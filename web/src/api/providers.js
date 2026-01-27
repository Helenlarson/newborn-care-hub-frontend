import client from "./client";

export async function apiListProviders(params) {
  // params: q, zipcode, city, state, service_types (array)
  const { data } = await client.get("/providers", { params });
  return data;
}

export async function apiGetProvider(id) {
  const { data } = await client.get(`/providers/${id}`);
  return data;
}
