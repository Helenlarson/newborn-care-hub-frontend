import client from "./client";

// GET /api/family/inbox/ (familiar) | GET /api/inbox/ (professional)
export async function apiInbox(role) {
  const url = role === "professional" ? "/inbox/" : "/family/inbox/";
  const { data } = await client.get(url);
  return data;
}

// GET /api/conversations/<id>/messages/
export async function apiConversationMessages(conversationId) {
  const { data } = await client.get(`/conversations/${conversationId}/messages/`);
  return data;
}

// POST /api/contact/

export async function apiSendMessage(payload) {
  const normalized = { ...payload };

  // garante message e body sempre que possível
  if (!normalized.message && normalized.body) normalized.message = normalized.body;
  if (!normalized.body && normalized.message) normalized.body = normalized.message;

  const { data } = await client.post("/contact/", normalized);
  return data;
}