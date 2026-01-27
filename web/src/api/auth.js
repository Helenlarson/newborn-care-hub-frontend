import client from "./client";

// Ajuste nomes/rotas para o seu backend:
export async function apiLogin({ email, password }) {
  const { data } = await client.post("/auth/login", { email, password });
  // esperado: { token, user: { role, ... } }
  return data;
}

export async function apiSignup(payload) {
  // payload deve incluir role + dados do user + dados do profile
  const { data } = await client.post("/auth/signup", payload);
  return data;
}

export async function apiMe() {
  const { data } = await client.get("/me");
  return data;
}
