export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Privacy Policy</h1>
      <div className="prose dark:prose-invert">
        <p>Koydo collects minimal personal data necessary to provide ICSE Class 10 exam preparation services.</p>
        <h2>Data We Collect</h2>
        <ul>
          <li>Account information (email, display name)</li>
          <li>Study progress and quiz scores</li>
          <li>Device and usage analytics</li>
        </ul>
        <h2>How We Use Data</h2>
        <p>Your data is used exclusively to personalize your study experience, track progress, and improve our service.</p>
        <h2>Data Sharing</h2>
        <p>We do not sell your personal data. We share data only with essential service providers (Supabase for database, Vercel for hosting).</p>
        <h2>Contact</h2>
        <p>For privacy inquiries: privacy@koydo.app</p>
      </div>
    </main>
  );
}
