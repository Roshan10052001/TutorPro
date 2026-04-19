import axios from "axios";
import { getStoredUser } from "../storage";
import { baseUrl } from "./constants";

const config = { baseURL: baseUrl };
export const axiosInstance = axios.create(config);

axiosInstance.interceptors.request.use((requestConfig) => {
	const token = getStoredUser()?.token;

	if (token) {
		requestConfig.headers = requestConfig.headers || {};
		requestConfig.headers.Authorization = `Bearer ${token}`;
	}

	return requestConfig;
});
