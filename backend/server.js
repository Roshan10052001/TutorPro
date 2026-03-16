const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const cookieParser = require("cookie-parser");

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

//Security Middleware

// Secure HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Prevent abuse / brute force
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests
	message: "Too many requests, please try again later.",
});

app.use(limiter);

//Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Logging (Development)
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

//Routes
// const authRoutes = require("./routes/auth");
// const tutorRoutes = require("./routes/tutor");
// const bookingRoutes = require("./routes/booking");

// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/tutors", tutorRoutes);
// app.use("/api/v1/bookings", bookingRoutes);

// Health check
app.get("/", (req, res) => {
	res.status(200).json({
		message: "SLU PeerTutor API is running",
	});
});

//404 handler
app.use((req, res) => {
	res.status(404).json({
		message: "Route not found",
	});
});

//Error Handler
app.use(errorHandler);

//Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
