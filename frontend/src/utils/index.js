import { toast } from "sonner";
import { getStoredUser } from "../storage";

export const safeRead = (key, fallback) => {
	try {
		const saved = localStorage.getItem(key);
		return saved ? JSON.parse(saved) : fallback;
	} catch {
		return fallback;
	}
};

export const getDecodedJWT = () => {
	try {
		const user = getStoredUser();
		return user?.token;
	} catch {
		return null;
	}
};

export const DAYS = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

export const HOURS = [
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"11",
	"12",
];
export const MINUTES = ["00", "15", "30", "45"];
export const PERIODS = ["AM", "PM"];

export const MAJORS = [
	"Computer Science",
	"Data Science",
	"Information Systems",
	"Mathematics",
	"Biology",
	"Chemistry",
	"Physics",
	"Business",
	"Finance",
	"Accounting",
	"Engineering",
	"Other",
];

export const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

export const SUBJECT_OPTIONS = [
	"Database Systems",
	"Data Structures",
	"Algorithms",
	"Operating Systems",
	"Software Engineering",
	"Calculus",
	"Statistics",
	"Physics",
	"Chemistry",
];

export const isAuthenticated = () => {
	try {
		const token = getStoredUser();
		return Boolean(token);
	} catch {
		return false;
	}
};

export const successAlert = (msg) => {
	toast.success(msg || "Successfully created");
};
export const warnAlert = (msg) => {
	toast.warning(msg || "Warning");
};
export const errorAlert = (error) => {
	const defaultErrorMessage = "An error occurred. Please try again later.";
	const errorMessage =
		error?.response?.data?.message ||
		error?.response?.data?.error ||
		defaultErrorMessage;

	toast.error(errorMessage);
};
