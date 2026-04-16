import { useAuthenticatedUser, useLogin, useSignup } from "./auth";
import { useDeleteTutor, useGetTutorById, useGetTutors } from "./tutor";
export const hooks = {
	useLogin,
	useSignup,
	useAuthenticatedUser,
	useDeleteTutor,
	useGetTutorById,
	useGetTutors,
};
