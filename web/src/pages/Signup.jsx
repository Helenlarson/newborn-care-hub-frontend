import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiSignup } from "../api/auth";

function toApiRole(uiRole) {
  if (uiRole === "professional") return "provider";
  return uiRole; // "family"
}

const US_STATES = [
  { label: "Alabama", value: "AL" },
  { label: "Alaska", value: "AK" },
  { label: "Arizona", value: "AZ" },
  { label: "Arkansas", value: "AR" },
  { label: "California", value: "CA" },
  { label: "Colorado", value: "CO" },
  { label: "Connecticut", value: "CT" },
  { label: "Delaware", value: "DE" },
  { label: "Florida", value: "FL" },
  { label: "Georgia", value: "GA" },
  { label: "Hawaii", value: "HI" },
  { label: "Idaho", value: "ID" },
  { label: "Illinois", value: "IL" },
  { label: "Indiana", value: "IN" },
  { label: "Iowa", value: "IA" },
  { label: "Kansas", value: "KS" },
  { label: "Kentucky", value: "KY" },
  { label: "Louisiana", value: "LA" },
  { label: "Maine", value: "ME" },
  { label: "Maryland", value: "MD" },
  { label: "Massachusetts", value: "MA" },
  { label: "Michigan", value: "MI" },
  { label: "Minnesota", value: "MN" },
  { label: "Mississippi", value: "MS" },
  { label: "Missouri", value: "MO" },
  { label: "Montana", value: "MT" },
  { label: "Nebraska", value: "NE" },
  { label: "Nevada", value: "NV" },
  { label: "New Hampshire", value: "NH" },
  { label: "New Jersey", value: "NJ" },
  { label: "New Mexico", value: "NM" },
  { label: "New York", value: "NY" },
  { label: "North Carolina", value: "NC" },
  { label: "North Dakota", value: "ND" },
  { label: "Ohio", value: "OH" },
  { label: "Oklahoma", value: "OK" },
  { label: "Oregon", value: "OR" },
  { label: "Pennsylvania", value: "PA" },
  { label: "Rhode Island", value: "RI" },
  { label: "South Carolina", value: "SC" },
  { label: "South Dakota", value: "SD" },
  { label: "Tennessee", value: "TN" },
  { label: "Texas", value: "TX" },
  { label: "Utah", value: "UT" },
  { label: "Vermont", value: "VT" },
  { label: "Virginia", value: "VA" },
  { label: "Washington", value: "WA" },
  { label: "West Virginia", value: "WV" },
  { label: "Wisconsin", value: "WI" },
  { label: "Wyoming", value: "WY" },
];

// Only these 4
const ALLOWED_SERVICE_TYPE_KEYWORDS = [
  "birth doula",
  "postpartum doula",
  "newborn care specialist",
  "lactation consultant",
];

const ALLOWED_SERVICE_TYPE_SLUGS = new Set([
  "birth-doula",
  "postpartum-doula",
  "newborn-care-specialist",
  "lactation-consultant",
]);

function normalize(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function isAllowedServiceType(st) {
  const name = normalize(st?.name);
  const slug = normalize(st?.slug);

  if (ALLOWED_SERVICE_TYPE_SLUGS.has(slug)) return true;
  return ALLOWED_SERVICE_TYPE_KEYWORDS.some((kw) => name.includes(kw));
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("Failed to read file."));
    r.onload = () => resolve(r.result);
    r.readAsDataURL(file);
  });
}

function isDataUrlPhoto(s) {
  return typeof s === "string" && s.startsWith("data:image/");
}

export default function Signup() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const [role, setRole] = useState(sp.get("role") || ""); // family | professional

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipcode, setZipcode] = useState("");

  // provider
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");

  // photo
  const [photo, setPhoto] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);

  // service types
  const [serviceTypes, setServiceTypes] = useState([]);
  const [serviceTypesLoading, setServiceTypesLoading] = useState(false);
  const [serviceTypesError, setServiceTypesError] = useState("");

  const [selectedServiceTypeIds, setSelectedServiceTypeIds] = useState([]);
  const [familyLookingForIds, setFamilyLookingForIds] = useState([]);
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchServiceTypes() {
    const API = import.meta.env.VITE_API_URL; // e.g. http://127.0.0.1:8000
    const url = API ? `${API}/service-types/` : `/api/service-types/`;

    setServiceTypesLoading(true);
    setServiceTypesError("");

    try {
      const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Unable to load service types (${res.status}).`);
      }
      const data = await res.json();
      setServiceTypes(Array.isArray(data) ? data : []);
    } catch (e) {
      setServiceTypesError(e?.message || "Unable to load service types.");
      setServiceTypes([]);
    } finally {
      setServiceTypesLoading(false);
    }
  }

  useEffect(() => {
    if (role === "professional" || role === "family") {
      if (serviceTypes.length === 0 && !serviceTypesLoading) fetchServiceTypes();
    } else {
      setSelectedServiceTypeIds([]);
      setFamilyLookingForIds([]);
      setServiceTypesError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const filteredServiceTypes = useMemo(() => {
    return serviceTypes.filter(isAllowedServiceType);
  }, [serviceTypes]);

  function toggleId(id, setter) {
    const n = Number(id);
    setter((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));
  }

  const submitBlockReason = useMemo(() => {
    if (!role) return "Please choose whether you are a Family/Client or a Professional.";
    if (!displayName) return "Please enter your full name.";
    if (!email) return "Please enter your email.";
    if (!password) return "Please enter your password.";
    if (password !== confirmPassword) return "Passwords do not match.";

    if (role === "professional") {
      if (!headline) return "Please enter your headline.";
      if (selectedServiceTypeIds.length === 0) return "Please select at least one service type.";
    }
    return "";
  }, [role, displayName, email, password, confirmPassword, headline, selectedServiceTypeIds]);

  const canSubmit = !submitBlockReason && !loading;

  async function handlePhotoFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxMB = 2.5;
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxMB) {
      setError(`Image is too large. Please choose a file under ${maxMB}MB.`);
      return;
    }

    setError("");
    setPhotoLoading(true);

    try {
      const dataUrl = await fileToDataUrl(file);
      setPhoto(String(dataUrl));
      setPhotoPreview(String(dataUrl));
    } catch (err) {
      setError(err?.message || "Failed to process image.");
    } finally {
      setPhotoLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (submitBlockReason) {
      setError(submitBlockReason);
      return;
    }

    setLoading(true);

    try {
      const apiRole = toApiRole(role);

      // If base64, do NOT send to signup (backend expects URL). Save locally for later.
      const shouldDeferPhotoUpload = isDataUrlPhoto(photo);
      if (shouldDeferPhotoUpload) {
        try {
          localStorage.setItem(`pending_profile_photo_${email || "unknown"}`, photo);
        } catch {
          // ignore
        }
      }

      // Family extras saved locally (no backend changes)
      if (apiRole === "family") {
        try {
          const key = `nch_family_intake_${email || "unknown"}`;
          localStorage.setItem(
            key,
            JSON.stringify({
              looking_for_service_type_ids: familyLookingForIds,
              due_date: dueDate || null,
              saved_at: new Date().toISOString(),
            })
          );
        } catch {
          // ignore
        }
      }

      const payload = {
        role: apiRole,
        user: { email, password },
        profile:
          apiRole === "provider"
            ? {
                display_name: displayName,
                headline,
                service_type_ids: selectedServiceTypeIds,
                city,
                state,
                zipcode,
                bio,
                ...(shouldDeferPhotoUpload ? {} : { photo }),
              }
            : {
                display_name: displayName,
                city,
                state,
                zipcode,
                ...(shouldDeferPhotoUpload ? {} : { photo }),
              },
      };

      console.log("Signup payload:", payload);

      await apiSignup(payload);

      // ✅ SAFEST NAVIGATION: always go to login after signup to avoid blank page from missing routes.
      navigate("/login", { replace: true });
    } catch (err) {
      const data = err?.response?.data;
      console.log("Signup error:", data || err);

      const msg =
        data?.detail ||
        data?.message ||
        (data ? JSON.stringify(data, null, 2) : null) ||
        "Failed to create account.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // STYLE (reference)
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

  const select = { ...input, appearance: "none", background: COLORS.creamInput };

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

  const roleRow = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    marginBottom: 10,
  };

  const roleCard = (active) => ({
    borderRadius: 14,
    border: `2px solid ${active ? COLORS.terracotta : "rgba(43,43,43,0.12)"}`,
    background: COLORS.white,
    padding: "14px 14px",
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "34px 1fr",
    gap: 12,
    alignItems: "center",
    boxShadow: active ? "0 10px 22px rgba(185,122,99,0.18)" : "none",
    transition: "all 120ms ease",
  });

  const iconBubble = (active) => ({
    width: 34,
    height: 34,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: active ? "rgba(185,122,99,0.14)" : "rgba(0,0,0,0.04)",
    border: `1px solid ${active ? "rgba(185,122,99,0.35)" : "rgba(0,0,0,0.06)"}`,
    fontSize: 16,
  });

  const helpText = { fontSize: 12, color: COLORS.muted, marginTop: 8 };

  const box = {
    borderRadius: 14,
    border: `1px solid ${COLORS.border}`,
    background: COLORS.white,
    padding: 14,
  };

  const checkboxGrid = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 8,
  };

  const checkboxItem = {
    display: "flex",
    gap: 10,
    alignItems: "center",
    fontSize: 14,
  };

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

  return (
    <div style={page}>
      <div style={shell}>
        <div style={card}>
          <h1 style={title}>Sign Up for Newborn Care Hub</h1>
          <p style={subtitle}>Find the professional support your family needs</p>

          <form onSubmit={handleSubmit}>
            {/* ROLE */}
            <div style={label}>I am:</div>
            <div style={roleRow}>
              <div
                style={roleCard(role === "family")}
                onClick={() => setRole("family")}
                role="button"
                tabIndex={0}
              >
                <div style={iconBubble(role === "family")}>👨‍👩‍👧</div>
                <div>
                  <div style={{ fontWeight: 700 }}>Family / Client</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>
                    Looking for specialized professionals
                  </div>
                </div>
              </div>

              <div
                style={roleCard(role === "professional")}
                onClick={() => setRole("professional")}
                role="button"
                tabIndex={0}
              >
                <div style={iconBubble(role === "professional")}>🤍</div>
                <div>
                  <div style={{ fontWeight: 700 }}>Professional</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>
                    Expand your practice and connect with more families
                  </div>
                </div>
              </div>
            </div>

            {/* BASIC INFO */}
            <div style={row2}>
              <div>
                <div style={label}>Full Name</div>
                <input
                  style={input}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="First and Last name"
                />
              </div>

              <div>
                <div style={label}>E-mail</div>
                <input
                  style={input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div style={{ height: 14 }} />

            <div style={row2}>
              <div>
                <div style={label}>Password</div>
                <input
                  style={input}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <div style={label}>Confirm Password</div>
                <input
                  style={input}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div style={{ height: 14 }} />

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
                <select style={select} value={state} onChange={(e) => setState(e.target.value)}>
                  <option value="">Select</option>
                  {US_STATES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label} ({s.value})
                    </option>
                  ))}
                </select>
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

            {/* PHOTO UPLOAD */}
            <div style={sectionTitle}>Profile photo (optional)</div>
            <div style={box}>
              <input type="file" accept="image/*" onChange={handlePhotoFileChange} />
              {photoLoading && <div style={helpText}>Processing image…</div>}

              {!!photoPreview && (
                <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover" }}
                  />
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
                </div>
              )}

              <div style={helpText}>
                Note: your selected photo will be saved locally and can be uploaded later in Edit Profile.
              </div>
            </div>

            {/* PROFESSIONAL */}
            {role === "professional" && (
              <>
                <div style={sectionTitle}>Professional Information</div>

                <div>
                  <div style={label}>Headline</div>
                  <input
                    style={input}
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g., Postpartum Doula"
                  />
                </div>

                <div style={{ marginTop: 14 }}>
                  <div style={label}>Service types (select one or more)</div>
                  <div style={box}>
                    {serviceTypesLoading && <div style={helpText}>Loading options…</div>}

                    {!serviceTypesLoading && serviceTypesError && (
                      <div style={{ color: "crimson", fontSize: 13 }}>
                        {serviceTypesError}{" "}
                        <button type="button" style={{ ...smallBtn, marginLeft: 8 }} onClick={fetchServiceTypes}>
                          Try again
                        </button>
                      </div>
                    )}

                    {!serviceTypesLoading && !serviceTypesError && filteredServiceTypes.length === 0 && (
                      <div style={helpText}>
                        No matching service types found. Expected: Birth Doula, Postpartum Doula, Newborn Care Specialist, Lactation Consultant.
                      </div>
                    )}

                    {!serviceTypesLoading && !serviceTypesError && filteredServiceTypes.length > 0 && (
                      <div style={{ display: "grid", gap: 10 }}>
                        {filteredServiceTypes.map((st) => (
                          <label key={st.id} style={checkboxItem}>
                            <input
                              type="checkbox"
                              checked={selectedServiceTypeIds.includes(Number(st.id))}
                              onChange={() => toggleId(st.id, setSelectedServiceTypeIds)}
                            />
                            <span>{st.name}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {selectedServiceTypeIds.length === 0 && (
                      <div style={helpText}>* Professionals must select at least one service type.</div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <div style={label}>Bio</div>
                  <textarea
                    style={{ ...input, minHeight: 120, resize: "vertical" }}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell families about your experience, certifications, and availability."
                  />
                </div>
              </>
            )}

            {/* FAMILY */}
            {role === "family" && (
              <>
                <div style={sectionTitle}>Family Information</div>

                <div style={row2}>
                  <div>
                    <div style={label}>Baby's Due Date</div>
                    <input
                      style={input}
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                    <div style={helpText}>Saved locally for now (no backend changes).</div>
                  </div>

                  <div>
                    <div style={label}>Services of Interest</div>
                    <div style={{ ...box, height: "100%" }}>
                      {serviceTypesLoading && <div style={helpText}>Loading options…</div>}

                      {!serviceTypesLoading && serviceTypesError && (
                        <div style={{ color: "crimson", fontSize: 13 }}>
                          {serviceTypesError}{" "}
                          <button type="button" style={{ ...smallBtn, marginLeft: 8 }} onClick={fetchServiceTypes}>
                            Try again
                          </button>
                        </div>
                      )}

                      {!serviceTypesLoading && !serviceTypesError && filteredServiceTypes.length > 0 && (
                        <div style={checkboxGrid}>
                          {filteredServiceTypes.map((st) => (
                            <label key={st.id} style={checkboxItem}>
                              <input
                                type="checkbox"
                                checked={familyLookingForIds.includes(Number(st.id))}
                                onChange={() => toggleId(st.id, setFamilyLookingForIds)}
                              />
                              <span>{st.name}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      <div style={helpText}>Saved locally for now.</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Errors */}
            {!loading && submitBlockReason && (
              <div style={{ marginTop: 10, color: "crimson", fontSize: 13 }}>
                {submitBlockReason}
              </div>
            )}

            {error && (
              <pre style={{ marginTop: 10, color: "crimson", whiteSpace: "pre-wrap", fontSize: 12 }}>
                {error}
              </pre>
            )}

            <button type="submit" disabled={!canSubmit} style={button(canSubmit)}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
