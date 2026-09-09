import axios from "axios";

export const API = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// takes token and set it to header to each api call if available otherwise delete
export function setToken(token) {
  if (token) API.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete API.defaults.headers.common.Authorization;
}
