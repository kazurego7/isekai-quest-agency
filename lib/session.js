import { cache } from "react";
import { isLocalRuntime } from "@/lib/local-runtime";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { batch, first, statement, now } from "@/lib/store";
import { ApiError } from "@/lib/api-handler";
export const getSessionUser = cache(async () => {
  const identity=await getChatGPTUser();
  if(!identity) return null;
  let user=await first("SELECT id,userId,displayName,userType,role,themePreference FROM users WHERE authId=?",[identity.userId]);
  if(user) return user;
  const id=crypto.randomUUID(), timestamp=now();
  const localStaff=isLocalRuntime && identity.userId==="local-reception";
  const localGeneral=isLocalRuntime && identity.userId.startsWith("local-general");
  const ownership=localGeneral ? [] : [statement("INSERT INTO owner(singleton,authId) VALUES(1,?) ON CONFLICT(singleton) DO NOTHING",[identity.userId])];
  await batch([...ownership, statement(`INSERT INTO users(id,authId,userId,displayName,userType,role,createdAt,updatedAt) SELECT ?,?,?,?,CASE WHEN ? OR EXISTS(SELECT 1 FROM owner WHERE authId=?) THEN 'staff' ELSE 'general' END,CASE WHEN ? OR EXISTS(SELECT 1 FROM owner WHERE authId=?) THEN 'reception' ELSE 'general' END,?,? ON CONFLICT(authId) DO NOTHING`,[id,identity.userId,id,identity.displayName,localStaff,identity.userId,localStaff,identity.userId,timestamp,timestamp])]);
  user=await first("SELECT id,userId,displayName,userType,role,themePreference FROM users WHERE authId=?",[identity.userId]);
  return user;
});
export async function requireActor(type) {
  const actor=await getSessionUser();
  if(!actor) throw new ApiError(401,"ChatGPTでログインしてください。");
  if(type && actor.userType!==type) throw new ApiError(403,"この操作の権限がありません。");
  return actor;
}
