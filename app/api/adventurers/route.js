import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const adventurers = await prisma.adventurer.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ adventurers });
}
