function PageHeader({ title, subtitle, buttonText, onClick, actions }) {
	return (
		<div className='dashboard-header'>
			<div>
				<h1>{title}</h1>
				{subtitle ? <p>{subtitle}</p> : null}
			</div>

			{actions
				? actions
				: buttonText && (
						<button
							className='primary-btn'
							onClick={onClick}>
							{buttonText}
						</button>
					)}
		</div>
	);
}

export default PageHeader;
