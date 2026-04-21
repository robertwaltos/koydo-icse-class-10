import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/Footer";
import { CortexWidget } from "@/components/cortex/CortexWidget";
import { AmbientPlayerPortal } from "@/components/music/AmbientPlayer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EXAM_CONFIG } from "@/lib/act/config";

const BASE_URL = `https://${EXAM_CONFIG.slug}.koydo.app`;

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: `%s | Koydo ${EXAM_CONFIG.name}`,
    default: `Koydo ${EXAM_CONFIG.name} — Free Exam Prep`,
  },
  description: `${EXAM_CONFIG.name} exam preparation. Practice questions, AI tutor, full mock exams, study rooms, and score prediction. Independent study aid — not affiliated with or endorsed by any official testing authority.`,
  authors: [{ name: "Koydo", url: "https://koydo.app" }],
  creator: "Koydo",
  publisher: "Koydo",
  category: "education",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: `Koydo ${EXAM_CONFIG.name}`,
    locale: EXAM_CONFIG.locale,
  },
  twitter: { card: "summary_large_image", site: "@koydoapp" },
};

export const viewport: Viewport = {
  themeColor: EXAM_CONFIG.themeColor,
  colorScheme: "dark light",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang={EXAM_CONFIG.locale} dir={EXAM_CONFIG.isRTL ? "rtl" : "ltr"}>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <style>{`:root{--accent:${EXAM_CONFIG.themeColor};--accent-dark:${EXAM_CONFIG.themeColorDark};}`}</style>
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased flex flex-col">
        <Nav user={user} examName={EXAM_CONFIG.name} examSlug={EXAM_CONFIG.slug} />
        <main className="flex-1" style={{ paddingTop: "var(--nav-h)" }}>
          {children}
        </main>
        <Footer examName={EXAM_CONFIG.name} examSlug={EXAM_CONFIG.slug} />
        <AmbientPlayerPortal />
        <CortexWidget userId={user?.id ?? null} examSlug={EXAM_CONFIG.slug} />
      </body>
    </html>
  );
}
