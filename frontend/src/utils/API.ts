import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // backend url
  withCredentials: true, // 🔥 THIS IS THE KEY
});

export default api;