import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNgeniusOrder } from "@/lib/ngenius";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claims, error } = await supabase.auth.getClaims();
  if (error || !claims?.claims?.sub) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (payload?.code !== "AZLMNQ1") {
    return NextResponse.json({ error: "Invalid checkout code." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  try {
    const payment = await createNgeniusOrder({
      amount: 1000, // AED 10.00 in fils; never accept amount from the client
      email: typeof claims.claims.email === "string" ? claims.claims.email : undefined,
      description: "Asanib special checkout AZLMNQ1",
      redirectUrl: `${origin}/checkout/azlmnq1?returned=1`,
      cancelUrl: `${origin}/checkout/azlmnq1?cancelled=1`,
    });
    return NextResponse.json({ redirectUrl: payment.redirectUrl });
  } catch {
    return NextResponse.json({ error: "Unable to open Network International checkout. Check gateway configuration." }, { status: 502 });
  }
}
