const assemblyRoutes = {tests:"assemblyMap", tasks:"tasks", videos:"videoTitle"};
let assemblyResult, assemblyActive = false, assemblyStep = 0;

function showingAssembly(view) {
  return Boolean(assemblyActive && assemblyResult && Object.hasOwn(assemblyRoutes,view));
}

function assemblyActions(view) {
  if (!data.assembly) return [];
  return div("assembly-actions",
    btn(t("assemblyBuild"), () => assemblyDialog(view), "soft assembly-launch"),
    assemblyResult ? btn(t("assemblyLast"), () => openAssembly(view), "soft") : []);
}

function openAssembly(view) {
  assemblyActive = true;
  if (route !== view) navigate(view);
  else refreshAssembly();
}

function refreshAssembly() {
  render();
  main.focus();
  window.scrollTo({top:0,behavior:"instant"});
}

function assemblyDialog(view) {
  const config = data.assembly;
  const dialog = txt("dialog", "", "assembly-dialog");
  const title = txt("h2", t("assemblyBuild"));
  title.id = "assembly-dialog-title";
  dialog.setAttribute("aria-labelledby", title.id);
  let operation;
  function dismiss() {
    operation?.abort();
    dialog.close();
    dialog.remove();
  }
  const close = btn(t("close"),dismiss,"soft");
  const status = txt("p", "", "assembly-status");
  status.setAttribute("role", "status");
  const progress = txt("progress");
  progress.hidden = true;
  progress.setAttribute("aria-label", t("assemblyWait"));
  const sample = btn(t(config.worker ? "assemblyExample" : "assemblyOpenExample"), () => run(async (signal,update) => {
    const sampleResponse = await fetch(new URL(config.pdf,location.href),{signal});
    if (!sampleResponse.ok) throw new Error(t("assemblyFailed"));
    const pdf = await sampleResponse.blob();
    if (!config.worker) return {...config.example, pdf, firstPage:1};

    const response = await fetch(new URL("sample.md",new URL(config.worker,location.href)),{signal});
    if (!response.ok) throw new Error(t("assemblyFailed"));
    const metadata = {source:"sample.md", pdf:"sample.pdf", title:"Измерения в учебной скважине",
      author:"RockiGo", book:"Учебный пример", pages:"1–14", first_pdf_page:"1"};
    return assembleChapter(config.worker, metadata, await response.blob(), pdf, signal, update);
  }), "primary");
  const sources = config.worker ? assemblySourceForm(config.worker,run) : assemblyImportForm(run);
  const actions = [sample,...sources.querySelectorAll("button")];
  dialog.append(div("assembly-dialog-head",title,close),txt("p",t(config.worker ? "assemblyAbout" : "assemblyLocal"),"muted"),sample,sources,progress,status);
  document.body.append(dialog);
  dialog.addEventListener("cancel",event => {event.preventDefault();dismiss();});
  dialog.showModal();

  async function run(assemble) {
    if (operation) return;
    const controller = new AbortController();
    operation = controller;
    const update = message => {status.textContent = message;};
    progress.hidden = false;
    status.classList.remove("bad");
    update(t("assemblyWait"));
    for (const control of actions) control.disabled = true;
    try {
      const result = await assemble(controller.signal,update);
      if (controller.signal.aborted) return;
      if (result.pdf) result.pdfUrl = URL.createObjectURL(new Blob([result.pdf],{type:"application/pdf"}));
      delete result.pdf;
      if (assemblyResult?.pdfUrl) URL.revokeObjectURL(assemblyResult.pdfUrl);
      assemblyResult = {...result, solved:new Set()};
      assemblyStep = 0;
      dismiss();
      openAssembly(view);
    } catch (error) {
      if (controller.signal.aborted) return;
      status.classList.add("bad");
      update(error.message || t("assemblyFailed"));
    } finally {
      operation = undefined;
      progress.hidden = true;
      for (const control of actions) control.disabled = false;
    }
  }
}

function assemblyFile(accept) {
  const input = txt("input", "", "field");
  input.type = "file";
  input.accept = accept;
  input.required = true;
  return input;
}

function assemblySubmit() {
  const button = txt("button", t("assemblyBuild"), "btn primary");
  button.type = "submit";
  return button;
}

function assemblySourceForm(worker, run) {
  const details = txt("details", "", "assembly-inputs");
  const form = txt("form");
  const markdown = assemblyFile(".md,.markdown,text/markdown");
  const pdf = assemblyFile(".pdf,application/pdf");
  const pages = txt("input", "", "field");
  pages.placeholder = "9–14, 20–30";
  pages.maxLength = 120;
  const firstPage = txt("input", "", "field");
  firstPage.type = "number";
  firstPage.min = "1";
  firstPage.max = "99999";
  firstPage.value = "1";
  firstPage.required = true;
  const title = txt("input", "", "field");
  title.maxLength = 140;
  form.append(labeled("Markdown",markdown),labeled("PDF",pdf),labeled(t("assemblyRange"),pages),
    txt("p",t("assemblyMarkers"),"muted assembly-help"),labeled(t("assemblyPdfStart"),firstPage),
    labeled(t("assemblyChapterName"),title),assemblySubmit());
  details.append(txt("summary",t("assemblyOwn")),form);
  form.addEventListener("submit", event => {
    event.preventDefault();
    const [source] = markdown.files;
    const [document] = pdf.files;
    const metadata = {source:source.name, pdf:document.name, title:title.value.trim() || source.name.replace(/\.[^.]+$/,""),
      author:"", book:"", pages:pages.value.trim(), first_pdf_page:firstPage.value};
    run((signal,update) => assembleChapter(worker,metadata,source,document,signal,update));
  });
  return details;
}

function assemblyImportForm(run) {
  const details = txt("details", "", "assembly-inputs");
  const form = txt("form");
  const file = assemblyFile(".json,application/json");
  const submit = assemblySubmit();
  submit.textContent = t("assemblyOpenResult");
  form.append(labeled("course.json",file),submit);
  details.append(txt("summary",t("assemblyOpenResult")),form);
  form.addEventListener("submit", event => {
    event.preventDefault();
    run(async () => {
      try {
        const course = JSON.parse(await file.files[0].text());
        if (!validAssemblyCourse(course)) throw new Error();
        return {course};
      } catch (_) { throw new Error(t("assemblyBadResult")); }
    });
  });
  return details;
}

function validAssemblyCourse(course) {
  const string = value => typeof value === "string" && value.length > 0;
  const page = value => Number.isInteger(value) && value > 0;
  return string(course?.title) && Array.isArray(course.steps) && course.steps.length > 0 && course.steps.every(step =>
    string(step?.id) && string(step.title) && string(step.summary) && Array.isArray(step.pages) && step.pages.length > 0 &&
    step.pages.every(page) && page(step.evidence?.page_pdf) && Array.isArray(step.tasks) && step.tasks.every(task => {
      if (!string(task?.id) || !string(task.prompt) || !Array.isArray(task.claim_ids) ||
          !task.claim_ids.every(id => page(step.taskSources?.[id]))) return false;
      const keys = Array.isArray(task.answer) ? task.answer : [task.answer];
      if (!keys.length || !keys.every(string)) return false;
      if (task.type === "gap") return Array.isArray(task.answer);
      return ["single","multiple","order"].includes(task.type) && Array.isArray(task.options) && task.options.length >= 2 &&
        task.options.every(option => string(option?.id) && string(option.text)) && keys.every(key => task.options.some(option => option.id === key));
    }));
}

async function assembleChapter(path, metadata, source, pdf, signal, update) {
  const [markdown, pdfBytes] = await Promise.all([source.arrayBuffer(),pdf.arrayBuffer()]);
  signal.throwIfAborted();
  return new Promise((resolve,reject) => {
    const worker = new Worker(new URL(path,location.href),{type:"module"});
    function finish(callback,value) {
      worker.terminate();
      signal.removeEventListener("abort",abort);
      callback(value);
    }
    const abort = () => finish(reject,signal.reason);
    signal.addEventListener("abort",abort,{once:true});
    worker.onerror = () => finish(reject,new Error(t("assemblyFailed")));
    worker.onmessage = ({data:message}) => {
      if (message.message) {
        update(state.lang === "ru" ? message.message : t("assemblyWait"));
        return;
      }
      try {
        if (message.error) throw new Error(message.error);
        const files = Object.fromEntries(message.outputs);
        const course = JSON.parse(new TextDecoder().decode(files["course.json"]));
        finish(resolve,{course,report:message.report,zip:files["RockiGo-chapter.zip"],pdf,firstPage:Number(metadata.first_pdf_page)});
      } catch (error) { finish(reject,error); }
    };
    try { worker.postMessage({metadata,markdown,pdf:pdfBytes},[markdown,pdfBytes]); }
    catch (error) { finish(reject,error); }
  });
}

function assemblyPages(pages) {
  const list = [...new Set(pages)].sort((a,b) => a-b);
  if (list.length < 2) return list.join("");
  return list.every((page,index) => page === list[0]+index) ? `${list[0]}–${list.at(-1)}` : list.join(", ");
}

function assemblyCitation(page) {
  const label = t("assemblySourcePages",{pages:page});
  if (!assemblyResult.pdfUrl) return txt("span",label,"muted assembly-citation");
  const link = txt("a",label,"book-source assembly-citation");
  link.href = assemblyResult.pdfUrl + "#page=" + (page-assemblyResult.firstPage+1);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

function assemblyDownload(contents, type, name) {
  const address = URL.createObjectURL(new Blob([contents],{type}));
  const link = txt("a");
  link.href = address;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(address),30000);
}

function assemblyView(view) {
  const {course,report,zip} = assemblyResult;
  const step = course.steps[assemblyStep];
  const back = btn(t("assemblyFirst"),() => {assemblyActive = false;refreshAssembly();},"soft");
  const rebuild = btn(t("assemblyBuild"),() => assemblyDialog(view),"soft assembly-launch");
  const files = zip ? btn(t("assemblyDownload"),() => assemblyDownload(zip,"application/zip","RockiGo-chapter.zip"),"soft") : [];
  const tabs = div("assembly-tabs",Object.entries(assemblyRoutes).map(([screen,key]) => {
    const button = btn(t(key),() => openAssembly(screen),"soft",screen===view);
    if (screen === view) button.setAttribute("aria-current","page");
    return button;
  }));
  const counts = t("assemblyCounts",{steps:course.steps.length,tasks:course.steps.reduce((sum,part) => sum+part.tasks.length,0)});
  const heading = div("assembly-heading",txt("p",t("assemblyResult"),"assembly-kicker"),txt("h1",course.title),
    txt("p",[course.author,course.book].filter(Boolean).join(" · "),"muted"),
    div("assembly-actions",back,rebuild,files),tabs,txt("p",counts,"muted"),
    report?.needs_visual_review ? txt("p",t("assemblyReview",{n:report.needs_visual_review}),"hint") : []);
  const content = view === "tests" ? assemblyMap(course) : view === "tasks" ? assemblyPractice(course,step) : assemblyVideo(course,assemblyStep);
  return div("assembly-view",heading,content);
}

function assemblyMap(course) {
  const list = txt("ol","","assembly-path");
  for (const [index,step] of course.steps.entries()) {
    const previous = course.steps.find(part => part.id === step.prerequisite);
    const node = txt("li","","assembly-node");
    const count = txt("span",String(index+1),"assembly-node-number");
    count.setAttribute("aria-hidden","true");
    const detail = txt("details","","card assembly-node-content");
    detail.open = index === assemblyStep;
    const summary = txt("summary");
    summary.append(txt("strong",step.title),txt("span",t("assemblySourcePages",{pages:assemblyPages(step.pages)}),"muted"));
    detail.append(summary,txt("p",step.summary),
      previous ? txt("p",t("assemblyAfter",{title:previous.title}),"muted") : [],
      step.format ? txt("p",step.format,"assembly-format") : [],assemblyCitation(step.evidence.page_pdf),
      div("assembly-actions",btn(t("tasks"),() => {assemblyStep=index;openAssembly("tasks");},"primary"),
        btn(t("assemblyWatch"),() => {assemblyStep=index;openAssembly("videos");},"soft")));
    node.append(count,detail);
    list.append(node);
  }
  return list;
}

function assemblyPractice(course,step) {
  const select = txt("select","","field");
  for (const [index,part] of course.steps.entries()) {
    const option = txt("option",part.title);
    option.value = index;
    select.append(option);
  }
  select.value = assemblyStep;
  select.addEventListener("change",() => {
    assemblyStep = Number(select.value);
    render();
    main.querySelector(".assembly-practice select").focus({preventScroll:true});
  });
  const progress = txt("p","","assembly-practice-progress muted");
  const update = () => {progress.textContent = t("fieldCompleted",{done:step.tasks.filter(task => assemblyResult.solved.has(task.id)).length,total:step.tasks.length});};
  update();
  return div("assembly-practice",div("card",labeled(t("assemblyLesson"),select),progress),
    step.tasks.length ? step.tasks.map(task => assemblyTask(task,step.taskSources,update)) : txt("p",t("assemblyEmptyTasks"),"hint"));
}

function assemblyTask(task,pages,update) {
  const form = txt("form","","card assembly-task");
  const group = txt("fieldset");
  group.append(txt("legend",task.prompt));
  let order;
  if (task.type === "order") {
    order = assemblyOrder(task.options,group);
  } else if (task.type === "gap") {
    const input = txt("input","","field");
    input.name = "answer";
    input.required = true;
    input.autocomplete = "off";
    group.append(labeled(t("answer"),input));
  } else {
    for (const option of task.options) {
      const input = txt("input");
      input.type = task.type === "multiple" ? "checkbox" : "radio";
      input.name = "answer";
      input.value = option.id;
      input.required = task.type === "single";
      const label = txt("label","","option");
      label.append(input,txt("span",option.text));
      group.append(label);
    }
  }
  const submit = assemblySubmit();
  submit.textContent = t("check");
  const feedback = div("review");
  feedback.hidden = true;
  feedback.setAttribute("role","status");
  form.append(group,submit,feedback);
  form.addEventListener("submit", event => {
    event.preventDefault();
    const values = order ?? new FormData(form).getAll("answer");
    feedback.hidden = false;
    if (!values.length) {
      feedback.className = "review";
      feedback.textContent = t("assemblySelectAnswer");
      return;
    }
    const key = Array.isArray(task.answer) ? task.answer : [task.answer];
    const correct = task.type === "gap" ? key.some(answer => normal(answer) === normal(values[0])) :
      task.type === "multiple" ? key.length === values.length && key.every(answer => values.includes(answer)) :
      key.length === values.length && key.every((answer,index) => answer === values[index]);
    if (correct) {assemblyResult.solved.add(task.id);update();}
    const expected = key.map(answer => task.options?.find(option => option.id === answer)?.text ?? answer);
    const evidence = [...new Set(task.claim_ids.map(id => pages[id]))];
    feedback.className = "review " + (correct ? "correct-note" : "wrong-note");
    feedback.replaceChildren(txt("strong",t(correct ? "correct" : "incorrect")),
      txt("p",t("reference")+" · "+expected.join(task.type === "order" ? " → " : " · ")),
      txt("p",task.explanation),div("lesson-sources",evidence.map(assemblyCitation)));
  });
  return form;
}

function assemblyOrder(options, group) {
  const sequence = options.map(option => option.id);
  const list = txt("ol","","order-list assembly-order");
  function paint() {
    list.replaceChildren(...sequence.map((id,index) => {
      const item = txt("li");
      const label = options.find(option => option.id === id).text;
      item.append(txt("span",label), div("assembly-order-buttons",[[-1,"moveUp","↑"],[1,"moveDown","↓"]].map(([delta,key,arrow]) => {
        const target = index+delta;
        const move = btn(arrow,() => {
          [sequence[target],sequence[index]] = [id,sequence[target]];
          paint();
          list.children[target].querySelector("button:not(:disabled)").focus();
        },"soft",target<0 || target>=sequence.length);
        move.setAttribute("aria-label",t(key)+" · "+label);
        return move;
      })));
      return item;
    }));
  }
  paint();
  group.append(list);
  return sequence;
}
