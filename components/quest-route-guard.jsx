import { redirect } from "next/navigation";
export default async function QuestRouteGuard({params}) {const {id}=await params;redirect(`/quests/${id}`);}
