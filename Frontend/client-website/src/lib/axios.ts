import axios, { AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8088/api/v1";

const privateClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // gửi cookie với mỗi request
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;

privateClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalRequest = error.config as any;

    // Nếu token hết hạn
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) return Promise.reject(error);

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await privateClient.post("/auth/refresh");
        return privateClient(originalRequest); // gọi lại request gốc
      } catch (err) {
        if (typeof window !== "undefined") {
          window.location.href = "/user/login";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default privateClient;