import { useEffect } from "react";

function Modal({
	isOpen,
	title,
	onClose,
	children,
	footer,
	size = "md",
}) {
	useEffect(() => {
		if (!isOpen) return undefined;

		function handleEscape(event) {
			if (event.key === "Escape") {
				onClose();
			}
		}

		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", handleEscape);

		return () => {
			document.body.style.overflow = "";
			window.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			className='modal-overlay'
			onClick={onClose}>
			<div
				className={`modal-card modal-${size}`}
				onClick={(event) => event.stopPropagation()}>
				<div className='modal-header'>
					<div>
						<h2>{title}</h2>
					</div>
					<button
						type='button'
						className='modal-close-btn'
						onClick={onClose}
						aria-label='Close modal'>
						×
					</button>
				</div>
				<div className='modal-body'>{children}</div>
				{footer ? <div className='modal-footer'>{footer}</div> : null}
			</div>
		</div>
	);
}

export default Modal;
