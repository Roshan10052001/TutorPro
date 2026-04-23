import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";
import { errorAlert } from "../utils";
import { queryClient } from "../react-query/index";
import { queryKeys } from "../react-query/constants";

const fetchNotifications = async () => {
	const { data } = await axiosInstance({
		url: "/notifications",
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});

	return data?.data ?? { items: [], unreadCount: 0 };
};

const markNotificationRead = async (notificationId) => {
	const { data } = await axiosInstance({
		url: `/notifications/${notificationId}/read`,
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
	});

	return data?.data;
};

const markAllNotificationsRead = async () => {
	const { data } = await axiosInstance({
		url: "/notifications/read-all",
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
	});

	return data;
};

export const useGetNotifications = (enabled = true) => {
	return useQuery({
		queryKey: [queryKeys.notifications],
		queryFn: fetchNotifications,
		enabled,
		refetchInterval: 30_000,
		refetchOnWindowFocus: true,
	});
};

export function useMarkNotificationRead() {
	const { mutate, mutateAsync, isPending } = useMutation({
		mutationFn: markNotificationRead,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.notifications] });
		},
		onError: (error) => {
			errorAlert(error);
		},
	});

	return { mutate, mutateAsync, isPending };
}

export function useMarkAllNotificationsRead() {
	const { mutate, mutateAsync, isPending } = useMutation({
		mutationFn: markAllNotificationsRead,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.notifications] });
		},
		onError: (error) => {
			errorAlert(error);
		},
	});

	return { mutate, mutateAsync, isPending };
}
