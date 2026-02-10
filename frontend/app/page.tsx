"use client";
import { useState } from "react";

type FormState = {
  contestId: string;
  drawAtIso: string;
  locale: "en" | "fr";
  firstName: string;
  lastName: string;
  guestFirstName: string;
  guestLastName: string;
  companyName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  jerseySize: string;
  optIn: boolean;
};

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [form, setForm] = useState<FormState>({
    contestId: "clientA-2026-worldcup",
    // Example draw time in UTC. Adjust to your actual draw datetime.
    drawAtIso: "2026-03-20T20:00:00.000Z",
    locale: "en",
    firstName: "",
    lastName: "",
    guestFirstName: "",
    guestLastName: "",
    companyName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    province: "",
    postalCode: "",
    jerseySize: "",
    optIn: false,
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

      // Hide form and show thank you message
      setShowForm(false);
      setFormSubmitted(true);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    if (!form.streetAddress.trim()) return "Street address is required";
    if (!form.city.trim()) return "City is required";
    if (!form.province.trim()) return "Province is required";
    if (!form.postalCode.trim()) return "Postal code is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return "Please enter a valid email address";

    // Phone validation - at least 10 digits
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) return "Please enter a valid phone number (at least 10 digits)";

    // Postal code validation (Canadian format)
    const postalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    if (!postalCodeRegex.test(form.postalCode.trim())) return "Please enter a valid postal code (e.g., A1A 1A1)";

    // Name length validation
    if (form.firstName.length > 50) return "First name must be 50 characters or less";
    if (form.lastName.length > 50) return "Last name must be 50 characters or less";
    if (form.guestFirstName.length > 50) return "Guest first name must be 50 characters or less";
    if (form.guestLastName.length > 50) return "Guest last name must be 50 characters or less";

    return null;
  }

  return (
    <>
      {/* White Header */}
      <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e5e5e5", padding: "12px 24px", position: "sticky", top: 0, zIndex: 100, height: "64px", display: "flex", alignItems: "center" }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start", maxWidth: "100%" }}>
          <img src="/visa-logo-header.png" alt="VISA | FIFA" style={{ height: "56px", width: "auto", cursor: "pointer" }} />
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          minHeight: "calc(100vh - 64px)",
          backgroundImage: "url(/jpmc-GoldGradient-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "clamp(88px, 8vw, 112px) clamp(16px, 5vw, 80px) 60px",
          gap: "40px",
          position: "relative",
        }}
      >
        {/* Hero Content Section */}
        {!showForm && !formSubmitted && (
          <div className="hero-card-wrapper" style={{ 
            maxWidth: "1200px", 
            width: "100%", 
            display: "flex",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2), 0 16px 48px rgba(30, 15, 0, 0.35), 0 40px 100px rgba(20, 10, 0, 0.5), 0 0 60px rgba(180, 140, 60, 0.12)",
            minHeight: "400px",
            flexDirection: "row",
          }}>
            <style jsx>{`
              .hero-divider {
                width: 26px;
                flex-shrink: 0;
                position: relative;
                align-self: stretch;
                background: linear-gradient(90deg,
                  #151515 0%,
                  #151515 4%,
                  rgba(255, 232, 170, 0.35) 4%,
                  rgba(255, 232, 170, 0.35) 6%,
                  #3b2216 6%,
                  #3b2216 22%,
                  #d9c08a 22%,
                  #d9c08a 26%,
                  #c9ad7a 26%,
                  #bfa37a 70%,
                  #6a543f 70%,
                  #6a543f 76%,
                  #21120f 76%,
                  #21120f 96%,
                  rgba(255, 232, 170, 0.18) 96%,
                  rgba(255, 232, 170, 0.18) 100%
                );
                box-shadow:
                  inset 1px 0 0 rgba(255, 240, 200, 0.18),
                  inset -1px 0 0 rgba(0, 0, 0, 0.25);
              }
              .hero-divider::after {
                content: "";
                position: absolute;
                inset: 0;
                background: linear-gradient(180deg,
                  rgba(255,255,255,0.10) 0%,
                  rgba(255,255,255,0.00) 35%,
                  rgba(0,0,0,0.08) 70%,
                  rgba(0,0,0,0.00) 100%
                );
                pointer-events: none;
                mix-blend-mode: overlay;
                opacity: 0.65;
              }
              @media (max-width: 1023px) {
                .hero-card-wrapper {
                  flex-direction: column !important;
                }
                .hero-divider {
                  width: 100% !important;
                  height: 26px !important;
                  background: linear-gradient(180deg,
                    #151515 0%,
                    #151515 4%,
                    rgba(255, 232, 170, 0.35) 4%,
                    rgba(255, 232, 170, 0.35) 6%,
                    #3b2216 6%,
                    #3b2216 22%,
                    #d9c08a 22%,
                    #d9c08a 26%,
                    #c9ad7a 26%,
                    #bfa37a 70%,
                    #6a543f 70%,
                    #6a543f 76%,
                    #21120f 76%,
                    #21120f 96%,
                    rgba(255, 232, 170, 0.18) 96%,
                    rgba(255, 232, 170, 0.18) 100%
                  ) !important;
                }
                .hero-divider::after {
                  background: linear-gradient(90deg,
                    rgba(255,255,255,0.10) 0%,
                    rgba(255,255,255,0.00) 35%,
                    rgba(0,0,0,0.08) 70%,
                    rgba(0,0,0,0.00) 100%
                  ) !important;
                }
              }
            `}</style>
            
            {/* Left Section - Dark with VISA Logo */}
            <div className="hero-left" style={{
              flex: "1",
              backgroundColor: "#111111",
              backgroundImage: "linear-gradient(135deg, #111111 0%, #1a1a1a 100%)",
              padding: "clamp(40px, 6vw, 80px) clamp(20px, 3vw, 40px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "24px",
            }}>
              <img src="/visa-logo-hero.png" alt="VISA | FIFA" style={{ 
                height: "clamp(80px, 12vw, 120px)", 
                width: "auto",
                filter: "brightness(1.1)"
              }} />
            </div>

            {/* Gold Divider */}
            <div className="hero-divider"></div>

            {/* Right Section - Light with RSVP */}
            <div className="hero-right" style={{
              flex: "1",
              backgroundColor: "#ffffff",
              padding: "clamp(40px, 6vw, 80px) clamp(20px, 3vw, 40px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "clamp(20px, 3vw, 32px)",
            }}>
              <h1 style={{
                fontFamily: '"FWC26-CondensedBlack", sans-serif',
                fontSize: "clamp(36px, 6vw, 56px)",
                fontWeight: "900",
                lineHeight: "1.1",
                color: "#000000",
                textTransform: "uppercase",
                letterSpacing: "1px",
                margin: "0",
                textAlign: "center",
              }}>
                A match day seat awaits
              </h1>
              
              <p style={{
                fontFamily: '"FWC26-NormalThin", "Inter", Helvetica, Arial, sans-serif',
                fontSize: "clamp(14px, 2vw, 18px)",
                lineHeight: "1.6",
                color: "#333333",
                margin: "0",
                maxWidth: "100%",
                textAlign: "center",
              }}>
                Step into an experience few will ever witness. Be part of history at football’s biggest stage.
              </p>
              <p style={{
                fontFamily: '"FWC26-NormalThin", "Inter", Helvetica, Arial, sans-serif',
                fontSize: "14px",
                lineHeight: "1.5",
                color: "#333333",
                margin: "0",
                maxWidth: "100%",
                letterSpacing: "0",
                fontWeight: "300",
                textAlign: "center",
              }}>
                <span>Friday, June 12, 2026</span>
            <br/>
            FIFA Toronto Stadium (70 Princes' Boulevard, Toronto, ON)
            <br/>
            Recommended arrival 1 hour to kick off
            <br/><br style={{ display: "block", content: '""', marginTop: "4px" }} />
            Kickoff at 3pm ET
              </p>
              
              

              <button 
                onClick={() => {
                  setShowForm(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                style={{ 
                  backgroundColor: "#8B6F47", 
                  color: "#ffffff", 
                  border: "none", 
                  padding: "clamp(14px, 2vw, 18px) clamp(40px, 6vw, 70px)", 
                  fontSize: "clamp(14px, 2vw, 18px)", 
                  fontWeight: "700", 
                  borderRadius: "50px", 
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  boxShadow: "0 6px 20px rgba(139, 111, 71, 0.4)",
                  fontFamily: '"FWC26-NormalRegular", sans-serif',
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#72573a"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#8B6F47"}
              >
                RSVP
              </button>
              <img src="/JPMC_Logo_Standard_Black_RGB.png" alt="JPMorgan Chase" style={{ height: "clamp(24px, 3vw, 36px)", width: "auto" }} />
            </div>
          </div>
        )}

        {formSubmitted && (
          <div style={{ 
            maxWidth: 950, 
            width: "100%", 
            color: "#ffffff", 
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
            <div className="hero-content" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {/* VISA | FIFA Logo */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", marginBottom: "clamp(24px, 4vw, 48px)" }}>
                <img src="/visa-logo-hero.png" alt="VISA | FIFA" style={{ height: "clamp(56px, 10vw, 100px)", width: "auto" }} />
              </div>

              {/* Thank You Message */}
              <p style={{ fontFamily: '"FWC26-NormalThin", "Inter", Helvetica, Arial, sans-serif', fontSize: "clamp(14px, 2.5vw, 22px)", lineHeight: "clamp(20px, 3.5vw, 32px)", letterSpacing: "0", fontWeight: "300", color: "#ffffff", marginBottom: "clamp(24px, 4vw, 40px)", maxWidth: "620px", textAlign: "center" }}>
                Thank you for registering for the FIFA World Cup 2026™ thanks to Visa. You will receive an email momentarily with more information on how to access your tickets.
              </p>

              {/* JPMC Logo Only */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src="/JPMC_Logo_Standard_White_RGB.png" alt="J.P. Morgan" style={{ height: "clamp(24px, 3vw, 36px)", width: "auto" }} />
              </div>
            </div>
          </div>
        )}

        {/* Contest Form */}
        {showForm && (
          <>
            {/* VISA Logo above form */}
            <div style={{ 
              maxWidth: 950, 
              width: "100%", 
              marginBottom: "clamp(16px, 2vw, 24px)",
              display: "flex",
              justifyContent: "center",
            }}>
              <img src="/visa-logo-hero.png" alt="VISA | FIFA" style={{ height: "clamp(56px, 10vw, 100px)", width: "auto" }} />
            </div>
            
            <div id="contest-form" style={{ 
              maxWidth: 950, 
              width: "100%", 
              backgroundColor: "transparent", 
              padding: "clamp(24px, 4vw, 40px)",
              borderRadius: 12, 
              marginTop: "28px", 
              marginBottom: "60px",
              marginLeft: "clamp(0px, -10vw, -150px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}>
            <h2 style={{ 
              fontFamily: '"FWC26-CondensedBlack", sans-serif',
              fontSize: "clamp(28px, 4vw, 36px)", 
              fontWeight: "700", 
              marginBottom: "32px", 
              color: "#ffffff",
              textAlign: "center"
            }}>RSVP for you and your guest by May 7, 2026.</h2>

            <form onSubmit={onSubmit} style={{ display: "grid", gap: 20 }}>
        <style jsx>{`
          @media (min-width: 768px) {
            .name-row {
              grid-template-columns: 1fr 1fr !important;
            }
            .form-input {
              width: 48% !important;
            }
          }
          @media (max-width: 767px) {
            .form-input {
              width: 90% !important;
            }
          }
        `}</style>
        
        <div className="name-row" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
          <label style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600", fontFamily: '"FWC26-NormalRegular", sans-serif' }}>
            First Name
            <input value={form.firstName} onChange={(e) => onChange("firstName", e.target.value)} required
              style={{ 
                display: "block", 
                width: "90%", 
                padding: "12px 16px",
                marginTop: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: 8,
                fontSize: "16px",
                color: "#333"
              }} />
          </label>
          <label style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600", fontFamily: '"FWC26-NormalRegular", sans-serif' }}>
            Last Name
            <input value={form.lastName} onChange={(e) => onChange("lastName", e.target.value)} required
              style={{ 
                display: "block", 
                width: "90%", 
                padding: "12px 16px",
                marginTop: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: 8,
                fontSize: "16px",
                color: "#333"
              }} />
          </label>
        </div>

        <div className="name-row" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
          <label style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600", fontFamily: '"FWC26-NormalRegular", sans-serif' }}>
            Guest First Name
            <input value={form.guestFirstName} onChange={(e) => onChange("guestFirstName", e.target.value)}
              style={{ 
                display: "block", 
                width: "90%", 
                padding: "12px 16px",
                marginTop: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: 8,
                fontSize: "16px",
                color: "#333"
              }} />
          </label>
          <label style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600", fontFamily: '"FWC26-NormalRegular", sans-serif' }}>
            Guest Last Name
            <input value={form.guestLastName} onChange={(e) => onChange("guestLastName", e.target.value)}
              style={{ 
                display: "block", 
                width: "90%", 
                padding: "12px 16px",
                marginTop: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: 8,
                fontSize: "16px",
                color: "#333"
              }} />
          </label>
        </div>

        <div className="name-row" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
          <label style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600", fontFamily: '"FWC26-NormalRegular", sans-serif' }}>
            Company Name
            <input value={form.companyName} onChange={(e) => onChange("companyName", e.target.value)}
              style={{ 
                display: "block", 
                width: "90%", 
                padding: "12px 16px",
                marginTop: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: 8,
                fontSize: "16px",
                color: "#333"
              }} />
          </label>

          <label style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600", fontFamily: '"FWC26-NormalRegular", sans-serif' }}>
            Email Address
            <input type="email" value={form.email} onChange={(e) => onChange("email", e.target.value)} required
              style={{ 
                display: "block", 
                width: "90%", 
                padding: "12px 16px",
                marginTop: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: 8,
                fontSize: "16px",
                color: "#333"
              }} />
          </label>
        </div>

        <div className="name-row" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
          <label style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600", fontFamily: '"FWC26-NormalRegular", sans-serif' }}>
            Phone Number
            <input value={form.phone} onChange={(e) => onChange("phone", e.target.value)} required
              style={{ 
                display: "block", 
                width: "90%", 
                padding: "12px 16px",
                marginTop: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: 8,
                fontSize: "16px",
                color: "#333"
              }} />
          </label>

          <label style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600", fontFamily: '"FWC26-NormalRegular", sans-serif' }}>
            Street Address
            <input value={form.streetAddress} onChange={(e) => onChange("streetAddress", e.target.value)} required
              style={{ 
                display: "block", 
                width: "90%", 
                padding: "12px 16px",
                marginTop: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: 8,
                fontSize: "16px",
                color: "#333"
              }} />
          </label>
        </div>

        <div className="name-row" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
          <label style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600", fontFamily: '"FWC26-NormalRegular", sans-serif' }}>
            City
            <input value={form.city} onChange={(e) => onChange("city", e.target.value)} required
              style={{ 
                display: "block", 
                width: "90%", 
                padding: "12px 16px",
                marginTop: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: 8,
                fontSize: "16px",
                color: "#333"
              }} />
          </label>

          <label style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600", fontFamily: '"FWC26-NormalRegular", sans-serif' }}>
            Province
            <input value={form.province} onChange={(e) => onChange("province", e.target.value)} required
              style={{ 
                display: "block", 
                width: "90%", 
                padding: "12px 16px",
                marginTop: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: 8,
                fontSize: "16px",
                color: "#333"
              }} />
          </label>
        </div>

        <div className="name-row" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
          <label style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600", fontFamily: '"FWC26-NormalRegular", sans-serif' }}>
            Postal Code
            <input value={form.postalCode} onChange={(e) => onChange("postalCode", e.target.value)} required
              style={{ 
                display: "block", 
                width: "90%", 
                padding: "12px 16px",
                marginTop: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: 8,
                fontSize: "16px",
                color: "#333"
              }} />
          </label>
          <label style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600", fontFamily: '"FWC26-NormalRegular", sans-serif' }}>
            Jersey Size
            <select value={form.jerseySize} onChange={(e) => onChange("jerseySize", e.target.value)} required
              style={{ 
                display: "block", 
                width: "96%", 
                padding: "12px 16px",
                marginTop: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: 8,
                fontSize: "16px",
                color: "#333",
                cursor: "pointer"
              }}>
              <option value="">Select size</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="2XL">2XL</option>
              <option value="3XL">3XL</option>
            </select>
          </label>
        </div>
        

        <label style={{ display: "flex", gap: 12, alignItems: "flex-start", color: "#ffffff", fontSize: "13px", marginTop: "8px", lineHeight: "1.5", fontFamily: '"FWC26-NormalRegular", sans-serif' }}>
          <input type="checkbox" checked={form.optIn} onChange={(e) => onChange("optIn", e.target.checked)} 
            style={{ width: "18px", height: "18px", cursor: "pointer", marginTop: "2px", flexShrink: 0 }} />
          <span>Yes, it's okay to send me text messages including confirmations, changes, updates, and/or promotions. Message frequency varies. Message and data rates may apply. Reply STOP to cancel. View our terms of service & privacy policy.</span>
        </label>

        {error && <div style={{ background: "rgba(255, 255, 255, 0.9)", color: "#C8102E", padding: 16, borderRadius: 8, fontWeight: "600" }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <button type="submit" disabled={loading} className="form-input" style={{ 
          padding: "clamp(14px, 2vw, 18px) clamp(40px, 6vw, 70px)",
          borderRadius: "50px",
          cursor: loading ? "not-allowed" : "pointer",
          backgroundColor: "#8B6F47",
          color: "#ffffff",
          fontSize: "clamp(14px, 2vw, 18px)",
          fontWeight: "700",
          border: "none",
          marginTop: "12px",
          transition: "all 0.3s ease",
          opacity: loading ? 0.6 : 1,
          fontFamily: '"FWC26-NormalRegular", sans-serif',
          textTransform: "uppercase" as const,
          letterSpacing: "1.5px",
          boxShadow: "0 6px 20px rgba(139, 111, 71, 0.4)",
        }}
          onMouseOver={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#72573a"; }}
          onMouseOut={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#8B6F47"; }}
        >
          {loading ? "Submitting..." : "Register"}
        </button>
        </div>
      </form>
      </div>
          </>
        )}

        {/* FAQ Section */}
        <div style={{ maxWidth: "950px", width: "100%", marginTop: "80px", marginBottom: "60px" }}>
          <h2 style={{ fontFamily: '"FWC26-CondensedBlack", sans-serif', fontSize: "clamp(28px, 5vw, 36px)", fontWeight: "700", marginBottom: "40px", textAlign: "center", color: "#ffffff" }}>Frequently Asked Questions</h2>
          
          <div style={{ 
            maxWidth: "900px", 
            margin: "0 auto",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderRadius: "16px",
            padding: "32px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          }}>
            {/* FAQ 1 */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", marginBottom: "0" }}>
              <button
                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                style={{
                  width: "100%",
                  padding: "24px 0",
                  textAlign: "left",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "clamp(16px, 2vw, 18px)",
                  fontFamily: '"FWC26-CondensedBlack", sans-serif',
                  fontWeight: "600",
                  color: "#ffffff"
                }}
              >
                How will I receive my match tickets, and which apps do I need?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 1 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 1 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                  <p>Your FIFA World Cup 2026™ tickets will be delivered digitally and managed through the Visa Go App and the FIFA World Cup 2026™ App.</p>
                  <p style={{ marginTop: "12px" }}>You will receive two emails (an initial email and a reminder) to download the Visa Go App and create an account. Please ensure you download the Visa Go app at least 15 days before the match. Creating your Visa Go account validates your email, which allows FIFA to process and assign your tickets.</p>
                  <p style={{ marginTop: "12px" }}>All attendees must also download and register with the FIFA World Cup 2026™ App. It's important that you use the same email for both Visa Go and FIFA.</p>
                  <p style={{ marginTop: "12px" }}>Your mobile tickets will be released in the FIFA app at least 3 days before the match. When they are available, you will receive:</p>
                  <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
                    <li>A notification from Visa Go, and</li>
                    <li>An email directly from FIFA.</li>
                  </ul>
                  <p style={{ marginTop: "12px" }}>Visa Go will guide you through linking to the FIFA app and accessing your tickets once they are released.</p>
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", marginBottom: "0" }}>
              <button
                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                style={{
                  width: "100%",
                  padding: "24px 0",
                  textAlign: "left",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "clamp(16px, 2vw, 18px)",
                  fontFamily: '"FWC26-CondensedBlack", sans-serif',
                  fontWeight: "600",
                  color: "#ffffff"
                }}
              >
                Are printed tickets or screenshots accepted?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 2 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 2 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                  <p>No. Screenshots or photos of tickets will not be accepted for stadium entry. Mobile‑only entry applies.</p>
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", marginBottom: "0" }}>
              <button
                onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                style={{
                  width: "100%",
                  padding: "24px 0",
                  textAlign: "left",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "clamp(16px, 2vw, 18px)",
                  fontFamily: '"FWC26-CondensedBlack", sans-serif',
                  fontWeight: "600",
                  color: "#ffffff"
                }}
              >
                Where is the stadium located?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 3 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 3 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                  <p><strong>Toronto:</strong><br/>Toronto Stadium is located at Exhibition Place, just west of downtown Toronto along the waterfront.<br/>Address: 170 Princes' Blvd, Toronto, ON</p>
                </div>
              )}
            </div>

            {/* FAQ 4 */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", marginBottom: "0" }}>
              <button
                onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
                style={{
                  width: "100%",
                  padding: "24px 0",
                  textAlign: "left",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "clamp(16px, 2vw, 18px)",
                  fontFamily: '"FWC26-CondensedBlack", sans-serif',
                  fontWeight: "600",
                  color: "#ffffff"
                }}
              >
                What's the best way to get to the Toronto Stadium?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 4 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 4 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                  <p>Major events bring heavy traffic, road closures, and security perimeters. If you're planning to drive or use ride share/taxis, please leave extra time, expect delays, and arrive with patience — planning ahead is key to a smooth experience.</p>
                  
                  <p style={{ marginTop: "16px" }}><strong>Vancouver Stadium</strong></p>
                  <p style={{ marginTop: "8px" }}><strong>Ride Share / Taxi</strong></p>
                  <ul style={{ paddingLeft: "20px", marginTop: "4px" }}>
                    <li>Available, but event‑day traffic restrictions apply</li>
                    <li>Drop‑off points may require a short walk to the stadium</li>
                  </ul>
                  <p style={{ marginTop: "8px" }}><strong>Driving</strong></p>
                  <ul style={{ paddingLeft: "20px", marginTop: "4px" }}>
                    <li>Limited downtown parking</li>
                    <li>Expect congestion and possible road closures</li>
                    <li>Plan to park farther away and walk</li>
                  </ul>
                  <p style={{ marginTop: "8px" }}><strong>Public Transit (alternative)</strong></p>
                  <ul style={{ paddingLeft: "20px", marginTop: "4px" }}>
                    <li>Accessible via Stadium–Chinatown or Vancouver City Centre stations</li>
                  </ul>

                  <p style={{ marginTop: "16px" }}><strong>Toronto Stadium</strong></p>
                  <p style={{ marginTop: "8px" }}><strong>Ride Share / Taxi</strong></p>
                  <ul style={{ paddingLeft: "20px", marginTop: "4px" }}>
                    <li>Available, but drop‑off zones are limited due to road closures</li>
                    <li>Expect delays before and after matches</li>
                  </ul>
                  <p style={{ marginTop: "8px" }}><strong>Driving</strong></p>
                  <ul style={{ paddingLeft: "20px", marginTop: "4px" }}>
                    <li>Parking is limited</li>
                    <li>Heavy event‑day traffic is expected</li>
                    <li>Leave early and allow extra time</li>
                  </ul>
                  <p style={{ marginTop: "8px" }}><strong>Public Transit (alternative)</strong></p>
                  <ul style={{ paddingLeft: "20px", marginTop: "4px" }}>
                    <li>Accessible via GO Train (Exhibition Station) or TTC streetcars</li>
                  </ul>

                  <p style={{ marginTop: "16px" }}><strong>Plan ahead</strong></p>
                  <ul style={{ paddingLeft: "20px", marginTop: "4px" }}>
                    <li>Leave earlier than usual</li>
                    <li>Expect traffic, walking time, and security screening</li>
                    <li>Build in extra time so you can arrive relaxed and ready to enjoy the match</li>
                  </ul>
                </div>
              )}
            </div>

            {/* FAQ 5 */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", marginBottom: "0" }}>
              <button
                onClick={() => setOpenFaq(openFaq === 5 ? null : 5)}
                style={{
                  width: "100%",
                  padding: "24px 0",
                  textAlign: "left",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "clamp(16px, 2vw, 18px)",
                  fontFamily: '"FWC26-CondensedBlack", sans-serif',
                  fontWeight: "600",
                  color: "#ffffff"
                }}
              >
                Is parking available at the stadium?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 5 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 5 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                  <p>Yes, general parking pass sales for FIFA World Cup 2026™ will be available closer to the time of the match. For specific information, visit the official FIFA World Cup 2026™ parking website to stay up to date on when parking is available.</p>
                  <p style={{ marginTop: "8px" }}><a href="https://www.justpark.com/us/event-parking/fifa-world-cup-2026/toronto-stadium/" target="_blank" rel="noopener noreferrer" style={{ color: "#f2d76b", textDecoration: "underline" }}>Toronto Stadium Parking</a></p>
                </div>
              )}
            </div>

            {/* FAQ 6 */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", marginBottom: "0" }}>
              <button
                onClick={() => setOpenFaq(openFaq === 6 ? null : 6)}
                style={{
                  width: "100%",
                  padding: "24px 0",
                  textAlign: "left",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "clamp(16px, 2vw, 18px)",
                  fontFamily: '"FWC26-CondensedBlack", sans-serif',
                  fontWeight: "600",
                  color: "#ffffff"
                }}
              >
                How do I access my ticketing account or get account help?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 6 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 6 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                  <p>If you are facing difficulties or have a question, please email <a href="mailto:jpmchosting@visa.com" style={{ color: "#f2d76b", textDecoration: "underline" }}>jpmchosting@visa.com</a> or your primary JPMC contact.</p>
                </div>
              )}
            </div>

            {/* FAQ 7 */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", marginBottom: "0" }}>
              <button
                onClick={() => setOpenFaq(openFaq === 7 ? null : 7)}
                style={{
                  width: "100%",
                  padding: "24px 0",
                  textAlign: "left",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "clamp(16px, 2vw, 18px)",
                  fontFamily: '"FWC26-CondensedBlack", sans-serif',
                  fontWeight: "600",
                  color: "#ffffff"
                }}
              >
                How early should I arrive at the stadium?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 7 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 7 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                  <p>Guests should plan to arrive at least 90 minutes before kickoff to allow time for security screening, navigate any event‑day crowds, and enjoy the pre‑match atmosphere.</p>
                </div>
              )}
            </div>

            {/* FAQ 8 */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", marginBottom: "0" }}>
              <button
                onClick={() => setOpenFaq(openFaq === 8 ? null : 8)}
                style={{
                  width: "100%",
                  padding: "24px 0",
                  textAlign: "left",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "clamp(16px, 2vw, 18px)",
                  fontFamily: '"FWC26-CondensedBlack", sans-serif',
                  fontWeight: "600",
                  color: "#ffffff"
                }}
              >
                What ID or documents should I bring?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 8 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 8 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                  <p>You should bring your digital match ticket and a government‑issued photo ID, ideally with a name that matches your ticket. International visitors are encouraged to carry a copy of their passport in case it is needed for verification.</p>
                </div>
              )}
            </div>

            {/* FAQ 9 */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", marginBottom: "0" }}>
              <button
                onClick={() => setOpenFaq(openFaq === 9 ? null : 9)}
                style={{
                  width: "100%",
                  padding: "24px 0",
                  textAlign: "left",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "clamp(16px, 2vw, 18px)",
                  fontFamily: '"FWC26-CondensedBlack", sans-serif',
                  fontWeight: "600",
                  color: "#ffffff"
                }}
              >
                Are there bag or personal item restrictions?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 9 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 9 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                  <p>To keep everyone safe and moving through security quickly, fans are encouraged to travel light.</p>
                  <p style={{ marginTop: "12px" }}>Ticket holders are only permitted to bring certain types of bags into stadiums. These approved bags must be clear and made of plastic, vinyl, or PVC material. Those bags must not exceed 12" x 6" x 12" (30 cm x 30 cm x 15 cm). Additionally, small clutch purses or wallets approximately the size of a hand are allowed, even if not clear, and no larger than 4.5" x 6.5" (11 cm x 16.5 cm).</p>
                  <p style={{ marginTop: "12px" }}>FIFA has strict rules regarding bags and only small personal bags are typically permitted. Larger bags such as backpacks or oversized purses are not allowed, and most venues do not offer bag‑check services, so guests should bring only essential items.</p>
                  <p style={{ marginTop: "12px" }}>Please refer to the <a href="https://digitalhub.fifa.com/m/50ebae81c412b7d5/original/FIFA-World-Cup-2026-Stadium-Code-of-Conduct.pdf" target="_blank" rel="noopener noreferrer" style={{ color: "#f2d76b", textDecoration: "underline" }}>Stadium Code of Conduct</a> for a complete list of permitted and prohibited items. In addition to this list, FIFA, stadium authorities, and/or government authorities reserve the right to make the final decision on whether any item brought to or into the stadium is prohibited.</p>
                  
                  <p style={{ marginTop: "16px" }}><strong>Permitted items:</strong></p>
                  <ul style={{ paddingLeft: "20px", marginTop: "4px" }}>
                    <li>Small personal items — phone, wallet, keys</li>
                    <li>Medically necessary items — including prescribed medication</li>
                    <li>Accessibility or caregiving items</li>
                    <li>Small flags or signs — non‑political, non‑offensive, non‑commercial; must not block views or walkways</li>
                  </ul>
                  <p style={{ marginTop: "8px" }}>All permitted items are subject to inspection.</p>
                </div>
              )}
            </div>

            {/* FAQ 10 */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", marginBottom: "0" }}>
              <button
                onClick={() => setOpenFaq(openFaq === 10 ? null : 10)}
                style={{
                  width: "100%",
                  padding: "24px 0",
                  textAlign: "left",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "clamp(16px, 2vw, 18px)",
                  fontFamily: '"FWC26-CondensedBlack", sans-serif',
                  fontWeight: "600",
                  color: "#ffffff"
                }}
              >
                What items are prohibited inside the stadium?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 10 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 10 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                  <ul style={{ paddingLeft: "20px" }}>
                    <li>Outside food and beverage</li>
                    <li>Bags larger than 30 cm x 40 cm</li>
                    <li>Weapons or dangerous objects</li>
                    <li>Fireworks, flares, smoke devices, or pyrotechnics</li>
                    <li>Alcohol or illegal substances</li>
                    <li>Glass, metal, or hard objects</li>
                    <li>Professional recording or broadcast equipment (unless authorized)</li>
                    <li>Musical instruments or noisemaking devices (unless approved)</li>
                    <li>Items that block views or disrupt stadium operations</li>
                    <li>Political, offensive, discriminatory, or commercial materials</li>
                  </ul>
                  <p style={{ marginTop: "12px" }}>All items are subject to inspection. FIFA, stadium operators, and local authorities reserve the right to refuse entry for any item that is deemed unsafe, inappropriate, or disruptive, even if it is not specifically listed above.</p>
                </div>
              )}
            </div>

            {/* FAQ 11 */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", marginBottom: "0" }}>
              <button
                onClick={() => setOpenFaq(openFaq === 11 ? null : 11)}
                style={{
                  width: "100%",
                  padding: "24px 0",
                  textAlign: "left",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "clamp(16px, 2vw, 18px)",
                  fontFamily: '"FWC26-CondensedBlack", sans-serif',
                  fontWeight: "600",
                  color: "#ffffff"
                }}
              >
                Can I leave and re‑enter the stadium?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 11 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 11 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                  <p>No. Re‑entry is not allowed once you exit the secure stadium area, so please ensure you have everything you need before entering.</p>
                </div>
              )}
            </div>

            {/* FAQ 12 */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", marginBottom: "0" }}>
              <button
                onClick={() => setOpenFaq(openFaq === 12 ? null : 12)}
                style={{
                  width: "100%",
                  padding: "24px 0",
                  textAlign: "left",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "clamp(16px, 2vw, 18px)",
                  fontFamily: '"FWC26-CondensedBlack", sans-serif',
                  fontWeight: "600",
                  color: "#ffffff"
                }}
              >
                Will food and drinks be available inside the stadium?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 12 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 12 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                  <p>Yes. A full selection of standard stadium food and beverages will be available for purchase throughout the match.</p>
                  <p style={{ marginTop: "12px" }}>The stadium operates as a cashless venue — all purchases must be made using credit or debit cards.</p>
                  <p style={{ marginTop: "12px" }}><strong>Helpful tip:</strong> Use the $200 prepaid Visa card included in your welcome kit to enjoy food and beverages during the match.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code of Conduct Summary Section */}
        <div style={{ maxWidth: "950px", width: "100%", marginTop: "60px", marginBottom: "60px" }}>
          <h2 style={{ fontFamily: '"FWC26-CondensedBlack", sans-serif', fontSize: "clamp(28px, 5vw, 36px)", fontWeight: "700", marginBottom: "40px", textAlign: "center", color: "#ffffff" }}>FIFA Code of Conduct Summary</h2>
          
          <div style={{ 
            maxWidth: "900px", 
            margin: "0 auto",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderRadius: "16px",
            padding: "32px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          }}>
            <p style={{ color: "#ffffff", fontSize: "clamp(14px, 2vw, 16px)", lineHeight: "1.6", marginBottom: "30px", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
              All guests are subject to agreeing to FIFA's ticketing terms, and the stadium code of conduct.
            </p>

            {/* Respect & Behaviour */}
            <div style={{ marginBottom: "30px" }}>
              <h3 style={{ fontFamily: '"FWC26-CondensedBlack", sans-serif', fontSize: "clamp(18px, 2.5vw, 22px)", fontWeight: "700", marginBottom: "12px", color: "#ffffff" }}>Respect & Behaviour</h3>
              <ul style={{ color: "#ffffff", fontSize: "clamp(14px, 2vw, 16px)", lineHeight: "1.8", paddingLeft: "20px", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                <li>Treat all fans, staff and players with respect</li>
                <li>No abusive, discriminatory, or violent conduct</li>
              </ul>
            </div>

            {/* Entry & Security */}
            <div style={{ marginBottom: "30px" }}>
              <h3 style={{ fontFamily: '"FWC26-CondensedBlack", sans-serif', fontSize: "clamp(18px, 2.5vw, 22px)", fontWeight: "700", marginBottom: "12px", color: "#ffffff" }}>Entry & Security</h3>
              <ul style={{ color: "#ffffff", fontSize: "clamp(14px, 2vw, 16px)", lineHeight: "1.8", paddingLeft: "20px", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                <li>Mandatory security checks at gates</li>
                <li>Bags subject to inspection, clear bags required; size restrictions apply</li>
                <li>No re-entry once you leave the stadium</li>
              </ul>
            </div>

            {/* Prohibited Items */}
            <div style={{ marginBottom: "30px" }}>
              <h3 style={{ fontFamily: '"FWC26-CondensedBlack", sans-serif', fontSize: "clamp(18px, 2.5vw, 22px)", fontWeight: "700", marginBottom: "12px", color: "#ffffff" }}>Prohibited Items</h3>
              <ul style={{ color: "#ffffff", fontSize: "clamp(14px, 2vw, 16px)", lineHeight: "1.8", paddingLeft: "20px", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                <li>Weapons, fireworks, flares and hazardous materials</li>
                <li>Large banners, political or offensive signs, and umbrellas (per FIFA match rules)</li>
                <li>Alcohol beyond designed areas; illegal substances strictly banned</li>
              </ul>
            </div>

            {/* Fan Responsibilities */}
            <div style={{ marginBottom: "30px" }}>
              <h3 style={{ fontFamily: '"FWC26-CondensedBlack", sans-serif', fontSize: "clamp(18px, 2.5vw, 22px)", fontWeight: "700", marginBottom: "12px", color: "#ffffff" }}>Fan Responsibilities</h3>
              <ul style={{ color: "#ffffff", fontSize: "clamp(14px, 2vw, 16px)", lineHeight: "1.8", paddingLeft: "20px", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                <li>Follow seating assignments and steward instructions</li>
                <li>Smoking only in designated areas; respect alcohol free areas</li>
                <li>Maintain clear aisles and emergency exits</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Legal Text */}
        <div style={{ 
          position: "absolute", 
          bottom: "clamp(10px, 2vw, 20px)", 
          left: "50%", 
          transform: "translateX(-50%)", 
          marginLeft: "clamp(-25px, -10vw, -150px)", 
          maxWidth: "clamp(300px, 90vw, 1000px)", 
          width: "90%",
          fontSize: "clamp(8px, 1.2vw, 10px)", 
          lineHeight: "clamp(11px, 1.8vw, 14px)", 
          color: "#ffffff", 
          opacity: 0.7,
          padding: "0 10px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "20px"
        }}>
          <p style={{ flex: 1, margin: 0 }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
        </div>
      </main>
    </>
  );
}
