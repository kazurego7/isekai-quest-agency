import { REQUEST_BODY_BYTES } from "@/lib/request-files";
import { preparePublicationFiles } from "@/lib/publication-files";
import { validatePublicBrief,rewardBreakdown,gold } from "@/lib/public-quest";
import { requireActor } from "@/lib/session";
import { ApiError,readJson,withApiErrors } from "@/lib/api-handler";
import { all,first,questDetail,getRequest,getQuest,insert,update,guarded,now,statement } from "@/lib/store";
export const GET=withApiErrors(async(request)=> {
  const actor=await requireActor();
  const ids=await all(`SELECT q.id FROM quests q WHERE ${actor.userType==="staff"?"1":"q.status='募集中' OR q.adventurerId=? OR EXISTS(SELECT 1 FROM selections s JOIN adventurers a ON a.id=s.adventurerId WHERE s.questId=q.id AND a.userId=?)"} ORDER BY q.createdAt DESC`,actor.userType==="staff"?[]:[actor.id,actor.id]);
  const target=new URL(request.url).searchParams.get("userId");
  let viewer=actor;
  if(actor.userType==="staff" && target) viewer=(await first("SELECT id,userType,role FROM users WHERE id=?",[target]))??actor;
  const quests=[];
  for(const {id} of ids) {
    const detail=await questDetail(id,actor);
    if(viewer.id!==actor.id) detail.viewerAdventurerId=(await first("SELECT id FROM adventurers WHERE userId=?",[viewer.id]))?.id??null;
    quests.push(detail);
  }
  return Response.json({quests});
});
export const POST=withApiErrors(async(request)=> {
  const actor=await requireActor("staff"),payload=await readJson(request,REQUEST_BODY_BYTES);
  const fields=payload.publishFields,checklist=payload.checklist;
  if(typeof payload.requestId!=="string")throw new ApiError(400,"依頼を選択してください。");
  const problem=validatePublicBrief(fields,checklist);if(problem)throw new ApiError(400,problem);
  const source=await getRequest(payload.requestId);
  if(!source) throw new ApiError(404,"依頼が見つかりません。");
  if(source.status!=="合意済み" || !source.requesterAgreed || !source.receptionistAgreed) throw new ApiError(409,"合意済みの依頼のみクエスト化できます。");
  const id=crypto.randomUUID(),stamp=now();
  const selected=payload.attachmentIds??[];
  const draft=await first("SELECT * FROM publicationDrafts WHERE id=?",[source.id]);
  if((draft?.revision??null)!==(payload.draftRevision??null))throw new ApiError(409,"公開準備の下書きが更新されています。再読み込みして確認してください。");
  const files=await preparePublicationFiles(source,draft,selected,payload.additionalAttachments??[]);
  const publish=Object.fromEntries(["title","categoryId","detail","regionId","location","publicNote","rank","minimumRank","participationNote","distributionMode","distributionNote","meetingAt","meetingPlace"].map(key=>[key,fields[key]?.trim()||null]));
  Object.assign(publish,{publishVersion:1,locationMode:fields.locationMode,deadlineMode:fields.deadlineMode,deadlineDate:fields.deadlineMode==="date"?fields.deadlineDate:null,recruitCount:fields.recruitCount,slots:String(fields.recruitCount),grossReward:fields.grossReward,commissionRate:fields.commissionRate,...rewardBreakdown(fields.grossReward,fields.commissionRate),publicAttachments:JSON.stringify(files.items)});
  if(fields.locationMode==="after-selection"){publish.location=null;publish.regionId=null;}
  publish.reward=gold(publish.netReward);
  const token=crypto.randomUUID();
  try {await guarded("requests",source.id,source.revision,[
    statement("INSERT INTO mutationGuard(id,valid) VALUES (?, (SELECT CASE WHEN ? IS NULL THEN NOT EXISTS(SELECT 1 FROM publicationDrafts WHERE id=?) ELSE EXISTS(SELECT 1 FROM publicationDrafts WHERE id=? AND revision=?) END))",[token,draft?.revision??null,source.id,source.id,draft?.revision??null]),
    insert("quests",{id,requestId:source.id,status:"募集中",receptionistId:actor.id,...publish,summary:"受付がクエスト票を作成済み。募集中。",checklist:JSON.stringify(checklist.map(x=>({label:x.label.trim(),note:x.note?.trim()??"",checked:false}))),photos:"[]",createdAt:stamp,updatedAt:stamp}),
    statement("DELETE FROM publicationDrafts WHERE id=?",[source.id]),
    update("requests",source.id,{status:"クエスト化済み",notes:"クエスト化が完了し、冒険者の募集を開始しました。",receptionistId:actor.id}),
    statement("DELETE FROM mutationGuard WHERE id=?",[token]),
  ]);}catch(error){await files.rollback();throw error;}
  await files.cleanup();
  return Response.json({quest:await getQuest(id)},{status:201});
});
