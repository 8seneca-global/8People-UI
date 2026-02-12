/**
 * Axios Instance - Mock Mode
 *
 * In mock mode, this axios instance is kept for compatibility but
 * API calls are replaced with mock data from the Zustand store.
 * The interceptors have been simplified/removed.
 */

import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// NOTE: In mock mode, this axios instance is not actively used.
// All data comes from the Zustand store in lib/store.ts
// Keeping this file for import compatibility.
