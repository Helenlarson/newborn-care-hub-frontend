import client from "./client";

function isProviderRole(role) {
  return role === "provider" || role === "professional"; // UI pode ser professional
}

export async function apiGetMyProfile(role) {
  const url = isProviderRole(role) ? "/professionals/me/" : "/family/me/";
  const { data } = await client.get(url);
  return data;
}

export async function apiUpdateMyProfile(role, payload) {
  const url = isProviderRole(role) ? "/professionals/me/" : "/family/me/";
  const { data } = await client.patch(url, payload);
  return data;
}