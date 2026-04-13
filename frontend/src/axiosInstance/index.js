import axios from "axios";
import { getStoredUser } from "../storage";

import { baseUrl } from "./constants";

export async function getJWTHeader() {
	const storedUser = getStoredUser();
	return storedUser?.token
		? { Authorization: `Bearer ${storedUser.token}` }
		: {};
}

const config = { baseURL: baseUrl };
export const axiosInstance = axios.create(config);
