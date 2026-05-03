import { useContext } from "react";
import { Button } from "@/components/ui/button";
import NotificationBell from "./NotificationBell";
import { AuthContext } from "../context";

function PageHeader({ title, subtitle, buttonText, onClick, actions }) {
	const { user } = useContext(AuthContext);
	const displayName = user?.name?.trim();

	return (
		<div className='mb-6 flex flex-col items-start justify-between gap-4 rounded-[28px] border border-white/70 bg-white/75 px-5 py-5 shadow-lg shadow-slate-200/50 backdrop-blur sm:flex-row sm:items-center sm:px-6'>
			<div>
				<p className='text-xl font-semibold uppercase tracking-[0.24em] text-slate-400'>
					{displayName ? `Welcome, ${displayName}` : "Workspace overview"}
				</p>
				<h1 className='mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl'>
					{title}
				</h1>
				{subtitle ? (
					<p className='mt-1 max-w-2xl text-sm text-slate-500 sm:text-base'>
						{subtitle}
					</p>
				) : null}
			</div>

			<div className='flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto'>
				<NotificationBell />
				{actions
					? actions
					: buttonText && <Button onClick={onClick}>{buttonText}</Button>}
			</div>
		</div>
	);
}

export default PageHeader;
