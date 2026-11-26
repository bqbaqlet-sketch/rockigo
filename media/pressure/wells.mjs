import * as THREE from "../logging/vendor/three.module.min.js";

const colors = [0xffcd8c,0x7ee6dd,0xc4b3fe];

export function buildWells(host,fallback) {
  const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1,2));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-5,5,3,-3,.1,50);
  const strata = new THREE.Group();
  scene.add(strata, new THREE.HemisphereLight(0xecffe9,0x4b665c,1.85));
  const light = new THREE.DirectionalLight(0xffebc8,2.03);
  light.position.set(4,8,5);
  scene.add(light);

  [0x68775a,0x7e6453,0x55756c].forEach((color,i)=>{
    const layer = new THREE.Mesh(new THREE.BoxGeometry(7,.48,2.45),
      new THREE.MeshStandardMaterial({color,roughness:.92}));
    layer.position.y = -.24-i*.51;
    strata.add(layer);
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(layer.geometry),
      new THREE.LineBasicMaterial({color:0xbdd0b5,transparent:true,opacity:.28}));
    layer.add(edge);
  });
  const wellGeometry = new THREE.CylinderGeometry(.083,.083,1.93,18);
  const wells = [-2.6,0,2.6].map((x,index)=>{
    const material = new THREE.MeshStandardMaterial({color:colors[index],emissive:colors[index],metalness:.20,roughness:.32});
    const well = new THREE.Group();
    well.position.set(x,0,.98);
    const pipe = new THREE.Mesh(wellGeometry,material);
    pipe.position.y=-.20;
    const base = new THREE.Mesh(new THREE.BoxGeometry(.47,.15,.43),material);
    base.position.y=.085;
    const head = new THREE.Mesh(index===0?new THREE.BoxGeometry(.56,.19,.20):new THREE.SphereGeometry(.18,20,12),material);
    head.position.y=.77;
    well.add(pipe,base,head);
    strata.add(well);
    return {head,material};
  });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let last = {time:0,index:0};
  function render(time,index) {
    last = {time,index};
    const emphasis = index===0?[0]:index===3?[1]:index>=4&&index<=7?[2]:[1,2];
    strata.rotation.y = -.27 + (reduced.matches?0:.08*Math.min(time/4.9,1));
    wells.forEach(({material,head},i)=>{
      const active=emphasis.includes(i);
      material.emissiveIntensity = active ? .45 : .065;
      head.scale.setScalar(active?1.15:1);
    });
    renderer.render(scene,camera);
  }

  renderer.domElement.addEventListener("webglcontextlost",event=>{
    event.preventDefault();
    renderer.domElement.hidden=true;
    fallback.hidden=false;
  });
  renderer.domElement.addEventListener("webglcontextrestored",()=>{
    renderer.domElement.hidden=false;
    fallback.hidden=true;
    render(last.time,last.index);
  });
  host.append(renderer.domElement);
  function resize() {
    const w=host.clientWidth, h=host.clientHeight;
    if(!w||!h) return;
    const aspect=w/h;
    const vertical=Math.max(1.63,4.04/aspect);
    camera.left=-vertical*aspect;
    camera.right=vertical*aspect;
    camera.top=vertical;
    camera.bottom=-vertical;
    camera.position.set(1.5,4.4,11);
    camera.lookAt(0,-.12,0);
    camera.updateProjectionMatrix();
    renderer.setSize(w,h,false);
    render(last.time,last.index);
  }
  new ResizeObserver(resize).observe(host);
  resize();
  fallback.hidden=true;
  return render;
}
