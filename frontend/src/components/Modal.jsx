import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
	md: "sm:max-w-2xl",
	lg: "sm:max-w-4xl",
};

function Modal({ isOpen, title, onClose, children, footer, size = "md" }) {
	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose?.();
			}}>
			<DialogContent
				className={cn(
					"max-h-[calc(100vh-3rem)] overflow-y-auto",
					SIZE_CLASSES[size] ?? SIZE_CLASSES.md
				)}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div>{children}</div>
				{footer ? <DialogFooter>{footer}</DialogFooter> : null}
			</DialogContent>
		</Dialog>
	);
}

export default Modal;
