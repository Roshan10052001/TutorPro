import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AuthContext } from "../context";
import {
	useGetNotifications,
	useMarkNotificationRead,
	useMarkAllNotificationsRead,
} from "../hooks/notification";

function formatRelativeTime(iso) {
	if (!iso) return "";
	const diffMs = Date.now() - new Date(iso).getTime();
	const mins = Math.floor(diffMs / 60000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}

function getFallbackNotificationPath(notification, effectiveRole) {
	if (notification.type === "booking_created") {
		return "/tutor/sessions";
	}

	if (
		notification.type === "booking_status_updated" ||
		notification.type === "booking_cancelled"
	) {
		return "/student/sessions";
	}

	if (notification.type === "tutor_application_submitted") {
		return "/admin/tutor-applications";
	}

	if (notification.type === "tutor_application_decision") {
		return effectiveRole === "tutor"
			? "/tutor/tutor-apply"
			: "/student/tutor-apply";
	}

	return `/${effectiveRole}/dashboard`;
}

function getNotificationPath(notification, effectiveRole) {
	const targetPath = notification.targetPath?.trim();

	if (targetPath && /^\/[^/]/.test(targetPath)) {
		return targetPath;
	}

	return getFallbackNotificationPath(notification, effectiveRole);
}

function NotificationBell() {
	const { isAuthenticated, user, effectiveRole, switchView } =
		useContext(AuthContext);
	const navigate = useNavigate();
	const canShowNotifications =
		isAuthenticated && ["student", "tutor", "admin"].includes(effectiveRole);
	const { data } = useGetNotifications(canShowNotifications);
	const { mutate: markRead } = useMarkNotificationRead();
	const { mutate: markAllRead } = useMarkAllNotificationsRead();

	if (!canShowNotifications) return null;

	const items = data?.items ?? [];
	const unreadCount = data?.unreadCount ?? 0;

	const handleItemClick = (notification) => {
		if (!notification.read) markRead(notification._id);

		const targetPath = getNotificationPath(notification, effectiveRole);
		// Coupled to backend targetPath prefixes: controller code emits /tutor or
		// /student paths so dual-role users switch into the matching view first.
		if (user?.role === "tutor" && targetPath.startsWith("/tutor")) {
			switchView("tutor");
		} else if (user?.role === "tutor" && targetPath.startsWith("/student")) {
			switchView("student");
		}

		navigate(targetPath);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
					aria-label="Notifications">
					<Bell className="h-5 w-5" />
					{unreadCount > 0 ? (
						<span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-semibold text-white">
							{unreadCount > 9 ? "9+" : unreadCount}
						</span>
					) : null}
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-80">
				<DropdownMenuLabel className="flex items-center justify-between">
					<span>Notifications</span>
					{unreadCount > 0 ? (
						<button
							type="button"
							className="text-xs font-medium text-blue-600 hover:underline"
							onClick={(e) => {
								e.preventDefault();
								markAllRead();
							}}>
							Mark all read
						</button>
					) : null}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<div className="max-h-[240px] overflow-y-auto">
					{items.length === 0 ? (
						<div className="px-3 py-6 text-center text-sm text-slate-500">
							No notifications yet
						</div>
					) : (
						items.map((notification) => (
							<DropdownMenuItem
								key={notification._id}
								onSelect={() => handleItemClick(notification)}
								className="flex cursor-pointer flex-col items-start gap-0.5 py-2">
								<div className="flex w-full items-center justify-between gap-2">
									<span className="text-sm font-semibold text-slate-900">
										{notification.title}
									</span>
									{!notification.read ? (
										<span className="h-2 w-2 rounded-full bg-blue-500" />
									) : null}
								</div>
								<span className="text-xs text-slate-600 line-clamp-2">
									{notification.message}
								</span>
								<span className="text-[10px] text-slate-400">
									{formatRelativeTime(notification.createdAt)}
								</span>
							</DropdownMenuItem>
						))
					)}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default NotificationBell;
