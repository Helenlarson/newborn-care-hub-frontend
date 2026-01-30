import client from "./client";

function serializeParams(params) {
  const usp = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) v.forEach((item) => usp.append(k, String(item)));
    else usp.append(k, String(v));
  });
  return usp.toString();
}

export async function apiListProviders(params) {
  // backend: /api/professionals/
  // tenta mandar tanto "q" quanto "search" para facilitar compat com o backend
  const merged = {
    ...params,
    search: params?.q || params?.search,
  };

  const query = serializeParams(merged);
  const { data } = await client.get(`/professionals/${query ? `?${query}` : ""}`);
  return data;
}

export async function apiGetProvider(id) {
  const { data } = await client.get(`/professionals/${id}/`);
  return data;
}

export async function apiListProviderReviews(id) {
  const { data } = await client.get(`/professionals/${id}/reviews/`);
  return data;
}