export const getNextDateForDay = (dayName, startTime = "") => {
	const days = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];

	const today = new Date();
	const todayDay = today.getDay();
	const targetDay = days.indexOf(dayName);
	let diff = targetDay - todayDay;

	if (diff < 0) diff += 7;

	// If the chosen day is today but the selected start time has already passed,
	// move the booking to the next week's occurrence of that day instead.
	if (diff === 0 && startTime) {
		const selectedMinutes = convertTimeToMinutes(startTime);
		const currentMinutes = today.getHours() * 60 + today.getMinutes();

		if (selectedMinutes <= currentMinutes) {
			diff = 7;
		}
	}

	const result = new Date(today);
	result.setDate(today.getDate() + diff);
	result.setHours(0, 0, 0, 0);
	return result;
};

export const convertTimeToMinutes = (timeString) => {
	const [time, modifier] = timeString.split(" ");
	let [hours, minutes] = time.split(":").map(Number);

	if (modifier === "PM" && hours !== 12) hours += 12;
	if (modifier === "AM" && hours === 12) hours = 0;

	return hours * 60 + minutes;
};

export const convertMinutesToTime = (totalMinutes) => {
	let hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	const modifier = hours >= 12 ? "PM" : "AM";

	hours = hours % 12;
	if (hours === 0) hours = 12;

	return `${hours}:${String(minutes).padStart(2, "0")} ${modifier}`;
};

export const buildSlotLabel = (slotForm) => ({
	day: slotForm.day,
	startTime: `${slotForm.hour}:${slotForm.minute} ${slotForm.period}`,
	endTime: `${slotForm.endHour}:${slotForm.endMinute} ${slotForm.endPeriod}`,
	sessionLengthMinutes: Number(slotForm.sessionLengthMinutes),
});

export const convertToMinutes = (timeString) => {
	const [time, modifier] = timeString.split(" ");
	let [hours, minutes] = time.split(":").map(Number);
	if (modifier === "PM" && hours !== 12) hours += 12;
	if (modifier === "AM" && hours === 12) hours = 0;
	return hours * 60 + minutes;
};
