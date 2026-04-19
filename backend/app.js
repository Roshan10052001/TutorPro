const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const errorHandler = require("./middleware/error");

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Rate limiting — skip in test to avoid cross-test interference
if (process.env.NODE_ENV !== "test") {
	const limiter = rateLimit({
		windowMs: 15 * 60 * 1000,
		max: 100,
		message: "Too many requests, please try again later.",
	});
	app.use(limiter);
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging (skip in test)
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}
if (process.env.NODE_ENV !== "test") {
	app.use((req, res, next) => {
		console.log(`${req.method} ${req.originalUrl}`);
		next();
	});
}

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
const authRoutes = require("./routes/auth");
const tutorRoutes = require("./routes/tutor");
const bookingRoutes = require("./routes/booking");
const tutorApplicationRoutes = require("./routes/tutorApplication");
const userRoutes = require("./routes/user");
const reviewRoutes = require("./routes/review");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tutors", tutorRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/tutor-application", tutorApplicationRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/reviews", reviewRoutes);

// Health check
app.get("/", (req, res) => {
	res.status(200).json({
		message: "SLU PeerTutor API is running",
	});
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({
		message: "Route not found",
	});
});

// Error handler
app.use(errorHandler);

module.exports = app;
