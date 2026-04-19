import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_VARIANTS = {
	booked: "bg-blue-100 text-blue-800",
	confirmed: "bg-emerald-100 text-emerald-800",
	approved: "bg-emerald-100 text-emerald-800",
	pending: "bg-amber-100 text-amber-800",
	open: "bg-sky-100 text-sky-800",
	rejected: "bg-rose-100 text-rose-800",
};

function SessionCard({ course, tutor, time, status }) {
	const key = (status || "").toLowerCase();
	return (
		<div className="flex items-center justify-between gap-4 border-b border-slate-200/60 py-4 last:border-0 transition hover:bg-slate-50/60">
			<div>
				<h3 className="text-base font-semibold text-slate-900">{course}</h3>
				<p className="text-sm text-slate-500">{tutor}</p>
			</div>

			<div className="flex flex-col items-end gap-1.5">
				<p className="text-sm text-slate-600">{time}</p>
				<Badge
					variant="secondary"
					className={cn("font-semibold", STATUS_VARIANTS[key])}>
					{status}
				</Badge>
			</div>
		</div>
	);
}

export default SessionCard;
