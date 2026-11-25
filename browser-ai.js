function createBrowserRocky({runtime,weights,model}) {
  let engine, pending;
  return {
    model,
    get ready(){return !!engine;},
    load(onProgress) {
      if(engine)return Promise.resolve();
      pending??=(async()=>{
        const {Wllama}=await import(runtime+"/index.js");
        const instance=new Wllama({default:runtime+"/wasm/wllama.wasm"},{allowOffline:true,suppressNativeLog:true});
        try{
          await instance.loadModelFromUrl(weights,{
            n_ctx:1024,n_threads:1,n_gpu_layers:0,connections:2,
            signal:AbortSignal.timeout(600000),progressCallback:onProgress
          });
          engine=instance;
        }catch(error){
          try{await instance.exit();}catch(_){}
          throw error;
        }
      })().finally(()=>{pending=null;});
      return pending;
    },
    async reply(message,language,history) {
      const response=await engine.createChatCompletion({
        messages:[
          {role:"system",content:[
            "Ты Роки, помощник учебного сайта RockiGo. Отвечай естественно, просто и по делу. Дай не более трёх коротких предложений. Если просят варианты, перечисли только варианты.",
            "Язык ответа: "+({ru:"русский",kk:"қазақша",en:"English"}[language]),
            "Отвечай на обычные вопросы. Для геологии попроси уточнить тему курса. Не придумывай источники или страницы."
          ].join(" ")},
          ...history,
          {role:"user",content:message}
        ],
        max_tokens:115,temperature:0.35,chat_template_kwargs:{enable_thinking:false},
        abortSignal:AbortSignal.timeout(100000)
      });
      const reply=response.choices[0]?.message?.content?.replace(/<think>[\s\S]*?<\/think>/gi,"").trim();
      if(!reply||reply.startsWith("<think>"))throw new Error("Empty response");
      return {action:"none",reply};
    }
  };
}
