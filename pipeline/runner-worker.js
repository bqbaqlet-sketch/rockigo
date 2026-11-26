import {loadPyodide} from "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.mjs";

const files=["build_course.py","browser_run.py","domain-pack.json"];
const schemas=["node","coverage","routing","task"];
const assets={logo:["logo.jpg","image/jpeg"],model:["rocky.glb","model/gltf-binary"],viewer:["model-viewer.min.js","text/javascript"]};
let runtime, shell;

async function read(path,type="text") {
  const response=await fetch(new URL(path,import.meta.url));
  if(!response.ok)throw new Error("Не удалось загрузить "+path+" (HTTP "+response.status+").");
  return response[type]();
}

async function preparePython() {
  const python=await loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.29.3/full/"});
  await python.loadPackage(["micropip","attrs","referencing","jsonschema-specifications","rpds-py"]);
  await python.runPythonAsync("import micropip\nawait micropip.install(['jsonschema==4.25.1','pypdf==6.21.4'])");
  python.FS.mkdir("/schemas");
  python.FS.mkdir("/input");
  python.FS.mkdir("/output");
  await Promise.all([
    ...files.map(async path=>python.FS.writeFile("/"+path,await read("./"+path))),
    ...schemas.map(async name=>{
      const path=name+".schema.json";
      python.FS.writeFile("/schemas/"+path,await read("./schemas/"+path));
    })
  ]);
  python.runPython("import sys\nsys.path.insert(0, '/')\nfrom pathlib import Path\nfrom browser_run import run_browser");
  return python;
}

async function prepareCourseShell() {
  const [html,styles,chapterScript,entries]=await Promise.all([
    read("../index.html"),read("./chapter.css"),read("./chapter-ui.js"),
    Promise.all(Object.entries(assets).map(async ([key,[file,mime]])=>{
      const blob=await read("../assets/"+file,"blob");
      return [key,new FileReaderSync().readAsDataURL(new Blob([blob],{type:mime}))];
    }))
  ]);
  const content=/<script type="application\/json" id="content">([^<]+)<\/script>/;
  const found=html.match(content);
  if(!found)throw new Error("Не найден шаблон офлайн-курса.");
  const data=JSON.parse(found[1]);
  delete data.browserAI;
  data.assets=Object.fromEntries(entries);
  const template=html
    .replace(/(name="rockigo-api" content=")[^"]*"/,'$1"')
    .replace("</style>",()=>styles+"\n</style>")
    .replace("<script>",()=>"<script>"+chapterScript+"\n");
  return (chapter)=>template.replace(content,()=>
    '<script type="application/json" id="content">'+JSON.stringify({...data,chapter}).replaceAll("<","\\u003c")+"</script>");
}

self.onmessage=async ({data})=>{
  const status=(message)=>self.postMessage({message});
  try{
    status(runtime?"Читаю исходные файлы…":"Загружаю среду Python…");
    runtime??=preparePython().catch(error=>{runtime=null;throw error;});
    const python=await runtime;
    const fs=python.FS;
    fs.writeFile("/input/chapter.md",new Uint8Array(data.markdown));
    fs.writeFile("/input/chapter.pdf",new Uint8Array(data.pdf));
    fs.writeFile("/input/metadata.json",JSON.stringify(data.metadata));
    status("Собираю слой и сверяю страницы…");
    python.runPython("run_browser(Path('/input/metadata.json'),Path('/input'),Path('/output'),Path('/schemas'))");
    status("Собираю автономный HTML и архив…");
    shell??=prepareCourseShell().catch(error=>{shell=null;throw error;});
    const readOutput=name=>fs.readFile("/output/"+name,{encoding:"utf8"});
    const createCourse=await shell;
    const html=createCourse(JSON.parse(readOutput("course.json")));
    const htmlBytes=new TextEncoder().encode(html);
    if(htmlBytes.length>30000000)throw new Error("Офлайн-курс превысил лимит в 30 МБ. Укажи страницы одной главы.");
    fs.writeFile("/output/RockiGo.html",htmlBytes);
    const report=JSON.parse(readOutput("verification.json"));
    report.html_bytes=htmlBytes.length;
    fs.writeFile("/output/verification.json",JSON.stringify(report,null,2)+"\n");
    python.runPython(`from zipfile import ZipFile, ZIP_DEFLATED
with ZipFile('/bundle.zip','w',ZIP_DEFLATED,compresslevel=6) as package:
    for entry in sorted(Path('/output').iterdir()):
        package.write(entry,entry.name)`);
    const outputs=fs.readdir("/output").filter(name=>name!=="."&&name!=="..")
      .map(name=>[name,fs.readFile("/output/"+name)]);
    outputs.push(["RockiGo-chapter.zip",fs.readFile("/bundle.zip")]);
    self.postMessage({report,outputs},outputs.map(([,bytes])=>bytes.buffer));
  }catch(error){
    const message=String(error.message??error).trim().split("\n");
    self.postMessage({error:message.at(-1)});
  }finally{
    if(runtime){
      const fs=(await runtime).FS;
      for(const path of ["/input","/output"]){
        for(const name of fs.readdir(path).filter(item=>item!=="."&&item!==".."))fs.unlink(path+"/"+name);
      }
      if(fs.analyzePath("/bundle.zip").exists)fs.unlink("/bundle.zip");
    }
  }
};
