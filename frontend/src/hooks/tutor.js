import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";
import { errorAlert, getDecodedJWT, successAlert } from "../utils";
import { queryClient } from "../react-query/index";
import { queryKeys } from "../react-query/constants";

const fetchTutors = async (params = {}) => {
	const { data } = await axiosInstance({
		url: "/tutors",
		method: "GET",
		params,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${getDecodedJWT()}`,
		},
	});

	return data?.data ?? [];
};

const fetchTutorById = async (tutorId) => {
	const { data } = await axiosInstance({
		url: `/tutors/${tutorId}`,
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${getDecodedJWT()}`,
		},
	});

	return data?.data ?? null;
};

const deleteTutor = async (tutorId) => {
	const { data } = await axiosInstance({
		url: `/tutors/${tutorId}`,
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${getDecodedJWT()}`,
		},
	});

	return data;
};

export const useGetTutors = (params = {}) => {
	return useQuery({
		queryKey: [queryKeys.tutors, params],
		queryFn: () => fetchTutors(params),
		onError: (error) => {
			errorAlert(error);
		},
	});
};

export const useGetTutorById = (tutorId) => {
	return useQuery({
		queryKey: [queryKeys.tutors, tutorId],
		queryFn: () => fetchTutorById(tutorId),
		enabled: Boolean(tutorId),
		onError: (error) => {
			errorAlert(error);
		},
	});
};

export function useDeleteTutor() {
	const { mutate, mutateAsync, isSuccess, isError, reset, error, isPending } =
		useMutation({
			mutationFn: deleteTutor,
			onSuccess: () => {
				successAlert("Tutor deleted successfully");
				queryClient.invalidateQueries({
					queryKey: [queryKeys.tutors],
				});
				queryClient.invalidateQueries({
					queryKey: [queryKeys.tutorApplication],
				});
			},
			onError: (error) => {
				errorAlert(error);
			},
		});

	return { mutate, mutateAsync, isSuccess, isError, reset, error, isPending };
}
