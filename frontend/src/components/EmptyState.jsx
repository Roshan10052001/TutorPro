import { Card, CardContent } from "@/components/ui/card";

function EmptyState({ title, text }) {
	return (
		<Card>
			<CardContent className="flex flex-col items-center justify-center gap-2 p-10 text-center">
				<h3 className="text-lg font-semibold text-slate-900">{title}</h3>
				<p className="text-sm text-slate-500">{text}</p>
			</CardContent>
		</Card>
	);
}

export default EmptyState;
