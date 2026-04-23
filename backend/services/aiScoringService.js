const Anthropic = require("@anthropic-ai/sdk");

const MODEL = "claude-haiku-4-5";
const MAX_TOKENS = 600;

const RUBRIC_SYSTEM_PROMPT = `You are an admissions reviewer for a peer tutoring platform. You evaluate tutor applications and produce an advisory recommendation that a human admin will use to make the final decision.

Evaluate each application on these criteria:
1. Relevant coursework — does the applicant's course selection suggest they have the background to tutor it?
2. Prior tutoring / teaching experience — does the bio mention concrete experience helping others learn?
3. Writing quality — is the bio clear, well-structured, grammatical? Poor writing suggests poor communication with students.
4. Availability completeness — are the time slots realistic, varied enough to be useful, and cover reasonable durations?
5. Missing information — is there anything critical absent (e.g. empty bio, single-line bio, no meaningful availability)?

Produce one of three recommendations:
- "approve" — strong, complete application with no concerns
- "reject" — clear disqualifiers (empty/nonsense bio, unqualified, troubling red flags)
- "needs_review" — mixed signals, missing info, or borderline quality

Output ONLY a single JSON object with this exact schema, no prose, no markdown fences:
{
  "recommendation": "approve" | "reject" | "needs_review",
  "confidence": number between 0 and 1,
  "reasons": array of 1-5 short strings explaining the recommendation
}`;

function buildUserMessage(application) {
	const availabilityLines = (application.availability || [])
		.map(
			(slot) =>
				`- ${slot.day} ${slot.startTime}-${slot.endTime} (${slot.sessionLengthMinutes} min sessions)`,
		)
		.join("\n");

	return `Application to review:

Name: ${application.name}
Email: ${application.email}
Course: ${application.course}

Bio:
${application.bio}

Availability:
${availabilityLines || "(none provided)"}

Return your JSON recommendation now.`;
}

function validateScore(parsed) {
	if (!parsed || typeof parsed !== "object") {
		throw new Error("Response is not an object");
	}
	if (!["approve", "reject", "needs_review"].includes(parsed.recommendation)) {
		throw new Error(`Invalid recommendation: ${parsed.recommendation}`);
	}
	if (
		typeof parsed.confidence !== "number" ||
		parsed.confidence < 0 ||
		parsed.confidence > 1
	) {
		throw new Error(`Invalid confidence: ${parsed.confidence}`);
	}
	if (!Array.isArray(parsed.reasons) || parsed.reasons.length === 0) {
		throw new Error("Reasons must be a non-empty array");
	}
	return {
		recommendation: parsed.recommendation,
		confidence: parsed.confidence,
		reasons: parsed.reasons.slice(0, 5).map((r) => String(r)),
	};
}

function extractText(response) {
	const block = (response.content || []).find((b) => b.type === "text");
	if (!block || !block.text) {
		throw new Error("No text block in response");
	}
	return block.text.trim();
}

async function scoreApplication(application) {
	const scoredAt = new Date();

	if (!process.env.ANTHROPIC_API_KEY) {
		return { error: "ANTHROPIC_API_KEY not configured", scoredAt };
	}

	try {
		const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

		const response = await client.messages.create({
			model: MODEL,
			max_tokens: MAX_TOKENS,
			system: [
				{
					type: "text",
					text: RUBRIC_SYSTEM_PROMPT,
					cache_control: { type: "ephemeral" },
				},
			],
			messages: [
				{
					role: "user",
					content: buildUserMessage(application),
				},
			],
		});

		const text = extractText(response);
		const jsonMatch = text.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			throw new Error("No JSON object found in response");
		}

		const parsed = JSON.parse(jsonMatch[0]);
		const validated = validateScore(parsed);

		return {
			...validated,
			model: MODEL,
			scoredAt,
		};
	} catch (err) {
		return {
			error: err.message || "Unknown scoring error",
			scoredAt,
		};
	}
}

const SUGGEST_NOTES_SYSTEM_PROMPT = `You draft short, professional notes that an admin would leave on a tutor application. Tone: polite, specific, constructive. Length: 1–2 sentences each, under 280 characters. Reference the specific weaknesses provided, but do not invent facts.

Output ONLY a JSON object with this exact schema, no prose, no markdown fences:
{
  "suggestions": [string, string, string]
}`;

const POLISH_SYSTEM_PROMPT = `Rewrite the admin's draft to be professional, clear, and courteous while preserving the admin's intent, facts, and decision. Do not add new facts, new reasons, or new promises. Keep it concise (<=280 characters).

Output ONLY a JSON object with this exact schema, no prose, no markdown fences:
{
  "polished": string
}`;

function buildSuggestUserMessage(application) {
	const reasons = (application.aiScore?.reasons || []).join("; ") || "(none)";
	const recommendation = application.aiScore?.recommendation || "unknown";

	return `Application context:
Course: ${application.course}
Bio: ${application.bio}
AI recommendation: ${recommendation}
AI reasons: ${reasons}

Write 3 short admin notes the admin could use as-is or adapt. Return JSON now.`;
}

function buildPolishUserMessage(application, draft) {
	return `Application context:
Course: ${application.course}
Applicant: ${application.name}

Admin draft to rewrite:
"""
${draft}
"""

Return JSON now.`;
}

async function callModel({ system, userMessage, maxTokens }) {
	if (!process.env.ANTHROPIC_API_KEY) {
		throw new Error("ANTHROPIC_API_KEY not configured");
	}
	const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
	const response = await client.messages.create({
		model: MODEL,
		max_tokens: maxTokens,
		system: [
			{
				type: "text",
				text: system,
				cache_control: { type: "ephemeral" },
			},
		],
		messages: [{ role: "user", content: userMessage }],
	});
	const text = extractText(response);
	const jsonMatch = text.match(/\{[\s\S]*\}/);
	if (!jsonMatch) throw new Error("No JSON object found in response");
	return JSON.parse(jsonMatch[0]);
}

async function generateNoteSuggestions(application) {
	try {
		const parsed = await callModel({
			system: SUGGEST_NOTES_SYSTEM_PROMPT,
			userMessage: buildSuggestUserMessage(application),
			maxTokens: 500,
		});
		if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length === 0) {
			throw new Error("suggestions must be a non-empty array");
		}
		return {
			suggestions: parsed.suggestions.slice(0, 3).map((s) => String(s).trim()),
		};
	} catch (err) {
		return { error: err.message || "Unknown suggestion error" };
	}
}

async function polishNote(application, draft) {
	try {
		const parsed = await callModel({
			system: POLISH_SYSTEM_PROMPT,
			userMessage: buildPolishUserMessage(application, draft),
			maxTokens: 400,
		});
		if (typeof parsed.polished !== "string" || !parsed.polished.trim()) {
			throw new Error("polished must be a non-empty string");
		}
		return { polished: parsed.polished.trim() };
	} catch (err) {
		return { error: err.message || "Unknown polish error" };
	}
}

module.exports = { scoreApplication, generateNoteSuggestions, polishNote };
