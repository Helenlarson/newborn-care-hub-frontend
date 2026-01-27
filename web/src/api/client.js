const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function apiGet(path) {
    const res = await fetch(`${BASE_URL}${path}`);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
    const msg = data?.detail || data?.message || "Request failed";
    throw new Error(msg);
    }
    return data;
}
