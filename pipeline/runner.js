const form=document.querySelector("#source");
const status=document.querySelector("#status");
const work=document.querySelector("#work");
const stats=document.querySelector("#stats");
const result=document.querySelector("#result");
const downloads=document.querySelector("#downloads");
const buttons=[document.querySelector("#run"), document.querySelector("#sample")];
let worker, urls=[];

function finish(message, error=false) {
  status.textContent=message;
  status.classList.toggle("error",error);
  work.hidden=true;
  for(const button of buttons)button.disabled=false;
}

function renderResult(report, outputs) {
  const rows=[
    ["Страниц",report.pages],["Узлов",report.nodes],["Заданий",report.tasks],
    ["Проверенных цитат",report.verified_quotes],["Единиц для сверки",report.needs_visual_review]
  ];
  stats.replaceChildren(...rows.flatMap(([label,value])=>
    [Object.assign(document.createElement("dt"),{textContent:label}),Object.assign(document.createElement("dd"),{textContent:value})]));
  const files=Object.fromEntries(outputs);
  const items=[
    ["RockiGo-chapter.zip","Скачать весь пакет", "application/zip"],
    ["RockiGo.html","Офлайн-курс", "text/html;charset=utf-8"],
    ["layer.json","Учебный слой", "application/json"],
    ["routing.json","Маршрутизация", "application/json"],
    ["coverage.csv","Таблица покрытия", "text/csv;charset=utf-8"],
    ["task.json","Задания", "application/json"],
    ["review.csv","Список для сверки", "text/csv;charset=utf-8"],
    ["verification.json","Отчёт проверки", "application/json"]
  ];
  downloads.replaceChildren(...items.map(([file,label,type])=>{
    const href=URL.createObjectURL(new Blob([files[file]],{type}));
    urls.push(href);
    return Object.assign(document.createElement("a"),{textContent:label,href,download:file});
  }));
  result.hidden=false;
  finish(report.task_minimum_met?"Сборка готова. Проверь отмеченные места по PDF.":
    "Сборка готова. Для конкурсного минимума нужно 15 заданий четырёх типов.");
}

function createWorker() {
  const instance=new Worker("./runner-worker.js",{type:"module"});
  instance.onmessage=({data})=>{
    if(data.message)status.textContent=data.message;
    else if(data.error)finish(data.error,true);
    else renderResult(data.report,data.outputs);
  };
  instance.onerror=()=>{
    instance.terminate();
    worker=null;
    finish("Не удалось запустить среду сборки. Проверь соединение и повтори попытку.",true);
  };
  return instance;
}

async function run(sample) {
  result.hidden=true;
  for(const url of urls)URL.revokeObjectURL(url);
  urls=[];
  work.hidden=false;
  status.classList.remove("error");
  status.textContent="Подготавливаю исходные файлы…";
  for(const button of buttons)button.disabled=true;
  try{
    const input=new FormData(form);
    const get=name=>String(input.get(name)??"").trim();
    const sources=sample?await Promise.all(["md","pdf"].map(async extension=>{
      const response=await fetch("./sample."+extension);
      if(!response.ok)throw new Error("Не удалось загрузить пример.");
      return response.blob();
    })):[input.get("markdown"),input.get("pdf")];
    const [markdown,pdf]=await Promise.all(sources.map(file=>file.arrayBuffer()));
    const source=sample?"sample.md":sources[0].name;
    const metadata=sample?{title:"Измерения в учебной скважине",author:"RockiGo",book:"Учебный пример",pages:"1–14",source,pdf:"sample.pdf",first_pdf_page:"1"}:
      {title:get("title")||source.replace(/\.[^.]+$/,""),author:get("author"),book:get("book"),pages:get("pages"),source,
        pdf:sources[1].name,first_pdf_page:get("firstPdfPage")||"1",start_heading:get("startHeading"),end_heading:get("endHeading")};
    worker??=createWorker();
    worker.postMessage({metadata,markdown,pdf},[markdown,pdf]);
  }catch(error){finish(error.message,true);}
}

form.addEventListener("submit",event=>{event.preventDefault();run(false);});
buttons[1].addEventListener("click",()=>run(true));
