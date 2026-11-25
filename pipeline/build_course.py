import argparse
import csv
import hashlib
import json
import re
import subprocess
import time
from collections import Counter
from pathlib import Path

from jsonschema import Draft202012Validator
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parent.parent
PAGE_MARKER = re.compile(r"<!--\s*page\s+(\d+)\s*-->")
NUMBER = re.compile(r"(?<![\w])\d+(?:[.,]\d+)?(?![\w])")
EXERCISE = re.compile(r"^(?:задача\s*)?(\d{2,3})\s*\.\s+", re.I)
FIGURE = re.compile(r"^(?:рис\s*\.\s*\d+|рисунок\s+\d+)", re.I)
FIGURE_REFERENCE = re.compile(r"рис\s*\.\s*\d+", re.I)
FORMAT_HEADER = re.compile(r"^[━─ ]*FORMAT\s+\d", re.I)
KINDS = {"figure": "figure_caption", "table": "table", "formula": "formula", "task": "task"}


def canonical(text):
    return re.sub(r"\s+", "", text).casefold()


def plain(text):
    return re.sub(r"(?m)^\s*#{1,6}\s+", "", text).replace("**", "").strip()


def excerpt(text, anchor=None):
    if not anchor:
        return re.sub(r"\s+", " ", text).strip()[:160].rstrip()
    index = text.casefold().find(anchor.casefold())
    if index < 0:
        raise ValueError(f"Не найден фрагмент: {anchor}")
    return re.sub(r"\s+", " ", text[max(0, index - 45):index + len(anchor) + 110]).strip()


def field(text, by_model=False):
    return {"text": text, "by_model": by_model}


def numbers(text):
    normalized = text.replace("\\%", "%").replace("·", " ")
    return {match.group().replace(",", ".") for match in NUMBER.finditer(normalized)}


def read_pages(path, pdf, ranges):
    tokens = PAGE_MARKER.split(path.read_text(encoding="utf-8-sig"))
    book = {int(tokens[i]): tokens[i + 1] for i in range(1, len(tokens), 2)}
    pdf_length = len(PdfReader(pdf).pages)
    pages = {}
    for span in ranges:
        for number in range(span["from"], span["to"] + 1):
            if number not in book or number > pdf_length:
                raise ValueError(f"Страница {number} отсутствует в паре Markdown/PDF")
            lines = book[number].splitlines()
            start, end = 0, len(lines)
            for boundary, condition in (("start", number == span["from"]), ("end", number == span["to"])):
                if condition and boundary in span:
                    marker = canonical(span[boundary])
                    found = next((i for i, line in enumerate(lines) if canonical(plain(line)).startswith(marker)), None)
                    if found is None:
                        raise ValueError(f"Страница {number}: не найдено {span[boundary]!r}")
                    if boundary == "start":
                        start = found
                    else:
                        end = found
            if start >= end:
                raise ValueError(f"Страница {number}: неверные границы главы")
            pages[number] = "\n".join(lines[start:end]).strip()
    return pages


def page_units(page, raw):
    units, tasks = [], False
    for part in re.split(r"(?m)^\s*[-─━]{4,}\s*$", raw):
        part = part.strip()
        if not part:
            continue
        if FORMAT_HEADER.match(part):
            units.append({"kind": "figure", "raw": part, "review": "Описание рисунка подготовлено моделью; сверить со сканом и перерисовать."})
            continue
        paragraph_break = r"\n\s*\n|(?m:(?<=\n)(?=(?:Рис\s*\.\s*\d|Пример\s+\d|\d{2,3}\.\s+)))"
        for block in re.split(paragraph_break, part):
            block = block.strip()
            if not block:
                continue
            text = plain(block)
            review = None
            if block.startswith("#") or re.fullmatch(r"задач[аи]", text, re.I):
                kind = "heading"
                tasks = text.casefold() in {"задача", "задачи"}
            elif FIGURE.match(text):
                kind, review = "figure", "Сверить рисунок по PDF; требуется отдельная перерисовка."
            elif block.startswith("|") or re.match(r"^таблица\s+\d+", text, re.I):
                kind, review = "table", "Проверить разметку и значения таблицы по PDF."
            elif re.match(r"^(?:\$\$|\\\[)", block):
                kind, review = "formula", "Проверить обозначения, индексы и единицы по PDF."
            elif re.match(r"^пример\s+\d+\b", text, re.I):
                kind, tasks = "worked_example", False
                review = "Разделить условие, ход и итог; проверить рисунок и числа оригинала."
            elif EXERCISE.match(text) and (tasks or len(text) > 45):
                kind = "task"
                if sum(c.isascii() and c.isalpha() for c in text) > len(text) / 3:
                    review = "Искажено распознавание текста задачи; сверить по PDF."
            else:
                kind = "paragraph"
            units.append({"kind": kind, "raw": block, "review": review})
    if not units:
        units.append({"kind": "figure", "raw": "", "review": "В Markdown страница без текста; проверить изображение PDF."})
    return [dict(item, id=f"p{page:03d}-u{i:03d}", page=page) for i, item in enumerate(units, 1)]


def locate(units, anchor, page=None):
    matches = [u for u in units if (page is None or u["page"] == page) and anchor.casefold() in u["raw"].casefold()]
    if not matches:
        raise ValueError(f"Якорь {anchor!r} не найден в тексте части главы")
    return matches[0]


def to_claim(node_id, index, item, anchor=None):
    quote = excerpt(item["raw"], anchor)
    return {"id": f"{node_id}#c{index}", "text": plain(quote), "kind": "observation",
            "page_pdf": item["page"], "quote": quote, "source_kind": KINDS.get(item["kind"], "text"),
            "by_model": False, "needs_scan": item["review"] is not None}


def book_exercises(units):
    result = []
    for item in units:
        if item["kind"] != "task":
            continue
        text = plain(item["raw"])
        label = EXERCISE.match(text)
        figure = FIGURE_REFERENCE.search(text)
        if label:
            result.append({"number": label.group(1), "page_pdf": item["page"], "text": text,
                           "figure": figure.group() if figure else None})
    return result


def edition_task(node, kind, key, prompt, options=None, answer=None, explanation=None):
    task = {"id": f"{node['id']}.{key}", "step_id": node["id"], "claim_ids": [node["claims"][0]["id"]],
            "type": kind, "prompt": prompt, "answer": answer, "explanation": explanation or node["layers"]["main"]["text"]}
    if options:
        task["options"] = [{"id": str(i), "text": text} for i, text in enumerate(options)]
    return task


def draft_steps(pages, ranges):
    steps = []
    for span in ranges:
        for first in range(span["from"], span["to"] + 1, 2):
            last = min(first + 1, span["to"])
            items = [item for page in range(first, last + 1) for item in page_units(page, pages[page])]
            evidence = next((item for item in items if item["kind"] == "paragraph" and len(item["raw"]) > 40), None)
            if evidence is None:
                raise ValueError(f"Страницы {first}–{last}: нет текста для автоматического урока")
            summary = excerpt(evidence["raw"])
            term = re.search(r"[А-Яа-яЁё]{4,}", summary)
            if term is None:
                raise ValueError(f"Страницы {first}–{last}: не найдено понятие для карточки")
            steps.append({"from": first, "to": last, "title": f"Фрагмент главы, страницы {first}–{last}",
                          "difficulty": "Ф" if any(item["kind"] == "formula" for item in items) else "И",
                          "term": term.group().lower(), "summary": summary, "anchor": evidence["raw"].split()[0],
                          "extractive": True})
    return steps


def build(config, chapter, pages):
    by_page = {page: page_units(page, raw) for page, raw in pages.items()}
    nodes, rows, routes, tasks = [], [], [], []
    plans = config.get("steps") or draft_steps(pages, config["ranges"])
    decision = config.get("decision")
    assigned = set()
    for index, plan in enumerate(plans):
        step_pages = list(range(plan["from"], plan["to"] + 1))
        if assigned.intersection(step_pages):
            raise ValueError("Страница попала в два шага")
        assigned.update(step_pages)
        units = [u for p in step_pages for u in by_page[p]]
        node_id = f"{chapter}.p{step_pages[0]:03d}"
        lead = locate(units, plan["anchor"])
        claims = [to_claim(node_id, 1, lead, plan["anchor"])]
        claims.extend(to_claim(node_id, i, item) for i, item in enumerate((
            u for u in units if u is not lead and len(u["raw"]) >= 8 and not (u["kind"] == "figure" and FORMAT_HEADER.match(u["raw"]))
        ), 2))
        links = []
        if nodes and nodes[-1]["pages"][-1] + 1 == step_pages[0]:
            links.append({"type": "prerequisite", "target": nodes[-1]["id"], "note": "Предыдущий шаг того же фрагмента."})
        node = {"id": node_id, "order": index + 1, "title": plan["title"], "pages": step_pages,
                "why_here": field("Порядок источника; внутри фрагмента шаг продолжает предыдущий."),
                "difficulty": {"primary": plan["difficulty"], "secondary": None}, "threshold": False,
                "layers": {"topic": field(plan["title"], True), "main": field(plan["summary"], not plan.get("extractive")),
                           "mechanism": field(""), "practice": field(""), "nuances": field(""), "deeper": []},
                "claims": claims, "links": links, "misconception": None,
                "data_meaning": {"from_chapter": field(""), "breaks": field(""), "hypotheses": []},
                "it_analogy": {"text": "", "breaks_where": "", "by_model": False}, "now_practice": None,
                "inefficiency_lens": None, "terms_introduced": [plan["term"]], "terms_used": [],
                "book_tasks": book_exercises(units),
                "needs_scan": [{"page": u["page"], "what": f"{u['id']}: {u['review']}"} for u in units if u["review"]]}
        nodes.append(node)
        rows.extend({"unit_id": u["id"], "kind": u["kind"], "page_pdf": u["page"],
                     "excerpt": excerpt(u["raw"]), "node_ids": [node_id], "reason": None,
                     "needs_review": u["review"]} for u in units)

        choice_pool = [plans[(index + i) % len(plans)]["summary"] for i in (1, 2)]
        correct_slot = index % 3
        choice_pool.insert(correct_slot, plan["summary"])
        step_tasks = [edition_task(node, "single", "idea", "Какой вывод относится к этому шагу?", choice_pool, str(correct_slot)),
                      edition_task(node, "gap", "term", "Впиши ключевое понятие этого шага.",
                                   answer=[plan["term"]], explanation=f"Ключевое понятие: {plan['term']}.")]
        if decision and decision["page"] in step_pages:
            evidence = locate(units, decision["anchor"], decision["page"])
            data_claim = to_claim(node_id, len(claims) + 1, evidence, decision["anchor"])
            claims.append(data_claim)
            question = edition_task(node, "single", "data", decision["prompt"], decision["options"],
                                    str(decision["answer"]), decision["explanation"])
            question.update(kind="data", claim_ids=[data_claim["id"]])
            step_tasks.append(question)
            node["decision_on_data"] = {"features": [question["prompt"]], "rule": "Сопоставить данные с критерием автора.",
                                        "conclusion": question["explanation"]}
        if "decision_on_data" in node or (not decision and index == 0):
            step_tasks.append(edition_task(node, "order", "process", "Расставь этапы работы с источником.",
                ["Записать вывод и его ограничение", "Найти исходные признаки", "Применить правило из книги"],
                ["1", "2", "0"], "Сначала нужны признаки, затем правило и только потом вывод."))
            step_tasks.append(edition_task(node, "multiple", "limits", "Что нужно сохранить вместе с выводом?",
                ["Условия, при которых применимо правило", "Гарантию того же результата во всех скважинах", "Страницу, на которой описан пример"],
                ["0", "2"], "У вывода должны быть условия применения и проверяемый источник."))
        tasks.extend(step_tasks)
        route_format = "практикум на данных" if "decision_on_data" in node else "текст"
        routes.append({"node_id": node_id, "format": route_format,
                       "video_scores": {"time": 0, "invisible": int(plan["difficulty"] == "И"), "scale": 0,
                                        "counterintuitive": int(plan["difficulty"] == "Н"), "cause_effect": 0},
                       "why": "Проверка решения по признакам из источника." if "decision_on_data" in node else
                       "Чтение с проверкой понимания; учебное медиа пока не подготовлено."})
        words = sum(len(item["raw"].split()) for item in units if item["kind"] == "paragraph")
        node["estimated_minutes"] = max(3, (words + 179) // 180 + 2)
        node["source_units"] = [{"id": item["id"], "kind": item["kind"], "page": item["page"],
                                 "review": item["review"], "text": plain(item["raw"])}
                                for item in units if not FORMAT_HEADER.match(item["raw"])]
    if assigned != set(pages):
        raise ValueError(f"Покрытие страниц расходится: {sorted(set(pages) ^ assigned)}")
    if len(tasks) < 15 or len({task["type"] for task in tasks}) < 4:
        raise ValueError("Курс требует 15 заданий и 4 типа")
    layer = {"chapter": chapter, "source": config["source"], "pdf_pages": [str(i) for i in pages],
             "generated_by": "RockiGo, разметка Markdown" + (" и учебные заметки" if config.get("steps") else ""),
             "metadata": {key: config[key] for key in ("title", "book", "author", "scope")}, "nodes": nodes}
    return {"layer": layer, "coverage": {"chapter": chapter, "rows": rows},
            "routing": {"chapter": chapter, "routes": routes}, "task": {"chapter": chapter, "tasks": tasks}}


def render_data(docs):
    layer = docs["layer"]
    by_node = {}
    for task in docs["task"]["tasks"]:
        by_node.setdefault(task["step_id"], []).append(task)
    lessons = []
    for node in layer["nodes"]:
        main = node["layers"]["main"]
        lessons.append({"id": node["id"], "title": node["title"], "pages": node["pages"],
                        "minutes": node["estimated_minutes"], "summary": main["text"], "summaryByModel": main["by_model"],
                        "term": node["terms_introduced"][0],
                        "prerequisite": node["links"][0]["target"] if node["links"] else None,
                        "evidence": node["claims"][0], "tasks": by_node.get(node["id"], []),
                        "taskSources": {claim["id"]: claim["page_pdf"] for claim in node["claims"]},
                        "units": node["source_units"]})
    return {"id": layer["chapter"], **layer["metadata"], "steps": lessons}


def verify(docs, pages, official):
    schemas = {"layer": "node", "coverage": "coverage", "routing": "routing", "task": "task"}
    for name, key in schemas.items():
        schema = json.loads((official / f"{key}.schema.json").read_text(encoding="utf-8-sig"))
        Draft202012Validator(schema).validate(docs[name])
    all_claims = {claim["id"]: claim for node in docs["layer"]["nodes"] for claim in node["claims"]}
    all_nodes = {node["id"]: node for node in docs["layer"]["nodes"]}
    stable_rows = docs["coverage"]["rows"]
    if len({row["unit_id"] for row in stable_rows}) != len(stable_rows):
        raise ValueError("В таблице покрытия повторяются единицы")
    for node in all_nodes.values():
        source_text = " ".join(pages[number] for number in node["pages"])
        if not numbers(node["layers"]["main"]["text"]) <= numbers(source_text):
            raise ValueError(f"{node['id']}: число в пояснении отсутствует на страницах узла")
        for edge in node["links"]:
            if all_nodes[edge["target"]]["order"] >= node["order"]:
                raise ValueError("Нарушен порядок зависимостей")
    for claim in all_claims.values():
        raw = pages[claim["page_pdf"]]
        if canonical(claim["quote"]) not in canonical(raw):
            raise ValueError(f"{claim['id']}: цитата отсутствует на указанной странице")
        if not numbers(claim["text"]) <= numbers(raw):
            raise ValueError(f"{claim['id']}: число отсутствует на указанной странице")
    for task in docs["task"]["tasks"]:
        owner = all_nodes[task["step_id"]]
        if any(not key.startswith(owner["id"] + "#") or key not in all_claims for key in task["claim_ids"]):
            raise ValueError(f"{task['id']}: ссылка на утверждение данного шага отсутствует")
        if task.get("kind") == "data":
            evidence = " ".join(pages[all_claims[key]["page_pdf"]] for key in task["claim_ids"])
            if not numbers(task["prompt"]) <= numbers(evidence):
                raise ValueError(f"{task['id']}: число задания отсутствует на странице источника")
    return {"schemas": list(schemas.values()), "pages": len(pages), "nodes": len(all_nodes), "units": len(stable_rows),
            "verified_quotes": len(all_claims), "units_by_type": dict(Counter(row["kind"] for row in stable_rows)),
            "needs_visual_review": sum(bool(row["needs_review"]) for row in stable_rows),
            "tasks": len(docs["task"]["tasks"]), "task_types": sorted({task["type"] for task in docs["task"]["tasks"]}),
            "scope": "Дословность и числа сверены с выданным Markdown. PDF проверен по охвату страниц; предметная оценка и сканы отмечаются отдельно."}


def write_json(path, contents):
    path.write_text(json.dumps(contents, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def run(chapter, source, official, output, node, manifest):
    started = time.monotonic()
    configs = json.loads(manifest.read_text(encoding="utf-8-sig"))
    config = configs[chapter]
    pdf, markdown = source / config["pdf"], source / config["source"]
    pages = read_pages(markdown, pdf, config["ranges"])
    docs = build(config, chapter, pages)
    report = verify(docs, pages, official)
    course = render_data(docs)
    output.mkdir(parents=True, exist_ok=True)
    for name, artifact in docs.items():
        write_json(output / f"{name}.json", artifact)
    write_json(output / "course.json", course)
    coverage = docs["coverage"]["rows"]
    for name, rows in (("coverage.csv", coverage), ("review.csv", [row for row in coverage if row["needs_review"]])):
        with (output / name).open("w", encoding="utf-8-sig", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=list(coverage[0]), delimiter=";")
            writer.writeheader()
            writer.writerows(dict(row, node_ids=", ".join(row["node_ids"])) for row in rows)
    subprocess.run([node, str(ROOT / "build.mjs"), str(output / "RockiGo.html"),
                    "--chapter=" + str(output / "course.json")], check=True, cwd=ROOT)
    report.update(chapter=chapter, html_bytes=(output / "RockiGo.html").stat().st_size,
                  build_seconds=round(time.monotonic() - started, 2),
                  teaching_notes=bool(config.get("steps")),
                  pdf_sha256=hashlib.sha256(pdf.read_bytes()).hexdigest(),
                  markdown_sha256=hashlib.sha256(markdown.read_bytes()).hexdigest())
    write_json(output / "verification.json", report)
    print(f"{chapter}: {report['pages']} страниц, {report['units']} единиц, {report['verified_quotes']} цитат, {report['tasks']} заданий.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Собрать офлайн-курс RockiGo по официальному Markdown и PDF главы.")
    parser.add_argument("chapter")
    parser.add_argument("--source", type=Path, default=ROOT / "source")
    parser.add_argument("--schemas", type=Path, default=ROOT / "source/official")
    parser.add_argument("--manifest", type=Path, default=ROOT / "pipeline/chapters.json")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--node", default="node")
    args = parser.parse_args()
    run(args.chapter, args.source.resolve(), args.schemas.resolve(),
        (args.output or ROOT / "output" / args.chapter).resolve(), args.node, args.manifest.resolve())
