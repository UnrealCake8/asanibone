import { NextResponse } from "next/server";
import { calculateQuote } from "@/lib/pricing";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const estimate = Number(body?.estimate);
  const buffer = Number(body?.buffer);

  if (!Number.isFinite(estimate) || estimate < 0 || !Number.isFinite(buffer) || buffer < 0) {
    return NextResponse.json({ error: "Invalid pricing input." }, { status: 400 });
  }

  const itemAllowance = Math.round((estimate + buffer) * 100) / 100;
  return NextResponse.json(calculateQuote(itemAllowance));
}
