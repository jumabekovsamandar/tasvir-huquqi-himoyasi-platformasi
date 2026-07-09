"use client";

/**
 * Yagona API mijozi. Token localStorage'da saqlanadi va har bir so'rovga
 * Authorization sarlavhasi sifatida qo'shiladi. 401 javobida sessiya
 * tozalanadi va foydalanuvchi login sahifasiga yo'naltiriladi.
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const TOKEN_KEY = "imagerights_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  formData?: FormData;
  signal?: AbortSignal;
};

function extractMessage(payload: unknown): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const m = (payload as { message: string | string[] }).message;
    return Array.isArray(m) ? m[0] : m;
  }
  return "Kutilmagan xatolik yuz berdi";
}

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method: opts.method ?? (opts.body !== undefined || opts.formData ? "POST" : "GET"),
      headers,
      body: opts.formData ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
      signal: opts.signal,
    });
  } catch {
    throw new ApiError(0, "Serverga ulanib bo‘lmadi. Internet aloqasini tekshiring.");
  }

  if (res.status === 401 && token) {
    setToken(null);
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
      window.location.href = "/auth/login?expired=1";
    }
  }

  if (res.status === 204) return undefined as T;

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, extractMessage(payload));
  }
  return payload as T;
}

/** Himoyalangan faylni blob sifatida yuklab olish (rasm preview, PDF). */
export async function apiBlob(path: string): Promise<Blob> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new ApiError(res.status, "Faylni yuklab bo‘lmadi");
  return res.blob();
}
