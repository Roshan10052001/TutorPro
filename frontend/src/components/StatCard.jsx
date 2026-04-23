import { Activity, CalendarDays, GraduationCap, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ICONS = {
	default: Activity,
	academics: GraduationCap,
	schedule: CalendarDays,
	trust: ShieldCheck,
};

const TONES = {
	default: "from-white to-slate-50 text-slate-900",
	blue: "from-blue-600 to-cyan-500 text-white",
	indigo: "from-indigo-600 to-blue-600 text-white",
	emerald: "from-emerald-600 to-teal-500 text-white",
};

function StatCard({ title, value, subtitle, tone = "default", icon = "default" }) {
	const Icon = ICONS[icon] || ICONS.default;
	const isColored = tone !== "default";

	return (
		<Card
			className={cn(
				"overflow-hidden border-white/70 bg-gradient-to-br shadow-lg shadow-slate-200/60 transition hover:-translate-y-0.5 hover:shadow-xl",
				TONES[tone] || TONES.default
			)}>
			<CardContent className="p-5">
				<div className="flex items-start justify-between gap-4">
					<div>
						<p
							className={cn(
								"text-sm font-semibold",
								isColored ? "text-white/80" : "text-slate-500"
							)}>
							{title}
						</p>
						<h2
							className={cn(
								"mt-1 text-3xl font-extrabold",
								isColored ? "text-white" : "text-slate-900"
							)}>
							{value}
						</h2>
					</div>
					<div
						className={cn(
							"inline-flex h-11 w-11 items-center justify-center rounded-2xl",
							isColored ? "bg-white/15 text-white" : "bg-blue-50 text-blue-600"
						)}>
						<Icon className="h-5 w-5" />
					</div>
				</div>
				{subtitle ? (
					<span
						className={cn(
							"mt-3 block text-sm",
							isColored ? "text-white/80" : "text-slate-500"
						)}>
						{subtitle}
					</span>
				) : null}
			</CardContent>
		</Card>
	);
}

export default StatCard;
