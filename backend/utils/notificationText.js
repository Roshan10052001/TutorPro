const DEFAULT_MAX_LENGTH = 80;

function sanitizeNotificationValue(value, maxLength = DEFAULT_MAX_LENGTH) {
	if (value === null || value === undefined) return "";

	const normalized = String(value)
		.replace(/[\u0000-\u001F\u007F]/g, " ")
		.replace(/[<>"'`]/g, "")
		.replace(/\s+/g, " ")
		.trim();

	if (!normalized) return "";

	return normalized.length > maxLength
		? `${normalized.slice(0, maxLength - 3).trimEnd()}...`
		: normalized;
}

module.exports = {
	sanitizeNotificationValue,
};
