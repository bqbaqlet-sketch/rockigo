import { createServer } from "node:http";
import { access, readFile } from "node:fs/promises";
import { spawn, spawnSync } from "node:child_process";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { BlockList } from "node:net";
import { networkInterfaces } from "node:os";
import { createInterface } from "node:readline/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { units } from "./lessons.mjs";
import { loadWasm } from "./wasm-runtime.mjs";

const here=dirname(fileURLToPath(import.meta.url));
const runtime=process.env.ROCKIGO_RUNTIME||resolve(here,"../geology-ai-runtime");
const model=join(runtime,"qwen2.5-0.5b-instruct-q4_k_m.gguf");
const args=process.argv.slice(2);
const apiMode=args.includes("--api");
const juryMode=args.includes("--jury");
if(apiMode&&juryMode)throw new Error("Choose either --api or --jury.");
const htmlPath=args.find(arg=>!arg.startsWith("--"));
const page=apiMode?null:await readFile(htmlPath?resolve(htmlPath):join(here,"RockiGo.html"));
const privateAddress=/^(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/;

function siteOrigin(value){
  const url=new URL(value);
  if(url.protocol!=="https:"||url.username||url.password||url.pathname!=="/"||url.search||url.hash)
    throw new Error("ROCKIGO_SITE_ORIGIN must be the site's HTTPS origin, without a project path.");
  return url.origin;
}
const pagesOrigin=apiMode?siteOrigin(process.env.ROCKIGO_SITE_ORIGIN??""):"";

async function selectNetwork(){
  const choices=Object.entries(networkInterfaces()).flatMap(([name, addresses])=>
    addresses.filter(address=>address.family==="IPv4"&&!address.internal&&address.cidr&&privateAddress.test(address.address))
      .map(address=>({...address,name})));
  if(!choices.length)throw new Error("No private Wi-Fi address found. Connect to Wi-Fi or turn on the hotspot first.");
  const requested=args.find(arg=>arg.startsWith("--jury-host="))?.split("=")[1];
  if(requested){
    const match=choices.find(choice=>choice.address===requested);
    if(!match)throw new Error("Choose an address assigned to this computer's private network.");
    return match;
  }
  if(choices.length===1)return choices[0];
  console.log("Choose the network shared with the phone:");
  choices.forEach((choice,index)=>console.log(`${index+1}. ${choice.name} (${choice.address})`));
  const input=createInterface({input:process.stdin,output:process.stdout});
  try{
    const selected=choices[Number(await input.question("Network number: "))-1];
    if(!selected)throw new Error("Invalid network.");
    return selected;
  }finally{input.close();}
}
const network=juryMode?await selectNetwork():null;
const host=apiMode?(process.env.ROCKIGO_BIND??"127.0.0.1"):(network?.address??"127.0.0.1");
const port=apiMode?Number(process.env.PORT??8080):juryMode?8777:8776;
if(!Number.isInteger(port)||port<1||port>65535)throw new Error("Invalid server port.");
const hostHeader=host+":"+port;
const origin="http://"+hostHeader;
const token=juryMode?randomBytes(16).toString("base64url"):"";
const accessSeconds=7200;
const expires=Date.now()+accessSeconds*1000;
const allowedSubnet=new BlockList();
if(network)allowedSubnet.addSubnet(network.address,Number(network.cidr.split("/")[1]),"ipv4");
const present=await Promise.all([access(model),access(join(runtime,"wasm","package","esm","wasm","wllama.wasm"))]).then(()=>true,()=>false);
let engine, busy=false;
const headers={"Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer","X-Frame-Options":"DENY"};
const rateWindow=60_000, peerLimit=12;
const rate=new Map();
function limited(peer){
  const now=Date.now();
  const previous=rate.get(peer);
  if(previous&&previous.end>now){
    if(previous.count>=peerLimit)return true;
    previous.count++;
    return false;
  }
  if(rate.size>=1000){
    for(const [key,value] of rate)if(value.end<=now)rate.delete(key);
    if(rate.size>=1000&&!rate.has(peer))return true;
  }
  rate.set(peer,{count:1,end:now+rateWindow});
  return false;
}

function reply(res,status,object){
  res.writeHead(status,{...headers,"Content-Type":"application/json; charset=utf-8"});
  res.end(JSON.stringify(object));
}
function tokenMatches(value){
  return typeof value==="string"&&Buffer.byteLength(value)===token.length&&
    timingSafeEqual(Buffer.from(value),Buffer.from(token));
}
function authorizeJury(req,res){
  if(!network)return true;
  if(!req.socket.remoteAddress||!allowedSubnet.check(req.socket.remoteAddress,"ipv4")||Date.now()>expires){
    reply(res,403,{error:"Join from the demo Wi-Fi with an active link."});return false;
  }
  if(req.method==="GET"&&req.url.startsWith("/join?")&&tokenMatches(new URL(req.url,origin).searchParams.get("k"))){
    res.writeHead(303,{...headers,Location:"/","Set-Cookie":`rockigo_jury=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${accessSeconds}`});
    res.end();
    return false;
  }
  const cookie=req.headers.cookie?.match(/(?:^|;\s*)rockigo_jury=([^;]*)/)?.[1];
  if(tokenMatches(cookie))return true;
  reply(res,403,{error:"Open the private link shown on the presenter's laptop."});
  return false;
}
function printQr(url){
  const python=process.env.ROCKIGO_QR_PYTHON;
  if(!python)return;
  const {stdout,status}=spawnSync(python,[join(here,"show-qr.py")],{input:url,encoding:"utf8",windowsHide:true,timeout:4000});
  if(status!==0)return;
  const lines=stdout.trim().split(/\r?\n/);
  if(lines.length<20||!lines.every(line=>/^[01]+$/.test(line)&&line.length===lines[0].length))return;
  for(let i=0;i<lines.length;i+=2){
    let output="";
    for(let j=0;j<lines[0].length;j++){
      const upper=lines[i][j]==="1"?"30":"97";
      const lower=lines[i+1]?.[j]==="1"?"40":"107";
      output+="\x1b["+upper+";"+lower+"m▀";
    }
    console.log(output+"\x1b[0m");
  }
}
const server=createServer(async (req,res)=>{
  if(apiMode){
    res.setHeader("Vary","Origin");
    if(req.url!=="/capabilities"&&req.url!=="/rocky")return reply(res,404,{error:"unknown route"});
    if(req.headers.origin!==pagesOrigin)return reply(res,403,{error:"unapproved site"});
    res.setHeader("Access-Control-Allow-Origin",pagesOrigin);
    if(req.method==="OPTIONS"&&req.url==="/rocky"){
      if(req.headers["access-control-request-method"]!=="POST")return reply(res,405,{error:"method not allowed"});
      res.writeHead(204,{...headers,"Access-Control-Allow-Methods":"POST","Access-Control-Allow-Headers":"Content-Type","Access-Control-Max-Age":"600"});
      return res.end();
    }
  }else{
    if(req.headers.host!==hostHeader)return reply(res,403,{error:"local only"});
    if(!authorizeJury(req,res))return;
  }
  if(!apiMode&&req.method==="GET"&&req.url==="/"){
    res.writeHead(200,{...headers,"Content-Type":"text/html; charset=utf-8"});return res.end(page);
  }
  if(req.method==="GET"&&req.url==="/capabilities")return reply(res,200,{rocky:present});
  if(req.method!=="POST"||req.url!=="/rocky"||req.headers.origin!==(apiMode?pagesOrigin:origin))return reply(res,404,{error:"unknown route"});
  if(!/^application\/json(?:\s*;|$)/i.test(req.headers["content-type"]??""))return reply(res,415,{error:"expected json"});
  if(Number(req.headers["content-length"])>2500)return reply(res,413,{error:"request too large"});
  if(apiMode&&limited(req.socket.remoteAddress??"unknown")){
    res.setHeader("Retry-After","60");
    return reply(res,429,{error:"too many requests"});
  }
  if(!present||busy)return reply(res,503,{error:"model unavailable"});
  let body="";
  req.setEncoding("utf8");
  try{
    for await(const chunk of req){
      body+=chunk;
      if(body.length>2500)return reply(res,413,{error:"request too large"});
    }
    let parsed;
    try{parsed=JSON.parse(body);}catch(_){return reply(res,400,{error:"invalid json"});}
    const {message,lang,unit}=parsed??{};
    const locale=["ru","kk","en"].indexOf(lang);
    const section=units.find(item=>item.id===unit);
    if(typeof message!=="string"||!message.trim()||message.length>500||locale<0||!section)return reply(res,400,{error:"invalid request"});
    if(busy)return reply(res,503,{error:"model busy"});
    busy=true;
    try{
      engine??=loadWasm(runtime,model).catch(error=>{engine=null;throw error;});
      const answer=await (await engine).createChatCompletion({
        messages:[
          {role:"system",content:"Pick the evidence item that most directly answers the learner's geology question. Match the topic and technical terms. Return only the item number in the fact field."},
          {role:"user",content:JSON.stringify({question:message,evidence:section.facts.map((f,i)=>({number:i,topic:f.term[locale],text:f.explanation[locale]}))})}
        ],
        response_format:{type:"json_schema",json_schema:{name:"selection",strict:true,schema:{
          type:"object",properties:{fact:{type:"integer",enum:[0,1,2]}},required:["fact"],additionalProperties:false
        }}},
        temperature:0.05,max_tokens:60,abortSignal:AbortSignal.timeout(95000)
      });
      const choice=JSON.parse(answer.choices[0].message.content);
      if(!Number.isInteger(choice.fact)||!section.facts[choice.fact])throw new Error("Invalid selection");
      return reply(res,200,{fact:choice.fact});
    }finally{busy=false;}
  }catch(error){
    console.error("Rocky could not complete the request:",error.name);
    return reply(res,500,{error:"assistant unavailable"});
  }
});
server.listen(port,host,()=>{
  if(apiMode){
    console.log("RockiGo API: "+origin);
    if(!present)console.log("Model files missing. The capability endpoint will report the model as unavailable.");
    return;
  }
  if(juryMode){
    const address=origin+"/join?k="+token;
    console.log("RockiGo Jury: "+address);
    printQr(address);
    console.log("Connect the phone to the same Wi-Fi. Link valid for 2 hours. Close this window to end the demo.");
    return;
  }
  console.log("RockiGo: "+origin);
  if(args.includes("--open")&&process.platform==="win32"){
    const child=spawn("explorer.exe",[origin],{detached:true,windowsHide:true,stdio:"ignore"});
    child.on("error",()=>console.log(origin));child.unref();
  }
});
