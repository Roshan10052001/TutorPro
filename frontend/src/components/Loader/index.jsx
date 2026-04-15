import * as React from "react";
import { Rings } from "react-loader-spinner";
import "./styles.css";

const Loader = () => {
	return (
		<div className='loader'>
			<Rings
				visible={true}
				height='80'
				width='80'
				color='#ffcc00'
				ariaLabel='rings-loading'
				wrapperStyle={{}}
				wrapperClass=''
			/>
			<p>Loading....</p>
		</div>
	);
};

export default Loader;
