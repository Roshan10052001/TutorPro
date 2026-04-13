const swaggerJsdoc = require("swagger-jsdoc");

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "SLU PeerTutor API",
			version: "1.0.0",
			description:
				"API documentation for TutorPro — a peer tutoring platform for SLU students.",
		},
		servers: [
			{
				url: "/api/v1",
				description: "API v1",
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
			schemas: {
				User: {
					type: "object",
					properties: {
						_id: { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0d" },
						name: { type: "string", example: "John Doe" },
						email: {
							type: "string",
							format: "email",
							example: "john@slu.edu",
						},
						role: {
							type: "string",
							enum: ["student", "tutor", "admin"],
							example: "student",
						},
						createdAt: {
							type: "string",
							format: "date-time",
						},
						updatedAt: {
							type: "string",
							format: "date-time",
						},
					},
				},
				Booking: {
					type: "object",
					properties: {
						_id: { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0d" },
						student: { type: "string", description: "Student user ID" },
						tutor: { type: "string", description: "Tutor user ID" },
						course: { type: "string", description: "Course ID" },
						date: {
							type: "string",
							format: "date",
							example: "2026-04-15",
						},
						startTime: { type: "string", example: "10:00" },
						endTime: { type: "string", example: "11:00" },
						status: {
							type: "string",
							enum: ["pending", "confirmed", "cancelled", "completed"],
							example: "pending",
						},
						notes: {
							type: "string",
							example: "Need help with recursion",
						},
						createdAt: { type: "string", format: "date-time" },
						updatedAt: { type: "string", format: "date-time" },
					},
				},
				Course: {
					type: "object",
					properties: {
						_id: { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0d" },
						code: { type: "string", example: "CSCI-1300" },
						name: { type: "string", example: "Intro to Computer Science" },
						department: { type: "string", example: "Computer Science" },
						createdAt: { type: "string", format: "date-time" },
						updatedAt: { type: "string", format: "date-time" },
					},
				},
			},
		},
	},
	apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
