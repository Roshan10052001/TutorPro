import AppRoutes from "./routes";
import "./styles/pages.css";
import { Toaster } from "@/components/ui/sonner";

function App() {
	return (
		<>
			<AppRoutes />
			<Toaster position="top-right" richColors closeButton />
		</>
	);
}

export default App;
