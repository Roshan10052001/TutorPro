import { toast } from "react-toastify";
import { getStoredUser } from "../storage";

export const getDecodedJWT = () => {
	try {
		const token = getStoredUser();
		return token;
	} catch {
		return null;
	}
};

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
export const errorAlert = (error) => {
	const defaultErrorMessage = "An error occurred. Please try again later.";
	const errorMessage =
		error?.response?.data?.message ||
		error?.response?.data?.error ||
		defaultErrorMessage;

	toast.error(errorMessage, toastOptions);
};
