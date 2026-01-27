import { useEffect, useState } from "react";
import { apiMe } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

export default function EditProfile() {
  const { role, setUser } = useAuth();
  const [form, setForm] = useState({ display_name: "", city: "", zipcode: "", headline: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const me = await apiMe();
      // ajuste conforme seu backend retorna:
      setForm({
        display_name: me.display_name || "",
        city: me.city || "",
        zipcode: me.zipcode || "",
        headline: me.headline || "",
      });
      setLoading(false);
    })();
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    // ajuste endpoint:
    const { data } = await client.patch("/me", form);
    setUser((u) => ({ ...u, ...data }));
    alert("Saved!");
  };

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 560, margin: "24px auto", padding: 16 }}>
      <h2>Edit Profile</h2>

      <form onSubmit={save} style={{ display: "grid", gap: 12 }}>
        <input
          placeholder="Display name"
          value={form.display_name}
          onChange={(e) => update("display_name", e.target.value)}
        />

        {role === "family" && (
          <>
            <input placeholder="City" value={form.city} onChange={(e) => update("city", e.target.value)} />
            <input placeholder="Zipcode" value={form.zipcode} onChange={(e) => update("zipcode", e.target.value)} />
          </>
        )}

        {role === "provider" && (
          <>
            <input placeholder="Headline" value={form.headline} onChange={(e) => update("headline", e.target.value)} />
          </>
        )}

        <button type="submit">Save</button>
      </form>
    </div>
  );
}
