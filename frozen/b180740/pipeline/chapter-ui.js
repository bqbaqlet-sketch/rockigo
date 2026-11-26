let chapterOpen=null;

function chapterProgress() {
  return state.chapterProgress??={current:null,done:{},cards:{},solved:{}};
}

function openChapterStep(id) {
  chapterOpen=id;
  if(id){chapterProgress().current=id;save();}
  render();
  main.focus();
  window.scrollTo({top:0,behavior:"instant"});
}

function chapterPages(pages) {
  return "PDF "+(pages.length===1?pages[0]:pages[0]+"–"+pages.at(-1));
}

function chapterImage(step) {
  if(bookScenes[step.scene])return bookModel({scene:step.scene,term:step.title});
  if(!step.scene)return [];
  const figure=txt("figure","","chapter-science");
  const canvas=txt("canvas");
  canvas.width=680; canvas.height=260;
  canvas.setAttribute("role","img");
  const context=canvas.getContext("2d");
  const details={
    invasion:["Фильтрат у стенки скважины","При давлении в скважине выше пластового фильтрат может проникать в проницаемую породу."],
    contact:["Контакт и переходная зона","Показаны нефтяная часть, условная переходная зона и вода. Границы переходной зоны нельзя подменять одной отметкой."],
    crossplot:["Точка на осях палетки","Точка соответствует пористости 25% и сопротивлению 20 Ом·м. Границы областей на схеме опущены."],
    storage:["Упругий запас","При одинаковом снижении давления большему коэффициенту упругоёмкости соответствует больший высвобожденный объём."],
    diffusion:["Выравнивание давления","Гладкие профили показывают распространение изменения давления в линейной модели."],
    gallery:["Линейный приток к галерее","В линейной модели движение направлено к прямой границе отбора."],
    radial:["Радиальный приток к скважине","При осевой симметрии линии равного давления образуют кольца, а жидкость движется к скважине."],
    radius:["Расчётная длина области","При постоянном отборе из галереи длина условной зоны пропорциональна квадратному корню из времени."],
    trap:["Кровля ловушки и контакт","В показанной массивной ловушке высота залежи уменьшается от свода к крыльям."]
  }[step.scene];
  if(!details||!context)return [];
  canvas.setAttribute("aria-label",details[1]);
  figure.append(canvas,txt("figcaption",details[0]),txt("p",details[1]),txt("small","Схема · не в масштабе · стр. PDF "+step.evidence.page_pdf));
  const line=(points,color="#8ee7d5",width=4)=>{
    context.beginPath(); context.strokeStyle=color;context.lineWidth=width;
    points.forEach(([x,y],i)=>i?context.lineTo(x,y):context.moveTo(x,y));context.stroke();
  };
  const label=(text,x,y)=>{
    context.fillStyle="#f2f9ff";context.font="19px system-ui";context.fillText(text,x,y);
  };
  const dot=(x,y)=>{context.beginPath();context.arc(x,y,7,0,2*Math.PI);context.fillStyle="#ffc576";context.fill();};
  const arrow=(x,y,toX,toY)=>{
    const angle=Math.atan2(toY-y,toX-x);
    line([[x,y],[toX,toY],[toX-10*Math.cos(angle-.5),toY-10*Math.sin(angle-.5)]]);
    line([[toX,toY],[toX-10*Math.cos(angle+.5),toY-10*Math.sin(angle+.5)]]);
  };
  context.fillStyle="#13263a";context.fillRect(0,0,680,260);
  if(step.scene==="crossplot"){
    line([[92,32],[92,207],[623,207]],"#cbd9ed",2); label("Сопротивление, Ом·м",105,46);
    label("Пористость, %",447,244);
    line([[92,106],[411,106],[411,207]],"#6c91ad",2);dot(411,106);label("20",55,112);label("25",400,231);
  }else if(step.scene==="radial"){
    for(const radius of [42,74,109]){
      context.beginPath();context.arc(210,130,radius,0,2*Math.PI);context.strokeStyle="#7e9db8";context.lineWidth=3;context.stroke();
    }
    dot(210,130);arrow(390,130,234,130);arrow(35,130,186,130);
    label("Скважина",426,127);label("Изобары на плане",426,156);
  }else if(step.scene==="radius"||step.scene==="diffusion"){
    line([[72,45],[72,206],[604,206]],"#cbd9ed",2);
    if(step.scene==="radius"){
      for(const [x,y,width,text] of [[95,94,186,"t"],[95,152,372,"4t"]]){
        line([[x,y],[x+width,y]]);dot(x+width,y);label(text,x+width+14,y+6);
      }
      label("Расстояние от галереи",395,239);
    }else{
      for(const span of [90,180,270]){
        line(Array.from({length:75},(_,i)=>[73+i*7,79+110*Math.exp(-((i*7/span)**2))]));
      }
      label("Давление",93,48);label("Расстояние",495,239);
    }
  }else if(step.scene==="trap"||step.scene==="contact"){
    context.fillStyle="#397c9f";context.fillRect(49,156,578,54);
    if(step.scene==="trap"){
      context.fillStyle="#b99058";context.beginPath();context.moveTo(49,156);
      context.bezierCurveTo(230,45,404,32,627,156);context.fill();
      line([[350,63],[350,156]],"#f7deac",2);label("Свод",323,52);
    }else{
      context.fillStyle="#b99058";context.fillRect(49,76,578,56);
      context.fillStyle="#688d90";context.fillRect(49,132,578,24);label("Переходная зона",65,150);
    }
    label("Вода",64,193);
  }else if(step.scene==="storage"){
    context.fillStyle="#69bea8";context.fillRect(150,104,140,76); context.fillRect(379,55,140,125);
    label("Меньше β*",158,212);label("Больше β*",386,212);label("Высвобожденный объём",209,36);
  }else{
    context.fillStyle="#325879";context.fillRect(49,58,105,153);
    context.fillStyle="#af865c";context.fillRect(154,58,476,153);
    for(const y of [94,134,174]){
      if(step.scene==="invasion")arrow(106,y,334,y);
      else arrow(397,y,143,y);
    }
    label(step.scene==="invasion"?"Ствол скважины":"Галерея",60,39);
    label("Проницаемая порода",374,39);
  }
  return figure;
}

function chapterExtras(step) {
  const formulas=(step.formulaUnits??[]).map(id=>unitMap.get(id)).filter(Boolean);
  return [
    step.practice?div("card",txt("h2","Практика"),txt("p",step.practice),txt("p",chapterPages(step.pages),"muted")):[],
    step.nuance?div("card",txt("h2","Условия применимости"),txt("p",step.nuance),txt("p",chapterPages(step.pages),"muted")):[],
    formulas.length?div("card",formulas.map(bookFormulas)):[],
    step.examples?.length?div("card",txt("h2","Разбор из главы"),step.examples.map(example=>{
      const list=txt("ol");list.append(...example.steps.map(item=>txt("li",item)));
      return div("chapter-example",txt("h3","Условие"),txt("p",example.condition),list,
        txt("strong",example.result),txt("p","PDF "+example.page_pdf+(example.figure?" · "+example.figure:""),"muted"));
    })):[],
    step.decision?div("card",txt("h2","Решение на данных"),txt("p",step.decision.rule),txt("p",step.decision.conclusion)):[],
  ];
}

function chapterVideo(step) {
  if(!step.media?.file)return [];
  const video=txt("video","","chapter-video "+(step.media.orientation==="portrait"?"portrait":"landscape"));
  video.controls=true; video.playsInline=true; video.preload="metadata";
  video.src=step.media.file;
  const captions=txt("track");
  captions.kind="captions"; captions.srclang="ru"; captions.label="Русские субтитры";
  captions.src=step.media.captions; video.append(captions);
  const link=(name,href)=>{
    const a=txt("a",name,"book-source");a.href=href;return a;
  };
  return div("card",txt("h2",step.media.title), video,
    div("lesson-sources",link("Паспорт ролика",step.media.passport),link("Спецификация сцены",step.media.specification)));
}

function chapterReadable(text) {
  return text.replace(/\$+|\\\[|\\\]|\\\(|\\\)/g, "").replaceAll("\\%", "%");
}

function chapterOverview() {
  const progress=chapterProgress();
  const done=chapter.steps.filter(step=>progress.done[step.id]).length;
  const resume=chapter.steps.find(step=>step.id===progress.current)??chapter.steps[0];
  const introduction=div("chapter-hero",txt("p",chapter.scope,"chapter-kicker"),txt("h1",chapter.title),
    txt("p",`${chapter.author} · ${chapter.book}`),
    div("chapter-actions",btn(progress.current?"Продолжить курс":"Начать курс",()=>openChapterStep(resume.id),"positive"),
      btn("Распечатать конспект",()=>window.print(),"soft")));
  const checklist=txt("ol","","chapter-path");
  for(const step of chapter.steps){
    const previous=chapter.steps.find(item=>item.id===step.prerequisite);
    const item=txt("li");
    const title=btn(step.title,()=>openChapterStep(step.id),progress.done[step.id]?"soft chapter-done":"soft");
    const detail=txt("p",`${step.minutes} мин · ${chapterPages(step.pages)}`,"muted");
    item.append(div("chapter-path-card",title,detail,previous?txt("p","Опирается на шаг «"+previous.title+"». ","chapter-dependency"):[]));
    checklist.append(item);
  }
  return [introduction,div("chapter-path-header",txt("h2","Путь по главе"),txt("span",`${done} из ${chapter.steps.length} пройдено`,"pill")),checklist];
}

function chapterTable(text) {
  const table=txt("table");
  const body=txt("tbody");
  for(const line of text.split("\n")){
    if(!line.trim().startsWith("|")||/^\|[|\s:\-]+\|$/.test(line.trim()))continue;
    const row=txt("tr");
    const element=body.children.length?"td":"th";
    for(const cell of line.trim().split("|").slice(1,-1))row.append(txt(element,chapterReadable(cell.trim())));
    body.append(row);
  }
  table.append(body);
  const wrap=div("chapter-table",table);
  wrap.tabIndex=0;
  wrap.setAttribute("aria-label","Таблица из книги, прокрутка по горизонтали");
  return wrap;
}

function chapterSourceUnits(step) {
  const details=txt("details","","card chapter-doc");
  details.append(txt("summary","Фрагменты и задания из книги"));
  for(const item of step.units){
    if(!item.text&&!item.review)continue;
    const block=div("chapter-source-unit",txt("span",`стр. ${item.page} · автор`,"chapter-source-label"));
    if(item.text)block.append(item.kind==="table"&&item.text.startsWith("|")?chapterTable(item.text):
      txt(item.kind==="heading"?"h3":"p",chapterReadable(item.text),"chapter-source-text"));
    if(item.review)block.append(txt("p",item.review,"chapter-source-review"));
    details.append(block);
  }
  return details;
}

function chapterFlashcard(step) {
  const details=txt("details","","card chapter-flash");
  details.append(txt("summary","Карточка · Что важно запомнить?"),txt("p",step.summary));
  const status=txt("p",chapterProgress().cards[step.id]??"","muted");
  status.setAttribute("role","status");
  const mark=label=>{
    chapterProgress().cards[step.id]=label;
    save();
    status.textContent=label;
  };
  details.append(div("chapter-actions",btn("Знаю",()=>mark("Знаю"),"soft"),btn("Повторить",()=>mark("Повторить"),"soft")),status);
  return details;
}

function chapterOrder(task, parent) {
  const list=txt("ol","","chapter-order");
  const order=task.options.map(item=>item.id);
  const move=(from,to)=>{
    if(from===to||to<0||to>=order.length)return;
    order.splice(to,0,...order.splice(from,1));
    draw();
  };
  function draw() {
    list.replaceChildren(...order.map((id,index)=>{
      const item=txt("li");
      const handle=txt("span","⠿","chapter-drag-handle");
      handle.setAttribute("aria-hidden","true");
      item.dataset.orderIndex=index;
      handle.addEventListener("pointerdown",event=>{
        handle.setPointerCapture(event.pointerId);
        item.classList.add("chapter-dragging");
      });
      handle.addEventListener("pointercancel",()=>item.classList.remove("chapter-dragging"));
      handle.addEventListener("pointerup",event=>{
        item.classList.remove("chapter-dragging");
        const target=document.elementFromPoint(event.clientX,event.clientY)?.closest("[data-order-index]");
        if(target&&list.contains(target))move(index,Number(target.dataset.orderIndex));
      });
      const option=task.options.find(entry=>entry.id===id);
      const up=btn("↑",()=>move(index,index-1),"soft",index===0);
      const down=btn("↓",()=>move(index,index+1),"soft",index===order.length-1);
      up.setAttribute("aria-label","Выше · "+option.text);
      down.setAttribute("aria-label","Ниже · "+option.text);
      item.append(handle,txt("span",option.text),div("chapter-order-actions",up,down));
      return item;
    }));
  }
  draw();
  parent.append(list);
  return order;
}

function chapterQuestion(task, pages) {
  const form=txt("form","","chapter-question");
  const group=txt("fieldset");
  const legend=txt("legend",task.prompt);
  if(task.kind==="data")legend.classList.add("chapter-decision");
  group.append(legend);
  let order;
  if(task.type==="order"){
    order=chapterOrder(task,group);
  }else if(task.type==="single"||task.type==="multiple"){
    for(const option of task.options){
      const input=txt("input");
      input.type=task.type==="multiple"?"checkbox":"radio";
      input.value=option.id;input.name="answer";
      if(task.type==="single")input.required=true;
      const label=txt("label","","option");
      label.append(input,txt("span",option.text));
      group.append(label);
    }
  }else{
    const input=txt("input","","field");
    input.name="answer";input.required=true;
    input.setAttribute("aria-label","Твой ответ");
    group.append(input);
  }
  const submit=txt("button","Проверить","btn primary");
  submit.type="submit";
  const feedback=div("chapter-feedback");
  feedback.setAttribute("role","status");
  form.append(group,submit,feedback);
  form.addEventListener("submit",event=>{
    event.preventDefault();
    const entered=new FormData(form).getAll("answer");
    if(!order&&!entered.length){feedback.textContent="Выбери ответ.";return;}
    const key=task.answer;
    const correct=order?order.join()===key.join():task.type==="multiple"?entered.sort().join()===[...key].sort().join():
      task.type==="gap"?key.some(word=>normal(word)===normal(entered[0])):entered[0]===key;
    if(correct){chapterProgress().solved[task.id]=true;save();}
    feedback.className="chapter-feedback "+(correct?"correct-note":"wrong-note");
    const source=[...new Set(task.claim_ids.map(id=>pages[id]))].join(", ");
    const expected=task.options?(Array.isArray(key)?key:[key]).map(id=>task.options.find(item=>item.id===id)?.text).join(" → "):
      Array.isArray(key)?key[0]:key;
    feedback.replaceChildren(txt("strong",correct?"Верно":"Разбор ответа"),txt("p","Ответ — "+expected),
      txt("p",task.explanation),txt("span","Источник · стр. "+source,"chapter-source-label"));
  });
  return form;
}

function chapterLesson(step,index) {
  const previous=chapter.steps[index-1], next=chapter.steps[index+1];
  const header=div("chapter-lesson-header",btn("К пути по главе",()=>openChapterStep(null),"soft"),
    txt("p",`Шаг ${index+1} из ${chapter.steps.length} · ${step.minutes} мин · ${chapterPages(step.pages)}`,"muted"),txt("h1",step.title));
  const evidence=txt("blockquote",chapterReadable(step.evidence.quote));
  const summary=div("card chapter-summary",txt("h2","Суть"),txt("p",step.summary),
    txt("p",step.summaryByModel?"Учебное пояснение · ИИ":"Фрагмент источника","chapter-source-label"),
    evidence,txt("p",`стр. ${step.evidence.page_pdf} · автор`,"chapter-source-label"),chapterImage(step));
  summary.append(txt("h3","Ключевое понятие"),txt("p",step.term));
  const tasks=div("card chapter-tasks",txt("h2","Проверка понимания"),...step.tasks.map(task=>chapterQuestion(task,step.taskSources)));
  const finish=()=>{
    chapterProgress().done[step.id]=true;
    if(next)openChapterStep(next.id);
    else{save();openChapterStep(null);}
  };
  return [header,summary,...chapterExtras(step),chapterVideo(step),chapterSourceUnits(step),chapterFlashcard(step),tasks,
    div("chapter-actions",previous?btn("Назад",()=>openChapterStep(previous.id),"soft"):[],
      btn(next?"Сохранить и дальше":"Завершить главу",finish,"primary"))];
}

function chapterView() {
  const index=chapter.steps.findIndex(step=>step.id===chapterOpen);
  const summary=txt("section","","chapter-print");
  summary.append(txt("h1",chapter.title),txt("p",`${chapter.author} · ${chapter.book}`),...chapter.steps.map(step=>
    div("chapter-print-item",txt("h2",step.title),txt("p",step.summary),txt("p",chapterPages(step.pages),"muted"))));
  return [div("chapter-view",index<0?chapterOverview():chapterLesson(chapter.steps[index],index)),summary];
}
