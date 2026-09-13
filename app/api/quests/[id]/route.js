import { meetsRank } from "@/lib/public-quest";
import { requireActor } from "@/lib/session";
import { ApiError,readJson,withApiErrors } from "@/lib/api-handler";
import { first,all,statement,insert,update,guarded,getQuest,questDetail,now } from "@/lib/store";
import { preparePhotos } from "@/lib/photos";
export const GET=withApiErrors(async(_request,context)=> {
  const actor=await requireActor(),{id}=await context.params,quest=await questDetail(id,actor);
  if(!quest) throw new ApiError(404,"クエストが見つかりません。");
  return Response.json({quest});
});
export const PATCH=withApiErrors(async(request,context)=> {
  const actor=await requireActor(),{id}=await context.params,payload=await readJson(request,3*1024*1024),mode=payload.mode;
  const generalModes=["apply","accept","report"],staffModes=["select","finalize-selection","verify","remand"];
  if(![...generalModes,...staffModes].includes(mode)) throw new ApiError(400,"更新内容が不正です。");
  if(actor.userType!==(generalModes.includes(mode)?"general":"staff")) throw new ApiError(403,"この操作の権限がありません。");
  const quest=await getQuest(id);
  if(!quest) throw new ApiError(404,"クエストが見つかりません。");
  const expected=mode==="report"?"クエスト進行中":["verify","remand"].includes(mode)?"完了報告済み":"募集中";
  if(quest.status!==expected) throw new ApiError(409,"現在の状態では操作できません。再読み込みしてください。");
  let profile=await first("SELECT * FROM adventurers WHERE userId=?",[actor.id]);
  const statements=[];let data,requestStatus,photos;
  if(mode==="apply") {
    if(!meetsRank(profile?.rank||"C",quest.minimumRank))throw new ApiError(403,"このクエストの参加ランク条件を満たしていません。");
    const stamp=now(),profileId=profile?.id??crypto.randomUUID();
    if(!profile) statements.push(statement(`INSERT INTO adventurers(id,userId,code,name,rank,role,source,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(userId) DO NOTHING`,[profileId,actor.id,"ADV-"+profileId,actor.displayName,"C","未設定","申請",stamp,stamp]));
    statements.push(statement("INSERT INTO applications(questId,adventurerId,appliedAt) SELECT ?,id,? FROM adventurers WHERE userId=? ON CONFLICT(questId,adventurerId) DO NOTHING",[id,stamp,actor.id]));
    await guarded("quests",id,quest.revision,statements);
    profile=await first("SELECT id FROM adventurers WHERE userId=?",[actor.id]);
    return Response.json({application:await first("SELECT * FROM applications WHERE questId=? AND adventurerId=?",[id,profile.id])});
  }
  const selected=profile && quest.selectedAdventurerIds.includes(profile.id);
  if(mode==="accept") {
    if(!selected) throw new ApiError(403,"選定された冒険者のみ受注できます。");
    data={status:"クエスト進行中",adventurerId:quest.selectedAdventurerIds.length===1?actor.id:null,summary:"冒険者が参加しました。"};requestStatus="クエスト進行中";
  } else if(mode==="report") {
    if(quest.adventurerId!==actor.id && !selected) throw new ApiError(403,"担当する冒険者のみ完了報告できます。");
    if(typeof payload.reportComment!=="string" || payload.reportComment.length>10000) throw new ApiError(400,"成果コメントは10000文字以内で入力してください。");
    if(!Array.isArray(payload.checklist) || payload.checklist.length!==quest.checklist.length || payload.checklist.some((x,i)=>!x || typeof x.checked!=="boolean" || x.label!==quest.checklist[i].label)) throw new ApiError(400,"チェックリストが不正です。再読み込みしてください。");
    photos=await preparePhotos(quest,payload.photos??[]);
    data={status:"完了報告済み",summary:"完了報告が提出済み。受付の確認待ち。",reportComment:payload.reportComment,checklist:JSON.stringify(quest.checklist.map((x,i)=>({...x,checked:payload.checklist[i].checked}))),photos:JSON.stringify(photos.items)};requestStatus="完了報告済み";
  } else if(mode==="verify" || mode==="remand") {
    if(payload.reviewNote!=null && (typeof payload.reviewNote!=="string" || payload.reviewNote.length>10000)) throw new ApiError(400,"確認メモは10000文字以内で入力してください。");
    const reviewNote=payload.reviewNote?.trim()||null;
    if(mode==="remand" && !reviewNote) throw new ApiError(400,"差し戻し理由を入力してください。");
    data={status:mode==="verify"?"達成確認済み":"クエスト進行中",summary:mode==="verify"?"受付の達成確認が完了。":"受付が差し戻しました。冒険者の再報告待ち。",reviewNote,receptionistId:actor.id};requestStatus=mode==="verify"?"完了":"クエスト進行中";
  } else {
    const ids=payload.selectedIds;
    if(!Array.isArray(ids) || ids.length>100 || ids.some(x=>typeof x!=="string" || !x) || new Set(ids).size!==ids.length || (mode==="finalize-selection" && !ids.length)) throw new ApiError(400,"選定内容が不正です。冒険者を選び直してください。");
    if(quest.recruitCount&&ids.length>quest.recruitCount)throw new ApiError(400,"募集人数を超えて選定できません。");
    const members=ids.length?await all(`SELECT a.id,a.userId,a.rank FROM adventurers a JOIN users u ON u.id=a.userId WHERE u.userType='general' AND a.id IN (${ids.map(()=>"?").join(",")})`,ids):[];
    if(members.length!==ids.length) throw new ApiError(400,"有効なユーザーに紐づく冒険者を選んでください。");
    if(members.some(member=>!meetsRank(member.rank,quest.minimumRank)))throw new ApiError(400,"参加ランク条件を満たす冒険者を選定してください。");
    statements.push(statement("DELETE FROM selections WHERE questId=?",[id]),...ids.map(adventurerId=>insert("selections",{questId:id,adventurerId,selectedAt:now()})));
    data={receptionistId:actor.id,summary:"受付が冒険者を選定中です。"};
    if(mode==="finalize-selection") {Object.assign(data,{status:"クエスト進行中",summary:"受付がクエストを開始。",adventurerId:members.length===1?members[0].userId:null});requestStatus="クエスト進行中";}
  }
  statements.push(update("quests",id,data));
  if(requestStatus) statements.push(update("requests",quest.requestId,{status:requestStatus,notes:data.summary}));
  try {await guarded("quests",id,quest.revision,statements);} catch(error) {await photos?.rollback();throw error;}
  if(photos) {try {await photos.cleanup();} catch(error) {console.error("Photo cleanup failed",error);}}
  return Response.json({quest:await getQuest(id)});
});
