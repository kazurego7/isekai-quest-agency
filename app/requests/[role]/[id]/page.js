import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getRequest, first } from "@/lib/store";
import RequestDocument from "@/components/request-document-page";
export default async function RequestPage({params,searchParams}) {
 const {id}=await params,query=await searchParams,user=await getSessionUser();
 if(!user)return null;
 const source=await getRequest(id);
 if(!source || (user.userType==='general' && source.requesterId!==user.id) || (user.userType==='staff' && source.status==='下書き'))notFound();
 const quest=await first("SELECT id FROM quests WHERE requestId=?",[id]);
 if(quest && query.document!=='1')redirect(`/quests/${quest.id}`);
 return <RequestDocument/>;
}
