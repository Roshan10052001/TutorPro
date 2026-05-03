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

const updateTutorApplicationStatus = async ({
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

const updateTutorApplication = async (payload) => {
	const { id, ...updateData } = payload;
	const { data } = await axiosInstance({
		url: `/tutor-application/${id}/resubmit`,
		method: "PUT",
		data: updateData,
		headers: {
			"Content-Type": "application/json",
		},
	});

	return data?.data;
};

const rescoreTutorApplication = async (applicationId) => {
	const { data } = await axiosInstance({
		url: `/tutor-application/${applicationId}/score`,
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	});

	return data?.data;
};

const generateAdminNotes = async ({ applicationId, mode, draft }) => {
	const { data } = await axiosInstance({
		url: `/tutor-application/${applicationId}/admin-notes`,
		method: "POST",
		data: { mode, draft },
		headers: {
			"Content-Type": "application/json",
		},
	});

	return data?.data;
};

const updateMyTutorAvailability = async ({ applicationId, availability }) => {
	const { data } = await axiosInstance({
		url: "/tutor-application/availability",
		method: "PUT",
		data: {
			applicationId,
			availability,
		},
		headers: {
			"Content-Type": "application/json",
		},
	});

	return data?.data;
};

const refreshTutorApplicationData = () => {
	queryClient.invalidateQueries({
		queryKey: [queryKeys.tutorApplication],
	});
	queryClient.invalidateQueries({
		queryKey: [queryKeys.allTutorApplications],
	});
	queryClient.invalidateQueries({
		queryKey: [queryKeys.notifications],
	});
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
			refreshTutorApplicationData();
		},
		onError: (error) => {
			errorAlert(error);
		},
	});

	return { mutate, mutateAsync, reset, isPending };
}

export function useUpdateTutorApplicationStatus() {
	const { mutate, mutateAsync, isSuccess, isError, reset, error, isPending } =
		useMutation({
			mutationFn: ({ applicationId, status, adminNotes }) =>
				updateTutorApplicationStatus({
					applicationId,
					status,
					adminNotes,
				}),
			onSuccess: () => {
				successAlert("Tutor application status updated successfully");
				refreshTutorApplicationData();
			},
			onError: (error) => {
				errorAlert(error);
			},
		});

	return { mutate, mutateAsync, isSuccess, isError, reset, error, isPending };
}

export function useUpdateTutorApplication() {
	const { mutate, mutateAsync, isSuccess, isError, reset, error, isPending } =
		useMutation({
			mutationFn: (payload) => updateTutorApplication(payload),
			onSuccess: () => {
				successAlert("Tutor application updated successfully");
				refreshTutorApplicationData();
			},
			onError: (error) => {
				errorAlert(error);
			},
		});

	return { mutate, mutateAsync, isSuccess, isError, reset, error, isPending };
}

export function useRescoreTutorApplication() {
	const { mutate, mutateAsync, reset, isPending, isSuccess, isError, error } =
		useMutation({
			mutationFn: rescoreTutorApplication,
			onSuccess: () => {
				successAlert("Application re-scored");
				queryClient.invalidateQueries({
					queryKey: [queryKeys.allTutorApplications],
				});
				queryClient.invalidateQueries({
					queryKey: [queryKeys.tutorApplication],
				});
			},
			onError: (mutationError) => {
				errorAlert(mutationError);
			},
		});

	return { mutate, mutateAsync, reset, isPending, isSuccess, isError, error };
}

export function useSuggestAdminNotes() {
	const { mutate, mutateAsync, reset, isPending, isSuccess, isError, error } =
		useMutation({
			mutationFn: (applicationId) =>
				generateAdminNotes({ applicationId, mode: "suggest" }),
			onError: (mutationError) => {
				errorAlert(mutationError);
			},
		});

	return { mutate, mutateAsync, reset, isPending, isSuccess, isError, error };
}

export function usePolishAdminNote() {
	const { mutate, mutateAsync, reset, isPending, isSuccess, isError, error } =
		useMutation({
			mutationFn: ({ applicationId, draft }) =>
				generateAdminNotes({ applicationId, mode: "polish", draft }),
			onError: (mutationError) => {
				errorAlert(mutationError);
			},
		});

	return { mutate, mutateAsync, reset, isPending, isSuccess, isError, error };
}

export function useUpdateMyTutorAvailability() {
	const { mutate, mutateAsync, reset, isPending, isSuccess, isError, error } =
		useMutation({
			mutationFn: updateMyTutorAvailability,
			onSuccess: () => {
				successAlert("Availability updated successfully");
				queryClient.invalidateQueries({
					queryKey: [queryKeys.tutors],
				});
				queryClient.invalidateQueries({
					queryKey: [queryKeys.tutorApplication],
				});
			},
			onError: (mutationError) => {
				errorAlert(mutationError);
			},
		});

	return { mutate, mutateAsync, reset, isPending, isSuccess, isError, error };
}
