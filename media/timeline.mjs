export function mountLesson(scenes,cues,draw) {
  const audio = document.getElementById("audio");
  const captions = document.getElementById("captions");
  const phase = document.getElementById("phase");
  const headline = document.getElementById("headline");
  const transcript = document.getElementById("transcript");
  const error = document.getElementById("audio-error");
  let frameId = 0;
  let lastCue = -1;
  const controls = scenes.map(([label],index)=>{
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click",()=>{
      audio.currentTime = cues.find(cue=>cue[2]===index)[0];
      audio.play().catch(()=>{if(audio.error) error.hidden=false;});
      update();
    });
    return button;
  });
  document.getElementById("scenes").append(...controls);
  scenes.forEach((_,scene)=>{
    const paragraph = document.createElement("p");
    paragraph.textContent = cues.filter(cue=>cue[2]===scene).map(cue=>cue[3]).join(" ");
    transcript.append(paragraph);
  });

  function update() {
    const time = audio.currentTime;
    const index = Math.max(0,cues.findLastIndex(([start])=>time>=start));
    const [,end,scene,text] = cues[index];
    const changed = index !== lastCue;
    if(changed) {
      lastCue = index;
      document.body.dataset.scene = String(scene);
      document.body.dataset.cue = String(index);
      [phase.textContent,headline.textContent] = scenes[scene];
      controls.forEach((button,i)=>{
        if(i===scene) button.setAttribute("aria-current","true");
        else button.removeAttribute("aria-current");
      });
    }
    const line = !audio.ended && time<=end?text:"";
    if(captions.textContent!==line) captions.textContent=line;
    draw({time,index,scene,changed});
  }
  function tick() {
    update();
    frameId = audio.paused||audio.ended?0:requestAnimationFrame(tick);
  }
  audio.addEventListener("playing",()=>{if(!frameId) tick();});
  for(const event of ["loadedmetadata","seeking","seeked","timeupdate","pause","ended"]) audio.addEventListener(event,update);
  audio.addEventListener("error",()=>{error.hidden=false;});
  update();
  return update;
}
