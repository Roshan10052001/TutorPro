import { useContext } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";
import { AuthContext } from "../context";
import { getStoredUser, setStoredUser } from "../storage";
import { errorAlert, successAlert } from "../utils";
import { queryKeys } from "../react-query/constants";

function buildStoredAuth(data) {
	if (!data?.user) return null;

	return {
		...data.user,
		token: data.token || "",
	};
}

export async function signupUserRequest(formData) {
	const { data } = await axiosInstance({
		url: "/auth/signup",
		method: "POST",
		data: formData,
		headers: {
			"Content-Type": "application/json",
		},
	});

	const storedAuth = buildStoredAuth(data);
	if (storedAuth) {
		setStoredUser(storedAuth);
	}

	return data;
}

export async function loginUserRequest(formData) {
	const { data } = await axiosInstance({
		url: "/auth/login",
		method: "POST",
		data: formData,
		headers: {
			"Content-Type": "application/json",
		},
	});

	const storedAuth = buildStoredAuth(data);
	if (storedAuth) {
		setStoredUser(storedAuth);
	}

	return data;
}

export async function fetchAuthenticatedUserRequest() {
	const token = getStoredUser()?.token;

	const { data } = await axiosInstance({
		url: "/auth/me",
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
	});

	if (data?.user && token) {
		setStoredUser({
			...data.user,
			token,
		});
	}

	return data?.user ?? null;
}

export function useAuthenticatedUser(enabled = true) {
	const token = getStoredUser()?.token;

	return useQuery({
		enabled: Boolean(enabled && token),
		queryKey: [queryKeys.user, token],
		queryFn: fetchAuthenticatedUserRequest,
		retry: false,
	});
}

export function useCurrentUserProfile() {
	const { user, role, isAuthenticated } = useContext(AuthContext);
	const currentUser = user;

	return {
		currentUser,
		currentUserRole: role || currentUser?.role || "",
		currentUserEmail: currentUser?.email || "",
		currentUserName: currentUser?.name || "",
		isLoggedIn: Boolean(isAuthenticated),
	};
}

export function useSignup() {
	const { mutate, mutateAsync, isSuccess, isError, reset, error } = useMutation(
		{
			mutationFn: signupUserRequest,
			onSuccess: () => {
				successAlert("Account created successfully");
			},
			onError: (error) => {
				errorAlert(error);
			},
		},
	);

	return { mutate, mutateAsync, isSuccess, isError, reset, error };
}

export function useLogin() {
	const { mutate, mutateAsync, isSuccess, isError, reset, error } = useMutation(
		{
			mutationFn: loginUserRequest,
			onSuccess: () => {
				successAlert("Signed in successfully");
			},
			onError: (error) => {
				errorAlert(error);
			},
		},
	);

	return { mutate, mutateAsync, isSuccess, isError, reset, error };
}
