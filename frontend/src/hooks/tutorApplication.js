import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";
import { errorAlert, successAlert } from "../utils";
import { queryClient } from "../react-query/index";
import { queryKeys } from "../react-query/constants";

const fetchAllTutorApplications = async () => {
	const { data } = await axiosInstance({
		url: "/tutor-application/all",
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	return data?.data ?? [];
};

const fetchTutorApplications = async () => {
	const { data } = await axiosInstance({
		url: "/tutor-application",
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	return data?.data ?? [];
};
const submitTutorApplication = async (payload) => {
	const { data } = await axiosInstance({
		url: "/tutor-application",
		method: "POST",
		data: payload,
		headers: {
			"Content-Type": "application/json",
		},
	});

	return data;
};

const updateTutorApplication = async ({
	applicationId,
	status,
	adminNotes,
}) => {
	const { data } = await axiosInstance({
		url: `/tutor-application/${applicationId}`,
		method: "PUT",
		data: {
			status,
			adminNotes: adminNotes || "",
		},
		headers: {
			"Content-Type": "application/json",
		},
	});

	return data?.data;
};

export const useGetAllTutorApplications = () => {
	return useQuery({
		queryKey: [queryKeys.allTutorApplications],
		queryFn: fetchAllTutorApplications,
		onError: (error) => {
			errorAlert(error);
		},
	});
};

export const useGetTutorApplications = () => {
	return useQuery({
		queryKey: [queryKeys.tutorApplication],
		queryFn: fetchTutorApplications,
		onError: (error) => {
			errorAlert(error);
		},
	});
};

export function useSubmitTutorApplication() {
	const { mutate, mutateAsync, reset, isPending } = useMutation({
		mutationFn: submitTutorApplication,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.tutorApplication],
			});
			queryClient.invalidateQueries({
				queryKey: [queryKeys.allTutorApplications],
			});
		},
		onError: (error) => {
			errorAlert(error);
		},
	});

	return { mutate, mutateAsync, reset, isPending };
}

export function useUpdateTutorApplication() {
	const { mutate, mutateAsync, isSuccess, isError, reset, error, isPending } =
		useMutation({
			mutationFn: ({ applicationId, status, adminNotes }) =>
				updateTutorApplication({
					applicationId,
					status,
					adminNotes,
				}),
			onSuccess: () => {
				successAlert("Tutor application status updated successfully");
				queryClient.invalidateQueries({
					queryKey: [queryKeys.tutorApplication],
				});
				queryClient.invalidateQueries({
					queryKey: [queryKeys.allTutorApplications],
				});
			},
			onError: (error) => {
				errorAlert(error);
			},
		});

	return { mutate, mutateAsync, isSuccess, isError, reset, error, isPending };
}
