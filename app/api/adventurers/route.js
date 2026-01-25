import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const baseApplicants = [
  {
    code: "ADV-014",
    name: "レン・ハドリック",
    rank: "Cランク",
    role: "盾役",
    appliedAt: "今朝 09:12",
    note: "街道護衛経験あり。馬の扱いも可。",
    source: "申請",
  },
  {
    code: "ADV-008",
    name: "ミオ・サザーランド",
    rank: "Cランク",
    role: "斥候",
    appliedAt: "今朝 09:18",
    note: "夜間警戒の実績あり。静音移動が得意。",
    source: "申請",
  },
  {
    code: "ADV-021",
    name: "ダン・フォード",
    rank: "Dランク",
    role: "支援",
    appliedAt: "今朝 09:35",
    note: "護衛は初参加。補給・索敵を希望。",
    source: "申請",
  },
  {
    code: "ADV-003",
    name: "エルネ・ミード",
    rank: "Bランク",
    role: "槍士",
    appliedAt: "今朝 09:40",
    note: "高ランク枠。指揮を担える。",
    source: "申請",
  },
];

const baseStandby = [
  {
    code: "ADV-011",
    name: "アラン・ベイル",
    rank: "Cランク",
    role: "回復",
    note: "申請なし。ギルド推薦枠。",
    source: "推薦",
  },
  {
    code: "ADV-019",
    name: "スイ・カナリス",
    rank: "Bランク",
    role: "剣士",
    note: "申請なし。前回実績が良好。",
    source: "推薦",
  },
  {
    code: "ADV-002",
    name: "ヨナ・ホークス",
    rank: "Cランク",
    role: "弓手",
    note: "申請なし。護衛の後衛支援に適任。",
    source: "推薦",
  },
];

const TOTAL_ADVENTURERS = 100;
const APPLICANT_TARGET = 10;
const STANDBY_TARGET = TOTAL_ADVENTURERS - APPLICANT_TARGET;

const rankCycle = ["Dランク", "Cランク", "Bランク", "Aランク"];
const roleCycle = ["前衛", "後衛", "支援", "盾役", "回復", "斥候", "弓手", "魔導"];

const generatedApplicants = Array.from(
  { length: Math.max(APPLICANT_TARGET - baseApplicants.length, 0) },
  (_, index) => {
    const seq = baseApplicants.length + index + 1;
    return {
      code: `ADV-${String(100 + seq).slice(-3)}`,
      name: `候補冒険者${String(seq).padStart(2, "0")}`,
      rank: rankCycle[seq % rankCycle.length],
      role: roleCycle[seq % roleCycle.length],
      appliedAt: `今朝 09:${String(12 + index).padStart(2, "0")}`,
      note: "申請内容は簡易フォーム提出（ダミー）",
      source: "申請",
    };
  },
);

const generatedStandby = Array.from(
  { length: Math.max(STANDBY_TARGET - baseStandby.length, 0) },
  (_, index) => {
    const seq = baseStandby.length + index + 1;
    return {
      code: `ADV-${String(200 + seq).slice(-3)}`,
      name: `推薦候補${String(seq).padStart(2, "0")}`,
      rank: rankCycle[(seq + 1) % rankCycle.length],
      role: roleCycle[(seq + 3) % roleCycle.length],
      note: "申請なし / 受付推薦（ダミー）",
      source: "推薦",
    };
  },
);

const seedAdventurers = [
  ...baseApplicants,
  ...generatedApplicants,
  ...baseStandby,
  ...generatedStandby,
];

export async function GET() {
  const count = await prisma.adventurer.count();
  if (count === 0) {
    await prisma.adventurer.createMany({ data: seedAdventurers });
  }

  const adventurers = await prisma.adventurer.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ adventurers });
}
