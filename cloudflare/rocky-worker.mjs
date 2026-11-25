const languages = {ru:"русском", kk:"казахском", en:"английском"};
const textLimit = 500;
const historyLimit = 4;
const historyTextLimit = 115;
const bodyLimit = 8192;

function json(data, status, headers) {
  return Response.json(data, {status, headers});
}

async function readChat(request) {
  if(Number(request.headers.get("Content-Length"))>bodyLimit)return {status:413};
  if(!request.body)return {status:400};
  const reader=request.body.getReader();
  const decoder=new TextDecoder();
  let bytes=0, text="";
  for(;;){
    const {done,value}=await reader.read();
    if(done)break;
    bytes+=value.byteLength;
    if(bytes>bodyLimit){
      await reader.cancel();
      return {status:413};
    }
    text+=decoder.decode(value,{stream:true});
  }
  let input;
  try{input=JSON.parse(text+decoder.decode());}catch(_){return {status:400};}
  const {message,lang,history=[]}=input??{};
  if(typeof lang!=="string"||!Object.hasOwn(languages,lang)||typeof message!=="string"||!message.trim()||message.length>textLimit||
      !Array.isArray(history)||history.length>historyLimit||history.some(entry=>
        !entry||!["user","assistant"].includes(entry.role)||typeof entry.content!=="string"||entry.content.length>historyTextLimit)){
    return {status:400};
  }
  return {message:message.trim(),lang,history:history.map(({role,content})=>({role,content}))};
}

export default {
  async fetch(request, env) {
    const headers={"Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Vary":"Origin"};
    if(!env.ROCKIGO_SITE_ORIGIN||request.headers.get("Origin")!==env.ROCKIGO_SITE_ORIGIN){
      return json({error:"unapproved site"},403,headers);
    }
    headers["Access-Control-Allow-Origin"]=env.ROCKIGO_SITE_ORIGIN;
    const pathname=new URL(request.url).pathname;
    if(pathname==="/capabilities"&&request.method==="GET"){
      const ready=typeof env.AI?.run==="function"&&!!env.ROCKIGO_MODEL;
      return json({rocky:ready,chat:ready,...(ready?{model:env.ROCKIGO_MODEL_LABEL}:{})},200,headers);
    }
    if(pathname!=="/rocky/chat")return json({error:"unknown route"},404,headers);
    if(request.method==="OPTIONS"&&request.headers.get("Access-Control-Request-Method")==="POST"){
      return new Response(null,{status:204,headers:{...headers,
        "Access-Control-Allow-Methods":"POST","Access-Control-Allow-Headers":"Content-Type","Access-Control-Max-Age":"600"}});
    }
    if(request.method!=="POST")return json({error:"method not allowed"},405,headers);
    if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get("Content-Type")??"")){
      return json({error:"expected json"},415,headers);
    }
    try{
      const chat=await readChat(request);
      if(chat.status)return json({error:"invalid request"},chat.status,headers);
      const key=request.headers.get("CF-Connecting-IP")??"unknown";
      const {success}=await env.CHAT_LIMIT.limit({key});
      if(!success)return json({error:"too many requests"},429,{...headers,"Retry-After":"60"});
      const result=await env.AI.run(env.ROCKIGO_MODEL,{
        messages:[
          {role:"system",content:[
            "Ты Роки, помощник учебного сайта RockiGo. Отвечай на "+languages[chat.lang]+" языке.",
            "Пиши кратко и по делу. Поддерживай уместный для школьников и студентов тон. Не проси личные данные.",
            "Если вопрос о геологии, попроси назвать тему из урока. Не придумывай источники или страницы."
          ].join(" ")},
          ...chat.history,
          {role:"user",content:chat.message}
        ],
        max_completion_tokens:200,
        temperature:0.35,
        chat_template_kwargs:{enable_thinking:false},
        store:false,
        stream:false
      });
      const raw=result?.choices?.[0]?.message?.content??result?.response;
      const reply=typeof raw==="string"?raw.replace(/<think>[\s\S]*?<\/think>/gi,"").trim():"";
      if(!reply||reply.startsWith("<think>"))return json({error:"empty model response"},502,headers);
      return json({action:"none",reply:reply.slice(0,600)},200,headers);
    }catch(error){
      if(error?.status===429||error?.statusCode===429||error?.httpCode===429||
          [3036,3040].includes(Number(error?.code))){
        return json({error:"inference limit"},429,headers);
      }
      return json({error:"model unavailable"},503,headers);
    }
  }
};
