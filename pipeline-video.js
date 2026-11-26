let disposeAssemblyVideo;

function stopAssemblyVideo() {
  disposeAssemblyVideo?.();
  disposeAssemblyVideo = undefined;
}

function assemblyVideo(course,initial) {
  let duration = 0;
  const scenes = course.steps.map(step => {
    const start = duration;
    duration += Math.min(18,Math.max(6,Math.ceil(step.summary.split(/\s+/).length / 2.8)+2));
    return {step,start,end:duration};
  });
  const canvas = txt("canvas","","assembly-film");
  canvas.width = 1280;
  canvas.height = 720;
  canvas.setAttribute("aria-hidden","true");
  const context = canvas.getContext("2d");
  const play = btn(t("assemblyPlay"),() => frame ? pause() : start(),"primary");
  const record = btn(t("assemblySaveVideo"),recordVideo,"soft");
  const time = txt("span","","assembly-film-time");
  const status = txt("p","","assembly-film-status muted");
  status.setAttribute("role","status");
  const seek = txt("input","","assembly-film-seek");
  seek.type = "range";
  seek.min = "0";
  seek.max = String(duration);
  seek.step = "0.1";
  seek.setAttribute("aria-label",t("assemblyTimeline"));
  const select = txt("select","","field");
  scenes.forEach(({step},index) => {
    const option = txt("option",step.title);
    option.value = index;
    select.append(option);
  });
  const text = div("assembly-film-text");
  const mime = typeof MediaRecorder !== "undefined" && canvas.captureStream &&
    ["video/webm;codecs=vp8","video/mp4","video/webm"].find(type => MediaRecorder.isTypeSupported(type));
  record.hidden = !mime || !context;
  play.disabled = !context;
  seek.disabled = !context;

  let position = scenes[initial].start, current = -1, anchor, frame = 0, recording, disposed = false;
  function draw() {
    const index = Math.max(0,scenes.findLastIndex(scene => scene.start <= position));
    const {step,start,end} = scenes[index];
    const progress = Math.max(0,Math.min(1,(position-start)/(end-start)));
    if (context) paintAssemblyFrame(context,course,step,index,scenes.length,progress,position/duration);
    if (index !== current) {
      current = index;
      assemblyStep = index;
      select.value = index;
      text.replaceChildren(txt("h2",step.title),txt("p",step.summary),assemblyCitation(step.evidence.page_pdf));
    }
    seek.value = position;
    const clock = value => `${Math.floor(value/60)}:${String(Math.floor(value)%60).padStart(2,"0")}`;
    time.textContent = clock(position)+" / "+clock(duration);
  }

  function seekTo(value) {
    position = value;
    if (frame) anchor = performance.now() - value*1000;
    draw();
  }

  function pause() {
    cancelAnimationFrame(frame);
    frame = 0;
    play.textContent = t("assemblyPlay");
  }

  function start() {
    if (frame) return;
    if (position >= duration) seekTo(0);
    anchor = performance.now() - position*1000;
    play.textContent = t("assemblyPause");
    frame = requestAnimationFrame(tick);
  }

  function tick(now) {
    position = Math.max(0,Math.min(duration,(now-anchor)/1000));
    draw();
    if (position < duration) frame = requestAnimationFrame(tick);
    else {
      pause();
      if (recording?.state === "recording") recording.stop();
    }
  }

  function setRecording(active) {
    play.disabled = active;
    record.disabled = active;
    seek.disabled = active;
    select.disabled = active;
  }

  function recordVideo() {
    pause();
    seekTo(0);
    const chunks = [];
    let stream;
    try {
      stream = canvas.captureStream(25);
      const recorder = new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:2400000});
      let failed = false;
      recorder.ondataavailable = event => {if (event.data.size) chunks.push(event.data);};
      recorder.onerror = () => {failed = true;};
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        if (disposed) return;
        recording = undefined;
        setRecording(false);
        if (failed || !chunks.length) {
          pause();
          status.textContent = t("assemblyRecordError");
          return;
        }
        const type = recorder.mimeType || mime;
        assemblyDownload(new Blob(chunks,{type}),type,"RockiGo."+(type.startsWith("video/mp4")?"mp4":"webm"));
        status.textContent = t("assemblyRecorded");
      };
      recorder.start();
      recording = recorder;
      setRecording(true);
      status.textContent = t("assemblyRecording");
      start();
    } catch (_) {
      stream?.getTracks().forEach(track => track.stop());
      status.textContent = t("assemblyRecordError");
    }
  }

  seek.addEventListener("input",() => seekTo(Number(seek.value)));
  select.addEventListener("change",() => seekTo(scenes[Number(select.value)].start));
  disposeAssemblyVideo = () => {
    disposed = true;
    pause();
    if (recording?.state === "recording") recording.stop();
  };
  draw();
  return div("card assembly-video",canvas,div("assembly-film-controls",play,seek,time),
    text,div("assembly-film-footer",labeled(t("assemblyLesson"),select),record),status);
}

function assemblyFilmLines(ctx,text,width,limit) {
  const lines = [];
  let current = "";
  for (const word of String(text).trim().split(/\s+/)) {
    const next = current ? current+" "+word : word;
    if (current && ctx.measureText(next).width > width) {
      lines.push(current);
      current = word;
    } else current = next;
  }
  if (current) lines.push(current);
  if (lines.length > limit) {
    lines.length = limit;
    lines[limit-1] += "…";
  }
  return lines;
}

function paintAssemblyFrame(ctx,course,step,index,count,progress,overall) {
  const backdrop = ctx.createLinearGradient(0,0,1280,720);
  backdrop.addColorStop(0,"#17223d");
  backdrop.addColorStop(.65,"#142b3f");
  backdrop.addColorStop(1,"#143c48");
  ctx.fillStyle = backdrop;
  ctx.fillRect(0,0,1280,720);
  ctx.fillStyle = "#324b60";
  ctx.fillRect(92,79,1096,2);
  ctx.fillRect(92,626,1096,2);
  ctx.fillStyle = "#9ee8df";
  ctx.fillRect(92,626,1096*overall,3);
  ctx.font = "600 24px system-ui";
  ctx.fillText("ROCKIGO    /    "+t("assemblyWatch"),92,58);
  ctx.textAlign = "right";
  ctx.fillText(`${index+1} / ${count}`,1188,58);
  ctx.textAlign = "left";

  ctx.save();
  const offset = reducedMotion.matches || progress === 0 ? 0 : 8*Math.max(0,1-progress*12);
  ctx.translate(0,offset);
  ctx.fillStyle = "#f5f8ff";
  ctx.font = "700 53px system-ui";
  const heading = assemblyFilmLines(ctx,step.title,1080,2);
  heading.forEach((line,i) => ctx.fillText(line,92,171+i*62,1080));
  ctx.font = "400 33px system-ui";
  ctx.fillStyle = "#deecf7";
  const body = assemblyFilmLines(ctx,step.summary,1060,7);
  body.forEach((line,i) => ctx.fillText(line,94,227+heading.length*55+i*43,1060));
  ctx.restore();

  ctx.font = "500 22px system-ui";
  ctx.fillStyle = "#b8cfdf";
  ctx.fillText(course.author || course.book || course.title,92,671,815);
  ctx.textAlign = "right";
  ctx.fillText(t("assemblySourcePages",{pages:step.evidence.page_pdf}),1188,671,240);
  ctx.textAlign = "left";
}
