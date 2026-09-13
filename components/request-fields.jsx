"use client";
import { useSyncExternalStore } from "react";
import RequestAttachments from "@/components/request-attachments";
import { requestTypes,requestRegions,requestDisplayFields,requestSubmissionIssue } from "@/lib/request-options";
const subscribe=()=>()=>{};
export const requestFields=requestDisplayFields;
export default function RequestFields({value={},onChange,disabled=false,onBusyChange,renderBefore}) {
 const hydrated=useSyncExternalStore(subscribe,()=>true,()=>false),locked=disabled||!hydrated;
 const set=(key,v)=>{onChange(key,v);};
 const deadlineMode=value?.deadlineMode||"unknown",rewardMode=value?.rewardMode||"consult";
 return <div className="request-form-fields"><p className="form-requirements" role="status">{requestSubmissionIssue(value)||"必須項目は入力済みです。"} 下書きは未入力でも保存できます。</p>
 {value?.formatVersion!==1 && (value?.deadline||value?.reward||value?.risk) && <p className="notice-banner">以前の記載：{[value.deadline&&`期限：${value.deadline}`,value.reward&&`報酬：${value.reward}`,value.risk&&`注意事項：${value.risk}`].filter(Boolean).join(" ／ ")}。日付・予算を選び直す際の参考にしてください。</p>}
 {requestFields.map(field=><fieldset key={field.key} className="request-field-group" disabled={locked}><legend>{field.label}{["title","categoryId","purpose"].includes(field.key)?<small>必須</small>:<small className="optional-mark">任意</small>}</legend>
 {renderBefore?.(field)}
 {field.key==="title"?<input aria-label="依頼名" maxLength={200} placeholder="例：霧の森の月光草採集" value={value?.title||""} onChange={e=>set("title",e.target.value)}/>:
 field.key==="categoryId"?<select aria-label="依頼種別" value={value?.categoryId||""} onChange={e=>set("categoryId",e.target.value)}><option value="">種別を選択</option>{requestTypes.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>:
 field.key==="purpose"?<textarea aria-label="依頼内容" rows={5} maxLength={10000} placeholder="何をしてほしいか、目的や完了条件をまとめて記入してください。" value={value?.purpose||""} onChange={e=>set("purpose",e.target.value)}/>:
 field.key==="location"?<div className="request-input-pair"><select aria-label="地域" value={value?.regionId||""} onChange={e=>set("regionId",e.target.value)}><option value="">地域は未定</option>{requestRegions.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select><input aria-label="場所の補足" placeholder="例：霧の森の奥、古い祠の周辺" value={value?.location||""} onChange={e=>set("location",e.target.value)}/></div>:
 field.key==="deadline"?<div className="request-input-pair"><select aria-label="期限の指定" value={deadlineMode} onChange={e=>set("deadlineMode",e.target.value)}><option value="unknown">未定</option><option value="none">期限なし</option><option value="date">日付を指定</option></select>{deadlineMode==="date"&&<input aria-label="希望期限" type="date" value={value?.deadlineDate||""} onChange={e=>set("deadlineDate",e.target.value)}/>}</div>:
 field.key==="reward"?<div className="request-input-pair"><select aria-label="報酬の指定" value={rewardMode} onChange={e=>set("rewardMode",e.target.value)}><option value="consult">相談</option><option value="amount">金額を指定（G）</option></select>{rewardMode==="amount"&&<label className="reward-input"><input aria-label="報酬予算" type="number" inputMode="numeric" min="0" max="999999999" step="1" placeholder="例：1000" value={value?.rewardAmount??""} onChange={e=>set("rewardAmount",e.target.value===""?null:Number(e.target.value))}/><span>G</span></label>}</div>:
 <textarea aria-label="その他備考" rows={3} maxLength={10000} placeholder="注意事項や補足があれば記入してください。" value={value?.requesterNote||""} onChange={e=>set("requesterNote",e.target.value)}/>}
 </fieldset>)}
 <section className="request-field-group"><h3>添付ファイル <small className="optional-mark">任意</small></h3><RequestAttachments files={value?.attachments||[]} onChange={files=>set("attachments",files)} disabled={locked} onBusyChange={onBusyChange}/></section>
 </div>;
}
