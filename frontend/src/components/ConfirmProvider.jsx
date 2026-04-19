import { createContext, useCallback, useContext, useRef, useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ConfirmContext = createContext(null);

const defaultOptions = {
	title: "Confirmation",
	description: "",
	confirmText: "Yes",
	cancelText: "Cancel",
	variant: "default",
};

export function ConfirmProvider({ children }) {
	const [options, setOptions] = useState(defaultOptions);
	const [open, setOpen] = useState(false);
	const resolverRef = useRef(null);

	const confirm = useCallback((overrides = {}) => {
		setOptions({ ...defaultOptions, ...overrides });
		setOpen(true);
		return new Promise((resolve) => {
			resolverRef.current = resolve;
		});
	}, []);

	const handleCancel = () => {
		setOpen(false);
		resolverRef.current?.(false);
		resolverRef.current = null;
	};

	const handleConfirm = () => {
		setOpen(false);
		resolverRef.current?.(true);
		resolverRef.current = null;
	};

	return (
		<ConfirmContext.Provider value={confirm}>
			{children}
			<AlertDialog
				open={open}
				onOpenChange={(next) => {
					if (!next) handleCancel();
				}}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{options.title}</AlertDialogTitle>
						{options.description ? (
							<AlertDialogDescription>
								{options.description}
							</AlertDialogDescription>
						) : null}
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={handleCancel}>
							{options.cancelText}
						</AlertDialogCancel>
						<AlertDialogAction
							variant={options.variant}
							onClick={handleConfirm}>
							{options.confirmText}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</ConfirmContext.Provider>
	);
}

export function useConfirm() {
	const confirm = useContext(ConfirmContext);
	if (!confirm) {
		throw new Error("useConfirm must be used within ConfirmProvider");
	}
	return confirm;
}
