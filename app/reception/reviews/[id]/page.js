import { redirect } from "next/navigation";
export default async function LegacyQuest({params}) {const {id}=await params;redirect(`/quests/${id}`);}
