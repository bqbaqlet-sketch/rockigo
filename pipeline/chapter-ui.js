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
    feedback.replaceChildren(txt("strong",correct?"Верно":"Разбор ответа"),txt("p",task.explanation),txt("span","Источник · стр. "+source,"chapter-source-label"));
  });
  return form;
}

function chapterLesson(step,index) {
  const previous=chapter.steps[index-1], next=chapter.steps[index+1];
  const header=div("chapter-lesson-header",btn("К пути по главе",()=>openChapterStep(null),"soft"),
    txt("p",`Шаг ${index+1} из ${chapter.steps.length} · ${step.minutes} мин · ${chapterPages(step.pages)}`,"muted"),txt("h1",step.title));
  const figure=txt("figure","","chapter-diagram");
  figure.append(txt("figcaption","Схема чтения шага"),div("chapter-diagram-points",txt("span","Вопрос"),txt("span","Источник"),txt("span","Проверка вывода")));
  const evidence=txt("blockquote",chapterReadable(step.evidence.quote));
  const summary=div("card chapter-summary",txt("h2","Суть"),txt("p",step.summary),
    txt("p",step.summaryByModel?"Учебное пояснение · ИИ":"Фрагмент источника","chapter-source-label"),
    evidence,txt("p",`стр. ${step.evidence.page_pdf} · автор`,"chapter-source-label"),figure);
  summary.append(txt("h3","Ключевое понятие"),txt("p",step.term));
  const tasks=div("card chapter-tasks",txt("h2","Проверка понимания"),...step.tasks.map(task=>chapterQuestion(task,step.taskSources)));
  const finish=()=>{
    chapterProgress().done[step.id]=true;
    if(next)openChapterStep(next.id);
    else{save();openChapterStep(null);}
  };
  return [header,summary,chapterSourceUnits(step),chapterFlashcard(step),tasks,
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
