const bookScenes = {
  logs: {
    caption: [
      "На профильном виде сдвинь линию глубины. Она пересечёт обе кривые и покажет, к какому слою относятся показания.",
      "Қима көрінісінде тереңдік сызығын жылжыт. Ол екі қисықты да қиып, көрсеткіштердің қай қабатқа тиесілі екенін көрсетеді.",
      "Switch to the profile and move the depth line. It crosses both curves to show which layer the readings belong to."
    ],
    keys: [
      ["#4ce6df", "Самопроизвольная поляризация (СП)", "Өздігінен полярлану (ӨП)", "Spontaneous potential (SP)"],
      ["#e6b27e", "Гамма-каротаж (ГК)", "Гамма-каротаж (ГК)", "Gamma ray (GR)"],
      ["#f6e3a0", "Общая глубина", "Ортақ тереңдік", "Shared depth"]
    ],
    start: [0.30, 0.31],
    views: ["isometric", "profile"]
  },
  lens: {
    caption: [
      "В профиль видно, как светлое тело утончается к краям. Вид сверху показывает его протяжённость.",
      "Қимадан ашық түсті дененің шеттері жұқаратынын көресің. Үстіңгі көрініс оның созылымын көрсетеді.",
      "In profile the light-coloured body tapers towards its edges. From above you can see its extent."
    ],
    keys: [
      ["#edc387", "Линза биострома", "Биостром линзасы", "Biostrome lens"],
      ["#6d8c99", "Вмещающие слои", "Сыйыстырушы қабаттар", "Surrounding beds"]
    ],
    start: [0.38, 0.40],
    views: ["isometric", "top", "profile"]
  },
  atoll: {
    caption: [
      "Посмотри сверху: рифовое ядро образует овал вокруг внутренней области. Под углом видны рифовый склон и основание.",
      "Жоғарыдан қара: риф ядросы ішкі бөлікті сопақша қоршайды. Қиғаш көріністе рифтің беткейі мен табаны көрінеді.",
      "From above, the reef core forms an oval around the interior. The angled view reveals the reef slope and its base."
    ],
    keys: [
      ["#eed3a0", "Рифовое ядро", "Риф ядросы", "Reef core"],
      ["#39c7c4", "Внутренняя область", "Ішкі аумақ", "Interior"],
      ["#347b9a", "Внешний склон", "Сыртқы беткей", "Outer slope"]
    ],
    start: [0.28, 0.78],
    views: ["isometric", "top"]
  },
  zones: {
    caption: [
      "Сверху видно, что соседние полосы идут вдоль рифа. В профиль эти же зоны читаются поперёк системы.",
      "Үстінен қарағанда көршілес жолақтар рифтің бойымен созылады. Қимада сол белдемдер жүйенің көлденеңінен көрінеді.",
      "From above, neighbouring bands run along the reef. In profile, the same zones can be read across the system."
    ],
    keys: [
      ["#79c5af", "Соседняя зона", "Көршілес белдем", "Neighbouring zone"],
      ["#edc387", "Осевой пояс", "Осьтік белдеу", "Central belt"],
      ["#b17fa0", "Соседняя зона", "Көршілес белдем", "Neighbouring zone"]
    ],
    start: [0.48, 0.65],
    views: ["isometric", "top", "profile"]
  },
  cement: {
    caption: [
      "Сравни одинаковые зёрна с двух сторон. В одном образце между ними остаются промежутки, в другом часть этих промежутков занята минералом-цементом.",
      "Екі жақтағы бірдей түйірлерді салыстыр. Бір үлгіде олардың арасында қуыстар бар, екіншісінде сол қуыстардың бір бөлігін минералдық цемент толтырған.",
      "Compare the identical grains in the two samples. In one, there are gaps between the grains. In the other, mineral cement has filled some of that space."
    ],
    keys: [
      ["#94b3ac", "Зёрна породы", "Жыныс түйірлері", "Rock grains"],
      ["#f3aa58", "Минерал-цемент", "Минералдық цемент", "Mineral cement"]
    ],
    start: [0.08, 0.59],
    views: ["isometric", "top"]
  }
};

function bookModel(fact) {
  const scene = bookScenes[fact.scene];
  const figure = txt("figure", "", "book-model");
  const caption = txt("figcaption");
  caption.append(txt("strong", fact.term), txt("p", scene.caption, "book-model-caption"));
  const stage = div("book-model-stage");
  const legend = div("book-model-legend", ...scene.keys.map(([color, ...label]) => {
    const marker = txt("i");
    marker.style.setProperty("--key-color", color);
    return div("book-model-key", marker, txt("span", label));
  }));
  const controls = div("book-model-controls");
  figure.append(caption, stage, controls, legend, txt("p", t(fact.scene === "logs" ? "syntheticLogs" : "exampleLabel"), "book-model-note"));

  const points = bookModelGeometry(fact.scene);
  const cursor = fact.scene === "logs" ? bookDepthCursor(-0.04) : [];
  let canvas = txt("canvas");
  const makeRenderer = createBookWebGL(canvas);
  if (!makeRenderer) canvas = txt("canvas");
  canvas.width = 900;
  canvas.height = 530;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", local(fact.term));
  stage.append(canvas);
  const fallback = !makeRenderer && canvas.getContext("2d");
  let [yaw, tilt] = scene.start;
  let drag;
  let drawRequest;
  const draw = () => {
    if (makeRenderer) makeRenderer(points, cursor, yaw, tilt);
    else if (fallback) paintBookModel(canvas, fallback, [...points, ...cursor], yaw, tilt);
  };
  const scheduleDraw = () => {
    if (drawRequest) return;
    drawRequest = requestAnimationFrame(() => { drawRequest = null; draw(); });
  };
  const views = {
    isometric: scene.start,
    top: [0, Math.PI / 2],
    profile: [fact.scene === "zones" ? -Math.PI / 2 : 0, 0]
  };
  const viewButtons = scene.views.map(view => btn(t("view" + view), () => {
    [yaw, tilt] = views[view];
    setView(view);
    draw();
  }, "soft"));
  function setView(view) {
    viewButtons.forEach((button, index) => button.setAttribute("aria-pressed", String(scene.views[index] === view)));
  }
  function turn(amount, elevation=0) {
    yaw += amount;
    tilt = Math.max(0, Math.min(Math.PI / 2, tilt + elevation));
    setView(null);
    scheduleDraw();
  }
  setView("isometric");
  controls.append(div("book-view-tabs", viewButtons),
    div("book-orbit-buttons",
      btn(t("turnLeft"), () => turn(-Math.PI / 9), "soft"),
      btn(t("turnRight"), () => turn(Math.PI / 9), "soft")
    ));
  if (fact.scene === "logs") {
    const input = txt("input");
    input.type = "range";
    input.min = "-7";
    input.max = "7";
    input.step = "0.1";
    input.value = "-0.4";
    input.addEventListener("input", () => {
      cursor.splice(0, cursor.length, ...bookDepthCursor(Number(input.value) / 10));
      scheduleDraw();
    });
    const label = txt("label", t("sharedDepth"), "book-depth-control");
    label.append(input);
    controls.append(label);
  }
  canvas.addEventListener("pointerdown", event => {
    if (!event.isPrimary || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", event => {
    if (drag?.id !== event.pointerId) return;
    turn((event.clientX - drag.x) * 0.012, (event.clientY - drag.y) * 0.008);
    drag.x = event.clientX;
    drag.y = event.clientY;
  });
  canvas.addEventListener("lostpointercapture", () => { drag = undefined; });
  draw();
  return figure;
}

function bookMesh() {
  const faces = [];
  function face(vertices, hex, flip=false, solid=false) {
    const [a,b,c] = vertices;
    const [x,y,z] = b.map((v,i)=>v-a[i]);
    const [u,v,w] = c.map((n,i)=>n-a[i]);
    const normal = [y*w-z*v,z*u-x*w,x*v-y*u];
    const length = Math.hypot(...normal);
    if (length < 1e-8) return;
    const color = hex.slice(1).match(/../g).map(part => parseInt(part,16));
    faces.push({vertices,color,normal:normal.map(n=>n/length*(flip?-1:1)),solid});
  }
  function box(x,y,z, width,height,depth, color, solid=false) {
    const offsets = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
    const points = offsets.map(([dx,dy,dz])=>[x+dx*width/2,y+dy*height/2,z+dz*depth/2]);
    for (const indices of [[3,2,1,0],[4,5,6,7],[0,4,7,3],[5,1,2,6],[3,7,6,2],[0,1,5,4]]) {
      face(indices.map(i=>points[i]),color,false,solid);
    }
  }
  function skin(rowCount,colCount, point, palette, flip=false) {
    const grid=Array.from({length:rowCount+1},(_,j)=>
      Array.from({length:colCount+1},(_,i)=>point(i/colCount,j/rowCount)));
    for(let j=0;j<rowCount;j++)for(let i=0;i<colCount;i++){
      const a=grid[j][i], b=grid[j][i+1], c=grid[j+1][i+1], d=grid[j+1][i];
      const color=palette[(i*17+j*13)%palette.length];
      face([a,b,c],color,flip);
      face([a,c,d],color,flip);
    }
  }
  function grain(x,y,z,rx,ry,rz, palette, seed) {
    skin(10,18,(u,v)=>{
      const t=u*Math.PI*2, a=(v-.5)*Math.PI;
      const r=1+.065*Math.sin(t*3+a*5+seed)+.05*Math.cos(t*7-a*3+seed);
      return [x+rx*r*Math.cos(t)*Math.cos(a),y+ry*r*Math.sin(a),z+rz*r*Math.sin(t)*Math.cos(a)];
    },palette,true);
  }
  return {faces,face,box,skin,grain};
}

function logX(track,y) {
  const base = track===0 ? 0.68 : 1.87;
  const clayResponse = 0.15*Math.tanh(14*(y+.31)) - 0.14*Math.tanh(14*(y-.21));
  return base + (track===0 ? -clayResponse : clayResponse*.87)
    + .049*Math.sin(y*13+track*2)+.022*Math.cos(y*31+track);
}

function bookDepthCursor(y) {
  const {faces,box} = bookMesh();
  for(let index=0;index<28;index++)box(-2.58+index*.19,y,0.949,.128,.014,.024,"#f6e3a0",true);
  for(let track=0;track<2;track++)box(logX(track,y),y,0.966,.094,.080,.039,"#fff1b5",true);
  return faces;
}

function bookModelGeometry(scene) {
  const {faces,face,box,skin,grain}=bookMesh();
  const tau=Math.PI*2;
  const plinth="#264655";
  if(scene==="logs"){
    const layers=[
      [-.76,.30,"#587277"],[-.40,.40,"#ae8b64"],[.01,.42,"#6b7985"],[.38,.32,"#a2896f"],[.69,.30,"#677d89"]
    ];
    for(const [y,h,color] of layers){
      box(-1.44,y,0,2.42,h,1.76,color);
      for(const n of [-.26,.12,.36])box(-1.44,y+h*n,.883,2.42,.012,.011,"#5a6061");
    }
    box(-.94,0,.901,.07,1.72,.03,"#3d5e64",true);
    for(let tick=0;tick<17;tick++)box(-.94,-.8+tick*.1,.92,tick%4===0?.14:.071,.007,.013,"#c4d5d2",true);
    for(const [track,base,color] of [[0,.68,"#4ce6df"],[1,1.87,"#e6b27e"]]){
      box(base,0,.875,1.08,1.81,.073,"#203c48");
      for(let row=0;row<=8;row++)box(base,-.8+row*.2,.916,1,.006,.012,"#42616e");
      for(let col=-2;col<=2;col++)box(base+col*.20,0,.916,.007,1.70,.012,"#45616e");
      for(let i=0;i<64;i++){
        const y=-.81+1.62*i/64, next=y+1.62/64;
        const x=logX(track,y), end=logX(track,next), z=.933;
        face([[x-.018,y,z],[x+.018,y,z],[end+.018,next,z],[end-.018,next,z]],color,false,true);
      }
    }
    return faces;
  }
  if(scene==="lens"){
    for(const [y,h,color] of [[-.86,.22,plinth],[-.65,.20,"#455f67"],[-.48,.14,"#6d8c99"],[-.37,.08,"#9e9682"]]){
      box(0,y,0,5.25,h,2.78,color);
    }
    function bed(u,v, surface) {
      const x=(u-.5)*4.90, z=(v-.5)*2.55;
      const thick=.61*Math.max(0,1-(x/2.45)**2-(z/1.28)**2)**.79;
      return [x,-.321+(surface?thick:0),z];
    }
    skin(20,38,(u,v)=>bed(u,v,true),["#edc387","#dfaf76","#efc78c","#e5bc86"],true);
    return faces;
  }
  if(scene==="atoll"){
    const bands=[
      [0,-.13,"#39c7c4"],[.48,-.12,"#3fcac0"],[.62,-.05,"#6fbcaf"],
      [.74,.32,"#c2ae83"],[.86,.42,"#eed3a0"],[.94,.13,"#af9d76"],
      [1.12,-.37,"#527e88"],[1.25,-.53,"#347b9a"],[1.28,-.62,"#396180"],[1.28,-.88,plinth]
    ];
    for(let i=0;i<bands.length-1;i++){
      const [r1,h1,color]=bands[i], [r2,h2]=bands[i+1];
      const tint=color==="#eed3a0"?"#e2c58b":color;
      skin(3,76,(u,v)=>{
        const angle=u*tau, ring=r1+(r2-r1)*v;
        const wave=1+.048*Math.sin(angle*5+.4)+.026*Math.cos(angle*9);
        const rough=(i>=2&&i<7 ? .042*Math.cos(angle*13+v) : 0);
        return [2.23*ring*wave*Math.cos(angle),h1+(h2-h1)*v+rough,1.72*ring*wave*Math.sin(angle)];
      },[color,tint,color]);
    }
    return faces;
  }
  if(scene==="zones"){
    box(0,-.72,0,5.32,.33,2.95,plinth);
    box(0,-.52,0,5.30,.10,2.94,"#52787d");
    for(const [index,color,h] of [[0,"#79c5af",.03],[1,"#edc387",.34],[2,"#b17fa0",.07]]){
      const band=(u,v)=>{
        const x=(u-.5)*5.18;
        const curve=.11*Math.sin(u*5)+.035*Math.sin(u*17);
        return [x,-.29+h*(.58+.42*Math.sin(Math.PI*v))+.026*Math.sin(u*14+index),-1.36+(index+v)*.90+curve];
      };
      skin(8,40,band,[color],true);
      for(const end of [0,1])skin(1,16,(u,v)=>{
        const [x,y,z]=band(end,u);
        return [x,-.48+(y+.48)*v,z];
      },[color],end===1);
      for(const side of [0,1])skin(1,36,(u,v)=>{
        const [x,y,z]=band(u,side);
        return [x,-.48+(y+.48)*v,z];
      },[color],side===0);
    }
    return faces;
  }
  if(scene==="cement"){
    const grainColors=["#94b3ac","#91afa5","#a2bcb0","#9cb8ac"];
    for(const group of [-1.45,1.45]){
      box(group,-.71,0,2.59,.25,2.24,plinth);
      box(group,-.54,0,2.54,.11,2.19,"#3f666b");
      for(const [i,[x,z,rx,rz]] of [[-.62,-.53,.55,.52],[.58,-.55,.48,.51],[-.59,.54,.56,.52],[.61,.55,.49,.49]].entries()){
        grain(group+x,-.02,z,rx,.52,rz,grainColors,i);
      }
    }
    const cementColors=["#f3aa58","#ed9b53","#f8bd74"];
    grain(1.43,-.29,.02,.47,.26,.39,cementColors,0);
    grain(1.37,-.13,.52,.27,.28,.25,cementColors,2);
    grain(.87,-.33,.04,.25,.24,.31,cementColors,3);
  }
  return faces;
}

function bookFrame(faces,yaw,tilt,width,height) {
  const cy=Math.cos(yaw), sy=Math.sin(yaw), ct=Math.cos(tilt), st=Math.sin(tilt);
  let maxX=0, maxY=0;
  const mesh=faces.map(({vertices,...material})=>{
    const points=vertices.map(([x,y,z])=>{
      const forward=x*sy+z*cy;
      const screenX=x*cy-z*sy, screenY=forward*st-y*ct;
      maxX=Math.max(maxX,Math.abs(screenX));
      maxY=Math.max(maxY,Math.abs(screenY));
      return [screenX,screenY,forward*ct+y*st];
    });
    return {...material,points};
  });
  return {mesh,zoom:Math.min(height*.245,width*.43/maxX,height*.41/maxY)};
}

function paintBookModel(canvas,context,faces,yaw,tilt){
  const {width,height}=canvas;
  const {mesh,zoom}=bookFrame(faces,yaw,tilt,width,height);
  const averageDepth=({points})=>points.reduce((sum,p)=>sum+p[2],0)/points.length;
  context.clearRect(0,0,width,height);
  for(const {points,color,normal,solid} of mesh.sort((a,b)=>averageDepth(a)-averageDepth(b))){
    const light=solid?1:Math.max(.55,Math.min(1.22,.80+.30*(normal[1]-.62*normal[0]+.35*normal[2])));
    context.beginPath();
    points.forEach(([x,y],i)=>{
      context[i?"lineTo":"moveTo"](width/2+x*zoom,height/2+y*zoom);
    });
    context.closePath();
    context.fillStyle=context.strokeStyle="rgb("+color.map(channel=>Math.min(255,Math.round(channel*light))).join(",")+")";
    context.lineWidth=.7;
    context.fill();
    context.stroke();
  }
}

function createBookWebGL(canvas){
  const gl=canvas.getContext("webgl",{alpha:true,antialias:true,premultipliedAlpha:false});
  if(!gl)return null;
  const program=gl.createProgram();
  function attach(type,source){
    const shader=gl.createShader(type);
    gl.shaderSource(shader,source.join("\n"));
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))return false;
    gl.attachShader(program,shader);
    gl.deleteShader(shader);
    return true;
  }
  if(!attach(gl.VERTEX_SHADER,[
    "attribute vec3 point; attribute vec3 color; attribute vec3 normal; attribute float solid;",
    "varying vec3 material; varying vec3 surface; varying vec3 lightNormal; varying float overlay;",
    "void main() { material=color; surface=point; lightNormal=normal; overlay=solid; gl_Position=vec4(point, 1.0); }"
  ])||!attach(gl.FRAGMENT_SHADER,[
    "precision mediump float;",
    "varying vec3 material; varying vec3 surface; varying vec3 lightNormal; varying float overlay;",
    "void main() {",
    " float diffuse = max(0.0, dot(normalize(lightNormal), normalize(vec3(-.51,.84,.34))));",
    " float streak = sin(surface.x*42.0 + sin(surface.y*39.0)*2.0)*.018;",
    " float spec = pow(diffuse, 9.0)*.13;",
    " vec3 shaded = material*(.59+.49*diffuse+streak) + vec3(.045,.065,.084) + spec*vec3(.95,.81,.62);",
    " gl_FragColor=vec4(mix(shaded,material,overlay),1.0); }"
  ]))return null;
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))return null;
  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);
  const buffer=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  for(const [name,size,offset] of [["point",3,0],["color",3,3],["normal",3,6],["solid",1,9]]){
    const location=gl.getAttribLocation(program,name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location,size,gl.FLOAT,false,40,offset*4);
  }
  return (faces,cursor,yaw,tilt)=>{
    const {width,height}=canvas;
    const {mesh,zoom}=bookFrame([...faces,...cursor],yaw,tilt,width,height);
    const data=[];
    for(const {points,color,normal,solid} of mesh){
      const tint=color.map(value=>value/255);
      for(let i=1;i<points.length-1;i++)for(const [x,y,z] of [points[0],points[i],points[i+1]]){
        data.push(x*2*zoom/width,-y*2*zoom/height,-z*.18,...tint,...normal,Number(solid));
      }
    }
    gl.viewport(0,0,width,height);
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLES,0,data.length/10);
  };
}
