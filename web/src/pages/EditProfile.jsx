import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiGetMyProfile, apiUpdateMyProfile } from "../api/me";

function isProviderRole(role) {
  return role === "provider" || role === "professional";
}

// ✅ aplica transformação na URL (não no upload)
function buildAvatarUrl(originalUrl) {
  if (!originalUrl) return "";
  // Evita duplicar transformação se já tiver
  if (originalUrl.includes("/upload/c_fill")) return originalUrl;

  // Insere transformação logo após "/upload/"
  return originalUrl.replace(
    "/upload/",
    "/upload/c_fill,g_face,w_256,h_256,q_auto,f_auto/"
  );
}

async function uploadToCloudinary(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);

  // ✅ permitido no unsigned
  form.append("folder", "leliconect/avatars");

  // ❌ NÃO pode em unsigned:
  // form.append("transformation", "c_fill,g_face,w_256,h_256,q_auto,f_auto");

  const res = await fetch(url, { method: "POST", body: form });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data?.error?.message || "Failed to upload image to Cloudinary."
    );
  }

  // Retorna a URL original (sem transformação no upload)
  return data.secure_url;
}

export default function EditProfile() {
  const { role } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // fields
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState(""); // provider
  const [serviceTypesText, setServiceTypesText] = useState(""); // provider
  const [city, setCity] = useState("");
  const [stateUF, setStateUF] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [bio, setBio] = useState(""); // provider
  const [photo, setPhoto] = useState(""); // URL (original)

  // foto UI
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);

  const isProvider = useMemo(() => isProviderRole(role), [role]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const data = await apiGetMyProfile(role);
        const profile = data?.profile ?? data;

        setDisplayName(profile?.display_name || "");
        setHeadline(profile?.headline || "");
        setCity(profile?.city || "");
        setStateUF(profile?.state || "");
        setZipcode(profile?.zipcode || "");
        setBio(profile?.bio || "");

        const photoUrl = profile?.photo || "";
        setPhoto(photoUrl);

        // ✅ preview com transformação na URL
        setPhotoPreview(buildAvatarUrl(photoUrl));

        const st = profile?.service_types;
        setServiceTypesText(Array.isArray(st) ? st.join(", ") : "");
      } catch (err) {
        const data = err?.response?.data;
        setError(
          data?.detail ||
            (data ? JSON.stringify(data, null, 2) : "Unable to load your profile.")
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [role]);

  async function onPickPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxMb = 2;
    if (file.size > maxMb * 1024 * 1024) {
      alert(`Arquivo muito grande. Use até ${maxMb}MB.`);
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPhotoPreview(localPreview);

    setPhotoUploading(true);
    setError("");
    setSuccess("");

    try {
      const originalUrl = await uploadToCloudinary(file);

      // ✅ salva a URL "crua" no backend
      setPhoto(originalUrl);

      // ✅ exibe versão avatar no preview
      setPhotoPreview(buildAvatarUrl(originalUrl));

      setSuccess("Photo uploaded successfully. Click \"Save changes\" to apply it to your profile.");
    } catch (err) {
      alert(err?.message || "Failed to upload image.");
      // volta para a foto anterior (com transformação)
      setPhotoPreview(buildAvatarUrl(photo || ""));
    } finally {
      setPhotoUploading(false);
      try {
        URL.revokeObjectURL(localPreview);
      } catch {}
    }
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const service_types = serviceTypesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const profilePayload = {
      display_name: displayName.trim(),
      city: city.trim(),
      state: stateUF.trim(),
      zipcode: zipcode.trim(),

      // ✅ manda a URL original (sem transformação)
      photo: photo || "",

      ...(isProvider
        ? {
            headline: headline.trim(),
            service_types,
            bio: bio.trim(),
          }
        : {}),
    };

    try {
      await apiUpdateMyProfile(role, profilePayload);
      setSuccess("Changes saved successfully!");
      setTimeout(() => setSuccess(""), 3500);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const data = err?.response?.data;
      setError(
        data?.detail || (data ? JSON.stringify(data, null, 2) : "Não foi possível salvar.")
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Carregando perfil...</div>;

  return (
    <div style={{ maxWidth: 700, margin: "24px auto", padding: 16 }}>
      <h2>Editar perfil</h2>

      {!!success && (
        <div
          style={{
            background: "#ECFDF3",
            border: "1px solid #A7F3D0",
            color: "#065F46",
            padding: 12,
            borderRadius: 8,
            marginTop: 12,
            marginBottom: 12,
          }}
        >
          {success}
        </div>
      )}

      {!!error && (
        <pre style={{ color: "crimson", whiteSpace: "pre-wrap", marginTop: 12 }}>
          {error}
        </pre>
      )}

      <form onSubmit={onSave} style={{ display: "grid", gap: 12, marginTop: 12 }}>
        <input
          placeholder="Nome de exibição"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        {isProvider && (
          <>
            <input
              placeholder="Headline (ex: Doula)"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />

            <input
              placeholder='Service types (ex: "doula, newborn care specialist")'
              value={serviceTypesText}
              onChange={(e) => setServiceTypesText(e.target.value)}
            />

            <textarea
              placeholder="Bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <input placeholder="State" value={stateUF} onChange={(e) => setStateUF(e.target.value)} />
        </div>

        <input placeholder="Zipcode" value={zipcode} onChange={(e) => setZipcode(e.target.value)} />

        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontWeight: 600 }}>Profile photo</label>

          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Preview"
              style={{
                width: 96,
                height: 96,
                borderRadius: 999,
                objectFit: "cover",
                border: "1px solid #eee",
              }}
            />
          ) : (
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 999,
                border: "1px solid #eee",
                display: "grid",
                placeItems: "center",
                opacity: 0.6,
              }}
            >
              no photo
            </div>
          )}

          <input type="file" accept="image/*" onChange={onPickPhoto} disabled={photoUploading} />
          {photoUploading && <div style={{ fontSize: 13, opacity: 0.7 }}>Uploading photo...</div>}
        </div>

        <button type="submit" disabled={saving || photoUploading || !displayName.trim()}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}