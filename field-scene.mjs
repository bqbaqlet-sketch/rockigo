import * as THREE from "./media/logging/vendor/three.module.min.js";

const lithology = {
  shale: {base:0x546b88, dark:0x31465f, light:0x9cadb9, sag:.031, grain:1},
  silt: {base:0x8d7892, dark:0x54435e, light:0xc3a9b4, sag:.046, grain:2},
  sand: {base:0xc18b64, dark:0x7d523f, light:0xe0b78e, sag:.012, grain:3},
  cap: {base:0x5d5377, dark:0x3f365b, light:0x9d89a8, sag:.035, grain:4},
  reef: {base:0xad795d, dark:0x644e4b, light:0xe8be91, sag:.02, grain:5}
};

const amber = 0xffd597;
const ice = 0xa9f3fb;
const width = 5.2;
const back = -1.12;
const front = .68;
const wellX = -.36;
const centre = new THREE.Vector3(0,0,.7);

function noise(seed) {
  let state = seed;
  return () => {
    state = (Math.imul(1664525,state)+1013904223) >>> 0;
    return state / 4294967296;
  };
}

function makeRockTexture(kind) {
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const rock = lithology[kind];
  const color = value => "#" + value.toString(16).padStart(6,"0");
  const random = noise(7269 + rock.grain);
  const gradient = ctx.createLinearGradient(0,-30,120,256);
  gradient.addColorStop(0,color(rock.light));
  gradient.addColorStop(.28,color(rock.base));
  gradient.addColorStop(.79,color(rock.dark));
  gradient.addColorStop(1,color(rock.base));
  ctx.fillStyle = gradient;
  ctx.fillRect(0,0,384,256);
  for (let i=0;i<210;i++) {
    const y = random()*256;
    const phase = random()*6;
    const amplitude = random()*3.5+1;
    ctx.beginPath();
    for (let x=0;x<=384;x+=12) {
      const height = y + Math.sin(x*.026 + phase)*amplitude + Math.sin(x*.008 + phase*.7)*2;
      if (x) ctx.lineTo(x,height);
      else ctx.moveTo(x,height);
    }
    ctx.strokeStyle = color(i%3 ? rock.dark : rock.light);
    ctx.lineWidth = random()*1.45 + .2;
    ctx.globalAlpha = random()*.22 + .035;
    ctx.stroke();
  }
  for (let i=0;i<2200;i++) {
    const x = random()*384, y = random()*256;
    const length = random()*3 + .5;
    ctx.globalAlpha = .1 + random()*.3;
    ctx.fillStyle = color(i%3 ? rock.dark : rock.light);
    ctx.fillRect(x,y,length,random()*1.9+.4);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function solidSlab(top, base, left, right, rear, face, material) {
  const positions = [], normals = [], uv = [];
  function surface(point) {
    const across = 30, down = 9;
    function vertex(p,u,v) {
      positions.push(...p);
      uv.push(u,v);
    }
    function triangle(a,b,c,uvA,uvB,uvC) {
      const ax = b[0]-a[0], ay = b[1]-a[1], az = b[2]-a[2];
      const bx = c[0]-a[0], by = c[1]-a[1], bz = c[2]-a[2];
      const normal = new THREE.Vector3(ay*bz-az*by,az*bx-ax*bz,ax*by-ay*bx).normalize();
      for (let j=0;j<3;j++) normals.push(normal.x,normal.y,normal.z);
      vertex(a,...uvA);
      vertex(b,...uvB);
      vertex(c,...uvC);
    }
    for (let x=0;x<across;x++) {
      const u0 = x/across, u1 = (x+1)/across;
      for (let y=0;y<down;y++) {
        const v0 = y/down, v1 = (y+1)/down;
        const a = point(u0,v0), b = point(u1,v0), c = point(u1,v1), d = point(u0,v1);
        triangle(a,b,d,[u0,v0],[u1,v0],[u0,v1]);
        triangle(b,c,d,[u1,v0],[u1,v1],[u0,v1]);
      }
    }
  }
  const span = right-left, breadth = face-rear;
  const vertical = (x,z,v) => THREE.MathUtils.lerp(base(x,z),top(x,z),v);
  surface((u,v) => {const x = left+u*span; return [x,vertical(x,face,v),face];});
  surface((u,v) => {const x = right-u*span; return [x,vertical(x,rear,v),rear];});
  surface((u,v) => {const z = rear+u*breadth; return [left,vertical(left,z,v),z];});
  surface((u,v) => {const z = face-u*breadth; return [right,vertical(right,z,v),z];});
  surface((u,v) => {const x = left+u*span, z = face-v*breadth; return [x,top(x,z),z];});
  surface((u,v) => {const x = left+u*span, z = rear+v*breadth; return [x,base(x,z),z];});
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions,3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals,3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv,2));
  return new THREE.Mesh(geo,material);
}

export function createFieldRenderer(host, model, onFallback) {
  const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1,1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;
  renderer.domElement.setAttribute("aria-hidden","true");
  const world = new THREE.Scene();
  const terrain = new THREE.Group();
  const survey = new THREE.Group();
  const textures = new Set();
  const materials = new Set();
  const geometries = new Set();
  const camera = new THREE.OrthographicCamera(-4,4,3,-3,.12,45);
  const key = new THREE.DirectionalLight(0xffe5cf,2.5);
  const rim = new THREE.DirectionalLight(0xb0e9ff,2.1);
  key.position.set(-3,6,5);
  rim.position.set(2,1,-4);
  world.add(terrain,survey,new THREE.HemisphereLight(0xd4e9fb,0x61528a,1.75),key,rim);
  let lastState, animation, frame, lost = false, disposed = false;
  let halfHeight, halfWidth, widthPx, heightPx, lens, phase = 0;
  let focus, sweep, probe, pressure, hydroContact;
  const y = depth => 2 - 4*(depth-model.from)/(model.to-model.from);

  function mesh(geometry, material, group = terrain) {
    const result = new THREE.Mesh(geometry,material);
    group.add(result);
    return result;
  }

  function beam(from, to, color, group, radius = .014, opacity = 1) {
    const vector = new THREE.Vector3().subVectors(to,from);
    const result = mesh(new THREE.CylinderGeometry(radius,radius,vector.length(),10),
      new THREE.MeshBasicMaterial({color,opacity,transparent:opacity<1}),group);
    result.position.copy(from).lerp(to,.5);
    result.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vector.normalize());
    return result;
  }

  function outline(points, color, opacity, group = terrain) {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geo,new THREE.LineBasicMaterial({color,transparent:true,opacity}));
    group.add(line);
    return line;
  }

  function strata(xMin, xMax, top, base, kind, tint) {
    const map = makeRockTexture(kind);
    textures.add(map);
    const material = new THREE.MeshStandardMaterial({
      color:tint ?? 0xffffff,map,bumpMap:map,bumpScale:.044,roughness:.96
    });
    const bed = solidSlab(top,base,xMin,xMax,back,front,material);
    terrain.add(bed);
    return bed;
  }

  function boundary(depth) {
    return (x,z) => y(depth) + .052*Math.sin((x-wellX)*1.65)*Math.cos((z-front)*1.2);
  }

  function lineAt(height, color, opacity, thickness) {
    const group = new THREE.Group();
    const points = new THREE.Vector3(-width*.51,height,front+.018);
    const end = new THREE.Vector3(width*.51,height,front+.018);
    beam(points,end,color,group,thickness,opacity);
    beam(points,end,color,group,thickness*4,.10);
    terrain.add(group);
    return group;
  }

  function drawCasing(bottom,top,x,z) {
    const metal = new THREE.MeshStandardMaterial({color:0xc2e3e7,metalness:.66,roughness:.27});
    const inner = new THREE.MeshBasicMaterial({color:0x8af1ff});
    const height = top-bottom;
    const casing = mesh(new THREE.CylinderGeometry(.064,.064,height,20),metal);
    casing.position.set(x,(top+bottom)/2,z);
    const string = mesh(new THREE.CylinderGeometry(.014,.014,height,8),inner);
    string.position.set(x+.068,casing.position.y,z+.006);
    for (let i=0;i<=Math.ceil(height/.45);i++) {
      const ring = mesh(new THREE.TorusGeometry(.075,.011,6,20),metal);
      ring.rotation.x = Math.PI/2;
      ring.position.set(x,Math.min(top,bottom+.09+i*.42),z);
    }
    const head = mesh(new THREE.CylinderGeometry(.15,.10,.095,20),metal);
    head.position.set(x,top,z);
  }

  function shaft() {
    const dark = new THREE.MeshStandardMaterial({color:0x151e2f,roughness:1});
    const opening = mesh(new THREE.BoxGeometry(.21,4.06,.035),dark);
    opening.position.set(wellX,0,front+.016);
    drawCasing(-2.01,2.26,wellX,front+.084);
  }

  function buildLogging() {
    for (const layer of model.layers) strata(-width/2,width/2,boundary(layer.top),boundary(layer.base),layer.rock);
    shaft();
    const sheet = solidSlab(() => y(model.contact),boundary(model.base),-width*.495,width*.495,back+.007,front+.010,
      new THREE.MeshBasicMaterial({color:0x69cfe4,transparent:true,opacity:.28,depthWrite:false}));
    terrain.add(sheet);
    hydroContact = sheet;
    focus = lineAt(0,amber,.98,.012);
  }

  function buildReef() {
    const crest = x => y(model.crest) - (y(model.crest)-y(model.flank))*(Math.abs(x)/(width*.38))**2.5;
    const floor = () => y(model.to);
    const contact = () => y(model.contact);
    strata(-width/2,width/2,() => y(model.from)+.07,crest,"cap");
    strata(-width/2,width/2,crest,(x) => Math.min(crest(x)-.012,contact()),"reef");
    strata(-width/2,width/2,x => Math.min(crest(x)-.012,contact()),floor,"shale",0xaadbea);
    const top = Array.from({length:60}, (_,i) => {
      const x = width*(i/59-.5);
      return new THREE.Vector3(x,crest(x),front+.018);
    });
    outline(top,0xffc99a,.9);
    lineAt(contact(),ice,.95,.013);
    drawCasing(y(model.to)+.025,y(model.from)+.21,0,front+.096);
    focus = new THREE.Group();
    const a = new THREE.Vector3(.42,y(model.crest),front+.16);
    const b = new THREE.Vector3(.42,y(model.contact),front+.16);
    beam(a,b,amber,focus,.024);
    for (const point of [a,b]) {
      beam(point.clone().add(new THREE.Vector3(-.14,0,0)),point.clone().add(new THREE.Vector3(.14,0,0)),amber,focus,.018);
    }
    terrain.add(focus);
  }

  function makePressureGlow() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const context = canvas.getContext("2d");
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    textures.add(map);
    const opacity = new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false});
    return {canvas,context,map,opacity};
  }

  function buildPressure() {
    const glow = makePressureGlow();
    const wells = model.permeability.map((k,index) => {
      const level = index ? -1.19 : .98;
      strata(-width/2,width/2,() => level+.41,() => level-.41,index?"shale":"cap");
      drawCasing(level-.51,level+.81,0,front+.093);
      const signal = mesh(new THREE.PlaneGeometry(width, .80),glow.opacity);
      signal.position.set(0,level,front+.009);
      if (index) {
        signal.scale.x = Math.sqrt(k/model.permeability[0]);
        signal.scale.x = Math.min(2,signal.scale.x);
      }
      return {signal};
    });
    pressure = {wells,glow};
  }

  try {
    if (model.kind === "logging") buildLogging();
    else if (model.kind === "reef") buildReef();
    else buildPressure();

    if (model.kind !== "pressure") {
      sweep = new THREE.Group();
      for (const [radius,opacity] of [[.012,.88],[.033,.15],[.068,.065]]) {
        const line = mesh(new THREE.CylinderGeometry(radius,radius,1,8),
          new THREE.MeshBasicMaterial({color:ice,opacity,transparent:true,depthWrite:false}),sweep);
        line.rotation.z = Math.PI/2;
      }
      probe = mesh(new THREE.SphereGeometry(.041,12,8),new THREE.MeshBasicMaterial({color:0xeefdfb}),survey);
      survey.add(sweep);
    }
  } catch (error) {
    dispose();
    throw error;
  }

  function anchorY(depth) {
    return camera.top - (camera.top-camera.bottom)*(.10+.8*(depth-model.from)/(model.to-model.from));
  }

  function updateSignal(value) {
    if (!pressure) return;
    const {canvas,context,map} = pressure.glow;
    if (phase === value) return;
    phase = value;
    context.clearRect(0,0,canvas.width,canvas.height);
    const gradient = context.createLinearGradient(0,0,canvas.width,0);
    const breadth = .05+.20*value;
    const corner = .5-breadth;
    const strength = .3 + value*.64;
    gradient.addColorStop(0,"#89e5ff00");
    gradient.addColorStop(corner,"#89e5ff00");
    gradient.addColorStop(.5-breadth*.45,"#91e7ff6b");
    gradient.addColorStop(.5,"rgba(197,255,248,"+strength+")");
    gradient.addColorStop(.5+breadth*.45,"#91e7ff6b");
    gradient.addColorStop(1-corner,"#89e5ff00");
    gradient.addColorStop(1,"#89e5ff00");
    context.fillStyle = gradient;
    context.fillRect(0,0,canvas.width,canvas.height);
    map.needsUpdate = true;
  }

  function paint(state, angle, pulse, signal) {
    if (lost || disposed || !widthPx || !heightPx) return;
    terrain.rotation.y = angle;
    if (hydroContact) hydroContact.visible = state.revealed && state.marker === model.contact;
    if (focus) {
      focus.visible = model.kind === "reef" ? state.revealed : state.marker !== null;
      if (model.kind === "logging" && focus.visible) focus.position.y = y(state.marker);
    }
    if (pressure) {
      pressure.wells.forEach(({signal: patch}) => { patch.visible = state.revealed; });
      if (state.revealed) updateSignal(signal);
    }
    if (sweep) {
      const shaftX = model.kind === "logging" ? wellX : 0;
      const markerX = shaftX*lens*Math.cos(angle) + (front+.09)*Math.sin(angle);
      const lineWidth = halfWidth-markerX;
      const depthY = anchorY(state.depth);
      const solved = state.revealed && state.marker !== null;
      for (const line of sweep.children) line.material.color.setHex(solved ? amber : ice);
      sweep.position.set(markerX+lineWidth/2,depthY,2.66);
      sweep.scale.set(lineWidth,pulse,1);
      probe.position.set(markerX,depthY,2.67);
      probe.scale.setScalar(Math.min(pulse,1.3));
    }
    renderer.render(world,camera);
  }

  function resize() {
    if (disposed) return;
    widthPx = host.clientWidth;
    heightPx = host.clientHeight;
    if (!widthPx || !heightPx) return;
    const aspect = widthPx/heightPx;
    halfHeight = 2.5;
    halfWidth = halfHeight*aspect;
    lens = Math.min(1,(halfWidth*2)/6.12);
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.position.set(0,0,11);
    camera.lookAt(centre);
    camera.updateProjectionMatrix();
    terrain.scale.set(lens,1,1);
    renderer.setSize(widthPx,heightPx,false);
    if (lastState && !animation) draw(lastState);
  }

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = undefined;
    animation = undefined;
  }

  function draw(state) {
    lastState = state;
    stop();
    paint(state,state.section ? 0 : state.yaw,1,1);
  }

  function animate(state, duration, step) {
    lastState = state;
    stop();
    const start = performance.now();
    const recipe = {};
    animation = recipe;
    function tick(now) {
      if (disposed || lost || animation !== recipe) return;
      const value = Math.min(1,Math.max(0,(now-start)/duration));
      step(value);
      if (value < 1) frame = requestAnimationFrame(tick);
      else stop();
    }
    frame = requestAnimationFrame(tick);
  }

  function intro(state, reduce) {
    if (reduce || state.section) return;
    animate(state,700,progress => {
      const eased = (1-progress)**3;
      paint(state,state.yaw-.36*eased,1,1);
    });
  }

  function resolve(state, reduce) {
    if (reduce) return;
    animate(state,model.kind==="pressure"?1500:650,progress => {
      const pulse = 1+1.25*Math.sin(progress*Math.PI)**2;
      paint(state,state.section ? 0 : state.yaw,pulse,progress);
    });
  }

  function contextLost(event) {
    event.preventDefault();
    stop();
    lost = true;
    renderer.domElement.hidden = true;
    onFallback(true);
  }
  function contextRestored() {
    lost = false;
    renderer.domElement.hidden = false;
    onFallback(false);
    resize();
  }
  renderer.domElement.addEventListener("webglcontextlost",contextLost);
  renderer.domElement.addEventListener("webglcontextrestored",contextRestored);
  host.append(renderer.domElement);
  resize();

  function dispose() {
    if (disposed) return;
    disposed = true;
    stop();
    renderer.domElement.removeEventListener("webglcontextlost",contextLost);
    renderer.domElement.removeEventListener("webglcontextrestored",contextRestored);
    world.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) materials.add(object.material);
    });
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    for (const texture of textures) texture.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  }

  return {draw,resize,intro,resolve,dispose};
}
