import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import EmptyState from "../components/EmptyState";
import { useGetTutors } from "../hooks/tutor";

function Tutors() {
	const [search, setSearch] = useState("");
	const navigate = useNavigate();
	const { data: tutors = [] } = useGetTutors();

	const formatAvailabilitySlot = (slot) => {
		if (!slot || typeof slot !== "object") return String(slot || "-");

		return `${slot.day}: ${slot.startTime} - ${slot.endTime} • ${slot.sessionLengthMinutes} min sessions`;
	};

	const approvedTutors = tutors.filter((tutor) => tutor.status === "approved");

	const filteredTutors = useMemo(() => {
		return approvedTutors.filter(
			(tutor) =>
				tutor.name.toLowerCase().includes(search.toLowerCase()) ||
				tutor.course.toLowerCase().includes(search.toLowerCase()),
		);
	}, [approvedTutors, search]);

	return (
		<Layout
			page='Student'
			title='Find Tutors'
			subtitle='Browse only admin-approved tutors and their available time slots.'>
			<section className='dashboard-panel enhanced-panel'>
				<input
					type='text'
					className='search-input'
					placeholder='Search by tutor name or course'
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</section>

			{filteredTutors.length === 0 ? (
				<EmptyState
					title='No tutors found'
					text='Try another search or wait for admin-approved tutors.'
				/>
			) : (
				<section className='card-grid'>
					{filteredTutors.map((tutor) => (
						<div
							className='dashboard-panel tutor-card enhanced-panel'
							key={tutor._id}>
							<div className='tutor-card-header'>
								<div>
									<h3>{tutor.name}</h3>
									<p className='course-line'>{tutor.course}</p>
								</div>
								<span className='soft-badge approved'>★ {tutor.rating}</span>
							</div>

							<p>{tutor.bio}</p>

							<div className='slot-section'>
								<strong>Available Slots</strong>
								{tutor.availability.length === 0 ? (
									<p className='muted-text'>No slots open right now.</p>
								) : (
									<ul className='slot-list'>
										{tutor.availability.map((slot, index) => (
											<li
												key={`${slot.day}-${slot.startTime}-${slot.endTime}-${index}`}>
												{formatAvailabilitySlot(slot)}
											</li>
										))}
									</ul>
								)}
							</div>

							<button
								className='primary-btn'
								onClick={() =>
									navigate("/student/sessions", {
										state: {
											openBooking: true,
											tutorId: tutor._id,
										},
									})
								}
								disabled={tutor.availability.length === 0}>
								{tutor.availability.length === 0
									? "No Slots Available"
									: "Book Now"}
							</button>
						</div>
					))}
				</section>
			)}
		</Layout>
	);
}

export default Tutors;
