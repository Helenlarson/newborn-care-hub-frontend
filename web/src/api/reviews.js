import client from "./client";

export async function apiCreateReview({ professional_id, rating, comment }) {
  const { data } = await client.post("/reviews/", {
    professional_id: Number(professional_id),
    rating: Number(rating),
    comment: String(comment),
  });
  return data;
}