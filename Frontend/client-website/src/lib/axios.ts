// libs/axios.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import useAuthStore from "@/stores/useAuthStore";

const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8088/api/v1"
    : "/api/v1";

const privateClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/* ---------- Refresh queue ---------- */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token?: string | null) => void;
  reject: (err?: any) => void;
}> = [];

const processQueue = (err: any, token: string | null = null) => {
  failedQueue.forEach((p) => (err ? p.reject(err) : p.resolve(token)));
  failedQueue = [];
};

/* ---------- Helpers re: paths ---------- */
const isAuthPagePath = (path: string) =>
  path.startsWith("/user/login") ||
  path.startsWith("/user/signup") ||
  path.startsWith("/user/forgot-password") ||
  path.startsWith("/user/reset-password") ||
  path.startsWith("/user/authenticate");

const isRefreshUrl = (url?: string) => !!url && url.includes("/auth/refresh");

/* ---------- Request interceptor: read token from Zustand ---------- */
privateClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // only in browser
    if (typeof window !== "undefined") {
      const token = useAuthStore.getState().accessToken;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (err) => Promise.reject(err)
);

/* ---------- Response interceptor: handle 401 + refresh ---------- */
privateClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If client-side and on auth pages or calling refresh endpoint -> clear token and reject
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (isAuthPagePath(path) || isRefreshUrl(originalRequest.url)) {
        // Clear only token in store (avoid calling logout() which may call this axios again)
        try {
          useAuthStore.getState().setAccessToken(null);
        } catch {
          /* ignore */
        }
        return Promise.reject(error);
      }
    }

    // If already refreshing, queue subsequent requests
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers && token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return privateClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const resp = await privateClient.get("/auth/refresh");
      const newToken = (resp.data as any)?.accesstoken || null;

      // update Zustand token (this will also be persisted by your persist middleware)
      try {
        useAuthStore.getState().setAccessToken(newToken);
      } catch {
        // swallow errors reading/setting store
      }

      processQueue(null, newToken);

      if (originalRequest.headers && newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return privateClient(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);

      // Clear token in Zustand; do not call logout() to avoid loops.
      try {
        useAuthStore.getState().setAccessToken(null);
      } catch {
        /* ignore */
      }

      // Optional: clear any other client-only data
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("cart-storage");
        }
      } catch {}

      if (typeof window !== "undefined") {
        window.location.replace("/user/login");
      }

      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default privateClient;
