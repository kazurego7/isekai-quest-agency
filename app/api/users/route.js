import { requireActor } from "@/lib/session";
import { withApiErrors } from "@/lib/api-handler";
import { all } from "@/lib/store";
export const GET=withApiErrors(async()=> {
  await requireActor("staff");
  return Response.json({users:await all("SELECT id,userId,displayName,userType,role FROM users ORDER BY createdAt DESC")});
});
