import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getRequest } from "@/lib/store";
export default async function AdjustLayout({children,params}) {
 const user=await getSessionUser();if(!user)return null;
 const {id}=await params,request=await getRequest(id),role=user.userType==='staff'?'reception':'requester';
 const self=role==='reception'?request?.receptionistAgreed:request?.requesterAgreed;
 const other=role==='reception'?request?.requesterAgreed:request?.receptionistAgreed;
 if(!request || !['確認前','合意待ち'].includes(request.status) || self || !other)redirect(`/requests/${role}/${id}`);
 return children;
}
