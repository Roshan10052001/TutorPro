import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance, getJWTHeader } from "../axiosInstance";
import {
	initialSessions,
	initialTutorApplications,
	initialTutors,
} from "../data/mockData";
import { queryKeys } from "../react-query/constants";
import { safeRead } from "../utils";

const STORAGE_KEYS = {
	tutors: "tutorProTutors",
	sessions: "tutorProSessions",
	applications: "tutorProApplications",
};

function readTutorsFromStorage() {
	return safeRead(STORAGE_KEYS.tutors, initialTutors);
}

function readSessionsFromStorage() {
	return safeRead(STORAGE_KEYS.sessions, initialSessions);
}

function readApplicationsFromStorage() {
	return safeRead(STORAGE_KEYS.applications, initialTutorApplications);
}

function writeTutorsToStorage(tutors) {
	localStorage.setItem(STORAGE_KEYS.tutors, JSON.stringify(tutors));
}

function writeSessionsToStorage(sessions) {
	localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
}

function writeApplicationsToStorage(applications) {
	localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(applications));
}

function invalidateTutorData(queryClient) {
	queryClient.invalidateQueries({ queryKey: [queryKeys.tutors] });
	queryClient.invalidateQueries({ queryKey: [queryKeys.applications] });
	queryClient.invalidateQueries({ queryKey: [queryKeys.sessions] });
}

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

export function useTutorList() {
	const { data = [] } = useQuery({
		queryKey: [queryKeys.tutors, "local"],
		queryFn: readTutorsFromStorage,
		initialData: initialTutors,
	});

	return data;
}

export function useSessions() {
	const { data = [] } = useQuery({
		queryKey: [queryKeys.sessions],
		queryFn: readSessionsFromStorage,
		initialData: initialSessions,
	});

	return data;
}

export function useApplications() {
	const { data = [] } = useQuery({
		queryKey: [queryKeys.applications],
		queryFn: readApplicationsFromStorage,
		initialData: initialTutorApplications,
	});

	return data;
}

export function useApprovedTutors() {
	const tutors = useTutorList();

	return tutors.filter((tutor) => tutor.status === "approved");
}

export function usePendingApplications() {
	const applications = useApplications();

	return applications.filter((application) => application.status === "pending");
}

export function useApproveTutor() {
	const queryClient = useQueryClient();
	const { mutate, mutateAsync, isSuccess, isError, reset, error } = useMutation(
		{
			mutationFn: approveTutorRequest,
			onSuccess: () => {
				invalidateTutorData(queryClient);
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
				invalidateTutorData(queryClient);
			},
		},
	);

	return { mutate, mutateAsync, isSuccess, isError, reset, error };
}

export function useSubmitTutorApplication() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (applicationData) => {
			const tutors = readTutorsFromStorage();
			const applications = readApplicationsFromStorage();
			const cleanEmail = applicationData.email.trim().toLowerCase();

			const alreadyApproved = tutors.some(
				(tutor) => tutor.email.trim().toLowerCase() === cleanEmail,
			);

			if (alreadyApproved) {
				return {
					ok: false,
					message: "You are already approved as a tutor.",
				};
			}

			const alreadyPending = applications.some(
				(application) =>
					application.email.trim().toLowerCase() === cleanEmail &&
					application.status === "pending",
			);

			if (alreadyPending) {
				return {
					ok: false,
					message: "Your tutor application is already pending admin approval.",
				};
			}

			const newApplication = {
				id: Date.now(),
				...applicationData,
				email: cleanEmail,
				availability: [
					...new Set(applicationData.availability.map((slot) => slot.trim())),
				],
				status: "pending",
			};

			writeApplicationsToStorage([newApplication, ...applications]);

			return {
				ok: true,
				message: "Tutor application submitted successfully.",
			};
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.applications] });
		},
	});
}

export function useBookSession() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			course,
			tutorName,
			studentName,
			studentEmail,
			slot,
			note,
		}) => {
			const tutors = readTutorsFromStorage();
			const sessions = readSessionsFromStorage();
			const tutor = tutors.find((item) => item.name === tutorName);

			if (!tutor) {
				return {
					ok: false,
					message: "Selected tutor was not found.",
				};
			}

			if (!tutor.availability.includes(slot)) {
				return {
					ok: false,
					message: "This slot is no longer available. Please choose another slot.",
				};
			}

			const duplicateBooking = sessions.some(
				(session) =>
					session.tutor === tutorName &&
					session.studentEmail === studentEmail &&
					session.time === slot,
			);

			if (duplicateBooking) {
				return {
					ok: false,
					message: "You already booked this slot.",
				};
			}

			const newSession = {
				id: Date.now(),
				course,
				tutor: tutorName,
				student: studentName,
				studentEmail,
				time: slot,
				note: note?.trim() || "",
				status: "Booked",
			};

			writeSessionsToStorage([newSession, ...sessions]);
			writeTutorsToStorage(
				tutors.map((item) =>
					item.name === tutorName
						? {
								...item,
								availability: item.availability.filter(
									(available) => available !== slot,
								),
						  }
						: item,
				),
			);

			return {
				ok: true,
				message: "Session booked successfully.",
			};
		},
		onSuccess: () => {
			invalidateTutorData(queryClient);
		},
	});
}

export function useUpdateTutorAvailability() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ email, slotsText }) => {
			const tutors = readTutorsFromStorage();
			const cleanEmail = email.trim().toLowerCase();
			const slots = [
				...new Set(
					slotsText
						.split("\n")
						.map((slot) => slot.trim())
						.filter(Boolean),
				),
			];

			writeTutorsToStorage(
				tutors.map((tutor) =>
					tutor.email.trim().toLowerCase() === cleanEmail
						? {
								...tutor,
								availability: slots,
						  }
						: tutor,
				),
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.tutors] });
		},
	});
}

export function useResetDemoData() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			writeTutorsToStorage(initialTutors);
			writeSessionsToStorage(initialSessions);
			writeApplicationsToStorage(initialTutorApplications);
		},
		onSuccess: () => {
			invalidateTutorData(queryClient);
		},
	});
}
