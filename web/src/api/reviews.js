import client from "./client";

export async function apiCreateReview(providerId, payload) {
  const { data } = await client.post(`/providers/${providerId}/reviews`, payload);
  return data;
}
