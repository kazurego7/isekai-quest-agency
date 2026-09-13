import { briefLocation,briefDeadline,meetsRank } from "@/lib/public-quest";
import { env } from "cloudflare:workers";
export const now = () => new Date().toISOString();
export function statement(sql, values = []) {
    if (!env.DB)
        throw new Error("保存先に接続できません。");
    return env.DB.prepare(sql).bind(...values.map(v => typeof v === "boolean" ? Number(v) : v ?? null));
}
export async function all(sql, values) { return (await statement(sql, values).all()).results; }
export async function first(sql, values) { return statement(sql, values).first(); }
export async function run(sql, values) { return statement(sql, values).run(); }
export async function batch(statements) { return env.DB.batch(statements); }
export function insert(table, data) {
    const keys = Object.keys(data);
    return statement(`INSERT INTO "${table}" (${keys.map(k => `"${k}"`).join(",")}) VALUES (${keys.map(() => "?").join(",")})`, Object.values(data));
}
export function update(table, id, data) {
    const values = { ...data, updatedAt: now() };
    return statement(`UPDATE "${table}" SET ${Object.keys(values).map(k => `"${k}" = ?`).join(",")}, revision = revision + 1 WHERE id = ?`, [...Object.values(values), id]);
}
export async function guarded(table, id, revision, statements) {
    const token = crypto.randomUUID();
    return batch([
        statement(`INSERT INTO mutationGuard(id,valid) VALUES (?, EXISTS(SELECT 1 FROM "${table}" WHERE id = ? AND revision = ?))`, [token, id, revision]),
        ...statements, statement("DELETE FROM mutationGuard WHERE id = ?", [token]),
    ]);
}
export function requestPayload(row) {
    return row && { ...row, attachments: JSON.parse(row.attachments || "[]"), previousConditions: row.previousConditions ? JSON.parse(row.previousConditions) : null, requesterAgreed: Boolean(row.requesterAgreed), receptionistAgreed: Boolean(row.receptionistAgreed) };
}
const requestSelect = `SELECT r.*, q.id AS questId, q.title AS publishedTitle, q.status AS questStatus, u.displayName AS requesterName, s.displayName AS receptionistName FROM requests r JOIN users u ON u.id=r.requesterId LEFT JOIN users s ON s.id=r.receptionistId LEFT JOIN quests q ON q.requestId=r.id`;
export async function getRequest(id) { return requestPayload(await first(requestSelect + " WHERE r.id=?", [id])); }
export async function listRequests(where, values) { return (await all(requestSelect + " WHERE " + where + " ORDER BY r.createdAt DESC", values)).map(requestPayload); }
export async function getQuest(id) {
    const row = await first(`SELECT q.*,CASE WHEN q.publishVersion=0 THEN source.location END AS legacyLocation,CASE WHEN q.publishVersion=0 THEN source.deadline END AS legacyDeadline,r.displayName AS receptionistName,a.displayName AS adventurerName FROM quests q JOIN requests source ON source.id=q.requestId LEFT JOIN users r ON r.id=q.receptionistId LEFT JOIN users a ON a.id=q.adventurerId WHERE q.id=?`, [id]);
    if (!row)return null;
    row.location=row.publishVersion?briefLocation(row):row.legacyLocation;
    row.deadline=row.publishVersion?briefDeadline(row):row.legacyDeadline;
    row.requestAttachments=JSON.parse(row.publicAttachments||"[]").map(({id,name,type,bytes})=>({id,name,type,bytes,url:`/api/quests/${row.id}/attachments/${id}`}));
    delete row.publicAttachments;delete row.legacyLocation;delete row.legacyDeadline;
    const selectedAdventurers = await all("SELECT * FROM selections WHERE questId=?", [id]);
    return { ...row, checklist: JSON.parse(row.checklist), photos: JSON.parse(row.photos), selectedAdventurers, selectedAdventurerIds: selectedAdventurers.map(x => x.adventurerId) };
}
export async function canSeeQuest(quest, actor) {
    if (!quest)
        return false;
    if (actor.userType === "staff" || quest.status === "募集中" || quest.adventurerId === actor.id)
        return true;
    if(await first("SELECT 1 FROM requests WHERE id=? AND requesterId=?",[quest.requestId,actor.id]))return true;
    return Boolean(await first("SELECT 1 FROM selections s JOIN adventurers a ON a.id=s.adventurerId WHERE s.questId=? AND a.userId=?", [quest.id, actor.id]));
}
export async function questDetail(id, actor) {
    const quest = await getQuest(id);
    if (!await canSeeQuest(quest, actor))
        return null;
    const profile = await first("SELECT * FROM adventurers WHERE userId=?", [actor.id]);
    const applicants = await all(`SELECT a.*,u.displayName AS name,ap.appliedAt FROM applications ap JOIN adventurers a ON a.id=ap.adventurerId JOIN users u ON u.id=a.userId WHERE ap.questId=? ${actor.userType === "staff" ? "" : "AND a.userId=?"} ORDER BY ap.appliedAt DESC`, actor.userType === "staff" ? [id] : [id, actor.id]);
    const canViewSourceRequest=actor.userType==='staff' || Boolean(await first("SELECT 1 FROM requests WHERE id=? AND requesterId=?",[quest.requestId,actor.id]));
    const rankAllowed=meetsRank(profile?.rank||"C",quest.minimumRank);
    const applicationMessage=quest.status!=="募集中"?"募集は終了しています。":applicants.length?"参加申請を受け付けました。受付の選定をお待ちください。":!rankAllowed?`参加には${quest.minimumRank}ランク以上が必要です。`:"条件を確認して申請してください。受付が冒険者を選定します。";
    return { ...quest, applicants, canViewSourceRequest, canApply:actor.userType==='general' && quest.status==='募集中' && !applicants.length && rankAllowed, applicationMessage, viewerAdventurerId: profile?.id ?? null, canReport: actor.userType === "general" && quest.status === "クエスト進行中" && (quest.adventurerId === actor.id || quest.selectedAdventurerIds.includes(profile?.id)) };
}
