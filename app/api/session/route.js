import { getSessionUser } from "@/lib/session";
import { withApiErrors } from "@/lib/api-handler";
export const GET=withApiErrors(async()=>Response.json({user:await getSessionUser()},{headers:{"Cache-Control":"no-store"}}));
