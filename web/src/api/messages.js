import client from "./client";

export async function apiListMessages() {
  const { data } = await client.get("/messages");
  return data;
}
