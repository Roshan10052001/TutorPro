import { toast } from "react-toastify";
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

export const isAuthenticated = () => {
	try {
		const token = getStoredUser();
		return Boolean(token);
	} catch {
		return false;
	}
};

export const toastOptions = {
	position: "top-right",
	// autoClose: 8000,
	draggable: true,
	//   theme: "dark",
	// timeOut: 8000,
	pauseOnHover: true,
	style: {
		zIndex: 9999,
	},
};

export const successAlert = (msg) => {
	toast.success(msg || "Successfully created", toastOptions);
};
export const warnAlert = (msg) => {
	toast.warn(msg || "Warning", toastOptions);
};
export const errorAlert = (error) => {
	const defaultErrorMessage = "An error occurred. Please try again later.";
	const errorMessage =
		error?.response?.data?.message ||
		error?.response?.data?.error ||
		defaultErrorMessage;

	console.log(errorMessage);

	toast.error(errorMessage, toastOptions);
};
