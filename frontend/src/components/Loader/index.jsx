import { Loader2 } from "lucide-react";

const Loader = () => {
	return (
		<div className="flex flex-col items-center justify-center gap-3 py-10">
			<Loader2 className="h-10 w-10 animate-spin text-blue-600" />
			<p className="text-sm font-medium text-slate-500">Loading....</p>
		</div>
	);
};

export default Loader;
