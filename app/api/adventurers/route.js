import { requireActor } from "@/lib/session";
import { withApiErrors } from "@/lib/api-handler";
import { all } from "@/lib/store";
export const GET=withApiErrors(async()=> {
  await requireActor("staff");
  return Response.json({adventurers:await all("SELECT a.*,u.displayName AS name FROM adventurers a JOIN users u ON u.id=a.userId WHERE u.userType='general' ORDER BY a.createdAt DESC")});
});
