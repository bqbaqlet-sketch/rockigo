import hashlib
import json
import re
from pathlib import Path
from time import monotonic

from build_course import build, read_pages, render_data, split_book, verify, write_json, write_records


def parse_ranges(value, available):
    tokens = re.split(r"[,;]", value.strip()) if value.strip() else []
    ranges = []
    if tokens:
        for token in tokens:
            match = re.fullmatch(r"\s*(\d{1,5})(?:\s*[-–—]\s*(\d{1,5}))?\s*", token)
            if not match:
                raise ValueError("Введи номера страниц через запятую, например 9–14, 20–30.")
            first, last = int(match[1]), int(match[2] or match[1])
            if not 1 <= first <= last:
                raise ValueError("Начальная страница должна быть больше нуля и не позднее последней.")
            ranges.append({"from": first, "to": last})
        ranges.sort(key=lambda span: span["from"])
        if any(left["to"] >= right["from"] for left, right in zip(ranges, ranges[1:])):
            raise ValueError("Диапазоны страниц пересекаются.")
    else:
        for page in sorted(available):
            if ranges and ranges[-1]["to"] + 1 == page:
                ranges[-1]["to"] = page
            else:
                ranges.append({"from": page, "to": page})
    return ranges


def run_browser(metadata_file, input_dir, output, official):
    start = monotonic()
    metadata = json.loads(metadata_file.read_text(encoding="utf-8"))
    markdown, pdf = input_dir / "chapter.md", input_dir / "chapter.pdf"
    available = split_book(markdown.read_text(encoding="utf-8-sig"))
    if not available:
        raise ValueError("В Markdown нужны отметки страниц вида <!-- page 90 -->.")
    ranges = parse_ranges(metadata["pages"], available)
    if metadata.get("start_heading"):
        ranges[0]["start"] = metadata["start_heading"]
    if metadata.get("end_heading"):
        ranges[-1]["end"] = metadata["end_heading"]
    pdf_offset = int(metadata["first_pdf_page"] or 1) - 1
    config = {
        "title": metadata["title"], "book": metadata["book"] or metadata["title"],
        "author": metadata["author"], "scope": metadata["pages"] or "Глава",
        "source": metadata["source"], "pdf": metadata["pdf"], "ranges": ranges, "pdf_offset": pdf_offset
    }
    markdown_hash = hashlib.sha256(markdown.read_bytes()).hexdigest()
    pdf_hash = hashlib.sha256(pdf.read_bytes()).hexdigest()
    identity = json.dumps([markdown_hash, pdf_hash, ranges, pdf_offset], sort_keys=True)
    chapter = "chapter-" + hashlib.sha256(identity.encode("utf-8")).hexdigest()[:12]
    pages = read_pages(markdown, pdf, ranges, pdf_offset)
    docs = build(config, chapter, pages)
    report = verify(docs, pages, official)
    write_records(output, docs, render_data(docs))
    write_json(output / "manifest.json", {chapter: config})
    report.update(
        chapter=chapter, build_seconds=round(monotonic()-start, 2), teaching_notes=False, ranges=ranges,
        pdf_sha256=pdf_hash, markdown_sha256=markdown_hash
    )
    write_json(output / "verification.json", report)
