import axios from "axios";
import { getStoredUser } from "../storage";

import { baseUrl } from "./constant";

export async function getJWTHeader() {
	return { Authorization: `Bearer ${await getStoredUser()}` };
}

const config = { baseURL: baseUrl };
export const axiosInstance = axios.create(config);
