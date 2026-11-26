import {mountLesson} from "../timeline.mjs";

const observations = [
  [0,22,22],
  [1,21.88,21.99],
  [2,21.67,21.96],
  [4,21.40,21.83],
  [8,21.18,21.59]
];
const threshold = .10;
const delta = (entry,well)=> Math.round((observations[0][well]-entry[well])*100)/100;
const format = new Intl.NumberFormat("ru-RU",{minimumFractionDigits:2,maximumFractionDigits:2});
const scenes = [
  ["Наблюдение","Отбор и два манометра"],
  ["Сравнение","Как изменилось давление за двое суток"],
  ["Порог","Когда показание стало заметным"],
  ["Проверка","Что проверить перед выводом"]
];
const cues = [
  [0,1.82,0,"В одной скважине начали отбор."],
  [2.09,4.44,0,"В двух соседних записали давление."],
  [4.86,9.81,0,"Сравним эти учебные ряды и посмотрим, где снижение стало заметным раньше."],
  [10.32,16.71,1,"К концу вторых суток давление в ближней скважине упало на 0,33 МПа."],
  [17.11,19.60,1,"В дальней оно снизилось на 0,04 МПа."],
  [20.13,22.72,2,"Возьмём порог в 0,10 МПа."],
  [23.12,27.50,2,"В дальней скважине первый замер выше порога получен на четвёртые сутки."],
  [27.88,30.60,2,"Между замерами мы точного момента не знаем."],
  [31.04,34.04,3,"Такой отклик согласуется с гидравлической связью."],
  [34.39,42.19,3,"Чтобы это проверить, сопоставим давления с журналом отбора и посмотрим, не менялось ли давление ещё до его начала."]
];
const hints = [
  "Отсчёт времени начинается с изменения режима отбора.",
  "Два манометра фиксируют давление в соседних скважинах.",
  "В обеих скважинах начальное давление равно 22 МПа.",
  "Ближняя · 22,00 − 21,67 = 0,33 МПа.",
  "Дальняя · 22,00 − 21,96 = 0,04 МПа.",
  "0,10 МПа — выбранный порог для этого упражнения.",
  "Дальняя · на 4-е сутки Δp = 0,17 МПа. Это первый замер выше порога.",
  "На 2-е сутки было 0,04 МПа. Точный момент между замерами неизвестен.",
  "Задержка согласуется с передачей возмущения. Причину нужно проверить.",
  "Сопоставь давление с журналом дебита и проверь фон до начала отбора."
];
const get=id=>document.getElementById(id);
const canvas=get("graph");
const plot=canvas.getContext("2d");
const keys=[...document.querySelectorAll(".well-key span")];
const fallback=get("fallback");
let indexNow=0, renderWells;

function drawGraph(index) {
  const width=canvas.clientWidth,h=canvas.clientHeight;
  const ratio=Math.min(devicePixelRatio || 1,2);
  if(!plot||!width||!h) return;
  if(canvas.width!==Math.round(width*ratio)||canvas.height!==Math.round(h*ratio)) {
    canvas.width=Math.round(width*ratio);
    canvas.height=Math.round(h*ratio);
  }
  plot.setTransform(ratio,0,0,ratio,0,0);
  plot.clearRect(0,0,width,h);
  const left=34, right=width-14, top=9, bottom=h-26;
  const x=day=>left+(right-left)*day/8;
  const y=difference=>bottom-(bottom-top)*difference/.9;
  plot.font="11px system-ui";
  plot.textBaseline="middle";
  plot.textAlign="right";
  plot.lineWidth=1;
  for(const value of [0,.2,.4,.6,.8]) {
    plot.strokeStyle="#315047";
    plot.beginPath();
    plot.moveTo(left,y(value));
    plot.lineTo(right,y(value));
    plot.stroke();
    plot.fillStyle="#acc1b7";
    plot.fillText(String(value).replace(".",","),left-6,y(value));
  }
  plot.textAlign="center";
  for(const [day] of observations) {
    plot.fillText(String(day),x(day),bottom+11);
  }
  plot.textAlign="right";
  plot.fillText("сутки",right,bottom+22);
  if(index>=5) {
    plot.strokeStyle="#ffcd8c";
    plot.setLineDash([5,3]);
    plot.beginPath();
    plot.moveTo(left,y(threshold));
    plot.lineTo(right,y(threshold));
    plot.stroke();
    plot.setLineDash([]);
    plot.fillStyle="#ffcd8c";
    plot.fillText("порог 0,10",right,y(threshold)-8);
  }
  if(index<2) return;
  for(const [well,color] of [[1,"#7ee6dd"],[2,"#c4b3fe"]]) {
    if(well===2&&index===3) continue;
    const samples=index<6?observations.slice(0,3):index<=7?observations.slice(0,4):observations;
    plot.strokeStyle=color;
    plot.fillStyle=color;
    plot.setLineDash([4,4]);
    plot.lineWidth=1.8;
    plot.beginPath();
    samples.forEach((entry,i)=>i?plot.lineTo(x(entry[0]),y(delta(entry,well))):plot.moveTo(x(entry[0]),y(delta(entry,well))));
    plot.stroke();
    plot.setLineDash([]);
    for(const entry of samples) {
      const focus=(index===3&&well===1||index===4&&well===2)&&entry[0]===2||index>=6&&well===2&&entry[0]===4;
      const xx=x(entry[0]),yy=y(delta(entry,well));
      plot.beginPath();
      plot.arc(xx,yy,focus?4.4:2.7,0,Math.PI*2);
      plot.fill();
      if(focus) {
        plot.textAlign="left";
        plot.fillText(format.format(delta(entry,well)),xx+7,yy-8);
      }
    }
  }
}
new ResizeObserver(()=>drawGraph(indexNow)).observe(canvas);

for(const [day,near,far] of observations) {
  const row=document.createElement("tr");
  const header=document.createElement("th");
  header.scope="row";
  header.textContent=day;
  row.append(header);
  for(const value of [near,far]) {
    const cell=document.createElement("td");
    cell.textContent=format.format(value);
    row.append(cell);
  }
  get("dataset").append(row);
}
const update=mountLesson(scenes,cues,({time,index,changed})=>{
  if(changed) {
    indexNow=index;
    get("readout").textContent=hints[index];
    keys.forEach((key,well)=>key.classList.toggle("is-active",
      index===0?well===0:index===3?well===1:index>=4&&index<=7?well===2:well>0));
    drawGraph(index);
  }
  renderWells?.(time,index);
});
import("./wells.mjs").then(({buildWells})=>{
  renderWells=buildWells(get("render"),fallback);
  update();
}).catch(()=>{fallback.hidden=false;});
