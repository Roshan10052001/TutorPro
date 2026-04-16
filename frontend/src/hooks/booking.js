import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";
import { errorAlert, successAlert } from "../utils";
import { queryClient } from "../react-query/index";
import { queryKeys } from "../react-query/constants";

const fetchBookings = async () => {
	const { data } = await axiosInstance({
		url: "/bookings",
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	return data?.data ?? [];
};

const fetchBookingById = async (bookingId) => {
	const { data } = await axiosInstance({
		url: `/bookings/${bookingId}`,
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	return data?.data ?? null;
};

const createBooking = async (payload) => {
	const { data } = await axiosInstance({
		url: "/bookings",
		method: "POST",
		data: payload,
		headers: {
			"Content-Type": "application/json",
		},
	});

	return data?.data;
};

const updateBooking = async ({ bookingId, payload }) => {
	const { data } = await axiosInstance({
		url: `/bookings/${bookingId}`,
		method: "PUT",
		data: payload,
		headers: {
			"Content-Type": "application/json",
		},
	});

	return data?.data;
};

const deleteBooking = async (bookingId) => {
	const { data } = await axiosInstance({
		url: `/bookings/${bookingId}`,
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
	});

	return data;
};

const updateBookingStatus = async ({ bookingId, status }) => {
	const { data } = await axiosInstance({
		url: `/bookings/${bookingId}/status`,
		method: "PUT",
		data: { status },
		headers: {
			"Content-Type": "application/json",
		},
	});

	return data?.data;
};

const cancelBooking = async (bookingId) => {
	const { data } = await axiosInstance({
		url: `/bookings/${bookingId}/cancel`,
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	});

	return data?.data;
};

export const useGetBookings = () => {
	return useQuery({
		queryKey: [queryKeys.bookings],
		queryFn: fetchBookings,
		onError: (error) => {
			errorAlert(error);
		},
	});
};

export const useGetBookingById = (bookingId) => {
	return useQuery({
		queryKey: [queryKeys.booking, bookingId],
		queryFn: () => fetchBookingById(bookingId),
		enabled: Boolean(bookingId),
		onError: (error) => {
			errorAlert(error);
		},
	});
};

export function useCreateBooking() {
	const { mutate, mutateAsync, reset, isPending, isSuccess, isError, error } =
		useMutation({
			mutationFn: createBooking,
			onSuccess: () => {
				successAlert("Booking created successfully");
				queryClient.invalidateQueries({
					queryKey: [queryKeys.bookings],
				});
			},
			onError: (error) => {
				errorAlert(error);
			},
		});

	return { mutate, mutateAsync, reset, isPending, isSuccess, isError, error };
}

export function useUpdateBooking() {
	const { mutate, mutateAsync, reset, isPending, isSuccess, isError, error } =
		useMutation({
			mutationFn: ({ bookingId, payload }) =>
				updateBooking({
					bookingId,
					payload,
				}),
			onSuccess: () => {
				successAlert("Booking updated successfully");
				queryClient.invalidateQueries({
					queryKey: [queryKeys.bookings],
				});
			},
			onError: (error) => {
				errorAlert(error);
			},
		});

	return { mutate, mutateAsync, reset, isPending, isSuccess, isError, error };
}

export function useDeleteBooking() {
	const { mutate, mutateAsync, reset, isPending, isSuccess, isError, error } =
		useMutation({
			mutationFn: deleteBooking,
			onSuccess: () => {
				successAlert("Booking deleted successfully");
				queryClient.invalidateQueries({
					queryKey: [queryKeys.bookings],
				});
			},
			onError: (error) => {
				errorAlert(error);
			},
		});

	return { mutate, mutateAsync, reset, isPending, isSuccess, isError, error };
}

export function useUpdateBookingStatus() {
	const { mutate, mutateAsync, reset, isPending, isSuccess, isError, error } =
		useMutation({
			mutationFn: ({ bookingId, status }) =>
				updateBookingStatus({
					bookingId,
					status,
				}),
			onSuccess: () => {
				successAlert("Booking status updated successfully");
				queryClient.invalidateQueries({
					queryKey: [queryKeys.bookings],
				});
			},
			onError: (error) => {
				errorAlert(error);
			},
		});

	return { mutate, mutateAsync, reset, isPending, isSuccess, isError, error };
}

export function useCancelBooking() {
	const { mutate, mutateAsync, reset, isPending, isSuccess, isError, error } =
		useMutation({
			mutationFn: cancelBooking,
			onSuccess: () => {
				successAlert("Booking cancelled successfully");
				queryClient.invalidateQueries({
					queryKey: [queryKeys.bookings],
				});
			},
			onError: (error) => {
				errorAlert(error);
			},
		});

	return { mutate, mutateAsync, reset, isPending, isSuccess, isError, error };
}
