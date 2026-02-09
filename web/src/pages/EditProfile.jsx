import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiGetMyProfile, apiUpdateMyProfile } from "../api/me";

function isProviderRole(role) {
  return role === "provider" || role === "professional";
}

// ✅ aplica transformação na URL (não no upload)
function buildAvatarUrl(originalUrl) {
  if (!originalUrl) return "";
  if (originalUrl.includes("/upload/c_fill")) return originalUrl;

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

  // ✅ allowed in unsigned upload
  form.append("folder", "leliconect/avatars");

  const res = await fetch(url, { method: "POST", body: form });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data?.error?.message || "Failed to upload image to Cloudinary."
    );
  }

  return data.secure_url; // original URL (no transform)
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
  const [photo, setPhoto] = useState(""); // original URL

  // photo UI
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
      setError(`Image is too large. Please choose a file under ${maxMb}MB.`);
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPhotoPreview(localPreview);

    setPhotoUploading(true);
    setError("");
    setSuccess("");

    try {
      const originalUrl = await uploadToCloudinary(file);

      setPhoto(originalUrl); // save original url
      setPhotoPreview(buildAvatarUrl(originalUrl)); // show transformed preview

      setSuccess('Photo uploaded. Click "Save changes" to apply it to your profile.');
    } catch (err) {
      setError(err?.message || "Failed to upload image.");
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
        data?.detail || (data ? JSON.stringify(data, null, 2) : "Unable to save changes.")
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // STYLE (match Signup.jsx)
  // =========================
  const COLORS = {
    pageLeft: "#F2C9A9",
    pageMid: "#F7E6D6",
    pageRight: "#BFE3CF",
    card: "#FBF6EE",
    border: "rgba(40, 30, 25, 0.12)",
    text: "#2B2B2B",
    muted: "rgba(43, 43, 43, 0.62)",
    terracotta: "#B97A63",
    creamInput: "#F6EFE6",
    white: "#FFFFFF",
    successBg: "rgba(236, 253, 243, 0.85)",
    successBorder: "rgba(167, 243, 208, 1)",
    successText: "#065F46",
  };

  const page = {
    minHeight: "100vh",
    padding: "42px 16px",
    background: `linear-gradient(90deg, ${COLORS.pageLeft} 0%, ${COLORS.pageMid} 45%, ${COLORS.pageRight} 100%)`,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
    color: COLORS.text,
  };

  const shell = {
    maxWidth: 920,
    margin: "0 auto",
    display: "grid",
    placeItems: "center",
  };

  const card = {
    width: "100%",
    maxWidth: 760,
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    boxShadow: "0 12px 36px rgba(0,0,0,0.10)",
    padding: "28px 28px 26px",
  };

  const title = {
    fontSize: 28,
    fontWeight: 700,
    textAlign: "center",
    margin: "0 0 6px 0",
  };

  const subtitle = {
    textAlign: "center",
    margin: "0 0 24px 0",
    color: COLORS.muted,
    fontSize: 14,
  };

  const label = {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
  };

  const input = {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 10,
    border: `1px solid ${COLORS.border}`,
    background: COLORS.creamInput,
    outline: "none",
    fontSize: 14,
  };

  const row2 = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  };

  const sectionTitle = {
    fontSize: 16,
    fontWeight: 700,
    marginTop: 18,
    marginBottom: 10,
  };

  const box = {
    borderRadius: 14,
    border: `1px solid ${COLORS.border}`,
    background: COLORS.white,
    padding: 14,
  };

  const helpText = { fontSize: 12, color: COLORS.muted, marginTop: 8 };

  const button = (enabled) => ({
    width: "100%",
    marginTop: 18,
    padding: "13px 14px",
    borderRadius: 12,
    border: "none",
    background: enabled ? COLORS.terracotta : "rgba(185,122,99,0.45)",
    color: "white",
    fontWeight: 700,
    fontSize: 15,
    cursor: enabled ? "pointer" : "not-allowed",
    boxShadow: enabled ? "0 12px 26px rgba(185,122,99,0.30)" : "none",
  });

  const smallBtn = {
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${COLORS.border}`,
    background: COLORS.white,
    cursor: "pointer",
    fontWeight: 600,
  };

  const messageBox = (kind) => {
    const isOk = kind === "success";
    return {
      marginTop: 12,
      marginBottom: 12,
      borderRadius: 12,
      padding: 12,
      background: isOk ? COLORS.successBg : "rgba(254, 242, 242, 0.85)",
      border: `1px solid ${isOk ? COLORS.successBorder : "rgba(254, 202, 202, 1)"}`,
      color: isOk ? COLORS.successText : "crimson",
      fontSize: 13,
      whiteSpace: "pre-wrap",
    };
  };

  const avatarCircle = {
    width: 92,
    height: 92,
    borderRadius: "50%",
    border: `1px solid ${COLORS.border}`,
    background: "rgba(0,0,0,0.04)",
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
  };

  const canSave = !!displayName.trim() && !saving && !photoUploading;

  if (loading) {
    return (
      <div style={page}>
        <div style={shell}>
          <div style={card}>
            <h1 style={title}>Edit Profile</h1>
            <p style={subtitle}>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={page}>
      <div style={shell}>
        <div style={card}>
          <h1 style={title}>Edit Profile</h1>
          <p style={subtitle}>Keep your profile updated for families to find you.</p>

          {!!success && <div style={messageBox("success")}>{success}</div>}

          {!!error && <div style={messageBox("error")}>{error}</div>}

          <form onSubmit={onSave}>
            {/* BASIC INFO */}
            <div style={row2}>
              <div>
                <div style={label}>Display Name</div>
                <input
                  style={input}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              {isProvider ? (
                <div>
                  <div style={label}>Headline</div>
                  <input
                    style={input}
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g., Birth Doula"
                  />
                </div>
              ) : (
                <div />
              )}
            </div>

            {/* PROVIDER DETAILS */}
            {isProvider && (
              <>
                <div style={{ marginTop: 14 }}>
                  <div style={label}>Service types</div>
                  <input
                    style={input}
                    value={serviceTypesText}
                    onChange={(e) => setServiceTypesText(e.target.value)}
                    placeholder='e.g., "birth doula, postpartum doula"'
                  />
                  <div style={helpText}>Separate multiple values with commas.</div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <div style={label}>Bio</div>
                  <textarea
                    style={{ ...input, minHeight: 120, resize: "vertical" }}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell families about your experience and approach."
                  />
                </div>
              </>
            )}

            <div style={{ height: 14 }} />

            {/* LOCATION */}
            <div style={row2}>
              <div>
                <div style={label}>City</div>
                <input
                  style={input}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
              </div>

              <div>
                <div style={label}>State</div>
                <input
                  style={input}
                  value={stateUF}
                  onChange={(e) => setStateUF(e.target.value)}
                  placeholder="State (e.g., CO)"
                />
              </div>
            </div>

            <div style={{ height: 14 }} />

            <div>
              <div style={label}>Zipcode</div>
              <input
                style={input}
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                placeholder="Zipcode"
              />
            </div>

            {/* PHOTO */}
            <div style={sectionTitle}>Profile photo</div>
            <div style={box}>
              <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                <div style={avatarCircle}>
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ fontSize: 12, color: COLORS.muted }}>no photo</div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 240 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onPickPhoto}
                    disabled={photoUploading}
                  />
                  {photoUploading && <div style={helpText}>Uploading photo...</div>}
                  <div style={helpText}>
                    Tip: upload a photo first, then click "Save changes".
                  </div>
                </div>

                {photoPreview && (
                  <button
                    type="button"
                    style={smallBtn}
                    onClick={() => {
                      setPhoto("");
                      setPhotoPreview("");
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <button type="submit" disabled={!canSave} style={button(canSave)}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
