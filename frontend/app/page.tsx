"use client";
import { useState } from "react";

type FormState = {
  contestId: string;
  drawAtIso: string;
  locale: "en" | "fr";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  provinceState: string;
  postalCode: string;
  country: string;
  consent: boolean;
};

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    contestId: "clientA-2026-worldcup",
    // Example draw time in UTC. Adjust to your actual draw datetime.
    drawAtIso: "2026-03-20T20:00:00.000Z",
    locale: "en",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    city: "",
    provinceState: "",
    postalCode: "",
    country: "Canada",
    consent: false,
  });

  const onChange = (k: keyof FormState, v: any) => setForm((s) => ({ ...s, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Client-side validation
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("Missing NEXT_PUBLIC_API_URL");

      const res = await fetch(`${apiUrl}/entry`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409 && data?.error === "duplicate_entry") {
          throw new Error("Duplicate entry detected (email or phone already used).");
        }
        throw new Error(data?.error || "Submission failed.");
      }

      window.location.href = `/success?entryId=${encodeURIComponent(data.entryId)}`;
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function validateForm(form: FormState): string | null {
    // Required fields
    if (!form.firstName.trim()) return "First name is required";
    if (!form.lastName.trim()) return "Last name is required";
    if (!form.email.trim()) return "Email is required";
    if (!form.phone.trim()) return "Phone is required";
    if (!form.address1.trim()) return "Address is required";
    if (!form.city.trim()) return "City is required";
    if (!form.provinceState.trim()) return "Province/State is required";
    if (!form.postalCode.trim()) return "Postal code is required";
    if (!form.country.trim()) return "Country is required";
    if (!form.consent) return "You must agree to the contest rules and privacy policy";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return "Please enter a valid email address";

    // Phone validation - at least 10 digits
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) return "Please enter a valid phone number (at least 10 digits)";

    // Name length validation
    if (form.firstName.length > 50) return "First name must be 50 characters or less";
    if (form.lastName.length > 50) return "Last name must be 50 characters or less";

    return null;
  }

  return (
    <main style={{ maxWidth: 680, margin: "40px auto", padding: 16 }}>
      <h1>Contest Entry</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Language
          <select
            value={form.locale}
            onChange={(e) => onChange("locale", e.target.value)}
            style={{ display: "block", width: "100%", padding: 10 }}
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            First name test preview deploy
            <input value={form.firstName} onChange={(e) => onChange("firstName", e.target.value)} required
              style={{ display: "block", width: "100%", padding: 10 }} />
          </label>
          <label>
            Last name
            <input value={form.lastName} onChange={(e) => onChange("lastName", e.target.value)} required
              style={{ display: "block", width: "100%", padding: 10 }} />
          </label>
        </div>

        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => onChange("email", e.target.value)} required
            style={{ display: "block", width: "100%", padding: 10 }} />
        </label>

        <label>
          Phone
          <input value={form.phone} onChange={(e) => onChange("phone", e.target.value)} required
            style={{ display: "block", width: "100%", padding: 10 }} />
        </label>

        <label>
          Address
          <input value={form.address1} onChange={(e) => onChange("address1", e.target.value)} required
            style={{ display: "block", width: "100%", padding: 10 }} />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            City
            <input value={form.city} onChange={(e) => onChange("city", e.target.value)} required
              style={{ display: "block", width: "100%", padding: 10 }} />
          </label>
          <label>
            Province/State
            <input value={form.provinceState} onChange={(e) => onChange("provinceState", e.target.value)} required
              style={{ display: "block", width: "100%", padding: 10 }} />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            Postal code
            <input value={form.postalCode} onChange={(e) => onChange("postalCode", e.target.value)} required
              style={{ display: "block", width: "100%", padding: 10 }} />
          </label>
          <label>
            Country
            <input value={form.country} onChange={(e) => onChange("country", e.target.value)} required
              style={{ display: "block", width: "100%", padding: 10 }} />
          </label>
        </div>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={form.consent} onChange={(e) => onChange("consent", e.target.checked)} required />
          I agree to the contest rules and privacy policy.
        </label>

        {error && <div style={{ background: "#fee", padding: 12, borderRadius: 8 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{ padding: 12, borderRadius: 10, cursor: "pointer" }}>
          {loading ? "Submitting..." : "Submit Entry"}
        </button>
      </form>
    </main>
  );
}
