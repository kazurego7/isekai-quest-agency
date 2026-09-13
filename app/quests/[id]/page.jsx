import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { questDetail } from "@/lib/store";
import AdventurerQuest from "@/components/quest-adventurer-page";
import QuestSelection from "@/components/quest-selection-page";
import QuestReview from "@/components/quest-review-page";
export default async function QuestPage({params}) {
 const actor=await getSessionUser();if(!actor)return null;
 const {id}=await params,quest=await questDetail(id,actor);if(!quest)notFound();
 return actor.userType==='staff'?(quest.status==='募集中'?<QuestSelection/>:<QuestReview/>):<AdventurerQuest/>;
}
