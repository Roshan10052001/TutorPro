import { useState } from "react";

function StarRating({ value = 0, onChange, readOnly = false, size = 20 }) {
	const [hover, setHover] = useState(0);
	const display = hover || value;

	const stars = [1, 2, 3, 4, 5];

	return (
		<div
			className='star-rating'
			role={readOnly ? "img" : "radiogroup"}
			aria-label={`Rating: ${value} of 5`}>
			{stars.map((star) => {
				const filled = star <= display;
				const commonProps = {
					key: star,
					style: {
						fontSize: size,
						cursor: readOnly ? "default" : "pointer",
						color: filled ? "#f5a623" : "#d0d4da",
						background: "none",
						border: "none",
						padding: 0,
						lineHeight: 1,
					},
					"aria-label": `${star} star${star === 1 ? "" : "s"}`,
				};

				if (readOnly) {
					return (
						<span
							{...commonProps}
							role='presentation'>
							★
						</span>
					);
				}

				return (
					<button
						{...commonProps}
						type='button'
						onMouseEnter={() => setHover(star)}
						onMouseLeave={() => setHover(0)}
						onClick={() => onChange?.(star)}
						aria-checked={star === value}
						role='radio'>
						★
					</button>
				);
			})}
		</div>
	);
}

export default StarRating;
