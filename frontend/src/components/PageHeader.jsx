import { Button } from "@/components/ui/button";

function PageHeader({ title, subtitle, buttonText, onClick, actions }) {
	return (
		<div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
			<div>
				<h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
					{title}
				</h1>
				{subtitle ? (
					<p className="mt-1 text-sm text-slate-500 sm:text-base">{subtitle}</p>
				) : null}
			</div>

			{actions
				? actions
				: buttonText && <Button onClick={onClick}>{buttonText}</Button>}
		</div>
	);
}

export default PageHeader;
