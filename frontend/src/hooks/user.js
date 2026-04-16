import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";
import { errorAlert, getDecodedJWT, successAlert } from "../utils";
import { queryClient } from "../react-query/index";
import { queryKeys } from "../react-query/constants";
import { getStoredUser, setStoredUser } from "../storage";

const updateUserProfile = async (payload) => {
	const { data } = await axiosInstance({
		url: "/user/profile",
		method: "PUT",
		data: payload,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${getDecodedJWT()}`,
		},
	});

	return data?.data;
};

const deleteUserProfile = async () => {
	const { data } = await axiosInstance({
		url: "/user/profile",
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${getDecodedJWT()}`,
		},
	});

	return data;
};

export function useUpdateUserProfile() {
	const { mutate, mutateAsync, isSuccess, isError, reset, error, isPending } =
		useMutation({
			mutationFn: updateUserProfile,
			onSuccess: (updatedUser) => {
				successAlert("Profile updated successfully");

				const storedUser = getStoredUser();

				if (storedUser) {
					setStoredUser({
						...storedUser,
						...updatedUser,
					});
				}

				queryClient.invalidateQueries({
					queryKey: [queryKeys.user],
				});
			},
			onError: (error) => {
				errorAlert(error);
			},
		});

	return { mutate, mutateAsync, isSuccess, isError, reset, error, isPending };
}

export function useDeleteUserProfile() {
	const { mutate, mutateAsync, isSuccess, isError, reset, error, isPending } =
		useMutation({
			mutationFn: deleteUserProfile,
			onSuccess: () => {
				successAlert("Account deleted successfully");

				queryClient.invalidateQueries({
					queryKey: [queryKeys.user],
				});
			},
			onError: (error) => {
				errorAlert(error);
			},
		});

	return { mutate, mutateAsync, isSuccess, isError, reset, error, isPending };
}
