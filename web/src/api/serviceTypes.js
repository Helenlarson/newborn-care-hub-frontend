import client from "./client";

export async function apiListServiceTypes() {
  const { data } = await client.get("/service-types/");
  return data;
}