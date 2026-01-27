import client from "./client";

/**
 * LOGIN
 * - Se seu backend for SimpleJWT: retorna { access, refresh }
 * - Se seu backend for custom: pode retornar { token, user }
 */
export async function apiLogin({ email, password }) {
  // tenta primeiro no endpoint que você escolheu
  const { data } = await client.post("/auth/login", { email, password });

  // Normaliza retorno para o frontend:
  // - token: usa data.token OU data.access
  // - refresh: data.refresh se existir
  // - user: data.user se existir (senão fica null e você pode buscar via apiMe)
  return {
    token: data.token || data.access || null,
    refresh: data.refresh || null,
    user: data.user || null,
    raw: data,
  };
}

export async function apiSignup(payload) {
  // POST /auth/signup
  const { data } = await client.post("/auth/signup", payload);
  return data;
}

export async function apiMe() {
  // GET /auth/me (corrigido)
  const { data } = await client.get("/auth/me");
  return data;
}
