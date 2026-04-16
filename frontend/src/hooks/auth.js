import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";
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
		},
	});

	if (data?.data && token) {
		setStoredUser({
			...data.data,
			token,
		});
	}

	return data?.data ?? null;
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
