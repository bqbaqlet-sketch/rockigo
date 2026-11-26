import * as THREE from "./vendor/three.module.min.js";

export function buildWell(host, fallback) {
  const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true, powerPreference:"low-power"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3.4, 3.4, 2.65, -2.65, .1, 40);
  const root = new THREE.Group();
  scene.add(root, new THREE.HemisphereLight(0xf2fff3, 0x698482, 1.9));
  const key = new THREE.DirectionalLight(0xffe5c2, 2.1);
  key.position.set(3, 6, 4);
  scene.add(key);
  const geometry = new THREE.BoxGeometry(3.55, .91, 1.48);
  const colors = [0x989770, 0x8c6359, 0x789786, 0x746b9a];
  const layers = colors.map((color,index)=>{
    const material = new THREE.MeshStandardMaterial({color, roughness:.85, emissive:0xbceaa0, emissiveIntensity:0});
    const layer = new THREE.Mesh(geometry, material);
    layer.position.y = 1.45 - index * .97;
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({color:0xf1eab6, transparent:true, opacity:.23}));
    layer.add(edge);
    root.add(layer);
    return {layer, edge, material};
  });

  const flecks = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.045,0),
    new THREE.MeshStandardMaterial({color:0xd9d2ae, roughness:1}), 160);
  const point = new THREE.Object3D();
  for (let i=0;i<160;i++) {
    point.position.set(Math.sin(i*8.41)*1.66, (1.45-Math.floor(i/40)*.97)+Math.sin(i*4.71)*.39, .746+Math.cos(i)*.02);
    point.scale.setScalar(.55 + (i%8)*.11);
    point.rotation.set(i*.27,i*.38,i*.16);
    point.updateMatrix();
    flecks.setMatrixAt(i, point.matrix);
  }
  root.add(flecks);

  const casing = new THREE.Mesh(new THREE.CylinderGeometry(.111,.111,4.2,28),
    new THREE.MeshStandardMaterial({color:0xa3dcd4, metalness:.32, roughness:.27}));
  casing.position.set(-.25,0,.91);
  root.add(casing);
  const probe = new THREE.Mesh(new THREE.CylinderGeometry(.154,.122,.36,24),
    new THREE.MeshStandardMaterial({color:0xf3ffe8, emissive:0xafffa1, emissiveIntensity:.48}));
  probe.position.copy(casing.position);
  root.add(probe);

  const highlight = new THREE.Mesh(new THREE.BoxGeometry(3.66,.012,1.57),
    new THREE.MeshBasicMaterial({color:0xc8f6a7, transparent:true, opacity:.60}));
  highlight.position.z=.05;
  root.add(highlight);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let last = {time:0, focus:null};
  function render(time,focus) {
    last = {time,focus};
    const phase = reduced.matches ? 0 : Math.min(1,time/5.9);
    const target = focus === 3 ? -1.46 : focus === 0 ? 1.45 : 1.58 - Math.min(time,5.90)*.36;
    root.rotation.y = -.39 + phase * .11;
    probe.position.y = target;
    highlight.position.y = target;
    highlight.visible = focus === null && time >= 3.18 && time < 9.5;
    probe.visible = time < 9.5 || Number.isInteger(focus);
    layers.forEach(({edge, material}, index)=>{
      const active = focus === index;
      material.emissiveIntensity = active ? .35 : 0;
      edge.material.opacity = active ? 1 : .23;
    });
    renderer.render(scene,camera);
  }
  renderer.domElement.addEventListener("webglcontextlost", event=>{
    event.preventDefault();
    renderer.domElement.hidden=true;
    fallback.hidden=false;
  });
  renderer.domElement.addEventListener("webglcontextrestored", ()=>{
    renderer.domElement.hidden=false;
    fallback.hidden=true;
    render(last.time,last.focus);
  });
  host.append(renderer.domElement);
  const resize = ()=>{
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    const aspect = w/h;
    const halfH = Math.max(2.55, 2.44/aspect);
    camera.left=-halfH*aspect;
    camera.right=halfH*aspect;
    camera.top=halfH;
    camera.bottom=-halfH;
    camera.position.set(0,1.5,8);
    camera.lookAt(0,0,0);
    camera.updateProjectionMatrix();
    renderer.setSize(w,h,false);
    render(last.time,last.focus);
  };
  new ResizeObserver(resize).observe(host);
  resize();
  fallback.hidden=true;
  return render;
}
