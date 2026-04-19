import Layout from "../../components/Layout";
import BookingForm from "./BookingForm";
import "./styles.css";

function BookSession() {
	return (
		<Layout
			page='Student'
			title='Book a Session'
			subtitle='Select an approved tutor and reserve one open time slot.'>
			<section className='dashboard-panel form-panel enhanced-panel'>
				<BookingForm />
			</section>
		</Layout>
	);
}

export default BookSession;
