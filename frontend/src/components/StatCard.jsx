import { Card, CardContent } from "@/components/ui/card";

function StatCard({ title, value, subtitle }) {
	return (
		<Card className="transition hover:-translate-y-0.5 hover:shadow-md">
			<CardContent className="p-5">
				<p className="text-sm font-semibold text-slate-500">{title}</p>
				<h2 className="mt-1 text-3xl font-extrabold text-slate-900">{value}</h2>
				{subtitle ? (
					<span className="mt-1 block text-sm text-slate-500">{subtitle}</span>
				) : null}
			</CardContent>
		</Card>
	);
}

export default StatCard;
