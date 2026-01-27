import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGetProvider } from "../api/providers";
import { apiCreateReview } from "../api/reviews";
import { useAuth } from "../context/AuthContext";

export default function ProviderDetail() {
  const { id } = useParams();
  const { role } = useAuth();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // add review
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGetProvider(id);
      setProvider(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not load provider.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiCreateReview(id, { rating: Number(rating), comment });
      setComment("");
      setRating(5);
      await load(); // recarrega pra mostrar o review novo
    } catch (err) {
      alert(err?.response?.data?.detail || "Could not create review.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (error) return <div style={{ padding: 16, color: "crimson" }}>{error}</div>;
  if (!provider) return null;

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h2>{provider.display_name}</h2>
      <div style={{ opacity: 0.8 }}>{provider.headline}</div>
      <div style={{ marginTop: 8 }}>
        {(provider.service_types || []).join(", ")}
      </div>

      <hr style={{ margin: "24px 0" }} />

      <h3>Reviews</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {(provider.reviews || []).map((r) => (
          <div key={r.id} style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
            <div><b>Rating:</b> {r.rating}</div>
            <div style={{ opacity: 0.8 }}>{r.comment}</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>{r.created_at}</div>
          </div>
        ))}
        {(!provider.reviews || provider.reviews.length === 0) && <div>No reviews yet.</div>}
      </div>

      {role === "family" && (
        <>
          <hr style={{ margin: "24px 0" }} />
          <h3>Add a review</h3>
          <form onSubmit={submitReview} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
            <label>
              Rating
              <select value={rating} onChange={(e) => setRating(e.target.value)}>
                {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <textarea
              placeholder="Write your feedback..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
            <button disabled={saving} type="submit">
              {saving ? "Saving..." : "Submit review"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
