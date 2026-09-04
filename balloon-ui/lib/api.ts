import axios from "axios";

// Same-origin: o Next.js (app/api/[...path]) repassa a chamada ao backend, injetando o token.
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

