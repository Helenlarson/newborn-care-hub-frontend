import client, { setTokens } from "./client";

// SimpleJWT: POST /api/auth/token/  -> {access, refresh}
export async function apiLogin({ email, password }) {
  const { data } = await client.post("/auth/token/", { email, password });

  const access = data.access || data.token || null;
  const refresh = data.refresh || null;

  if (access) setTokens({ access, refresh });

  return { access, refresh, raw: data };
}

// POST /api/auth/signup/
export async function apiSignup(payload) {
  const { data } = await client.post("/auth/signup/", payload);
  return data;
}

// GET /api/auth/me/
export async function apiMe() {
  const { data } = await client.get("/auth/me/");
  return data;
}