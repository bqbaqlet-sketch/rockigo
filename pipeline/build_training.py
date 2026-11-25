import argparse
import json
from html import escape
from pathlib import Path

from build_course import ROOT, run


def package_training(output, source, schemas, ffmpeg, voice):
    manifest = ROOT / "pipeline" / "chapters.json"
    chapters = json.loads(manifest.read_text(encoding="utf-8"))
    courses = ("latyshova", "basniev", "kuznetsov")
    for chapter in courses:
        run(chapter, source, schemas, output / chapter, "node", manifest, ffmpeg, voice)

    artifacts = {
        "Учебный слой": "layer.json",
        "Таблица покрытия": "coverage.csv",
        "Маршрутизация": "routing.json",
        "Задания": "task.json",
        "Отчёт проверки": "verification.json",
    }
    cards=[]
    for chapter in courses:
        item=chapters[chapter]
        links="".join(f'<a href="{chapter}/{file}">{label}</a>' for label,file in artifacts.items())
        cards.append(f'<article><p>{escape(item["author"])}</p><h2>{escape(item["title"])}</h2>'
                     f'<p>{escape(item["scope"])}</p><a class="open" href="{chapter}/RockiGo.html">Открыть курс</a>'
                     f'<div class="files">{links}</div></article>')
    html="""<!doctype html><html lang="ru"><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>RockiGo · Глава → курс</title>
<style>
:root{font:16px/1.55 system-ui,sans-serif;color:#201737;background:#f4f0fb}
body{max-width:960px;margin:auto;padding:24px 16px} article{background:#fff;padding:20px;border:1px solid #ddd3ee;border-radius:14px}
h1{font-size:clamp(2rem,6vw,3rem);margin:8px 0} h2{margin:4px 0} p{margin:6px 0 12px}
.courses{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));gap:14px;margin-top:20px}
a{color:#522391;text-underline-offset:.16em} .open{display:inline-block;background:#512492;color:#fff;border-radius:8px;padding:9px 12px}
.files{display:flex;flex-wrap:wrap;gap:7px 13px;margin-top:14px}
:focus-visible{outline:3px solid #228778;outline-offset:3px}
</style>
<body><main><strong>RockiGo</strong><h1>Глава → курс</h1>
<p>Практикум по нефтегазовой геологии для специалистов по данным.</p><div class="courses">
"""+ "".join(cards) + "</div></main></body></html>"
    (output/"index.html").write_text(html,encoding="utf-8")


if __name__=="__main__":
    cli=argparse.ArgumentParser(description="Build the private RockiGo training bundle.")
    cli.add_argument("--output",type=Path,default=ROOT/"output"/"training")
    cli.add_argument("--source",type=Path,default=ROOT/"source")
    cli.add_argument("--schemas",type=Path,default=ROOT/"source"/"official")
    cli.add_argument("--ffmpeg",required=True)
    cli.add_argument("--voice",default="pwsh.exe")
    args=cli.parse_args()
    package_training(args.output.resolve(),args.source.resolve(),args.schemas.resolve(),args.ffmpeg,args.voice)
