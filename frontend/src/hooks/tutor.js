import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance, getJWTHeader } from "../axiosInstance";
import { queryKeys } from "../react-query/constants";

export async function fetchTutors(params = {}) {
	const headers = await getJWTHeader();
	const { data } = await axiosInstance({
		url: "/tutors",
		method: "GET",
		params,
		headers,
	});

	return data?.data ?? [];
}

export async function approveTutorRequest(applicationId) {
	const headers = await getJWTHeader();
	const { data } = await axiosInstance({
		url: `/tutors/${applicationId}/approve`,
		method: "POST",
		headers,
	});

	return data;
}

export async function rejectTutorRequest(applicationId) {
	const headers = await getJWTHeader();
	const { data } = await axiosInstance({
		url: `/tutors/${applicationId}/reject`,
		method: "POST",
		headers,
	});

	return data;
}

export function useTutors(params = {}) {
	return useQuery({
		queryKey: [queryKeys.tutors, params],
		queryFn: () => fetchTutors(params),
	});
}

export function useApproveTutor() {
	const queryClient = useQueryClient();
	const { mutate, mutateAsync, isSuccess, isError, reset, error } = useMutation(
		{
			mutationFn: approveTutorRequest,
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: [queryKeys.tutors] });
				queryClient.invalidateQueries({ queryKey: [queryKeys.applications] });
			},
		},
	);

	return { mutate, mutateAsync, isSuccess, isError, reset, error };
}

export function useRejectTutor() {
	const queryClient = useQueryClient();
	const { mutate, mutateAsync, isSuccess, isError, reset, error } = useMutation(
		{
			mutationFn: rejectTutorRequest,
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: [queryKeys.tutors] });
				queryClient.invalidateQueries({ queryKey: [queryKeys.applications] });
			},
		},
	);

	return { mutate, mutateAsync, isSuccess, isError, reset, error };
}
