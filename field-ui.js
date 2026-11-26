let fieldMode = false;
let fieldIndex = 0;
let fieldStageCleanup;
const fieldSessions = new Map();

function unmountFieldStage() {
  fieldStageCleanup?.();
  fieldStageCleanup = undefined;
}

function practiceHub() {
  const ordinary = btn(t("fieldOrdinary"), () => switchPractice(false), "soft");
  const special = btn(t("fieldSpecial"), () => switchPractice(true), "soft");
  const switcher = div("field-switch", ordinary, special);
  switcher.setAttribute("role", "group");
  switcher.setAttribute("aria-label", t("tasks"));
  ordinary.setAttribute("aria-pressed", String(!fieldMode));
  special.setAttribute("aria-pressed", String(fieldMode));
  const actions = div("field-actions",switcher,assemblyActions("tasks"));
  function switchPractice(mode) {
    if (mode === fieldMode) return;
    fieldMode = mode;
    render();
    main.querySelector('.field-switch [aria-pressed="true"]').focus({preventScroll:true});
  }

  if (!fieldMode) {
    const [title, list] = practiceList();
    return [title, actions, list];
  }
  const exercises = data.fieldExercises;
  const completed = exercises.filter(exercise => state.fieldPractice?.[exercise.id]).length;
  const picker = div("field-picker", exercises.map((exercise, index) => {
    const isDone = Boolean(state.fieldPractice?.[exercise.id]);
    const button = btn("", () => {
      if (index === fieldIndex) return;
      fieldIndex = index;
      render();
      main.querySelector('.field-picker [aria-pressed="true"]').focus({preventScroll:true});
    }, "field-option");
    button.setAttribute("aria-pressed", String(index === fieldIndex));
    button.append(div("field-option-copy", txt("strong", exercise.title), txt("span", exercise.summary)),
      txt("span", isDone ? "✓" : "", "field-option-mark"));
    if (isDone) button.setAttribute("aria-label", local(exercise.title) + " · " + t("done"));
    return button;
  }));
  picker.setAttribute("role", "group");
  picker.setAttribute("aria-label", t("fieldSpecial"));
  const intro = div("field-intro", txt("p", t("fieldIntro")),
    txt("span", t("fieldCompleted", {done:completed, total:exercises.length}), "field-count"));
  return [heading("tasks"), actions, intro, picker, fieldExercise(exercises[fieldIndex])];
}

function fieldExercise(exercise) {
  const model = data.fieldModels[exercise.model];
  const session = fieldSessions.get(exercise.id) ?? {depth:model.initial, section:false};
  fieldSessions.set(exercise.id, session);
  const view = createFieldStage(exercise, model, session);

  const question = txt("h2", exercise.question);
  question.id = "field-question";
  const prompt = div("field-prompt", txt("p", exercise.title, "field-topic"), question,
    txt("p", exercise.setup, "muted"));
  const form = txt("form", "", "field-answer");
  form.setAttribute("aria-labelledby", question.id);
  const input = txt("input", "", "field");
  input.id = "field-response";
  input.inputMode = "numeric";
  input.autocomplete = "off";
  input.maxLength = 12;
  input.required = true;
  input.value = session.input ?? "";
  const label = txt("label", t(exercise.ratio ? "fieldRatioAnswer" : "fieldMetreAnswer"));
  label.htmlFor = input.id;
  const submit = txt("button", t("check"), "btn primary");
  submit.type = "submit";
  const revealButton = btn(t("fieldReveal"), () => {
    session.revealed = true;
    updateFeedback();
    focusFeedback();
  }, "soft");
  const retry = btn(t("tryPractice"), () => {
    delete session.revealed;
    delete session.hint;
    delete session.input;
    input.value = "";
    view.reset();
    updateFeedback();
    input.focus({preventScroll:true});
  }, "soft");
  const feedback = div("field-feedback");
  feedback.tabIndex = -1;
  feedback.setAttribute("aria-live", "polite");
  const unit = unitMap.get(exercise.unit);
  const sources = div("lesson-sources field-source",
    txt("span", t("source") + " · " + books[unit.book].author),
    bookLink(unit, exercise.page),
    btn(t("seeBook"), () => {
      navigate("books", unit.id);
      const fact = main.querySelector("details[open] [data-source-page='" + exercise.page + "']");
      if (fact) {
        fact.tabIndex = -1;
        fact.focus({preventScroll:true});
        fact.scrollIntoView({block:"center"});
      }
    }, "soft")
  );
  form.append(label, div("field-answer-controls", input, submit), revealButton, retry, feedback);
  const panel = div("field-response", form, sources);
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (session.revealed) return;
    const digits = input.value.trim().replace(/[\u0020\u00a0\u202f]/g, "");
    if (!/^\d{1,6}$/.test(digits)) {
      input.setCustomValidity(t("fieldWholeNumber"));
      input.reportValidity();
      return;
    }
    const answer = Number(digits);
    session.input = input.value;
    if (answer === exercise.answer) {
      session.revealed = true;
      session.correct = true;
      state.fieldPractice ??= {};
      state.fieldPractice[exercise.id] = true;
      save();
      const done = data.fieldExercises.filter(item => state.fieldPractice[item.id]).length;
      main.querySelector(".field-count").textContent = t("fieldCompleted", {done,total:data.fieldExercises.length});
      const choice = main.querySelector('.field-picker [aria-pressed="true"]');
      choice.querySelector(".field-option-mark").textContent = "✓";
      choice.setAttribute("aria-label", local(exercise.title) + " · " + t("done"));
    } else {
      session.hint = exercise.alternatives?.[answer] ?? exercise.hint;
    }
    updateFeedback();
    focusFeedback();
  });
  input.addEventListener("input", () => {
    input.setCustomValidity("");
    session.input = input.value;
  });

  function focusFeedback() {
    feedback.focus({preventScroll:true});
    feedback.scrollIntoView({block:"nearest"});
  }

  function updateFeedback() {
    const reveal = Boolean(session.revealed);
    input.readOnly = reveal;
    submit.hidden = reveal;
    retry.hidden = !reveal;
    revealButton.hidden = reveal || !session.hint;
    feedback.hidden = !reveal && !session.hint;
    feedback.className = "field-feedback " + (reveal && session.correct ? "field-feedback-ok" : "");
    feedback.replaceChildren();
    if (reveal) {
      feedback.append(txt("strong", t(session.correct ? "correct" : "reference")), txt("p", exercise.explanation));
    } else if (session.hint) {
      feedback.append(txt("strong", t("fieldInspectAgain")), txt("p", session.hint));
    }
    view.reveal(reveal);
    if (!reveal) delete session.correct;
  }

  updateFeedback();
  return div("field-workspace", prompt, view.panel, panel);
}

function createFieldStage(exercise, model, session) {
  const stage = div("field-stage");
  const viewport = div("field-viewport");
  const fallback = txt("canvas", "", "field-fallback");
  viewport.append(fallback);
  viewport.setAttribute("role", "img");
  viewport.setAttribute("aria-label", t(model.kind === "pressure" ? "fieldPressureScene" : "fieldWellScene"));
  viewport.dataset.kind = model.kind;
  const status = txt("span", "2D", "field-render-mode");
  status.hidden = true;
  const title = txt("h3", t(model.kind === "pressure" ? "fieldPressureTitle" : "fieldDepthTitle"));
  const isDepth = model.kind !== "pressure";
  const body = div("field-visual" + (isDepth ? " field-with-scale" : ""), viewport);
  const controls = div("field-camera");
  const dimension = btn(t("viewisometric"), () => setCamera(false), "soft");
  const section = btn(t("fieldSection"), () => setCamera(true), "soft");
  const turnLeft = btn("↶", () => orbit(-.22), "soft field-orbit");
  const turnRight = btn("↷", () => orbit(.22), "soft field-orbit");
  turnLeft.setAttribute("aria-label", t("turnLeft"));
  turnRight.setAttribute("aria-label", t("turnRight"));
  controls.append(dimension, section, turnLeft, turnRight);
  controls.setAttribute("role", "group");
  controls.setAttribute("aria-label", t("fieldCamera"));
  const header = div("field-stage-head", div("field-stage-label", title, status), controls);
  stage.append(header, body);

  let chart, slider, readout, measurements;
  if (isDepth) {
    chart = txt("canvas", "", "field-chart");
    chart.setAttribute("role", "img");
    chart.setAttribute("aria-label", t(model.tracks ? "fieldLogChart" : "fieldDepthScale"));
    body.append(chart);
    slider = txt("input", "", "field-slider");
    slider.type = "range";
    slider.id = "field-depth";
    slider.min = model.from;
    slider.max = model.to;
    slider.step = "1";
    slider.value = session.depth;
    readout = txt("output", "", "field-readout");
    readout.htmlFor = slider.id;
    const depthLabel = txt("label", t("sharedDepth"));
    depthLabel.htmlFor = slider.id;
    stage.append(div("field-depth-control", depthLabel, readout, slider));
    if (model.tracks) {
      measurements = div("field-observations field-measurements", model.tracks.map(() => txt("span")));
      stage.append(measurements);
    }
    slider.addEventListener("input", () => setDepth(Number(slider.value)));
    chart.addEventListener("pointerdown", event => {
      if (session.revealed && exercise.id !== "reef") return;
      const box = chart.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, ((event.clientY - box.top) / box.height - .10) / .80));
      setDepth(model.from + Math.round(fraction * (model.to - model.from)));
    });
  }

  if (model.kind === "reef") {
    stage.append(div("field-observations",
      txt("span", t("fieldCrestDepth", {n:formatFieldNumber(model.crest)})),
      txt("span", t("fieldContactDepth", {n:formatFieldNumber(model.contact)}))));
  } else if (!isDepth) {
    for (const bed of ["A","B"]) {
      const mark = txt("span", bed, "field-bed-label");
      mark.setAttribute("aria-hidden", "true");
      viewport.append(mark);
    }
    stage.append(div("field-observations",
      txt("span", t("fieldPermeability", {bed:"A", n:model.permeability[0]})),
      txt("span", t("fieldPermeability", {bed:"B", n:model.permeability[1]}))));
  }
  stage.append(txt("p", t("fieldSynthetic"), "field-stage-note"));

  let renderer, chartObserver, viewObserver, frame, disposed = false, drag;
  let yaw = session.yaw ?? -.37;
  let revealed = Boolean(session.revealed);
  const solutionDepth = isDepth && exercise.id !== "reef" ? exercise.answer : null;
  const sceneState = () => ({
    depth:session.depth, section:session.section, yaw, revealed,
    marker:exercise.id === "roof" || (revealed && exercise.id === "contact") ? exercise.answer : null
  });
  function paint() {
    const current = sceneState();
    if (readout) readout.textContent = t("fieldMetres", {n:formatFieldNumber(session.depth)});
    if (measurements) model.tracks.forEach((track, index) => {
      const point = track.points.findLastIndex(([depth]) => depth <= session.depth);
      const [depth, value] = track.points[point];
      const [nextDepth, nextValue] = track.points[point+1] ?? [depth,value];
      const reading = nextDepth === depth ? value : value + (nextValue - value) * (session.depth - depth) / (nextDepth - depth);
      measurements.children[index].textContent = local(track.name) + " · " + formatFieldNumber(Math.round(reading * 10) / 10) + " " + local(track.unit);
    });
    if (chart) paintFieldChart(chart, model, exercise, current);
    if (renderer) renderer.draw(current);
    if (!fallback.hidden) paintFieldFallback(fallback, model, current);
  }

  function setDepth(depth) {
    session.depth = depth;
    slider.value = depth;
    paint();
  }

  function setCamera(straight) {
    session.section = straight;
    dimension.setAttribute("aria-pressed", String(!straight));
    section.setAttribute("aria-pressed", String(straight));
    paint();
  }

  function orbit(delta) {
    yaw = Math.min(.89, Math.max(-.89, yaw + delta));
    session.yaw = yaw;
    setCamera(false);
  }

  viewport.addEventListener("pointerdown", event => {
    if (!renderer || event.button !== 0) return;
    drag = {id:event.pointerId,x:event.clientX,y:event.clientY,engaged:false};
  });
  viewport.addEventListener("pointermove", event => {
    if (drag?.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.engaged) {
      if (Math.abs(dx) < 5 || Math.abs(dx) < Math.abs(dy)) return;
      viewport.setPointerCapture(event.pointerId);
      drag.engaged = true;
    }
    drag.x = event.clientX;
    orbit(dx * .012);
  });
  for (const event of ["pointerup", "pointercancel", "lostpointercapture", "pointerleave"]) {
    viewport.addEventListener(event, () => { if (event !== "pointerleave" || !drag?.engaged) drag = undefined; });
  }

  function showFallback(visible) {
    fallback.hidden = !visible;
    status.hidden = false;
    status.textContent = visible ? "2D" : "3D";
    controls.hidden = visible;
    viewport.classList.toggle("field-orbitable", !visible);
    if (visible) paintFieldFallback(fallback, model, sceneState());
  }

  function resizeView() {
    renderer?.resize();
    if (!fallback.hidden) paintFieldFallback(fallback, model, sceneState());
  }

  frame = requestAnimationFrame(async () => {
    if (disposed) return;
    viewObserver = new ResizeObserver(resizeView);
    viewObserver.observe(viewport);
    if (chart) {
      chartObserver = new ResizeObserver(() => paintFieldChart(chart, model, exercise, sceneState()));
      chartObserver.observe(chart);
    }
    paint();
    try {
      const {createFieldRenderer} = await import(new URL(assets.fieldScene, location.href).href);
      if (disposed) return;
      renderer = createFieldRenderer(viewport,model,showFallback);
      showFallback(false);
      const current = sceneState();
      renderer.draw(current);
      renderer.intro(current, reducedMotion.matches);
    } catch (_) {
      if (!disposed) showFallback(true);
    }
  });

  fieldStageCleanup = () => {
    disposed = true;
    cancelAnimationFrame(frame);
    viewObserver?.disconnect();
    chartObserver?.disconnect();
    renderer?.dispose();
  };
  setCamera(session.section);
  return {
    panel:stage,
    reset() {
      if (slider) setDepth(model.initial);
    },
    reveal(value) {
      const changed = revealed !== value;
      revealed = value;
      if (value && changed && solutionDepth !== null) setDepth(solutionDepth);
      else if (changed) paint();
      if (slider) slider.disabled = value && solutionDepth !== null;
      if (value && changed && renderer) renderer.resolve(sceneState(), reducedMotion.matches);
    }
  };
}

function formatFieldNumber(number) {
  return new Intl.NumberFormat(state.lang).format(number);
}

function prepareFieldCanvas(canvas) {
  const {width,height} = canvas.getBoundingClientRect();
  if (!width || !height) return null;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.round(width * ratio);
  const pixelHeight = Math.round(height * ratio);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0);
  context.clearRect(0,0,width,height);
  return {context,width,height};
}

function fieldY(model,height,depth) {
  return height * (.10 + .80 * (depth - model.from) / (model.to - model.from));
}

function paintFieldChart(canvas, model, exercise, scene) {
  const prepared = prepareFieldCanvas(canvas);
  if (!prepared) return;
  const {context:ctx,width,height} = prepared;
  const top = height * .10, bottom = height * .90;
  const left = model.tracks ? 30 : 19;
  const trackWidth = (width - left - 7) / (model.tracks?.length ?? 1);
  ctx.font = (width > 158 ? 11 : 9) + "px Segoe UI, sans-serif";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#151b2c";
  ctx.fillRect(0,0,width,height);
  const right = model.tracks ? width - 6 : width - 23;
  for (let depth = model.from; depth <= model.to; depth += model.minor) {
    const y = fieldY(model,height,depth);
    const major = (depth - model.from) % model.tick === 0;
    ctx.strokeStyle = major ? "#97a9cc65" : "#8095bd34";
    ctx.beginPath();
    ctx.moveTo(major ? left : left + 5,y);
    ctx.lineTo(major ? right : Math.min(right,left + 12),y);
    ctx.stroke();
    if (major) {
      ctx.fillStyle = "#d0dbee";
      ctx.fillText(String(depth), 4, y);
    }
  }

  if (model.tracks) {
    model.tracks.forEach((track, index) => {
      const x = left + trackWidth * index;
      ctx.strokeStyle = "#7a8eae50";
      ctx.strokeRect(x,top,trackWidth,bottom-top);
      ctx.fillStyle = track.color;
      ctx.textAlign = "center";
      const label = local(track.name) + (trackWidth < 53 ? "" : " · " + local(track.unit));
      ctx.fillText(label, x + trackWidth / 2, Math.max(11,top - 10), trackWidth - 4);
      ctx.beginPath();
      track.points.forEach(([depth,value], point) => {
        const px = x + 4 + (trackWidth - 8) * value / track.max;
        const py = fieldY(model,height,depth);
        if (point) ctx.lineTo(px,py);
        else ctx.moveTo(px,py);
      });
      ctx.lineWidth = 1.75;
      ctx.strokeStyle = track.color;
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.fillStyle = "#b8c8e1";
      ctx.textAlign = "start";
      ctx.fillText("0",x + 4,bottom + 11);
      ctx.textAlign = "end";
      ctx.fillText(String(track.max),x + trackWidth - 3,bottom + 11);
      ctx.textAlign = "start";
    });
  } else {
    for (const [depth,color] of [[model.crest,"#ffc783"],[model.contact,"#7de8ef"]]) {
      const y = fieldY(model,height,depth);
      ctx.fillStyle = color;
      ctx.fillRect(left,y,right-left,1.5);
      ctx.beginPath();
      ctx.arc(right,y,3,0,Math.PI*2);
      ctx.fill();
    }
  }

  if (scene.marker !== null) {
    ctx.fillStyle = "#f5d28229";
    ctx.fillRect(left,fieldY(model,height,scene.marker)-2,right-left,4);
  }
  const y = fieldY(model,height,scene.depth);
  ctx.fillStyle = scene.revealed && exercise.id !== "reef" ? "#ffe18e" : "#c6f6ff";
  ctx.fillRect(left,y,right-left,1.3);
  ctx.beginPath();
  ctx.moveTo(0,y);
  ctx.lineTo(5,y-4);
  ctx.lineTo(5,y+4);
  ctx.fill();
}

function paintFieldFallback(canvas, model, scene) {
  const prepared = prepareFieldCanvas(canvas);
  if (!prepared) return;
  const {context:ctx,width,height} = prepared;
  const x = width * .13, slabWidth = width * .73;
  const y = depth => fieldY(model,height,depth);

  if (model.kind === "pressure") {
    const beds = [height * .31,height * .68];
    const centre = width * .48;
    beds.forEach((level,index) => {
      const slabHeight = height * .22;
      ctx.fillStyle = index ? "#315877" : "#635581";
      ctx.fillRect(x,level-slabHeight/2,slabWidth,slabHeight);
      if (scene.revealed) {
        const radius = slabWidth * (index ? .48 : .24);
        const signal = ctx.createRadialGradient(centre,level,0,centre,level,radius);
        signal.addColorStop(0,"#baf9ff");
        signal.addColorStop(1,"#baf9ff00");
        ctx.save();
        ctx.beginPath();
        ctx.rect(x,level-slabHeight/2,slabWidth,slabHeight);
        ctx.clip();
        ctx.fillStyle = signal;
        ctx.fillRect(x,level-slabHeight/2,slabWidth,slabHeight);
        ctx.restore();
      }
      ctx.fillStyle = "#f3f5ff";
      ctx.fillRect(centre-1,level-slabHeight*.66,2,slabHeight*1.32);
    });
    return;
  }

  if (model.layers) {
    const colors = {shale:"#436379",silt:"#826b82",sand:"#ac7659"};
    for (const layer of model.layers) {
      const top = y(layer.top), bottom = y(layer.base);
      const tint = ctx.createLinearGradient(x,top,x+slabWidth,bottom);
      tint.addColorStop(0,colors[layer.rock]);
      tint.addColorStop(1,"#25364c");
      ctx.fillStyle = tint;
      ctx.fillRect(x,top,slabWidth,bottom-top);
      ctx.fillStyle = "#fff2d527";
      for (let line=top+5;line<bottom;line+=8) ctx.fillRect(x,line,slabWidth,1);
    }
    if (scene.revealed && scene.marker === model.contact) {
      ctx.fillStyle = "#53c2da65";
      ctx.fillRect(x,y(model.contact),slabWidth,y(model.base)-y(model.contact));
    }
    ctx.fillStyle = "#d2ecf5";
    ctx.fillRect(width*.48-1,height*.075,3,height*.835);
  } else {
    ctx.fillStyle = "#304458";
    ctx.fillRect(x,y(model.from),slabWidth,y(model.to)-y(model.from));
    ctx.beginPath();
    ctx.moveTo(x,y(model.contact+8));
    ctx.bezierCurveTo(x+slabWidth*.24,y(model.flank),x+slabWidth*.24,y(model.crest),x+slabWidth*.5,y(model.crest));
    ctx.bezierCurveTo(x+slabWidth*.76,y(model.crest),x+slabWidth*.76,y(model.flank),x+slabWidth,y(model.contact+8));
    ctx.closePath();
    ctx.fillStyle = "#b68160";
    ctx.fill();
    ctx.strokeStyle = "#efbd8a";
    ctx.stroke();
    ctx.fillStyle = "#83dce9";
    ctx.fillRect(x,y(model.contact),slabWidth,2);
    if (scene.revealed) {
      const mid = x+slabWidth*.5;
      ctx.fillStyle = "#ffe18e";
      ctx.fillRect(mid-1,y(model.crest),2,y(model.contact)-y(model.crest));
      for (const depth of [model.crest,model.contact]) ctx.fillRect(mid-6,y(depth),12,2);
    }
  }

  if (scene.marker !== null) {
    ctx.shadowColor = "#ffcb67";
    ctx.shadowBlur = scene.revealed ? 13 : 6;
    ctx.fillStyle = "#ffd689";
    ctx.fillRect(x,y(scene.marker)-1,width-x,2);
    ctx.shadowBlur = 0;
  }
  ctx.fillStyle = "#b8f4ff";
  ctx.fillRect(0,y(scene.depth),width,1);
}
