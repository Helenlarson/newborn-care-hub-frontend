import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ex: http://127.0.0.1:8000/api
});

// --- Token helpers (mantém compat com "token" do seu código atual)
export function getAccessToken() {
  return localStorage.getItem("token") || localStorage.getItem("access") || null;
}
export function getRefreshToken() {
  return localStorage.getItem("refresh") || null;
}
export function setTokens({ access, refresh }) {
  if (access) {
    localStorage.setItem("token", access);   // compat (seu app usa "token")
    localStorage.setItem("access", access);  // opcional
  }
  if (refresh) localStorage.setItem("refresh", refresh);
}
export function clearTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

// --- Request: injeta Bearer token
client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Response: refresh automático quando 401
let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(error, token = null) {
  pendingQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  pendingQueue = [];
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // sem response / sem config => devolve
    if (!error.response || !original) throw error;

    // se não for 401 ou já tentamos retry, devolve
    if (error.response.status !== 401 || original._retry) throw error;

    const refresh = getRefreshToken();
    if (!refresh) throw error;

    // marca retry
    original._retry = true;

    // se já está refreshando, enfileira e aguarda
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(client(original));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      // SimpleJWT refresh
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/token/refresh/`,
        { refresh }
      );

      const newAccess = data.access;
      setTokens({ access: newAccess });

      resolveQueue(null, newAccess);

      original.headers.Authorization = `Bearer ${newAccess}`;
      return client(original);
    } catch (e) {
      resolveQueue(e, null);
      clearTokens();
      localStorage.removeItem("user");
      throw e;
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;