const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = require("../app");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Review = require("../models/Review");

const makeToken = (userId) =>
	jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET, {
		expiresIn: "1h",
	});

let seq = 0;
const makeUser = async (role = "student", overrides = {}) => {
	seq += 1;
	const user = await User.create({
		name: `${role} ${seq}`,
		email: `${role}${seq}-${Date.now()}@slu.edu`,
		password: "password123",
		role,
		...overrides,
	});
	return { user, token: makeToken(user._id) };
};

let bookingSeq = 0;
const makeBooking = async ({ student, tutor, status = "completed" } = {}) => {
	bookingSeq += 1;
	const hour = 7 + (bookingSeq % 10); // 7..16, distinct startTime per booking
	const pad = (n) => n.toString().padStart(2, "0");
	return Booking.create({
		student,
		tutor,
		course: "CSCI-1300",
		date: new Date("2026-01-15"),
		startTime: `${pad(hour)}:00 AM`,
		endTime: `${pad(hour + 1)}:00 AM`,
		status,
		notes: "",
	});
};

const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe("POST /api/v1/reviews", () => {
	it("allows a student to review their own completed booking", async () => {
		const { user: student, token } = await makeUser("student");
		const { user: tutor } = await makeUser("tutor");
		const booking = await makeBooking({
			student: student._id,
			tutor: tutor._id,
			status: "completed",
		});

		const res = await request(app)
			.post("/api/v1/reviews")
			.set(auth(token))
			.send({ bookingId: booking._id.toString(), rating: 5, comment: "Great!" });

		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);
		expect(res.body.data.rating).toBe(5);
		expect(res.body.data.comment).toBe("Great!");
		expect(res.body.data.tutor).toBe(tutor._id.toString());
		expect(res.body.data.student).toBe(student._id.toString());

		const saved = await Review.findById(res.body.data._id);
		expect(saved.rating).toBe(5);
	});

	it("rejects missing bookingId or rating", async () => {
		const { token } = await makeUser("student");
		const res = await request(app)
			.post("/api/v1/reviews")
			.set(auth(token))
			.send({ rating: 4 });
		expect(res.status).toBe(400);
		expect(res.body.success).toBe(false);
	});

	it("rejects a rating below 1 or above 5", async () => {
		const { user: student, token } = await makeUser("student");
		const { user: tutor } = await makeUser("tutor");
		const booking = await makeBooking({
			student: student._id,
			tutor: tutor._id,
		});

		const low = await request(app)
			.post("/api/v1/reviews")
			.set(auth(token))
			.send({ bookingId: booking._id.toString(), rating: 0 });
		expect(low.status).toBe(400);

		const high = await request(app)
			.post("/api/v1/reviews")
			.set(auth(token))
			.send({ bookingId: booking._id.toString(), rating: 6 });
		expect(high.status).toBe(400);
	});

	it("returns 404 when the booking does not exist", async () => {
		const { token } = await makeUser("student");
		const fakeId = new mongoose.Types.ObjectId();

		const res = await request(app)
			.post("/api/v1/reviews")
			.set(auth(token))
			.send({ bookingId: fakeId.toString(), rating: 5 });

		expect(res.status).toBe(404);
	});

	it("blocks a student from reviewing another student's booking", async () => {
		const { user: studentA } = await makeUser("student");
		const { token: tokenB } = await makeUser("student");
		const { user: tutor } = await makeUser("tutor");
		const booking = await makeBooking({
			student: studentA._id,
			tutor: tutor._id,
		});

		const res = await request(app)
			.post("/api/v1/reviews")
			.set(auth(tokenB))
			.send({ bookingId: booking._id.toString(), rating: 5 });

		expect(res.status).toBe(403);
	});

	it.each(["pending", "confirmed", "cancelled"])(
		"blocks reviewing a %s booking",
		async (status) => {
			const { user: student, token } = await makeUser("student");
			const { user: tutor } = await makeUser("tutor");
			const booking = await makeBooking({
				student: student._id,
				tutor: tutor._id,
				status,
			});

			const res = await request(app)
				.post("/api/v1/reviews")
				.set(auth(token))
				.send({ bookingId: booking._id.toString(), rating: 5 });

			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/completed/i);
		},
	);

	it("blocks tutors from creating reviews", async () => {
		const { user: student } = await makeUser("student");
		const { user: tutor, token } = await makeUser("tutor");
		const booking = await makeBooking({
			student: student._id,
			tutor: tutor._id,
		});

		const res = await request(app)
			.post("/api/v1/reviews")
			.set(auth(token))
			.send({ bookingId: booking._id.toString(), rating: 5 });

		expect(res.status).toBe(403);
	});

	it("blocks admins from creating reviews", async () => {
		const { user: student } = await makeUser("student");
		const { user: tutor } = await makeUser("tutor");
		const { token } = await makeUser("admin");
		const booking = await makeBooking({
			student: student._id,
			tutor: tutor._id,
		});

		const res = await request(app)
			.post("/api/v1/reviews")
			.set(auth(token))
			.send({ bookingId: booking._id.toString(), rating: 5 });

		expect(res.status).toBe(403);
	});

	it("prevents duplicate reviews for the same booking", async () => {
		const { user: student, token } = await makeUser("student");
		const { user: tutor } = await makeUser("tutor");
		const booking = await makeBooking({
			student: student._id,
			tutor: tutor._id,
		});

		const first = await request(app)
			.post("/api/v1/reviews")
			.set(auth(token))
			.send({ bookingId: booking._id.toString(), rating: 5 });
		expect(first.status).toBe(201);

		const second = await request(app)
			.post("/api/v1/reviews")
			.set(auth(token))
			.send({ bookingId: booking._id.toString(), rating: 4 });
		expect(second.status).toBe(400);
		expect(second.body.message).toMatch(/already reviewed/i);
	});

	it("requires authentication", async () => {
		const res = await request(app)
			.post("/api/v1/reviews")
			.send({ bookingId: "anything", rating: 5 });
		expect(res.status).toBe(401);
	});
});

describe("GET /api/v1/reviews/tutor/:tutorId", () => {
	it("returns reviews with count and averageRating", async () => {
		const { user: s1, token: t1 } = await makeUser("student");
		const { user: s2, token: t2 } = await makeUser("student");
		const { user: tutor } = await makeUser("tutor");

		const b1 = await makeBooking({ student: s1._id, tutor: tutor._id });
		const b2 = await makeBooking({ student: s2._id, tutor: tutor._id });

		await request(app)
			.post("/api/v1/reviews")
			.set(auth(t1))
			.send({ bookingId: b1._id.toString(), rating: 5 });
		await request(app)
			.post("/api/v1/reviews")
			.set(auth(t2))
			.send({ bookingId: b2._id.toString(), rating: 3 });

		const { token: viewerToken } = await makeUser("student");
		const res = await request(app)
			.get(`/api/v1/reviews/tutor/${tutor._id}`)
			.set(auth(viewerToken));

		expect(res.status).toBe(200);
		expect(res.body.count).toBe(2);
		expect(res.body.averageRating).toBe(4);
		expect(res.body.data).toHaveLength(2);
	});

	it("returns empty list with averageRating 0 when tutor has no reviews", async () => {
		const { user: tutor } = await makeUser("tutor");
		const { token } = await makeUser("student");
		const res = await request(app)
			.get(`/api/v1/reviews/tutor/${tutor._id}`)
			.set(auth(token));
		expect(res.status).toBe(200);
		expect(res.body.count).toBe(0);
		expect(res.body.averageRating).toBe(0);
	});

	it.each(["tutor", "admin"])("is accessible as %s", async (role) => {
		const { user: tutor } = await makeUser("tutor");
		const { token } = await makeUser(role);
		const res = await request(app)
			.get(`/api/v1/reviews/tutor/${tutor._id}`)
			.set(auth(token));
		expect(res.status).toBe(200);
	});

	it("requires authentication", async () => {
		const tutorId = new mongoose.Types.ObjectId();
		const res = await request(app).get(`/api/v1/reviews/tutor/${tutorId}`);
		expect(res.status).toBe(401);
	});
});

describe("GET /api/v1/reviews/me", () => {
	it("returns only the logged-in student's reviews", async () => {
		const { user: s1, token: t1 } = await makeUser("student");
		const { user: s2, token: t2 } = await makeUser("student");
		const { user: tutor } = await makeUser("tutor");

		const b1 = await makeBooking({ student: s1._id, tutor: tutor._id });
		const b2 = await makeBooking({ student: s2._id, tutor: tutor._id });

		await request(app)
			.post("/api/v1/reviews")
			.set(auth(t1))
			.send({ bookingId: b1._id.toString(), rating: 5 });
		await request(app)
			.post("/api/v1/reviews")
			.set(auth(t2))
			.send({ bookingId: b2._id.toString(), rating: 3 });

		const res = await request(app).get("/api/v1/reviews/me").set(auth(t1));
		expect(res.status).toBe(200);
		expect(res.body.count).toBe(1);
		expect(res.body.data[0].student).toBe(s1._id.toString());
	});

	it.each(["tutor", "admin"])("blocks %s role", async (role) => {
		const { token } = await makeUser(role);
		const res = await request(app).get("/api/v1/reviews/me").set(auth(token));
		expect(res.status).toBe(403);
	});
});

describe("DELETE /api/v1/reviews/:id", () => {
	const createReview = async (studentToken, bookingId, rating = 5) => {
		const res = await request(app)
			.post("/api/v1/reviews")
			.set(auth(studentToken))
			.send({ bookingId, rating });
		return res.body.data;
	};

	it("allows the author to delete their own review", async () => {
		const { user: student, token } = await makeUser("student");
		const { user: tutor } = await makeUser("tutor");
		const booking = await makeBooking({
			student: student._id,
			tutor: tutor._id,
		});
		const review = await createReview(token, booking._id.toString());

		const res = await request(app)
			.delete(`/api/v1/reviews/${review._id}`)
			.set(auth(token));
		expect(res.status).toBe(200);
		expect(await Review.findById(review._id)).toBeNull();
	});

	it("allows an admin to delete any review", async () => {
		const { user: student, token: studentToken } = await makeUser("student");
		const { user: tutor } = await makeUser("tutor");
		const { token: adminToken } = await makeUser("admin");
		const booking = await makeBooking({
			student: student._id,
			tutor: tutor._id,
		});
		const review = await createReview(studentToken, booking._id.toString());

		const res = await request(app)
			.delete(`/api/v1/reviews/${review._id}`)
			.set(auth(adminToken));
		expect(res.status).toBe(200);
	});

	it("blocks another student from deleting a review", async () => {
		const { user: student, token } = await makeUser("student");
		const { user: tutor } = await makeUser("tutor");
		const { token: otherToken } = await makeUser("student");
		const booking = await makeBooking({
			student: student._id,
			tutor: tutor._id,
		});
		const review = await createReview(token, booking._id.toString());

		const res = await request(app)
			.delete(`/api/v1/reviews/${review._id}`)
			.set(auth(otherToken));
		expect(res.status).toBe(403);
	});

	it("returns 404 when the review does not exist", async () => {
		const { token } = await makeUser("student");
		const fakeId = new mongoose.Types.ObjectId();
		const res = await request(app)
			.delete(`/api/v1/reviews/${fakeId}`)
			.set(auth(token));
		expect(res.status).toBe(404);
	});
});
