import Layout from "../../components/Layout";
import BookingForm from "./BookingForm";
import { Card, CardContent } from "@/components/ui/card";

function BookSession() {
	return (
		<Layout
			page="Student"
			title="Book a Session"
			subtitle="Select an approved tutor and reserve one open time slot.">
			<Card>
				<CardContent className="p-6">
					<BookingForm />
				</CardContent>
			</Card>
		</Layout>
	);
}

export default BookSession;
