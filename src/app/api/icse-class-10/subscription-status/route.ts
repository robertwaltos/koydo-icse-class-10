import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      isAuthenticated: false,
      active: false,
      premiumActive: false,
      plan: "free",
      provider: null,
      isInTrial: false,
      expiresAt: null,
      willRenew: false,
    });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status, plan_id, current_period_end, is_in_trial, cancel_at_period_end, provider")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    isAuthenticated: true,
    active: !!sub,
    premiumActive: !!sub,
    plan: sub?.plan_id ?? "free",
    provider: sub?.provider ?? null,
    isInTrial: sub?.is_in_trial ?? false,
    expiresAt: sub?.current_period_end ?? null,
    willRenew: sub ? !sub.cancel_at_period_end : false,
  });
}
