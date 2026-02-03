import axios from "axios";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

import { useStore } from "./store";

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add the active role header to inform the backend which role view is active
  const { currentRole, activeRoleId } = useStore.getState();
  const activeRole = activeRoleId || currentRole;
  if (activeRole) {
    config.headers["x-active-role"] = activeRole;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors (e.g., 401 Unauthorized)
    // Handle global errors (e.g., 401 Unauthorized)
    if (error.response?.status === 401) {
      // Create a specific error for Login Failures vs Session Expiry
      const isLoginPage = window.location.pathname === "/login";

      if (!isLoginPage) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      // If on login page, we let the component handle the specific "Invalid credentials" error
    }
    return Promise.reject(error);
  }
);
