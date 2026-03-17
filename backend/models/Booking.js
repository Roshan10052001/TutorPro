const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Student is required"]
    },
    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Tutor is required"]
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: [true, "Course is required"]
    },
    date: {
        type: Date,
        required: [true, "Booking date is required"]
    },
    startTime: {
        type: String,
        required: [true, "Start time is required"]
    },
    endTime: {
        type: String,
        required: [true, "End time is required"]
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "completed"],
        default: "pending"
    },
    notes: {
        type: String,
        maxLength: 500
    },
    timestamps: true
});

// prevent double-booking: same tutor, same date, same start time
bookingSchema.index({ tutor: 1, date: 1, startTime: 1}, {unique: true });

module.exports = mongoose.model("Booking", bookingSchema);
