export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const json = await res.json()
        return !!json?.success;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

async function request<T>(path: string, options: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = (await res.json().catch(() => ({
    success: false,
    message: `Request failed (${res.status})`,
  }))) as T;

  return { status: res.status, data };
}

export async function apiRequest<T>(endPoint: string, options: RequestInit = {}) {
  let result = await request<T>(endPoint, options);

  if (result.status === 401) {
    const refreshed = await refreshTokens();

    if (!refreshed) {
      return result;
    }

    result = await request<T>(endPoint, options);
  }

  return result;
}