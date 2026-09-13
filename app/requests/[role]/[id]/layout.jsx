import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getRequest } from "@/lib/store";
export default async function RequestLayout({children,params}) {
 const user=await getSessionUser();if(!user)return null;
 const {id,role}=await params,request=await getRequest(id);
 if(!request || (user.userType==='general' && request.requesterId!==user.id) || (user.userType==='staff' && request.status==='下書き'))notFound();
 const expected=user.userType==='staff'?'reception':'requester';
 if(role!==expected)redirect(`/requests/${expected}/${id}`);
 return children;
}
