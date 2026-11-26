const intervals = [
  {id:"А", depth:"2040–2042", gamma:34, resistance:22, porosity:24},
  {id:"Б", depth:"2042–2044", gamma:108, resistance:4, porosity:16},
  {id:"В", depth:"2044–2046", gamma:42, resistance:3.8, porosity:23},
  {id:"Д", depth:"2046–2048", gamma:31, resistance:34, porosity:7}
];
const measures = [
  ["Гамма-каротаж · API","Естественная радиоактивность породы"],
  ["Сопротивление · Ом·м","Зависит от породы и жидкости в порах"],
  ["Пористость · %","Оценка доли порового пространства"]
];
const sceneInfo = [
  ["Данные","Найди интервал для опробования"],
  ["Показатели","Что показывает каждый метод"],
  ["Сравнение","У интервалов А и Д разные свойства"],
  ["Решение","Начни с интервала А"]
];
const cues = [
  [0.00,2.90,0,"Перед нами учебные данные одной скважины."],
  [3.18,5.51,0,"Нужно выбрать интервал для опробования."],
  [5.90,9.10,0,"Сравним три показателя на одной и той же глубине."],
  [9.52,13.44,1,"Гамма-каротаж измеряет естественную радиоактивность породы."],
  [13.80,18.04,1,"Электрическое сопротивление зависит от породы и жидкости в порах."],
  [18.42,20.76,1,"Пористость здесь оценили по каротажу."],
  [21.13,27.38,2,"В интервале А пористость — 24%, а сопротивление — 22 Ом·м."],
  [27.77,32.51,2,"В интервале Д сопротивление выше, но пористость всего 7%."],
  [32.94,34.74,3,"Я бы начал с интервала А."],
  [35.08,38.63,3,"Сочетание показателей делает его кандидатом на опробование."],
  [39.00,45.64,3,"Чтобы проверить насыщение, уточним свойства пластовой воды и посмотрим, какой приток даст интервал."]
];
const sceneStarts = [0, 9.52, 21.13, 32.94];
const get = id => document.getElementById(id);
const audio = get("audio");
const fallback = get("fallback");
const readout = get("readout");
const captions = get("captions");
const markers = [...document.querySelectorAll(".scale span")];
let renderWell, animation = 0, lastCue = -1;
const format = new Intl.NumberFormat("ru-RU");

function node(tag,text,className) {
  const element = document.createElement(tag);
  if(text !== undefined) element.textContent=text;
  if(className) element.className=className;
  return element;
}

function measureCards(active) {
  return measures.map(([name,description],i)=>{
    const card=node("div",undefined,i===active?"measure active":"measure");
    card.append(node("strong",name),node("span",description));
    return card;
  });
}

function comparisons(focus) {
  const comparison=(name,property,unit,max)=>{
    const card=node("section",undefined,"compare");
    card.append(node("h3",name));
    for(const i of [0,3]) {
      if(focus===0 && i===3) continue;
      const interval=intervals[i];
      const row=node("div",undefined,"metric-row");
      const track=node("span",undefined,"metric-track");
      const fill=node("span",undefined,"metric-fill");
      fill.style.width=(interval[property]/max*100)+"%";
      track.append(fill);
      row.append(node("b",interval.id),track,node("span",format.format(interval[property])+" "+unit));
      card.append(row);
    }
    return card;
  };
  return [comparison("Пористость","porosity","%",30),comparison("Удельное сопротивление","resistance","Ом·м",40)];
}

function actions(active) {
  return [
    ["А · 2040–2042 м","Кандидат для опробования"],
    ["Свойства пластовой воды","Уточнить допущения при оценке насыщения"],
    ["Опробование пласта","Проверить характер притока"]
  ].map(([title,detail],index)=>{
    const card=node("div",undefined,index<=active?"action active":"action");
    card.append(node("strong",title),node("span",detail));
    return card;
  });
}

const controls=sceneInfo.map(([label],index)=>{
  const button=node("button",label);
  button.type="button";
  button.addEventListener("click",()=>{
    audio.currentTime=sceneStarts[index];
    tryPlay();
    update();
  });
  return button;
});
get("scenes").append(...controls);

function update() {
  const time=audio.currentTime;
  let index=cues.findLastIndex(([start])=>time>=start);
  if(index<0) index=0;
  const [,end,scene,text]=cues[index];
  const focus=index===7?3:index===6||index>=8?0:null;
  if(index!==lastCue) {
    lastCue=index;
    document.body.dataset.scene=String(scene);
    document.body.dataset.cue=String(index);
    const [label,title]=sceneInfo[scene];
    get("phase").textContent=label;
    get("headline").textContent=title;
    readout.replaceChildren(...(
      scene===0?[node("p",index<2?"Сопоставь интервалы по общей шкале глубины.":"Сравним гамма-каротаж, сопротивление и оценку пористости.","hint")]:
      scene===1?measureCards(index-3):
      scene===2?comparisons(focus):
      actions(index===10?2:0)
    ));
    controls.forEach((button,i)=>{
      if(i===scene) button.setAttribute("aria-current","true");
      else button.removeAttribute("aria-current");
    });
    markers.forEach((marker,i)=>{
      marker.classList.toggle("highlight",focus===i);
      fallback.children[i].classList.toggle("highlight",focus===i);
    });
  }
  const line=time<=end?text:"";
  if(captions.textContent!==line) captions.textContent=line;
  renderWell?.(time,focus);
}

function frame() {
  update();
  animation=audio.paused||audio.ended?0:requestAnimationFrame(frame);
}

function tryPlay() {
  audio.play().catch(()=>{
    if (audio.error) get("audio-error").hidden=false;
  });
}

audio.addEventListener("playing",()=>{if(!animation) frame();});
for(const event of ["loadedmetadata","seeking","seeked","timeupdate","pause","ended"]) audio.addEventListener(event,update);
audio.addEventListener("error",()=>{get("audio-error").hidden=false;});

for(const interval of intervals) {
  const row=node("tr");
  const header=node("th",interval.id);
  header.scope="row";
  row.append(header,node("td",interval.depth),...[interval.gamma, interval.resistance, interval.porosity].map(n=>node("td",format.format(n))));
  get("dataset").append(row);
}
for(let scene=0;scene<sceneInfo.length;scene++) {
  get("transcript").append(node("p",cues.filter(cue=>cue[2]===scene).map(cue=>cue[3]).join(" ")));
}
update();
import("./well.mjs").then(({buildWell})=>{
  renderWell=buildWell(get("render"),fallback);
  update();
}).catch(()=>{fallback.hidden=false;});
