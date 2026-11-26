function dateForCourse(date = new Date()) {
  return [date.getFullYear(), date.getMonth()+1, date.getDate()].map(part=>String(part).padStart(2,"0")).join("-");
}

function projectView() {
  const pipeline=txt("a",t("pipeline"),"btn soft");
  pipeline.href="https://bqbaqlet-sketch.github.io/rockigo/frozen/b180740/pipeline/";
  const cards=modules.map(module=>{
    const unit=units.find(item=>item.book===module.book);
    return div("card",txt("h2",module.title),txt("p",books[module.book].author,"muted"),
      div("actions",btn(t("courseRead"),()=>navigate("books",unit.id),"soft")));
  });
  return [heading("projectTitle","projectContext"),
    div("actions project-actions",btn(t("course"),()=>navigate("course"),"positive"),
      btn(t("tests"),()=>navigate("tests"),"soft"),pipeline),
    div("grid card-block",cards)];
}

function bookFormulas(unit) {
  if (!unit.formulas.length) return [];
  return div("book-formulas",txt("h3",t("courseFormulas")),unit.formulas.map(recipe=>{
    const terms=txt("dl","","formula-symbols");
    for(const symbol of recipe.symbols) terms.append(txt("dt",symbol.name),txt("dd",symbol.description));
    return div("formula-card",
      txt("p",recipe.equation,"formula-equation"),txt("p",recipe.use),terms,
      txt("p",recipe.example,"formula-example"),
      recipe.application?txt("p",t("courseApplication"),"hint"):[],
      bookLink(unit,recipe.page));
  }));
}

function courseDay(index,start,format) {
  const level=levels[index];
  const unit=unitMap.get(level.id);
  const date=new Date(start);
  date.setDate(date.getDate()+index);
  const when=txt("time",format.format(date));
  when.dateTime=dateForCourse(date);
  const complete=state.tests[level.id]?.passed;
  const locked=index>levelIndex()&&!complete;
  const wait=readyAt(index)>Date.now();
  const practice=state.practice[level.id]?.passed;
  const testButton=btn(t(complete?"review":"courseTest"),()=>complete?oldResult(index):startQuiz("test",index),"positive",locked||wait);
  const actions=div("actions course-actions",
    unit?btn(t("courseRead"),()=>navigate("books",unit.id),"soft"):[],
    btn(t(practice?"tryPractice":"coursePractice"),()=>startQuiz("practice",index),"soft",locked),
    testButton);
  const note=locked?txt("p",t("courseLocked"),"hint"):wait?timerText(readyAt(index)):[];
  const row=txt("li","","course-day");
  row.append(div("course-day-time",txt("strong",t("courseDay",{n:index+1})),when),
    div("course-day-body",
      div("course-day-heading",txt("h3",unit?unit.title:t("courseFinal")),
        complete?txt("span",state.tests[level.id].score+"%","course-complete"):[]),
      unit?txt("p",[unit.chapter,t("courseMinutes",{n:unit.minutes})].join(" · "),"muted course-meta"):[],
      txt("p",unit?unit.outcome:t("courseFinalGoal"),"course-outcome"),
      actions,note,unit?div("lesson-sources",bookLink(unit,unit.pages)):bookLibraryLinks()));
  return row;
}

function courseView() {
  if(!state.courseStart){state.courseStart=dateForCourse(); save();}
  const startField=txt("input","","field");
  startField.type="date";
  startField.value=state.courseStart;
  startField.required=true;
  startField.addEventListener("change",()=>{
    if(startField.value&&startField.validity.valid){
      state.courseStart=startField.value;
      save();
      render();
      main.querySelector('.course-overview input')?.focus();
    }
  });
  const start=new Date(state.courseStart+"T12:00:00");
  const format=new Intl.DateTimeFormat(state.lang,{day:"numeric",month:"short"});
  const passed=levels.filter(level=>state.tests[level.id]?.passed).length;
  const card=div("course-overview",div("course-overview-copy",txt("h1",t("courseTitle")),txt("p",t("courseIntro"))),
    div("course-controls",labeled(t("courseStart"),startField),
      div("course-status",txt("strong",passed+" / "+levels.length),txt("span",t("courseProgress")))));
  const sections=modules.map((module,index)=>{
    const book=books[module.book];
    const days=txt("ol","","course-days");
    units.forEach((unit,dayIndex)=>{if(unit.book===module.book)days.append(courseDay(dayIndex,start,format));});
    return div("course-module",div("course-module-header",
      div("",txt("p",t("courseModule",{n:index+1}),"course-module-label"),txt("h2",module.title),
        txt("p",module.goal,"muted")),bookReference(book,book.range)),days);
  });
  const final=txt("ol","","course-days");
  final.append(courseDay(levels.length-1,start,format));
  return div("course-screen",card,sections,div("course-module course-final",final),
    txt("p",t("coursePageNote"),"hint source-page-note"));
}
