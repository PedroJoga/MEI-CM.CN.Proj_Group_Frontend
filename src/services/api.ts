"use client"
import axios from "axios";
import { parseCookies } from "nookies";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export function setAuthToken(token: string) {
    api.defaults.headers["Authorization"] = `Bearer ${token}`;
}

const { "echochat.token": token } = parseCookies();

if (token) {
    setAuthToken(token);
}