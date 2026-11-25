"use strict";
const data = JSON.parse(document.getElementById("content").textContent);
const {ui, assets, books, units, levels, xpReward, videos} = data;
const unitMap = new Map(units.map(unit => [unit.id,unit]));
const questionMap = new Map(units.flatMap(unit => unit.questions.map(q => [q.id,q])));
const storageKey = "rockigo.local.v1";
const retryDelay = 60 * 60 * 1000;
const languages = ["ru","kk","en"];
const routes = {home:"⌂",tests:"✓",rocky:"✦",books:"▤",videos:"▷",tasks:"◇",profile:"◉"};
const main = document.getElementById("main");
const nav = document.getElementById("nav");
let state = load(), route = "home", quiz, result, bookSelection, player;
let assistantAvailable = false, assistantBusy = false, storageWorks = true;
const chat = [];
let viewerRequested=false;
const mascots=new Map();
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

function playRocky(entry,name,once=false) {
  const {model}=entry;
  if(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches){
    model.pause?.();
    return;
  }
  if(!model.availableAnimations?.includes(name))return;
  model.animationName=name;
  model.currentTime=0;
  if(typeof model.play==="function")model.play({repetitions:once?1:Infinity,pingpong:false});
}

function mascot(place) {
  let entry=mascots.get(place);
  if(!entry){
    const fallback=div("mascot-poster",logoMark());
    const model=txt("model-viewer");
    model.setAttribute("src",assets.model);
    model.setAttribute("loading","eager");
    model.setAttribute("interaction-prompt","none");
    model.setAttribute("camera-orbit","0deg 79deg 115%");
    model.setAttribute("field-of-view","33deg");
    model.setAttribute("environment-image","neutral");
    model.setAttribute("exposure","1.15");
    const wave=btn(t("greetRocky"),()=>{
      playRocky(entry,"Hello",true);
      notify(t("rockyHello"));
    },"mascot-button");
    const card=div("mascot mascot-"+place,div("mascot-glow"),fallback,model,wave);
    entry={card,model,wave};
    mascots.set(place,entry);
    model.addEventListener("load",()=>{
      fallback.hidden=true;
      card.dataset.ready="true";
      playRocky(entry,"Idle");
    });
    model.addEventListener("finished",()=>playRocky(entry,"Idle"));
    model.addEventListener("error",()=>{fallback.hidden=false;card.dataset.ready="false";});
    requestViewer();
  }
  entry.wave.textContent=t("greetRocky");
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
  const panel=div("card",txt("h2",t(next ? "nextLevel":"max")));
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
function home() {
  const current=levels[levelIndex()];
  const terrain=div("terrain",Array.from({length:4},()=>txt("i")));
  terrain.setAttribute("aria-hidden","true");
  const hero=div("hero",div("hero-copy",txt("span",t("level",{n:levelIndex()+1})+" · "+t("xp",{n:earned()}),"pill"),
    txt("h1",t("hello",{name:state.name})),txt("p",t("mainText")),
    div("actions",btn(t("continue"),()=>{
      if (state.resume && canUse(state.resume.kind,state.resume.index)) startQuiz(state.resume.kind,state.resume.index);
      else navigate(state.practice[current.id]?.passed?"tests":"tasks");
    },"positive"))),assets?.model?mascot("home"):terrain);
  return [hero,div("grid card-block",progress(),div("card",txt("h2",t("active")),txt("p",current.title),
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
function collection(kind) {
  const isTest=kind==="tests";
  return [heading(kind,isTest?"testsText":"tasksText"),div("stack",levels.map((item,index)=>{
    const past=isTest?state.tests[item.id]:state.practice[item.id];
    const ending=isTest?readyAt(index):0;
    const timing=ending>Date.now();
    const count=t("questions",{n:item[isTest?"quiz":"practice"].length});
    const title=t("level",{n:index+1})+" · "+local(item.title);
    const stateText=past?txt("p",t("last")+" · "+past.score+"%"+(past.passed?" · "+t("done"):""),past.passed?"good":"bad"):null;
    const button=isTest&&past?.passed ? btn(t("review"),()=>oldResult(index),"soft")
      : btn(index>levelIndex()?t("locked",{n:index+1}):timing?t("wait",{time:timeText(ending)}):t(kind==="tasks"&&past?.passed?"tryPractice":"begin"),
        ()=>startQuiz(isTest?"test":"practice",index),"primary",index>levelIndex()||timing);
    if (timing) button.dataset.until=ending;
    return row(title,count+(isTest?"":" · +"+t("xp",{n:xpReward[index]})),button,stateText);
  }))];
}
function bookLink(unit,page) {
  if(!books[unit.book].id)return txt("span",t("pdf")+" "+page,"pill");
  const link=txt("a",t("openPdf")+" · "+t("pdf")+" "+page,"btn soft");
  link.href="https://drive.google.com/file/d/"+books[unit.book].id+"/view#page="+page;
  link.target="_blank";link.rel="noopener noreferrer";
  return link;
}
function bookView() {
  const content = Object.entries(books).map(([id,book])=>div("card read",txt("h2",book.title),
    txt("p",book.author+" · PDF "+book.range,"muted"),...units.filter(unit=>unit.book===id).map(unit=>{
      const detail=txt("details");
      detail.open=bookSelection===unit.id;
      const summary=txt("summary",unit.title);
      const attempt=state.tests[unit.id];
      if(attempt) summary.append(txt("small"," · "+status(attempt.score)+" ("+attempt.score+"%)","book-note "+(attempt.passed?"good":"bad")));
      detail.append(summary,...unit.facts.map(f=>div("read-fact",txt("p",f.explanation),bookLink(unit,f.page))),
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
function questionScreen() {
  const q=questionMap.get(quiz.ids[quiz.pos]);
  const title=levels[quiz.index].title;
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
      label.append(input,txt("span",option)); fields.append(label);
    });
  } else if(q.type==="order"){
    quiz.choice ??= q.options.map((_,i)=>i);
    const list=txt("ol","","order-list");
    function draw() {
      list.replaceChildren(...quiz.choice.map((key,position)=>{
        const item=txt("li",q.options[key]);
        for (const [direction,label] of [[-1,"moveUp"],[1,"moveDown"]]) {
          const target=position+direction;
          const move=btn(t(label),()=>{
            [quiz.choice[position],quiz.choice[target]]=[quiz.choice[target],quiz.choice[position]];
            draw();list.children[target].querySelector("button:not(:disabled)")?.focus();
          },"soft",quiz.checked||target<0||target>=q.options.length);
          move.setAttribute("aria-label",t(label)+" · "+local(q.options[key]));
          item.append(move);
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
  const back=btn(t("back"),()=>navigate(route),"soft");
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
  });
  const tip=quiz.kind==="practice"||state.background==="beginner"?div("actions",btn(t("seeBook"),()=>{
    const savedQuiz=quiz;
    navigate("books",q.unit);
    if(savedQuiz.checked){
      state.resume={kind:savedQuiz.kind,index:savedQuiz.index,answers:savedQuiz.answers.slice(0,savedQuiz.pos)};
      save();
    }
  },"soft")):[];
  return div("card quiz",txt("p",title,"pill"),txt("p",t("quizStep",{n:quiz.pos+1,total:quiz.ids.length}),"muted"),
    txt("h2",q.prompt),q.type==="multi"?txt("p",t("multi"),"hint"):q.type==="order"?txt("p",t("order"),"hint"):[],form,tip);
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
  if(result.gain&&saved)notify(t("gained",{n:result.gain}));
}
function oldResult(index) {
  result={kind:"test",index,attempt:state.tests[levels[index].id],gain:0};quiz=null;render();main.focus();
}
function resultView() {
  const {kind,index,attempt,gain}=result;
  const label=kind==="test"?(attempt.passed?"testPassed":"testFailed"):(attempt.passed?"practicePassed":"practiceFailed");
  return div("quiz",div("card",txt("p",levels[index].title,"pill"),txt("h1",t(label)),
    txt("div",attempt.score+"%","metric"),txt("p",status(attempt.score),attempt.passed?"good":"bad"),
    gain?txt("p",t("gained",{n:gain})) : [],
    kind==="test"&&!attempt.passed&&readyAt(index)>Date.now()?timerText(readyAt(index)):[],
    div("actions",btn(t("back"),()=>navigate(route),"soft"),btn(t("continue"),()=>navigate("home"),"primary"))),
    div("stack card-block",(attempt.answers??[]).filter(item=>questionMap.has(item.id)).map(item=>{
      const q=questionMap.get(item.id);
      return div("card",txt("h3",q.prompt),answerPanel(q,item.ok),btn(t("seeBook"),()=>navigate("books",q.unit),"soft"));
    })));
}
function timerText(ending) {
  const text=txt("p",t("wait",{time:timeText(ending)}),"muted");
  text.dataset.until=ending;return text;
}

function localIntent(input) {
  const s=input.toLowerCase();
  if(/заклад|bookmark|бетбел/.test(s))return "bookmark";
  if(/(открой|перейди|покажи|open|go to|аш|көрсет).*(тест|test)/.test(s))return "tests";
  if(/(открой|перейди|покажи|open|go to|аш|көрсет).*(книг|book|кітап)/.test(s))return "books";
  if(/(открой|перейди|покажи|open|go to|аш|көрсет).*(видео|video|бейне)/.test(s))return "videos";
  if(/(открой|перейди|покажи|open|go to|аш|көрсет).*(урок|lesson|сабақ)/.test(s))return "lesson";
  if(/(открой|перейди|покажи|open|go to|аш|көрсет).*(задани|practice|тапсыр)/.test(s))return "tasks";
  if(/(опыт|тәжірибе|ұпай|\bxp\b)/.test(s))return "xp";
  if(/тест|test|70%|таймер|retry/.test(s))return "testHelp";
  return "hint";
}
async function sendChat(value) {
  const message=String(value??"").trim().slice(0,500);
  if(!message||assistantBusy)return;
  chat.push({who:"me",text:message}); assistantBusy=true;render();
  const intent=localIntent(message);
  let factIndex=0, usedModel=false;
  const unit=units[Math.min(levelIndex(),units.length-1)];
  if(intent==="hint"){
    const tokens=message.toLowerCase().split(/[^\p{L}]+/u).filter(word=>word.length>=5).map(word=>word.slice(0,6));
    const scores=unit.facts.map(f=>{
      const term=local(f.term).toLowerCase();
      const wording=local(f.explanation).toLowerCase();
      return tokens.reduce((score,w)=>score+(term.includes(w)?2:wording.includes(w)?1:0),0);
    });
    const best=Math.max(...scores);
    factIndex=scores.indexOf(best);
    if(assistantAvailable){
      try{
        const response=await askServer("/rocky",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,lang:state.lang,unit:unit.id})});
        const ai=await response.json();
        if(!response.ok)throw new Error();
        if(Number.isInteger(ai.fact)&&unit.facts[ai.fact]&&scores[ai.fact]>=best-1){
          factIndex=ai.fact;
          usedModel=true;
        }
      }catch(_){notify(t("aiFallback"));}
    }
  }
  let reply=intent==="xp"?t("helpXP"):intent==="testHelp"?t("helpTest"):t("moved");
  if(intent==="hint")reply=local(unit.facts[factIndex].explanation)+" · "+t("pdf")+" "+unit.facts[factIndex].page;
  if(intent==="bookmark"){bookmark(unit.id);reply=t("bookmarked");}
  const destination=["tests","books","videos","tasks"].includes(intent)?intent:intent==="lesson"?"books":null;
  chat.push({who:"rocky",text:reply,usedModel,link:intent==="hint"?{id:unit.id,page:unit.facts[factIndex].page}:null});
  assistantBusy=false;
  if(route==="rocky"&&destination) navigate(destination,intent==="lesson"?unit.id:null);
  else if(route==="rocky"){
    render();
    const entry=mascots.get("rocky");
    if(entry&&intent==="hint")playRocky(entry,"Celebrate",true);
  }
}
function rocky() {
  const log=div("chat-log",div("bubble",txt("strong",t("rocky")),txt("p",t("rockyIntro"))),...chat.map(record=>
    div("bubble "+(record.who==="me"?"me":""),txt("span",record.text),
      record.usedModel?txt("p","Qwen · "+t("source"),"hint"):[],
      record.link?div("actions",bookLink(unitMap.get(record.link.id),record.link.page)):[])));
  log.setAttribute("role","log");
  if(assistantBusy)log.append(div("bubble",txt("span",t("thinking"))));
  requestAnimationFrame(()=>{log.scrollTop=log.scrollHeight;});
  const form=txt("form","","chat-form");
  const input=txt("input","","field");input.placeholder=t("ask");
  input.maxLength=500;input.required=true;input.disabled=assistantBusy;input.setAttribute("aria-label",t("ask"));
  const submit=txt("button",t("send"),"btn primary");submit.type="submit";submit.disabled=assistantBusy;
  form.append(input,submit);
  form.addEventListener("submit",event=>{event.preventDefault();sendChat(input.value);});
  const commands=["askHint","askXP","askNext","askTests","askBookmark"];
  const mode=assistantAvailable?(remoteApi?"rockyServer":"rockyAI"):"rockyLocal";
  const intro=assets?.model?div("rocky-banner",heading("rocky","rockyText"),mascot("rocky")):heading("rocky","rockyText");
  return [intro,div("card chat",txt("p",t(mode),"hint"),log,
    div("actions",commands.map(key=>btn(t(key),()=>sendChat(t(key)),"soft",assistantBusy))),form)];
}

function render(draft) {
  document.documentElement.lang=state.lang;
  document.documentElement.dataset.theme=state.theme;
  document.getElementById("skip").textContent=t("skip");
  document.getElementById("top-right").replaceChildren(txt("span","КазМунайГаз","camp"),txt("span",t("offline"),"pill"));
  nav.hidden=!state.name;
  if(!state.name){main.replaceChildren(onboarding(draft));return;}
  bottom();
  if(quiz)main.replaceChildren(questionScreen());
  else if(result)main.replaceChildren(resultView());
  else {
    const views={home,tasks:()=>collection("tasks"),tests:()=>collection("tests"),rocky,books:bookView,videos:videoView,profile};
    main.replaceChildren(...[views[route]()].flat(2));
  }
  if(!storageWorks)main.append(txt("p",t("offline"),"hint"));
}
document.querySelector(".brand").addEventListener("click",event=>{event.preventDefault();if(state.name)navigate("home");});
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
    assistantAvailable=!!features?.rocky;if(route==="rocky")render();
  }).catch(()=>{});
}
render();
