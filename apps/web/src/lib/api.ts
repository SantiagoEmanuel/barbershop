const BASE = import.meta.env.VITE_HOST as string;

export async function api<T = unknown>(
  endpoint: string,
  config: RequestInit = {},
): Promise<T | null> {
  const { headers, ...rest } = config;
  try {
    const res = await fetch(`${BASE}/api/${endpoint}`, {
      headers: {
        "content-type": "application/json",
        ...(headers as Record<string, string>),
      },
      credentials: "include",
      ...rest,
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(
        (json as { message?: string }).message ??
          "Error al obtener información",
      );
    }

    return (await res.json()) as T;
  } catch (err) {
    console.error("[api]", JSON.stringify(err));
    return null;
  }
}

/** Helper para requests con body JSON */
export function post<T = unknown>(endpoint: string, body: unknown) {
  return api<T>(endpoint, { method: "POST", body: JSON.stringify(body) });
}

export function put<T = unknown>(endpoint: string, body: unknown) {
  return api<T>(endpoint, { method: "PUT", body: JSON.stringify(body) });
}

export function del<T = unknown>(endpoint: string) {
  return api<T>(endpoint, { method: "DELETE" });
}
