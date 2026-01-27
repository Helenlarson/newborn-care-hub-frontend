import client from "./client";

export async function apiLogin({ email, password }) {
  // SimpleJWT (pelo seu print, existe api/auth/token/)
  const { data } = await client.post("/api/auth/token/", { email, password });
  return {
    token: data.access,
    refresh: data.refresh,
    user: null,
  };
}

export async function apiSignup(payload) {
  const { data } = await client.post("/api/auth/signup/", payload);
  return data;
}

export async function apiMe() {
  const { data } = await client.get("/api/auth/me/");
  return data;
}
