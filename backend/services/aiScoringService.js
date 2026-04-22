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

module.exports = { scoreApplication };
