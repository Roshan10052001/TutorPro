export const ROUTES = Object.freeze({
	BOOK_SESSION: "/book-session",
	SESSIONS: "/sessions",
});

export const BasePaths = {
	STUDENT: "/student",
	TUTOR: "/tutor",
	ADMIN: "/admin",
};

export function getDashboardPath(role, activeView = "") {
	if (role === "admin") return `${BasePaths.ADMIN}/dashboard`;
	if (role === "student") return `${BasePaths.STUDENT}/dashboard`;

	if (role === "tutor") {
		if (activeView === "student") return `${BasePaths.STUDENT}/dashboard`;
		if (activeView === "tutor") return `${BasePaths.TUTOR}/dashboard`;
		return "/select-view";
	}

	return "/";
}
