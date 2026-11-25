"use strict";
const data = JSON.parse(document.getElementById("content").textContent);
const {ui, assets, books, units, levels, xpReward, videos, chapter} = data;
const unitMap = new Map(units.map(unit => [unit.id,unit]));
const questionMap = new Map(units.flatMap(unit => unit.questions.map(q => [q.id,q])));
const storageKey = chapter?`rockigo.chapter.${chapter.id}.v1`:"rockigo.local.v1";
const retryDelay = 60 * 60 * 1000;
const languages = ["ru","kk","en"];
const routes = chapter?{chapter:"▤",profile:"◉"}:{home:"⌂",tests:"✓",rocky:"✦",books:"▤",videos:"▷",tasks:"◇",profile:"◉"};
const main = document.getElementById("main");
const nav = document.getElementById("nav");
if(chapter)nav.classList.add("chapter-nav");
let state = load(), route = chapter?"chapter":"home", quiz, result, bookSelection, player;
let assistantAvailable = false, assistantChat = false, assistantBusy = false, storageWorks = true;
const chat = [];
const rockyActions = new Set(["home","tests","books","videos","tasks","profile","lesson","resume","model","bookmark"]);
let viewerRequested=false;
let currentMascot;
let testMapObserver;
const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
const configuredApi = document.querySelector('meta[name="rockigo-api"]')?.content?.trim();
let remoteApi = null;
try {
  const url = new URL(configuredApi);
  if (url.protocol === "https:" && !url.username && !url.password && !url.search && !url.hash) {
    remoteApi = url.href.replace(/\/$/, "");
  }
} catch (_) {}

function askServer(path, options = {}) {
  return fetch((remoteApi ?? "") + path, {
    ...options,
    credentials: remoteApi ? "omit" : "same-origin",
    redirect: "error"
  });
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved?.name && languages.includes(saved.lang) && saved.practice && saved.tests) return saved;
  } catch (_) {}
  return {name:"",lang:"ru",background:"beginner",theme:"light",practice:{},tests:{},bookmarks:[],resume:null};
}

function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); return true; }
  catch (_) {
    storageWorks = false;
    notify(["Браузер отключил сохранение. Этот сеанс доступен до закрытия страницы.","Браузер сақтауды өшірді. Сеанс парақ жабылғанша қолжетімді.","Browser storage is unavailable. This session lasts until you close the page."]);
    return false;
  }
}

function lang() { return languages.indexOf(state.lang); }
function local(value) { return Array.isArray(value) ? value[lang()] : value; }
function t(key, args = {}) { return local(ui[key]).replace(/\{(\w+)\}/g,(all,k)=>args[k] ?? all); }
function txt(tag, value, cls) {
  const node = document.createElement(tag);
  node.textContent = local(value) ?? "";
  if (cls) node.className = cls;
  return node;
}
function logoMark() {
  const image=txt("img","","brand-image");
  image.src=assets.logo;
  image.alt="";
  return image;
}

function requestViewer() {
  if(viewerRequested||!document.head)return;
  viewerRequested=true;
  const script=txt("script");
  script.type="module";
  script.src=assets.viewer;
  document.head.append(script);
}

function playRocky(entry) {
  const {model}=entry;
  if(!model.isConnected||!model.loaded||!model.availableAnimations.length)return;
  if(reducedMotion.matches){
    model.pause();
    return;
  }
  model.animationName=model.availableAnimations[0];
  model.play({repetitions:Infinity});
}

function pulseRocky(entry) {
  if(reducedMotion.matches)return;
  entry.glow?.animate([{opacity:1},{opacity:.62},{opacity:1}],{duration:680,easing:"ease-in-out"});
}

reducedMotion.addEventListener("change",()=>{
  if(currentMascot)playRocky(currentMascot);
});

function mascot(place, showGreeting=true) {
  let entry=currentMascot;
  if(entry?.place!==place||!entry.card.isConnected){
    const fallback=div("mascot-poster",logoMark());
    const glow=showGreeting?div("mascot-glow"):null;
    const model=txt("model-viewer");
    model.setAttribute("src",assets.model);
    model.setAttribute("loading","eager");
    model.setAttribute("interaction-prompt","none");
    model.setAttribute("camera-orbit","0deg 83deg 112%");
    model.setAttribute("field-of-view","32deg");
    model.setAttribute("environment-image","neutral");
    model.setAttribute("exposure","1.15");
    if(!showGreeting)model.setAttribute("shadow-intensity","0.65");
    const wave=showGreeting?btn(t("greetRocky"),()=>{
      pulseRocky(entry);
      notify(t("rockyHello"));
    },"mascot-button"):null;
    const card=div("mascot mascot-"+place,glow??[],fallback,model,wave??[]);
    entry={place,card,model,wave,glow};
    currentMascot=entry;
    model.addEventListener("load",()=>{
      fallback.hidden=true;
      card.dataset.ready="true";
      playRocky(entry);
    });
    model.addEventListener("error",()=>{fallback.hidden=false;card.dataset.ready="false";});
    requestViewer();
  }
  if(entry.wave)entry.wave.textContent=t("greetRocky");
  entry.model.setAttribute("alt",t("rockyModel"));
  return entry.card;
}
function div(cls, ...nodes) {
  const node = txt("div","",cls);
  node.append(...nodes.flat());
  return node;
}
function btn(label, callback, type = "", disabled = false) {
  const button = txt("button", label, "btn " + type);
  button.type = "button";
  button.disabled = disabled;
  button.addEventListener("click",callback);
  return button;
}
function heading(key, detail) {
  return div("screen-header",txt("h1",t(key)),detail ? txt("p",t(detail)) : []);
}
let noticeTimer;
function notify(value) {
  const message = document.getElementById("notice");
  message.textContent = local(value);
  message.hidden = false;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(()=>{message.hidden=true;},4200);
}
function earned() {
  return levels.reduce((sum,level,i)=>sum+(state.practice[level.id]?.passed ? xpReward[i] : 0),0);
}
function levelIndex() {
  let i=0;
  while (i < levels.length-1 && earned() >= levels[i+1].threshold && state.tests[levels[i].id]?.passed) i++;
  return i;
}
function select(items, value) {
  const field = txt("select","","field");
  for (const [id,label] of items) {
    const option = txt("option", label);
    option.value = id;
    field.append(option);
  }
  field.value = value;
  return field;
}
function labeled(label, field) {
  const node = txt("label",label);
  node.append(field);
  return node;
}
const langItems = [["ru","Русский"],["kk","Қазақша"],["en","English"]];
function setup(isProfile=false, draft=state.name) {
  const form = txt("form","","profile-form");
  const name = txt("input","","field");
  name.required = true;
  name.maxLength = 45;
  name.autocomplete = "given-name";
  name.value = draft;
  const language = select(langItems,state.lang);
  const background = select(["beginner","basics","experienced"].map(k=>[k,t(k)]),state.background);
  const theme = select(["light","dark"].map(k=>[k,t(k)]),state.theme);
  const commit = txt("button",t(isProfile ? "save" : "start"),"btn primary block");
  commit.type = "submit";
  form.append(labeled(t("name"),name),labeled(t("language"),language),labeled(t("experience"),background));
  if (isProfile) form.append(labeled(t("theme"),theme));
  form.append(commit);
  if (!isProfile) language.addEventListener("change",()=>{
    state.lang = language.value;
    const currentName=name.value;
    const currentBackground=background.value;
    state.background=currentBackground;
    render(currentName);
    main.querySelector("select")?.focus();
  });
  form.addEventListener("submit",event=>{
    event.preventDefault();
    if (!name.value.trim()) { name.setCustomValidity(t("nameError")); name.reportValidity(); return; }
    state.name=name.value.trim();
    state.lang=language.value;
    state.background=background.value;
    state.theme=theme.value;
    const saved=save();
    render();
    if (isProfile && saved) notify(t("saved"));
  });
  name.addEventListener("input",()=>name.setCustomValidity(""));
  return form;
}
function navigate(next, detail) {
  if (!Object.hasOwn(routes,next)) return;
  route = next; quiz=null; result=null; player=null;
  if (next==="books") bookSelection=detail ?? null;
  render();
  main.focus();
  window.scrollTo({top:0,behavior:"instant"});
}
function onboarding(draft) {
  return div("setup",div("card",assets?.logo?div("setup-logo",logoMark()):[],txt("h1",t("welcome")),txt("p",t("welcomeText"),"lead"),setup(false,draft),txt("p",t("mode"),"hint")));
}
function bottom() {
  nav.replaceChildren(div("nav-inner",Object.entries(routes).map(([id,icon])=>{
    const node = txt("button");
    node.type="button";
    if (id===route) node.setAttribute("aria-current","page");
    const symbol=txt("span",icon,"nav-icon");
    symbol.setAttribute("aria-hidden","true");
    node.append(symbol,txt("span",t(id),"nav-label"));
    node.addEventListener("click",()=>navigate(id));
    return node;
  })));
  nav.setAttribute("aria-label",t("nav"));
}
function progress() {
  const current=levelIndex(), next=levels[current+1], xp=earned();
  const panel=div("card progress-card",txt("h2",t(next ? "nextLevel":"max")));
  if (!next) return panel;
  const bar=txt("span");
  bar.style.width=Math.min(100,100*xp/next.threshold)+"%";
  const rail=div("progress-bar",bar);
  rail.setAttribute("role","progressbar");
  rail.setAttribute("aria-label",t("progress"));
  rail.setAttribute("aria-valuemin","0");rail.setAttribute("aria-valuemax",next.threshold);
  rail.setAttribute("aria-valuenow",Math.min(xp,next.threshold));
  const condition=(label,done)=>div("goal",txt("b",done?"✓":"·",done?"done":""),txt("span",label));
  panel.append(rail,condition(t("goalXP",{now:xp,need:next.threshold}),xp>=next.threshold),
    condition(t("goalTest"),state.tests[levels[current].id]?.passed),
    div("actions",btn(t("tests"),()=>navigate("tests"),"soft")));
  return panel;
}
function continueLearning() {
  const current=levels[levelIndex()];
  if (state.resume && canUse(state.resume.kind,state.resume.index)) startQuiz(state.resume.kind,state.resume.index);
  else navigate(state.practice[current.id]?.passed?"tests":"tasks");
}
function home() {
  const current=levels[levelIndex()];
  const terrain=div("terrain",Array.from({length:4},()=>txt("i")));
  terrain.setAttribute("aria-hidden","true");
  const hero=div("hero",div("hero-copy",txt("span",t("level",{n:levelIndex()+1})+" · "+t("xp",{n:earned()}),"pill"),
    txt("h1",t("hello",{name:state.name})),txt("p",t("mainText")),
    div("actions",btn(t("continue"),continueLearning,"positive"))),assets?.model?mascot("home"):terrain);
  return [hero,div("grid card-block",progress(),div("card lesson-card",txt("h2",t("active")),txt("p",current.title),
    div("actions",btn(t("read"),()=>navigate("books",unitMap.has(current.id)?current.id:units[0].id),"soft"),btn(t("askHint"),()=>{navigate("rocky");sendChat(t("askHint"));}))))];
}
function timeText(ending) {
  const seconds=Math.ceil(Math.max(0,ending-Date.now())/1000);
  return [Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(v=>String(v).padStart(2,"0")).join(":");
}
function readyAt(index) {
  const attempt=state.tests[levels[index].id];
  return attempt && !attempt.passed ? attempt.time+retryDelay : 0;
}
function canUse(kind,index) {
  const level=levels[index];
  if (!level || index>levelIndex()) return false;
  return kind==="practice" || (!state.tests[level.id]?.passed && readyAt(index)<=Date.now());
}
function status(score) { return t(score>=90?"statusGreat":score>=70?"statusGood":"statusLow"); }
function row(title, subtitle, action, tail) {
  return div("row-card",div("",txt("h3",title),txt("p",subtitle,"muted"),tail ?? []),action ?? []);
}
function practiceList() {
  const current=levelIndex();
  return [heading("tasks","tasksText"),div("stack",levels.map((item,index)=>{
    const past=state.practice[item.id];
    const count=t("questions",{n:item.practice.length});
    const title=t("level",{n:index+1})+" · "+local(item.title);
    const stateText=past?txt("p",t("last")+" · "+past.score+"%"+(past.passed?" · "+t("done"):""),past.passed?"good":"bad"):null;
    const button=btn(index>current?t("locked",{n:index+1}):t(past?.passed?"tryPractice":"begin"),
      ()=>startQuiz("practice",index),"primary",index>current);
    return row(title,count+" · +"+t("xp",{n:xpReward[index]}),button,stateText);
  }))];
}

function drawTestTrail(map,canvas,stops) {
  const context=canvas.getContext("2d");
  if(!context)return;
  const draw=()=>{
    const {width,height,left,top}=map.getBoundingClientRect();
    if(!width||!height)return;
    const scale=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.ceil(width*scale);
    canvas.height=Math.ceil(height*scale);
    context.scale(scale,scale);
    context.lineCap="round";
    const style=getComputedStyle(map);
    const trail=style.getPropertyValue("--trail");
    const reached=style.getPropertyValue("--trail-reached");
    const inset=style.getPropertyValue("--trail-inset");
    const points=stops.map(stop=>{
      const rect=stop.querySelector(".test-stop-marker").getBoundingClientRect();
      return [rect.left-left+rect.width/2,rect.top-top+rect.height/2];
    });
    drawTestMapLandmarks(context,width,height,points,style);
    for(let i=1;i<points.length;i++){
      const [x,y]=points[i-1], [nextX,nextY]=points[i];
      const middle=(y+nextY)/2;
      context.beginPath();
      context.moveTo(x,y);
      context.bezierCurveTo(x,middle,nextX,middle,nextX,nextY);
      context.setLineDash([]);
      context.lineWidth=11;
      context.strokeStyle=stops[i].dataset.state==="locked"?trail:reached;
      context.stroke();
      context.setLineDash([1,8]);
      context.lineWidth=2;
      context.strokeStyle=inset;
      context.stroke();
    }
  };
  testMapObserver=new ResizeObserver(draw);
  testMapObserver.observe(map);
}

function testStop(item,index,current) {
  const attempt=state.tests[item.id];
  const ending=readyAt(index);
  const passed=!!attempt?.passed;
  const locked=index>current&&!passed;
  const waiting=!locked&&ending>Date.now();
  const resumed=state.resume?.kind==="test"&&state.resume.index===index;
  const stateKey=passed?"passed":locked?"locked":waiting?"waiting":"ready";
  const itemNode=txt("li","","test-stop");
  itemNode.dataset.state=stateKey;
  if(index===current&&!passed)itemNode.setAttribute("aria-current","step");

  const marker=txt("span",passed?"✓":locked||waiting?"":"›","test-stop-marker");
  marker.setAttribute("aria-hidden","true");
  const description=txt("span",t("level",{n:index+1})+" · "+t("questions",{n:item.quiz.length}),"test-stop-meta");
  const title=txt("span",item.title,"test-stop-title");
  const action=txt("span",passed?attempt.score+"% · "+t("review"):
    locked?t("testLocked"):waiting?t("wait",{time:timeText(ending)}):t(resumed?"testResume":"testStart"),"test-stop-state");
  if(waiting)action.dataset.until=ending;
  const info=txt("span","","test-stop-info");
  info.append(description,title,action);
  const control=btn("",()=>passed?oldResult(index):startQuiz("test",index),"test-stop-action",locked||waiting);
  control.append(marker,info);
  itemNode.append(control);
  return itemNode;
}

function testMap() {
  const current=levelIndex();
  const passed=levels.filter(level=>state.tests[level.id]?.passed).length;
  const next=levels[current+1];
  const missingXP=next&&state.tests[levels[current].id]?.passed?next.threshold-earned():0;
  const summary=div("test-route-summary",txt("strong",`${passed} / ${levels.length}`),txt("span",t("testsCompleted")));
  const nextStep=missingXP>0?div("test-route-next",txt("p",t("testRouteXP",{n:missingXP})),
    btn(t("tasks"),()=>navigate("tasks"),"soft")):[];
  const header=div("test-map-intro",div("test-route-header",heading("tests","testsText"),summary,nextStep),
    assets?.model?mascot("tests",false):[]);

  const stops=levels.map((item,index)=>testStop(item,index,current));
  const list=txt("ol","","test-map-list");
  list.setAttribute("aria-label",t("testRoute"));
  list.append(...stops);
  const canvas=txt("canvas","","test-map-trail");
  canvas.setAttribute("aria-hidden","true");
  const map=div("test-map-board",canvas,header,list);
  drawTestTrail(map,canvas,stops);
  return map;
}
function bookLink(unit,page) {
  if(!books[unit.book].id)return txt("span",t("pdf")+" "+page,"pill");
  const link=txt("a",t("openPdf")+" · "+t("pdf")+" "+page,"btn soft");
  link.href="https://drive.google.com/file/d/"+books[unit.book].id+"/view#page="+page;
  link.target="_blank";link.rel="noopener noreferrer";
  return link;
}
function bookFact(unit, fact, index) {
  const id = "book-fact-" + unit.id + "-" + index;
  const actions = div("book-fact-actions", bookLink(unit, fact.page));
  const content = div("book-fact-content");
  const controls = [];

  function disclosure(key, name, renderContent) {
    const panel = div("book-fact-panel");
    panel.id = id + "-" + name;
    panel.hidden = true;
    const button = btn(t(key), () => {
      const open = panel.hidden;
      for (const item of controls) {
        const active = open && item.panel === panel;
        item.panel.hidden = !active;
        item.button.setAttribute("aria-expanded", String(active));
      }
      if (open && !panel.firstChild) panel.append(renderContent());
    }, "soft");
    button.id = panel.id + "-button";
    button.setAttribute("aria-controls", panel.id);
    button.setAttribute("aria-expanded", "false");
    controls.push({button, panel});
    actions.append(button);
    content.append(panel);
  }

  disclosure("plainWords", "plain", () => txt("p", fact.plain));
  if (fact.scene) disclosure("example3D", "scene", () => bookModel(fact));
  return div("read-fact", txt("p", fact.explanation), actions, content);
}
function bookView() {
  const content = Object.entries(books).map(([id,book])=>div("card read",txt("h2",book.title),
    txt("p",book.author+" · PDF "+book.range,"muted"),...units.filter(unit=>unit.book===id).map(unit=>{
      const detail=txt("details");
      detail.open=bookSelection===unit.id;
      const summary=txt("summary",unit.title);
      const attempt=state.tests[unit.id];
      if(attempt) summary.append(txt("small"," · "+status(attempt.score)+" ("+attempt.score+"%)","book-note "+(attempt.passed?"good":"bad")));
      detail.append(summary,...unit.facts.map((fact,index)=>bookFact(unit,fact,index)),
        div("actions",btn(t("askBookmark"),()=>bookmark(unit.id),"soft")));
      return detail;
    })));
  return [heading("books","bookText"),div("stack",content)];
}
function bookmark(id) {
  if (!unitMap.has(id)) return;
  state.bookmarks ??=[];
  if (!state.bookmarks.includes(id)) {state.bookmarks.push(id);save();}
  notify(t("bookmarked"));
}
function videoView() {
  return [heading("videoTitle","videoText"),div("video-list",videos.map((video,index)=>{
    const permitted=index<=levelIndex();
    const title=t("videoN",{n:index+1});
    return div("card",div("video-cover",txt("span",permitted?"▷":"◌")),txt("h3",title),
      txt("p",permitted?(video?t("watch"):t("coming")):t("locked",{n:index+1}),"muted"),
      permitted&&video?btn(t("watch"),()=>{player=index;render();},"soft"):[]);
  })),player!==null?videoPlayer(player):[]];
}
function videoPlayer(index) {
  if (index>levelIndex()||!videos[index]) return div("");
  const video=txt("video");
  video.controls=true;
  video.preload="metadata";
  video.playsInline=true;
  video.src=videos[index].src;
  return div("card card-block",txt("h2",videos[index].title),video,btn(t("close"),()=>{player=null;render();}));
}
function profile() {
  const links=(state.bookmarks??[]).filter(id=>unitMap.has(id)).map(id=>
    btn(unitMap.get(id).title,()=>navigate("books",id),"soft"));
  const about=div("card",txt("h2",t("about")),txt("p",t("aboutText")),txt("h3",t("bookmarks")),
    links.length?div("actions",links):txt("p",t("noBookmarks"),"muted"));
  return [heading("profile"),div("grid",div("card",txt("h2",t("setup")),setup(true)),about)];
}

function startQuiz(kind,index) {
  if (!canUse(kind,index)) { notify(t("waitShort")); return; }
  route=kind==="test"?"tests":"tasks"; result=null;
  const level=levels[index];
  const ids=kind==="test"?level.quiz:level.practice;
  const resume=state.resume;
  quiz={kind,index,ids,pos:0,answers:[],checked:false,choice:undefined};
  if(resume?.kind===kind&&resume.index===index&&Array.isArray(resume.answers)&&resume.answers.length<ids.length) {
    quiz.answers=resume.answers;
    quiz.pos=resume.answers.length;
  }
  saveResume(); render();main.focus();
  window.scrollTo({top:0,behavior:"instant"});
}
function saveResume() {
  if (!quiz) return;
  state.resume={kind:quiz.kind,index:quiz.index,answers:quiz.answers.slice(0,quiz.pos)};
  save();
}
function normal(s) {
  return String(s??"").toLocaleLowerCase(state.lang).normalize("NFKC").replace(/ё/g,"е").replace(/[.?!,«»]/g,"").trim().replace(/\s+/g," ");
}
function grade(q,value,language=lang()) {
  if(q.type==="single") return value===q.key;
  if(q.type==="multi") return JSON.stringify([...value].sort())===JSON.stringify(q.key);
  if(q.type==="order") return JSON.stringify(value)===JSON.stringify(q.key);
  if(q.type==="numeric") {
    const input=String(value??"").trim().replace(",",".");
    return /^[-+]?\d+(?:\.\d+)?$/.test(input)&&Math.abs(Number(input)-q.key)<1e-8;
  }
  return normal(value)===normal(q.key[language]);
}
function rightAnswer(q) {
  if(q.type==="single") return local(q.options[q.key]);
  if(q.type==="multi"||q.type==="order") return q.key.map(v=>local(q.options[v])).join(" · ");
  return local(q.key);
}
function answerPanel(q,valid) {
  const unit=unitMap.get(q.unit);
  return div("review "+(valid?"correct-note":"wrong-note"),txt("strong",t(valid?"correct":"incorrect")),
    txt("p",t("reference")+" · "+rightAnswer(q)),txt("p",q.help),
    bookLink(unit,q.page),q.extraPage!==undefined&&q.extraPage!==q.page?bookLink(unit,q.extraPage):[]);
}
function testQuestionHeader(title) {
  const total=quiz.ids.length;
  const step=t("quizStep",{n:quiz.pos+1,total});
  const segments=div("test-question-progress",quiz.ids.map((_,index)=>{
    const segment=txt("span");
    const answer=quiz.answers[index];
    if(answer)segment.dataset.state=answer.ok?"correct":"incorrect";
    else if(index===quiz.pos)segment.dataset.state="current";
    return segment;
  }));
  segments.setAttribute("role","progressbar");
  segments.setAttribute("aria-label",step);
  segments.setAttribute("aria-valuemin","0");
  segments.setAttribute("aria-valuemax",total);
  segments.setAttribute("aria-valuenow",quiz.pos+Number(quiz.checked));
  return div("test-question-header",div("test-question-nav",btn(t("testBack"),()=>navigate("tests"),"soft test-back"),
    txt("span",step,"test-question-step")),segments,txt("p",title,"test-question-topic"));
}
function questionScreen() {
  const q=questionMap.get(quiz.ids[quiz.pos]);
  const title=levels[quiz.index].title;
  const isTest=quiz.kind==="test";
  const form=txt("form");
  const fields=div("answers");
  const submit=txt("button",t(quiz.checked?(quiz.pos===quiz.ids.length-1?"finish":"next"):"check"),"btn primary");
  submit.type="submit";
  const update = value=>{quiz.choice=value;submit.disabled=value===undefined||(Array.isArray(value)&&!value.length)||value==="";};
  if (q.type==="single"||q.type==="multi") {
    q.options.forEach((option,index)=>{
      const input=txt("input");
      input.type=q.type==="single"?"radio":"checkbox";
      input.name="response";input.value=index;input.disabled=quiz.checked;
      input.checked=q.type==="single"?quiz.choice===index:quiz.choice?.includes(index)??false;
      input.addEventListener("change",()=>update(q.type==="single"?index:[...fields.querySelectorAll("input:checked")].map(i=>Number(i.value))));
      const label=txt("label","","option");
      if(isTest&&quiz.checked){
        const correct=q.type==="single"?q.key===index:q.key.includes(index);
        if(correct||input.checked)label.dataset.feedback=correct?"correct":"incorrect";
      }
      label.append(input,txt("span",option)); fields.append(label);
    });
  } else if(q.type==="order"){
    quiz.choice ??= q.options.map((_,i)=>i);
    const list=txt("ol","","order-list");
    function draw() {
      list.replaceChildren(...quiz.choice.map((key,position)=>{
        const item=txt("li",isTest?"":q.options[key]);
        const tools=isTest?div("test-order-tools"):item;
        if(isTest)item.append(txt("span",q.options[key],"test-order-copy"),tools);
        for (const [direction,label] of [[-1,"moveUp"],[1,"moveDown"]]) {
          const target=position+direction;
          const move=btn(isTest?(direction<0?"↑":"↓"):t(label),()=>{
            [quiz.choice[position],quiz.choice[target]]=[quiz.choice[target],quiz.choice[position]];
            draw();list.children[target].querySelector("button:not(:disabled)")?.focus();
          },"soft",quiz.checked||target<0||target>=q.options.length);
          move.setAttribute("aria-label",t(label)+" · "+local(q.options[key]));
          tools.append(move);
        }
        if(!quiz.checked){
          item.draggable=true;
          item.addEventListener("dragstart",e=>e.dataTransfer.setData("text/plain", String(position)));
          item.addEventListener("dragover",e=>e.preventDefault());
          item.addEventListener("drop",e=>{
            e.preventDefault();const from=Number(e.dataTransfer.getData("text/plain"));
            if(!Number.isInteger(from)||from<0||from>=quiz.choice.length||from===position)return;
            quiz.choice.splice(position,0,...quiz.choice.splice(from,1));draw();
          });
        }
        return item;
      }));
    }
    draw();fields.append(list);
  } else {
    const input=txt("input","","field");
    input.autocomplete="off";
    if(q.type==="numeric")input.inputMode="decimal";
    input.value=quiz.choice??"";input.disabled=quiz.checked;
    input.addEventListener("input",()=>update(input.value.trim()));
    fields.append(labeled(t("answer"),input));
  }
  if(!quiz.checked) update(quiz.choice);
  const back=isTest?[]:btn(t("back"),()=>navigate(route),"soft");
  form.append(fields,quiz.checked?answerPanel(q,quiz.answers[quiz.pos].ok):[],
    div("actions",submit,back));
  form.addEventListener("submit",event=>{
    event.preventDefault();
    if(submit.disabled)return;
    if(!quiz.checked) {
      quiz.answers[quiz.pos]={id:q.id,ok:grade(q,quiz.choice)};
      quiz.checked=true;render();main.querySelector('button[type="submit"]')?.focus();return;
    }
    if(quiz.pos===quiz.ids.length-1){complete();return;}
    quiz.pos++;quiz.choice=undefined;quiz.checked=false;saveResume();render();main.focus();
    if(isTest)window.scrollTo({top:0,behavior:"instant"});
  });
  const tip=quiz.kind==="practice"||state.background==="beginner"?div("actions",btn(t("seeBook"),()=>{
    const savedQuiz=quiz;
    navigate("books",q.unit);
    if(savedQuiz.checked){
      state.resume={kind:savedQuiz.kind,index:savedQuiz.index,answers:savedQuiz.answers.slice(0,savedQuiz.pos)};
      save();
    }
  },"soft")):[];
  const instructions=q.type==="multi"?txt("p",t("multi"),"hint"):q.type==="order"?txt("p",t("order"),"hint"):[];
  if(isTest){
    const prompt=txt("h1",q.prompt);
    prompt.id="test-prompt";
    fields.setAttribute("role","group");
    fields.setAttribute("aria-labelledby",prompt.id);
    return div("quiz test-quiz",testQuestionHeader(title),div("card test-question",prompt,instructions,form,tip));
  }
  return div("card quiz",txt("p",title,"pill"),txt("p",t("quizStep",{n:quiz.pos+1,total:quiz.ids.length}),"muted"),
    txt("h2",q.prompt),instructions,form,tip);
}
function complete() {
  const {kind,index,answers}=quiz;
  const level=levels[index];
  const correct=answers.filter(answer=>answer.ok).length;
  const score=Math.floor(100*correct/answers.length);
  const passed=kind==="test" ? correct*100>=70*answers.length : correct*3>=2*answers.length;
  const store=kind==="test"?state.tests:state.practice;
  const alreadyPassed=!!store[level.id]?.passed;
  const attempt={score,passed:passed||alreadyPassed,answers,time:Date.now()};
  store[level.id]=attempt;
  state.resume=null;
  quiz=null;
  result={kind,index,attempt:{...attempt,passed},gain:kind==="practice"&&passed&&!alreadyPassed?xpReward[index]:0};
  const saved=save();render();main.focus();
  if(kind==="test")window.scrollTo({top:0,behavior:"instant"});
  if(result.gain&&saved)notify(t("gained",{n:result.gain}));
}
function oldResult(index) {
  result={kind:"test",index,attempt:state.tests[levels[index].id],gain:0};quiz=null;render();main.focus();
  window.scrollTo({top:0,behavior:"instant"});
}
function resultView() {
  const {kind,index,attempt,gain}=result;
  const answers=(attempt.answers??[]).filter(item=>questionMap.has(item.id));
  const reviews=answers.map(item=>{
    const q=questionMap.get(item.id);
    return div("card",txt("h3",q.prompt),answerPanel(q,item.ok),btn(t("seeBook"),()=>navigate("books",q.unit),"soft"));
  });
  if(kind==="test"){
    const score=div("test-score",txt("strong",attempt.score+"%"));
    score.style.setProperty("--score",attempt.score+"%");
    const header=div("test-result-header",score,div("test-result-copy",txt("p",levels[index].title,"test-question-topic"),
      txt("h1",t(attempt.passed?"testPassed":"testFailed")),answers.length?txt("p",t("testCorrectCount",{n:answers.filter(answer=>answer.ok).length,total:answers.length})):[],
      !attempt.passed&&readyAt(index)>Date.now()?timerText(readyAt(index)):[],btn(t("testBack"),()=>navigate("tests"),"positive")));
    header.dataset.result=attempt.passed?"passed":"retry";
    return div("quiz test-results",header,reviews.length?div("test-review-list",txt("h2",t("testReview")),div("stack",reviews)):[]);
  }
  const label=attempt.passed?"practicePassed":"practiceFailed";
  return div("quiz",div("card",txt("p",levels[index].title,"pill"),txt("h1",t(label)),
    txt("div",attempt.score+"%","metric"),txt("p",status(attempt.score),attempt.passed?"good":"bad"),
    gain?txt("p",t("gained",{n:gain})) : [],
    div("actions",btn(t("back"),()=>navigate(route),"soft"),btn(t("continue"),()=>navigate("home"),"primary"))),
    div("stack card-block",reviews));
}
function timerText(ending) {
  const text=txt("p",t("wait",{time:timeText(ending)}),"muted");
  text.dataset.until=ending;return text;
}

function localIntent(input) {
  const s=input.toLowerCase().replaceAll("ё","е").replaceAll("’","'");
  if(/(?:^|\s)(?:не|don't|do not)\s+(?:откр|показ|постав|сохраня|сохрани|продолж|перей|open|show|go|add|save|continue)|ашпа|көрсетпе|қойма|жалғастырма|өтпе/.test(s))return "decline";
  if(/(?:удал|сними|убери|remove|delete|алып таста).*(?:заклад|bookmark|бетбел)|(?:бетбел).*(?:өшір|жой|алып таста)/.test(s))return "decline";
  if(/(?:где|қай жерде).*остано|(?:где|куда).*(?:тест|урок|задани)|where (?:are|is|can i find|do i find)|қайда/.test(s)
    || /откро[йе]|открыть|перей[дт]|покаж|показать|\bopen\b|\bshow\b|go to|take me to|(?:^|\s)аш(?:[ығ]\p{L}*)?(?=$|[^\p{L}])|көрсет|(?:^|\s)өт(?=$|[^\p{L}])|қайда/.test(s)){
    if(/где.*останов|where (?:i|we) left off|тоқтаған/.test(s))return "resume";
    if(/3\s*[dд]|трехмер|three.dimensi|үш өлшем/.test(s))return "model";
    if(/тест|\btests?\b/.test(s))return "tests";
    if(/книг|кітап|\bbooks?\b/.test(s))return "books";
    if(/видео|бейне|\bvideos?\b/.test(s))return "videos";
    if(/урок|сабақ|сабағ|\blessons?\b/.test(s))return "lesson";
    if(/задани|практик|тапсыр|жаттығ|\bpractice\b|\btasks?\b/.test(s))return "tasks";
    if(/профил|бейін|\bprofile\b/.test(s))return "profile";
    if(/главн|басты бет|\bhome\b/.test(s))return "home";
  }
  if(/продолж[иа]|верни меня.*останов|pick up where|\bresume (?:my|the|learning)\b|^resume[!?.\s]*$|continue (?:learning|my|the)|жалғастыр|тоқтаған\s+жер.*апар/.test(s))return "resume";
  if(/заклад|bookmark|бетбел/.test(s)&&/постав|добав|сохран|\badd\b|\bsave\b|\bbookmark (?:this|the|my)\b|қой|қос|сақта/.test(s))return "bookmark";
  if(/как (?:получ|заработ|набрат).*опыт|\b(?:earn|get|gain) xp\b|ұпайды қалай/.test(s))return "xp";
  if(/как (?:сдать|пересдать).*тест|how (?:do i|to).*(?:pass|retry).*test|тест.*қалай тап|пересдач/.test(s))return "testHelp";
  if(/^(?:подскажи по теме|дай подсказку|тақырып бойынша көмек|give me a lesson hint)[!?.\s]*$/.test(s))return "hint";
  if(/^(?:привет|сәлем|салем|hello|hi|hey)[!?.\s]*$/.test(s))return "hello";
  if(/^(?:спасибо(?:,? роки)?|рақмет|рахмет|thanks?(?: you)?)[!?.\s]*$/.test(s))return "thanks";
  return "free";
}
function rockyEvidence(message, current, scenesOnly=false) {
  const tokenize=text=>text.toLowerCase().replaceAll("ё","е").match(/\p{L}+/gu)??[];
  const generic=/^(?:покаж|показ|прост|слов|пример|модел|вообщ|көрсе|мысал|түсін|please|expla|show|examp|could|would|learn|about|today)/;
  const tokens=[...new Set(tokenize(message).filter(word=>word.length>=4&&!generic.test(word)).map(word=>word.slice(0,5)))];
  let best=null;
  for(const unit of units) for(const [index,fact] of unit.facts.entries()){
    if(scenesOnly&&!fact.scene)continue;
    const hits=words=>tokens.filter(token=>words.some(word=>word.startsWith(token))).length;
    const title=hits(tokenize(local(fact.term)));
    const text=hits(tokenize(local(fact.explanation)));
    if(title===0&&text<2)continue;
    const score=title*5+text+(unit===current?0.5:0);
    if(!best||score>best.score)best={unit,fact,index,score};
  }
  return best;
}
function rockyDefinition(message) {
  const s=message.trim().toLowerCase();
  if(!/^(?:(?:что такое|объясни) )?пористость[?!.\s]*$|^кеуектілік(?: деген не)?[?!.\s]*$|^(?:what is )?porosity[?!.\s]*$/.test(s))return null;
  return {unit:unitMap.get("saturation"),fact:{page:97,plain:[
    "Пористость показывает, какая доля объёма породы приходится на пустоты. Пустоты могут быть заполнены водой, нефтью или газом.",
    "Кеуектілік жыныс көлемінің қандай үлесін қуыстар алатынын көрсетеді. Қуыстарда су, мұнай немесе газ болуы мүмкін.",
    "Porosity is the fraction of a rock’s volume made up of pores. Those spaces can hold water, oil, or gas."
  ]}};
}
function runRockyAction(action, unit, message) {
  if(action==="bookmark"){bookmark(unit.id);return t("bookmarked");}
  if(action==="resume"){continueLearning();return t("moved");}
  if(action==="model"){
    const matching=rockyEvidence(message,unit,true);
    const index=matching?.index??unit.facts.findIndex(item=>item.scene);
    if(index<0)return t("rockyNoModel");
    const section=matching?.unit??unit;
    navigate("books",section.id);
    const button=document.getElementById("book-fact-"+section.id+"-"+index+"-scene-button");
    button?.click();
    button?.focus();
    return t("moved");
  }
  navigate(action==="lesson"?"books":action,action==="lesson"?unit.id:null);
  return t("moved");
}
async function sendChat(value, shortcut) {
  const message=String(value??"").trim().slice(0,500);
  if(!message||assistantBusy)return;
  const history=chat.filter(record=>record.conversation).slice(-4).map(record=>({
    role:record.who==="me"?"user":"assistant",content:record.text.slice(0,115)
  }));
  chat.push({who:"me",text:message}); assistantBusy=true;render();
  const intent=shortcut??localIntent(message);
  const unit=units[Math.min(levelIndex(),units.length-1)];
  const matching=intent==="free"?(rockyDefinition(message)??rockyEvidence(message,unit)):null;
  const evidence=intent==="hint"?{unit,fact:unit.facts[0]}:matching;
  const preset={hello:"rockyHi",thanks:"rockyThanks",xp:"helpXP",testHelp:"helpTest",decline:"rockyNoAction"};
  let reply=t("rockyOfflineChat"), action=rockyActions.has(intent)?intent:null, suggestion=null, conversation=false;
  let link;
  if(evidence){
    reply=local(evidence.fact.plain??evidence.fact.explanation);
    link={id:evidence.unit.id,page:evidence.fact.page};
  }else if(Object.hasOwn(preset,intent)){
    reply=t(preset[intent]);
  }else if(intent==="free"&&/геолог|порист|проницаем|каротаж|скважин|коллектор|риф|пластов|фаци|кеуек|өткізгіш|ұңғым|poros|permeab|geolog|well\s*log|reservoir|reef|facies/.test(message.toLowerCase())){
    reply=t("rockyNoSource");
  }else if(intent==="free"&&assistantChat){
    try{
      const response=await askServer("/rocky/chat",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({message,lang:state.lang,history}),signal:AbortSignal.timeout(85000)});
      if(!response.ok)throw new Error();
      const ai=await response.json();
      if(ai.action==="study"){
        reply=t("rockyNoSource");
      }else if(rockyActions.has(ai.action)){
        suggestion=ai.action;
        reply=t("rockyConfirm");
      }else if(ai.action==="none"&&typeof ai.reply==="string"&&ai.reply.trim()){
        reply=ai.reply.trim().slice(0,600);
        conversation=true;
        chat.at(-1).conversation=true;
      }else{
        reply=t("rockyAIUnavailable");
      }
    }catch(_){reply=t("rockyAIUnavailable");}
  }
  assistantBusy=false;
  if(action&&route==="rocky")reply=runRockyAction(action,unit,message);
  chat.push({who:"rocky",text:reply,conversation,link,suggestion,unit:unit.id,message});
  if(route==="rocky"){
    render();
    if(currentMascot?.place==="rocky"&&evidence)pulseRocky(currentMascot);
  }
}
function rockySuggestion(record) {
  const labels={lesson:"askNext",resume:"continue",model:"example3D",bookmark:"askBookmark"};
  const action=record.suggestion;
  const label=labels[action]?t(labels[action]):t("rockyOpen",{section:t(action)});
  return btn(label,()=>{
    record.suggestion=null;
    record.text=runRockyAction(action,unitMap.get(record.unit),record.message);
    if(route==="rocky")render();
  },"soft");
}
function rocky() {
  const log=div("chat-log",div("bubble",txt("strong",t("rocky")),txt("p",t("rockyIntro"))),...chat.map(record=>
    div("bubble "+(record.who==="me"?"me":""),txt("span",record.text),
      record.conversation&&record.who==="rocky"?txt("p","Qwen","hint"):[],
      record.link?div("actions",bookLink(unitMap.get(record.link.id),record.link.page)):[],
      record.suggestion?div("actions",rockySuggestion(record)):[])));
  log.setAttribute("role","log");
  if(assistantBusy)log.append(div("bubble",txt("span",t("thinking"))));
  requestAnimationFrame(()=>{log.scrollTop=log.scrollHeight;});
  const form=txt("form","","chat-form");
  const input=txt("input","","field");input.placeholder=t("ask");
  input.maxLength=500;input.required=true;input.disabled=assistantBusy;input.setAttribute("aria-label",t("ask"));
  const submit=txt("button",t("send"),"btn primary");submit.type="submit";submit.disabled=assistantBusy;
  form.append(input,submit);
  form.addEventListener("submit",event=>{event.preventDefault();sendChat(input.value);});
  const commands={askHint:"hint",askXP:"xp",askNext:"lesson",askTests:"tests",askBookmark:"bookmark",continue:"resume"};
  const mode=assistantChat?(remoteApi?"rockyServer":"rockyAI"):assistantAvailable?"rockyLegacy":"rockyLocal";
  const intro=assets?.model?div("rocky-banner",heading("rocky","rockyText"),mascot("rocky")):heading("rocky","rockyText");
  const status=txt("p",t(mode),"hint chat-status");
  status.classList.toggle("is-connected",assistantChat);
  return [intro,div("card chat",status,log,form,
    div("actions chat-commands",Object.entries(commands).map(([key,intent])=>btn(t(key),()=>sendChat(t(key),intent),"soft",assistantBusy))))];
}

function updateMode() {
  document.getElementById("top-right").replaceChildren(txt("span","КазМунайГаз","camp"),txt("span",t(assistantChat?"online":"offline"),"pill"));
}

function render(draft) {
  testMapObserver?.disconnect();
  testMapObserver=null;
  main.classList.toggle("test-map-screen",!!state.name&&route==="tests"&&!quiz&&!result);
  document.documentElement.lang=state.lang;
  document.documentElement.dataset.theme=state.theme;
  document.getElementById("skip").textContent=t("skip");
  updateMode();
  nav.hidden=!state.name;
  if(!state.name){main.replaceChildren(onboarding(draft));return;}
  bottom();
  if(quiz)main.replaceChildren(questionScreen());
  else if(result)main.replaceChildren(resultView());
  else {
    const views={home,tasks:practiceList,tests:testMap,rocky,books:bookView,videos:videoView,profile};
    main.replaceChildren(...[route==="chapter"?chapterView():views[route]()].flat(2));
  }
  if(!storageWorks)main.append(txt("p",t("offline"),"hint"));
}
document.querySelector(".brand").addEventListener("click",event=>{event.preventDefault();if(state.name)navigate(chapter?"chapter":"home");});
if(assets?.logo)document.getElementById("brand-mark")?.append(logoMark());
window.addEventListener("storage",event=>{
  if(event.key===storageKey&&!quiz){state=load();render();}
});
setInterval(()=>{
  for(const timer of document.querySelectorAll("[data-until]")){
    const ending=Number(timer.dataset.until);
    if(ending<=Date.now()){render();return;}
    timer.textContent=t("wait",{time:timeText(ending)});
  }
},1000);
if(remoteApi||location.protocol==="http:"||location.protocol==="https:"){
  askServer("/capabilities").then(r=>r.ok?r.json():null).then(features=>{
    assistantAvailable=!!features?.rocky;
    assistantChat=assistantAvailable&&features?.chat===true;
    if(route==="rocky")render();
    else updateMode();
  }).catch(()=>{});
}
render();
