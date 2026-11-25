import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { ui } from "./ui.mjs";
import { books, units, levels, xpReward, videos } from "./lessons.mjs";

const files = ["template.html","style.css","brand.css","tests.css","app.js","book-models.js","test-map-art.js"];
const [template, style, brand, tests, script, bookModels, mapArt] = await Promise.all(files.map(file => readFile(new URL(file,import.meta.url),"utf8")));
const questions = units.flatMap(unit => unit.questions);
assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
assert.deepEqual(levels.map(l=>l.threshold),[0,4,8,16,32,64,128]);
assert.equal(videos.length,7);
for (const {facts} of units) for (const fact of facts) {
  assert.ok(fact.plain?.length === 3 && fact.plain.every(Boolean), `Missing simple explanation for PDF page ${fact.page}`);
}
for (const [id, book] of Object.entries(books)) {
  const bank=questions.filter(q=>units.find(u=>u.id===q.unit).book===id);
  const [first,last]=book.range.split("–").map(Number);
  assert.ok(bank.length>=15 && new Set(bank.map(q=>q.type)).size>=4);
  assert.ok(bank.every(q=>q.page>=first&&q.page<=last));
}
for (const level of levels) {
  assert.ok([...level.quiz,...level.practice].every(id=>questions.some(q=>q.id===id)));
}
for (const q of questions) {
  assert.equal(q.prompt.length,3);
  assert.equal(q.help.length,3);
  assert.ok(q.options?.every(text=>text.length===3) ?? true);
  if(q.type==="blank") assert.equal(q.key.length,3);
}
const args=process.argv.slice(2);
const publicPage=args.includes("--public");
const chapterPath=args.find(arg=>arg.startsWith("--chapter="))?.slice("--chapter=".length);
assert.ok(!chapterPath||!publicPage,"Competition chapter builds are local-only.");
const [chapter,chapterStyle,chapterScript]=chapterPath?await Promise.all([
  readFile(resolve(chapterPath),"utf8").then(JSON.parse),
  readFile(new URL("pipeline/chapter.css",import.meta.url),"utf8"),
  readFile(new URL("pipeline/chapter-ui.js",import.meta.url),"utf8")
]):[null,"",""];
const target=args.find(arg=>!arg.startsWith("--"));
const output=target?resolve(target):fileURLToPath(new URL("./RockiGo.html",import.meta.url));
const assetFiles={logo:["logo.jpg","image/jpeg"],model:["rocky.glb","model/gltf-binary"],viewer:["model-viewer.min.js","text/javascript"]};
const assets={};
for(const [key,[file,mime]] of Object.entries(assetFiles)){
  const input=new URL("assets/"+file,import.meta.url);
  if(publicPage){
    const folder=join(dirname(output),"assets");
    await mkdir(folder,{recursive:true});
    await copyFile(input,join(folder,file));
    assets[key]="./assets/"+file;
  }else{
    assets[key]="data:"+mime+";base64,"+(await readFile(input)).toString("base64");
  }
}
if(publicPage)await copyFile(new URL("assets/LICENSE-model-viewer.txt",import.meta.url),join(dirname(output),"assets","LICENSE-model-viewer.txt"));
const publicBooks=Object.fromEntries(Object.entries(books).map(([key,{id,...book}])=>[key,book]));
const model = JSON.stringify({ui,assets,books:publicPage?publicBooks:books,units,levels,xpReward,...(chapter?{chapter}:{}),
  videos:publicPage?Array(videos.length).fill(null):videos}).replaceAll("<","\\u003c");
const api=chapter?null:process.env.ROCKIGO_API_URL?.trim();
let apiMeta="";
if(api){
  const url=new URL(api);
  assert.ok(url.protocol==="https:"&&!url.username&&!url.password&&!url.search&&!url.hash,"The Rocky API address must be an HTTPS base URL.");
  apiMeta=url.href.replace(/"/g,"&quot;");
}
const html=template.replace("/* ROCKIGO_STYLE */",()=>[style,brand,tests,chapterStyle].filter(Boolean).join("\n"))
  .replace('name="rockigo-api" content=""',()=>`name="rockigo-api" content="${apiMeta}"`)
  .replace("/* ROCKIGO_DATA */",()=>model).replace("/* ROCKIGO_UI */",()=>[chapterScript,script,bookModels,mapArt].filter(Boolean).join("\n"));
if(chapter)assert.ok(Buffer.byteLength(html,"utf8")<=30_000_000,"Offline course exceeds the 30 MB chapter budget.");
await mkdir(dirname(output),{recursive:true});
await writeFile(output,html,"utf8");
console.log(chapter?`RockiGo: ${chapter.title} (${chapter.steps.length} steps).`:
  `RockiGo: ${questions.length} items, ${Object.keys(books).length} books, ${levels.length} levels.`);
