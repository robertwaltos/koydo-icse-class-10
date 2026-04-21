import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EXAM_CONFIG } from "@/lib/act/config";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/sign-in?returnTo=/learn`);
  }

  return <>{children}</>;
}

export const metadata = {
  title: `Learn — ${EXAM_CONFIG.name}`,
};
