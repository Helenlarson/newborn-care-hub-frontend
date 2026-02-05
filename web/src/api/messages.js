import client from "./client";

function isProviderRole(role) {
  return role === "provider" || role === "professional";
}

// GET /api/family/inbox/ (family) | GET /api/inbox/ (provider)
export async function apiInbox(role) {
  const url = isProviderRole(role) ? "/inbox/" : "/family/inbox/";
  const { data } = await client.get(url);
  return data;
}

// GET /api/conversations/<id>/messages/
export async function apiConversationMessages(conversationId) {
  const { data } = await client.get(`/conversations/${conversationId}/messages/`);
  return data;
}

/**
 * Envio de mensagem:
 * - Se tiver conversation_id => responde na conversa: POST /conversations/<id>/messages/  (family/provider)
 * - Se NÃO tiver conversation_id => primeira mensagem: POST /contact/ (somente family, cria conversa se preciso)
 */
export async function apiSendMessage(payload) {
  const normalized = { ...payload };

  // normaliza campos de texto
  if (!normalized.message && normalized.body) normalized.message = normalized.body;
  if (!normalized.body && normalized.message) normalized.body = normalized.message;

  // 1) Responder conversa existente (rota correta para provider)
  const convId = normalized.conversation_id || normalized.conversationId;
  if (convId) {
    // nessa rota normalmente NÃO precisa professional_id
    const { conversation_id, conversationId, professional_id, ...rest } = normalized;

    // manda "body" e "message" para ser compatível com o backend
    const body = rest.body ?? rest.message ?? "";
    const toSend = { ...rest, body, message: body };

    const { data } = await client.post(`/conversations/${Number(convId)}/messages/`, toSend);
    return data;
  }

  // 2) Primeira mensagem (somente family)
  const { data } = await client.post("/contact/", normalized);
  return data;
}