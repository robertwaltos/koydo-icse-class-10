import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EXAM_CONFIG } from "@/lib/act/config";

export const metadata = { title: `Study Rooms — ${EXAM_CONFIG.name}` };

export default async function StudyRoomsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?returnTo=/study-rooms");
  return <>{children}</>;
}
