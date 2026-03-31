import { useAuthenticatedUser, useLogin, useSignup } from "./auth";
import { useApproveTutor, useRejectTutor, useTutors } from "./tutor";
export const hooks = {
	useLogin,
	useSignup,
	useAuthenticatedUser,
	useTutors,
	useApproveTutor,
	useRejectTutor,
};
