import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";
import { errorAlert, successAlert } from "../utils";
import { queryClient } from "../react-query/index";
import { queryKeys } from "../react-query/constants";

const fetchTutorReviews = async (tutorId) => {
	const { data } = await axiosInstance({
		url: `/reviews/tutor/${tutorId}`,
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});

	return {
		reviews: data?.data ?? [],
		count: data?.count ?? 0,
		averageRating: data?.averageRating ?? 0,
	};
};

const fetchMyReviews = async () => {
	const { data } = await axiosInstance({
		url: "/reviews/me",
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});

	return data?.data ?? [];
};

const createReview = async (payload) => {
	const { data } = await axiosInstance({
		url: "/reviews",
		method: "POST",
		data: payload,
		headers: { "Content-Type": "application/json" },
	});

	return data?.data;
};

const deleteReview = async (reviewId) => {
	const { data } = await axiosInstance({
		url: `/reviews/${reviewId}`,
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
	});

	return data;
};

export const useGetTutorReviews = (tutorId) => {
	return useQuery({
		queryKey: [queryKeys.reviews, tutorId],
		queryFn: () => fetchTutorReviews(tutorId),
		enabled: Boolean(tutorId),
		onError: (error) => {
			errorAlert(error);
		},
	});
};

export const useGetMyReviews = () => {
	return useQuery({
		queryKey: [queryKeys.myReviews],
		queryFn: fetchMyReviews,
		onError: (error) => {
			errorAlert(error);
		},
	});
};

export function useCreateReview() {
	const { mutate, mutateAsync, reset, isPending, isSuccess, isError, error } =
		useMutation({
			mutationFn: createReview,
			onSuccess: () => {
				successAlert("Review submitted");
				queryClient.invalidateQueries({ queryKey: [queryKeys.reviews] });
				queryClient.invalidateQueries({ queryKey: [queryKeys.myReviews] });
			},
			onError: (error) => {
				errorAlert(error);
			},
		});

	return { mutate, mutateAsync, reset, isPending, isSuccess, isError, error };
}

export function useDeleteReview() {
	const { mutate, mutateAsync, reset, isPending, isSuccess, isError, error } =
		useMutation({
			mutationFn: deleteReview,
			onSuccess: () => {
				successAlert("Review deleted");
				queryClient.invalidateQueries({ queryKey: [queryKeys.reviews] });
				queryClient.invalidateQueries({ queryKey: [queryKeys.myReviews] });
			},
			onError: (error) => {
				errorAlert(error);
			},
		});

	return { mutate, mutateAsync, reset, isPending, isSuccess, isError, error };
}
