import axios from "axios";

export const auth_axios = axios.create({
  baseURL: process.env.REACT_APP_DEV_AUTH_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

const instance = axios.create({
  baseURL: process.env.REACT_APP_DEV_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
