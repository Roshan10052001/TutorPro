import { createContext, useEffect, useMemo, useState } from "react";
import {
	initialTutors,
	initialSessions,
	initialTutorApplications,
} from "../data/mockData";
import { safeRead } from "./safeRead";

export const AppContext = createContext();

export function AppProvider({ children }) {
	const [tutors, setTutors] = useState(() =>
		safeRead("tutorProTutors", initialTutors),
	);

	const [sessions, setSessions] = useState(() =>
		safeRead("tutorProSessions", initialSessions),
	);

	const [applications, setApplications] = useState(() =>
		safeRead("tutorProApplications", initialTutorApplications),
	);

	useEffect(() => {
		localStorage.setItem("tutorProTutors", JSON.stringify(tutors));
	}, [tutors]);

	useEffect(() => {
		localStorage.setItem("tutorProSessions", JSON.stringify(sessions));
	}, [sessions]);

	useEffect(() => {
		localStorage.setItem("tutorProApplications", JSON.stringify(applications));
	}, [applications]);

	const approvedTutors = useMemo(
		() => tutors.filter((tutor) => tutor.status === "approved"),
		[tutors],
	);

	const pendingApplications = useMemo(
		() => applications.filter((app) => app.status === "pending"),
		[applications],
	);

	const submitTutorApplication = (applicationData) => {
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

		setApplications((prev) => [newApplication, ...prev]);

		return {
			ok: true,
			message: "Tutor application submitted successfully.",
		};
	};

	const bookSession = ({
		course,
		tutorName,
		studentName,
		studentEmail,
		slot,
		note,
	}) => {
		const tutor = tutors.find((item) => item.name === tutorName);

		if (!tutor) {
			return {
				ok: false,
				message: "Selected tutor was not found.",
			};
		}

		const slotStillAvailable = tutor.availability.includes(slot);

		if (!slotStillAvailable) {
			return {
				ok: false,
				message:
					"This slot is no longer available. Please choose another slot.",
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

		setSessions((prev) => [newSession, ...prev]);

		setTutors((prev) =>
			prev.map((item) =>
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
	};

	const updateTutorAvailability = (email, slotsText) => {
		const cleanEmail = email.trim().toLowerCase();

		const slots = [
			...new Set(
				slotsText
					.split("\n")
					.map((slot) => slot.trim())
					.filter(Boolean),
			),
		];

		setTutors((prev) =>
			prev.map((tutor) =>
				tutor.email.trim().toLowerCase() === cleanEmail
					? {
							...tutor,
							availability: slots,
						}
					: tutor,
			),
		);
	};

	const value = {
		tutors,
		sessions,
		applications,
		approvedTutors,
		pendingApplications,
		submitTutorApplication,
		bookSession,
		updateTutorAvailability,
	};

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
