export class ApiError extends Error {
  constructor(status,message) { super(message); this.status=status; }
}
export function withApiErrors(handler) {
  return async (...args) => {
    try {
      const response=await handler(...args);
      response.headers.set("Cache-Control","private, no-store");
      return response;
    }
    catch(error) {
      if(error instanceof ApiError) return Response.json({error:error.message},{status:error.status});
      if(/mutation_guard_valid|UNIQUE constraint failed|FOREIGN KEY constraint failed/.test(String(error))) {
        return Response.json({error:"別の操作と重なりました。再読み込みしてお試しください。"},{status:409});
      }
      console.error("Quest storage failure",error);
      return Response.json({error:"保存先に接続できません。入力を残したまま、時間をおいて再試行してください。"},{status:503});
    }
  };
}
export async function readJson(request,maxBytes=64*1024) {
  const origin=request.headers.get("origin");
  if ((origin && origin!==new URL(request.url).origin) || request.headers.get("sec-fetch-site")==="cross-site") throw new ApiError(403,"この送信元からは操作できません。");
  if(!request.body) throw new ApiError(400,"入力内容が不正です。");
  const reader=request.body.getReader(); const parts=[]; let total=0;
  while(true) {
    const {done,value}=await reader.read(); if(done) break;
    total+=value.length; if(total>maxBytes) { await reader.cancel(); throw new ApiError(413,"送信内容が大きすぎます。"); }
    parts.push(value);
  }
  try {
    const bytes=new Uint8Array(total); let offset=0;
    for(const part of parts) { bytes.set(part,offset); offset+=part.length; }
    const payload=JSON.parse(new TextDecoder().decode(bytes));
    if(!payload || typeof payload!=="object" || Array.isArray(payload)) throw new Error();
    return payload;
  } catch { throw new ApiError(400,"入力内容が不正です。"); }
}
