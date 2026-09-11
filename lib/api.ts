export const API_URL = (process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "")).trim().replace(/\/+$/, "");

export type SharedState = { message: string; counter: number; updated_at: string };
export type Ping = { message: string; timestamp: string; service: string };
export type ApiResult<T> = { data: T; status: number; duration: number };

export async function request<T>(path: string, method = "GET", body?: unknown): Promise<ApiResult<T>> {
  if (!API_URL) throw new Error("Ajoute NEXT_PUBLIC_API_URL dans Vercel puis redéploie le front.");
  const start = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      cache: "no-store",
      signal: controller.signal,
      ...(body !== undefined ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) throw new Error(`Erreur HTTP ${response.status}. Vérifie les données envoyées et les logs de l’API.`);
    return { data: await response.json() as T, status: response.status, duration: Math.round(performance.now() - start) };
  } catch (error) {
    if (controller.signal.aborted) throw new Error("L’API n’a pas répondu en 15 s. Réessaie lorsqu’elle est démarrée.");
    if (error instanceof TypeError) throw new Error("API inaccessible. Vérifie son URL, son démarrage et ALLOWED_ORIGINS sur Railway.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
