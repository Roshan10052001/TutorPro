import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";
import { getStoredUser, setStoredUser } from "../storage";
import { errorAlert, successAlert } from "../utils";
import { useContext } from "react";
import { AuthContext } from "../context";
import { queryKeys } from "../react-query/constants";

async function signupUser(formData) {
	const { data } = await axiosInstance({
		url: "/auth/signup",
		method: "POST",
		data: formData,
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (data?.user) {
		setStoredUser(data.user);
	}

	return data;
}

async function loginUser(formData) {
	const { data } = await axiosInstance({
		url: "/auth/login",
		method: "POST",
		data: formData,
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (data?.user) {
		setStoredUser(data.user);
	}

	return data;
}

const userProfile = async () => {
	const data = await axiosInstance({
		url: "/auth/me",
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${await getStoredUser()}`,
		},
	});

	return data;
};

export function useAuthenticatedUser() {
	const authCtx = useContext(AuthContext);
	const fallback = undefined;
	const { data = fallback, refetch } = useQuery({
		enabled: authCtx.isAuthenticated,
		queryKey: [queryKeys.user],
		queryFn: () => userProfile(),
		onSuccess: () => {
			// authCtx.updateUser(data);
		},
		onError: () => {
			authCtx.logout();
		},
	});
	return { user: data, refetch };
}

export function useSignup() {
	const { mutate, isSuccess, isError, reset, error } = useMutation({
		mutationFn: signupUser,
		onSuccess: () => {
			successAlert("Account created successfully");
		},
		onError: (error) => {
			errorAlert(error);
		},
	});

	return { mutate, isSuccess, isError, reset, error };
}

export function useLogin() {
	const { mutate, isSuccess, isError, reset, error } = useMutation({
		mutationFn: loginUser,
		onSuccess: () => {
			successAlert("Signed in successfully");
		},
		onError: (error) => {
			errorAlert(error);
		},
	});

	return { mutate, isSuccess, isError, reset, error };
}
