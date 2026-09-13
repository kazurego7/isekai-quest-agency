import type { Plugin } from "vite";
import type { IncomingMessage } from "node:http";
function removeHeader(req:IncomingMessage,key:string) {
  delete req.headers[key];
  for(let i=req.rawHeaders.length-2;i>=0;i-=2) if(req.rawHeaders[i].toLowerCase()===key) req.rawHeaders.splice(i,2);
}
function setHeader(req:IncomingMessage,key:string,value:string) {
  removeHeader(req,key);req.headers[key]=value;req.rawHeaders.push(key,value);
}
// configureServer runs only in Vite development, never in a deployed Worker.
export function questLocalAuth(): Plugin {
  return {name:"quest-local-auth",apply:"serve",configureServer(server) {
    server.middlewares.use((req,res,next)=> {
      for(const key of Object.keys(req.headers)) if(key.startsWith("oai-authenticated-user-")) removeHeader(req,key);
      const url=new URL(req.url??"/",`http://${req.headers.host}`);
      const base=process.env.VITE_QUEST_BASE_PATH || "";
      const path=base && url.pathname.startsWith(base+"/") ? url.pathname.slice(base.length) : url.pathname;
      if(!["127.0.0.1","localhost","[::1]", ...(process.env.QUEST_TAILSCALE_HOST ? [process.env.QUEST_TAILSCALE_HOST] : [])].includes(url.hostname) || !["127.0.0.1","::1","::ffff:127.0.0.1"].includes(req.socket.remoteAddress??"")) { next(); return; }
      const actors:Record<string,string>={reception:"検証用受付",general:"検証用冒険者A",general2:"検証用冒険者B",general3:"担当外の冒険者"};
      if(path==="/__test/signin" || path==="/signin-with-chatgpt") {
        const actor=url.searchParams.get("actor")??"general";
        if(!actors[actor]) {res.writeHead(400).end();return;}
        res.setHeader("Set-Cookie",`quest_test_actor=${actor}; Path=${base || "/"}; HttpOnly; SameSite=Lax`);
        res.writeHead(302,{Location:(base || "")+"/"}).end(); return;
      }
      if(path==="/__test/signout" || path==="/signout-with-chatgpt") {
        res.setHeader("Set-Cookie",`quest_test_actor=; Path=${base || "/"}; HttpOnly; Max-Age=0; SameSite=Lax`);res.writeHead(302,{Location:(base || "")+"/"}).end();return;
      }
      const actor=(req.headers.cookie??"").split(";").map(x=>x.trim()).find(x=>x.startsWith("quest_test_actor="))?.split("=")[1];
      if(actor && actors[actor]) {
        setHeader(req,"oai-authenticated-user-id","local-"+actor);
        setHeader(req,"oai-authenticated-user-email",actor+"@sites.test");
        setHeader(req,"oai-authenticated-user-full-name",encodeURIComponent(actors[actor]));
        setHeader(req,"oai-authenticated-user-full-name-encoding","percent-encoded-utf-8");
      }
      next();
    });
  }};
}
