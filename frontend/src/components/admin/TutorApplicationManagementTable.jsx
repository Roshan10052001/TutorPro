import { useState } from "react";
import DataTable from "../DataTable";
import Modal from "../Modal";
import { useConfirm } from "../ConfirmProvider";
import {
	useUpdateTutorApplication,
	useRescoreTutorApplication,
	useSuggestAdminNotes,
	usePolishAdminNote,
} from "../../hooks/tutorApplication";
import { errorAlert } from "../../utils";
import { useDeleteTutor } from "../../hooks/tutor";
import { useDeleteUserAccount } from "../../hooks/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const STATUS_VARIANTS = {
	pending: "bg-amber-100 text-amber-800",
	approved: "bg-emerald-100 text-emerald-800",
	rejected: "bg-rose-100 text-rose-800",
};

const AI_RECOMMENDATION_VARIANTS = {
	approve: "bg-emerald-100 text-emerald-800",
	reject: "bg-rose-100 text-rose-800",
	needs_review: "bg-amber-100 text-amber-800",
};

const AI_RECOMMENDATION_LABELS = {
	approve: "Approve",
	reject: "Reject",
	needs_review: "Needs review",
};

function TutorApplicationManagementTable({
	applications = [],
	isLoading = false,
	heading,
	emptyTitle,
	emptyText,
	viewMode = "all",
}) {
	const { mutateAsync: updateTutorApplication, isPending } =
		useUpdateTutorApplication();
	const { mutateAsync: rescoreApplication, isPending: isRescoring } =
		useRescoreTutorApplication();
	const { mutateAsync: suggestNotes, isPending: isSuggesting } =
		useSuggestAdminNotes();
	const { mutateAsync: polishNote, isPending: isPolishing } =
		usePolishAdminNote();
	const [suggestedNotes, setSuggestedNotes] = useState([]);
	const { mutateAsync: deleteTutor, isPending: isDeletingTutor } =
		useDeleteTutor();
	const { mutateAsync: deleteUserAccount, isPending: isDeletingUser } =
		useDeleteUserAccount();
	const confirm = useConfirm();
	const [adminNotesById, setAdminNotesById] = useState({});
	const [selectedApplication, setSelectedApplication] = useState(null);
	const [activeAction, setActiveAction] = useState("");
	const [activeApplicationId, setActiveApplicationId] = useState("");

	const isActionPending = isPending || isDeletingTutor || isDeletingUser;

	const handleOpenRequest = (application) => {
		setSuggestedNotes([]);
		setSelectedApplication(application);
	};
	const handleCloseRequest = () => {
		setSuggestedNotes([]);
		setSelectedApplication(null);
	};

	const handleSuggestNotes = async () => {
		if (!selectedApplication) return;
		try {
			const result = await suggestNotes(selectedApplication._id);
			setSuggestedNotes(result?.suggestions || []);
		} catch {
			/* errorAlert handled in hook */
		}
	};

	const handlePolishNote = async () => {
		if (!selectedApplication) return;
		const current = (
			adminNotesById[selectedApplication._id] ??
			selectedApplication.adminNotes ??
			""
		).trim();
		if (!current) {
			errorAlert("Type a draft before polishing");
			return;
		}
		try {
			const result = await polishNote({
				applicationId: selectedApplication._id,
				draft: current,
			});
			if (result?.polished) {
				handleNotesChange(selectedApplication._id, result.polished);
			}
		} catch {
			/* errorAlert handled in hook */
		}
	};

	const handleNotesChange = (applicationId, value) => {
		setAdminNotesById((prev) => ({ ...prev, [applicationId]: value }));
	};

	const formatAvailabilitySlot = (slot) => {
		if (!slot || typeof slot !== "object") return String(slot || "-");
		return `${slot.day}: ${slot.startTime} - ${slot.endTime} • ${slot.sessionLengthMinutes} min sessions`;
	};

	const handleSubmit = async (application, status) => {
		const actionLabel = status === "approved" ? "approve" : "reject";
		const notes = (
			adminNotesById[application._id] ??
			application.adminNotes ??
			""
		).trim();

		const ok = await confirm({
			title: "Confirmation",
			description: `Are you sure you want to ${actionLabel} this application?`,
		});
		if (!ok) return;

		try {
			setActiveAction(status);
			setActiveApplicationId(application._id);
			await updateTutorApplication({
				applicationId: application._id,
				status,
				adminNotes: notes,
			});
			setSelectedApplication(null);
		} finally {
			setActiveAction("");
			setActiveApplicationId("");
		}
	};

	const handleReverseTutor = async (application) => {
		const ok = await confirm({
			title: "Reverse Tutor Role",
			description:
				"This will remove the tutor profile and change the user back to a student. Continue?",
			confirmText: "Yes, reverse it",
			variant: "destructive",
		});
		if (!ok) return;

		try {
			setActiveAction("reverse");
			setActiveApplicationId(application._id);
			await deleteTutor(application._id);
			setSelectedApplication(null);
		} finally {
			setActiveAction("");
			setActiveApplicationId("");
		}
	};

	const handleDeleteAccount = async (application) => {
		const userId = application?.user?._id;
		if (!userId) return;

		const ok = await confirm({
			title: "Delete Account",
			description:
				"This will permanently delete the user, their tutor applications, and related bookings.",
			confirmText: "Yes, delete account",
			variant: "destructive",
		});
		if (!ok) return;

		try {
			setActiveAction("delete-account");
			setActiveApplicationId(application._id);
			await deleteUserAccount(userId);
			setSelectedApplication(null);
		} finally {
			setActiveAction("");
			setActiveApplicationId("");
		}
	};

	const columns = [
		{
			key: "name",
			header: viewMode === "approved" ? "Tutor" : "Applicant",
		},
		{ key: "email", header: "Email" },
		{ key: "course", header: "Course" },
		{
			key: "createdAt",
			header: "Submitted",
			render: (application) =>
				application.createdAt
					? new Date(application.createdAt).toLocaleDateString()
					: "-",
		},
		{
			key: "availability",
			header: "Availability",
			render: (application) =>
				application.availability?.length
					? `${application.availability.length} slot(s)`
					: "-",
		},
		{
			key: "status",
			header: "Status",
			render: (application) => {
				const status = application.status || "pending";
				return (
					<Badge className={STATUS_VARIANTS[status] || STATUS_VARIANTS.pending}>
						{status}
					</Badge>
				);
			},
		},
		{
			key: "actions",
			header: "Action",
			render: (application) => (
				<Button
					type="button"
					size="sm"
					onClick={() => handleOpenRequest(application)}>
					{viewMode === "approved" ? "Manage" : "View"}
				</Button>
			),
		},
	];

	return (
		<>
			<Card className="mb-6">
				<CardContent className="p-6">
					{heading ? (
						<h2 className="mb-4 text-lg font-bold text-slate-900">{heading}</h2>
					) : null}
					<DataTable
						columns={columns}
						data={applications}
						isLoading={isLoading}
						emptyTitle={emptyTitle}
						emptyText={emptyText}
					/>
				</CardContent>
			</Card>

			<Modal
				isOpen={Boolean(selectedApplication)}
				onClose={handleCloseRequest}
				title="Tutor Application Request"
				size="lg">
				{selectedApplication ? (
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-1.5">
							<Label>Name</Label>
							<Input type="text" value={selectedApplication.name} readOnly />
						</div>

						<div className="flex flex-col gap-1.5">
							<Label>Email</Label>
							<Input type="email" value={selectedApplication.email} readOnly />
						</div>

						<div className="flex flex-col gap-1.5">
							<Label>Course</Label>
							<Input type="text" value={selectedApplication.course} readOnly />
						</div>

						<div className="flex flex-col gap-1.5">
							<Label>Bio</Label>
							<textarea
								className="flex min-h-[96px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
								value={selectedApplication.bio}
								rows="4"
								readOnly
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label>Availability</Label>
							<ul className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
								{selectedApplication.availability.map((slot, index) => (
									<li key={`${slot.day}-${slot.startTime}-${slot.endTime}-${index}`}>
										{formatAvailabilitySlot(slot)}
									</li>
								))}
							</ul>
						</div>

						<div className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 p-3">
							<div className="flex items-center justify-between gap-2">
								<div>
									<Label className="text-sm font-semibold">AI Recommendation</Label>
									<p className="text-xs text-slate-500">
										Advisory — admin makes the final decision
									</p>
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={async () => {
										const updated = await rescoreApplication(
											selectedApplication._id,
										);
										if (updated) setSelectedApplication(updated);
									}}
									disabled={isRescoring}>
									{isRescoring ? "Re-scoring..." : "Re-score"}
								</Button>
							</div>
							{selectedApplication.aiScore?.error ? (
								<p className="text-sm text-rose-700">
									Scoring failed: {selectedApplication.aiScore.error}
								</p>
							) : selectedApplication.aiScore?.recommendation ? (
								<>
									<div className="flex items-center gap-2">
										<Badge
											className={
												AI_RECOMMENDATION_VARIANTS[
													selectedApplication.aiScore.recommendation
												] || AI_RECOMMENDATION_VARIANTS.needs_review
											}>
											{AI_RECOMMENDATION_LABELS[
												selectedApplication.aiScore.recommendation
											] || selectedApplication.aiScore.recommendation}
										</Badge>
										<span className="text-sm text-slate-600">
											{Math.round(
												(selectedApplication.aiScore.confidence ?? 0) * 100,
											)}
											% confidence
										</span>
									</div>
									{selectedApplication.aiScore.reasons?.length ? (
										<ul className="list-inside list-disc text-sm text-slate-700">
											{selectedApplication.aiScore.reasons
												.slice(0, 5)
												.map((reason, idx) => (
													<li key={idx}>{reason}</li>
												))}
										</ul>
									) : null}
									{selectedApplication.aiScore.scoredAt ? (
										<p className="text-xs text-slate-500">
											Scored{" "}
											{new Date(
												selectedApplication.aiScore.scoredAt,
											).toLocaleString()}
										</p>
									) : null}
								</>
							) : (
								<p className="text-sm text-slate-500">Scoring in progress…</p>
							)}
						</div>

						<div className="flex flex-col gap-1.5">
							<div className="flex items-center justify-between gap-2">
								<Label>Comments</Label>
								<div className="flex gap-2">
									{["reject", "needs_review"].includes(
										selectedApplication.aiScore?.recommendation,
									) ? (
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={handleSuggestNotes}
											disabled={isSuggesting}>
											{isSuggesting
												? "Generating..."
												: suggestedNotes.length
													? "Regenerate"
													: "Suggest notes"}
										</Button>
									) : null}
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handlePolishNote}
										disabled={isPolishing}>
										{isPolishing ? "Polishing..." : "Polish with AI"}
									</Button>
								</div>
							</div>
							{suggestedNotes.length > 0 ? (
								<div className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 p-2">
									<p className="text-xs text-slate-500">
										Click a suggestion to use it
									</p>
									{suggestedNotes.map((note, idx) => (
										<button
											key={idx}
											type="button"
											onClick={() =>
												handleNotesChange(selectedApplication._id, note)
											}
											className="rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 hover:border-blue-400 hover:bg-blue-50">
											{note}
										</button>
									))}
								</div>
							) : null}
							<textarea
								className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
								value={
									adminNotesById[selectedApplication._id] ??
									selectedApplication.adminNotes ??
									""
								}
								onChange={(event) =>
									handleNotesChange(selectedApplication._id, event.target.value)
								}
								placeholder="Add comments for this application"
								rows="3"
							/>
						</div>

						<div className="flex flex-wrap gap-2 pt-2">
							{selectedApplication.status === "pending" ||
							selectedApplication.status === "rejected" ? (
								<Button
									type="button"
									onClick={() => handleSubmit(selectedApplication, "approved")}
									disabled={isActionPending}>
									{isPending &&
									activeAction === "approved" &&
									activeApplicationId === selectedApplication._id
										? "Approving..."
										: "Approve"}
								</Button>
							) : null}
							{selectedApplication.status === "pending" ? (
								<Button
									type="button"
									variant="outline"
									className="border-rose-400 text-rose-700 hover:bg-rose-50"
									onClick={() => handleSubmit(selectedApplication, "rejected")}
									disabled={isActionPending}>
									{isPending &&
									activeAction === "rejected" &&
									activeApplicationId === selectedApplication._id
										? "Rejecting..."
										: "Reject"}
								</Button>
							) : null}
							{selectedApplication.status === "approved" ? (
								<Button
									type="button"
									variant="outline"
									onClick={() => handleReverseTutor(selectedApplication)}
									disabled={isActionPending}>
									{isDeletingTutor &&
									activeAction === "reverse" &&
									activeApplicationId === selectedApplication._id
										? "Reversing..."
										: "Change Back to Student"}
								</Button>
							) : null}
							<Button
								type="button"
								variant="destructive"
								onClick={() => handleDeleteAccount(selectedApplication)}
								disabled={isActionPending}>
								{isDeletingUser &&
								activeAction === "delete-account" &&
								activeApplicationId === selectedApplication._id
									? "Deleting Account..."
									: "Delete Account"}
							</Button>
						</div>
					</div>
				) : null}
			</Modal>
		</>
	);
}

export default TutorApplicationManagementTable;
