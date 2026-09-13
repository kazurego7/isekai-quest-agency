import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { resolveRoleHome } from "@/lib/role-route";
export default async function ProtectedSection({type,returnTo,children}) {
  const user=await getSessionUser();
  if(!user) redirect(`/?from=${encodeURIComponent(returnTo)}`);
  if(type && user.userType!==type) redirect(resolveRoleHome(user.userType,user.role));
  return children;
}
