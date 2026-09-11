import axios from "axios";

// Same-origin: o Next.js (app/api/[...path]) repassa a chamada ao backend, injetando o token.
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const apiData = error.response?.data;
    const originalRequest = error.config;

    if (error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh"
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshApi
            .post("/auth/refresh")
            .then(() => undefined)
            .finally(() => {
              refreshPromise = null;
            })
        }

        await refreshPromise;

        return api(originalRequest);
      } catch (error) {
        return Promise.reject(error);
      }
    }  

    if (apiData) {
      const rawMessage = apiData.message || apiData.error;

      if (rawMessage) {
        const message = Array.isArray(rawMessage)
          ? rawMessage.join(", ")
          : rawMessage;

        error.message = message;
      }
    }

    return Promise.reject(error);
  }
);
