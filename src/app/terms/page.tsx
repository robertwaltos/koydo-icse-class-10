export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Terms of Service</h1>
      <div className="prose dark:prose-invert">
        <p>By using Koydo ICSE Class 10 Prep, you agree to these terms.</p>
        <h2>Service Description</h2>
        <p>Koydo provides exam preparation tools including practice questions, mock tests, and AI-powered study aids. Study aid only. Not affiliated with official examination boards.</p>
        <h2>User Accounts</h2>
        <p>You are responsible for maintaining the security of your account credentials.</p>
        <h2>Intellectual Property</h2>
        <p>All content created by Koydo is proprietary. Exam references are used for educational purposes under fair use.</p>
        <h2>Limitation of Liability</h2>
        <p>Koydo does not guarantee exam outcomes. Results depend on individual effort and preparation.</p>
      </div>
    </main>
  );
}
