import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EXAM_CONFIG } from "@/lib/act/config";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

type AnthropicMessageResponse = {
  content?: Array<{
    type: string;
    text?: string;
  }>;
};

async function generateEssayEvaluation(systemPrompt: string, essayPrompt: string, essay: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `PROMPT: ${essayPrompt}

ESSAY:
${essay}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic request failed with status ${response.status}`);
  }

  const body = (await response.json()) as AnthropicMessageResponse;
  const raw = body.content?.find((entry) => entry.type === "text")?.text;

  if (!raw) {
    throw new Error("Anthropic response did not include text content");
  }

  return raw;
}

const SAMPLE_PROMPTS: Record<string, string> = {
  English:
    "Write a persuasive essay arguing whether social media has been a net positive or negative for society. Use specific examples and reasoning to support your position.",
  Writing:
    "Some people believe that technology has made modern life better. Others disagree. Write an essay that presents both perspectives and gives your own view.",
  default:
    "Write an argumentative essay on a topic of your choice. Your essay should have a clear thesis, supporting arguments, and a conclusion.",
};

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: entitlement } = await supabase
    .from("microapp_user_entitlements")
    .select("status")
    .eq("user_id", user.id)
    .eq("app_id", `koydo_${EXAM_CONFIG.slug}`)
    .maybeSingle();

  const isPremium = (entitlement as { status: string } | null)?.status === "active";

  if (!isPremium) {
    return NextResponse.json({ error: "premium_required" }, { status: 403 });
  }

  const { essay, prompt, domain } = (await req.json()) as {
    essay: string;
    prompt?: string;
    domain?: string;
  };

  if (!essay || essay.trim().length < 50) {
    return NextResponse.json({ error: "Essay too short (min 50 characters)" }, { status: 400 });
  }

  const essayPrompt = prompt ?? SAMPLE_PROMPTS[domain ?? "default"] ?? SAMPLE_PROMPTS.default;

  const systemPrompt = `You are an expert ${EXAM_CONFIG.name} essay examiner. Score the student's essay using the official ${EXAM_CONFIG.name} writing rubric.

Return your evaluation as valid JSON with this exact structure:
{
  "scores": {
    "ideas_analysis": <1-6>,
    "development_support": <1-6>,
    "organization": <1-6>,
    "language_use": <1-6>,
    "conventions": <1-6>
  },
  "composite": <1.0-36.0>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "model_paragraph": "<rewrite of the weakest paragraph with improvements>"
}

Be honest and constructive. Score fairly — most student essays fall between 2-4 on each dimension.`;

  const raw = await generateEssayEvaluation(systemPrompt, essayPrompt, essay);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return NextResponse.json({ error: "Failed to parse evaluation" }, { status: 500 });
  }

  const evaluation = JSON.parse(jsonMatch[0]) as {
    scores: Record<string, number>;
    composite: number;
    strengths: string[];
    improvements: string[];
    model_paragraph: string;
  };

  const { error: insertError } = await supabase.from("essay_submissions").insert({
    user_id: user.id,
    exam_id: EXAM_CONFIG.slug,
    domain: domain ?? "Writing",
    prompt: essayPrompt,
    essay_text: essay,
    evaluation,
    composite_score: evaluation.composite,
  });

  if (insertError) {
    console.warn("Unable to persist essay submission", insertError.message);
  }

  return NextResponse.json({ evaluation, prompt: essayPrompt });
}
