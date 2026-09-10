import axios from "axios";

// Same-origin: o Next.js (app/api/[...path]) repassa a chamada ao backend, injetando o token.
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiData = error.response?.data;

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
