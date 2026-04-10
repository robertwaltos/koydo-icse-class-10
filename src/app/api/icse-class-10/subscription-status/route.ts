import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Wire to Supabase auth + subscription check
  return NextResponse.json({
    isAuthenticated: false,
    active: false,
    premiumActive: false,
  });
}
