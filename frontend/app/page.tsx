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
          backgroundImage: "url(/HeroBgImage.png)",
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
        <div style={{ 
          maxWidth: 950, 
          width: "100%", 
          color: "#ffffff", 
          marginLeft: "clamp(0px, -10vw, -150px)",
        }}>
          <style jsx>{`
            @media (max-width: 475px) {
              .hero-content > * {
                text-align: center !important;
              }
              .hero-content .flex-container {
                justify-content: center !important;
              }
            }
            @media (min-width: 476px) {
              .hero-content .flex-container {
                justify-content: flex-start !important;
              }
            }
          `}</style>
          <div className="hero-content">
          {/* VISA | FIFA Logo */}
          <div className="flex-container" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px", marginBottom: "clamp(24px, 4vw, 48px)" }}>
            <img src="/visa-logo-hero.png" alt="VISA | FIFA" style={{ height: "clamp(56px, 10vw, 100px)", width: "auto" }} />
          </div>

          {!showForm && !formSubmitted && (
            <>
          {/* Hero Heading */}
          <h1 style={{ fontFamily: '"FWC26-CondensedBlack", sans-serif', fontSize: "60px", fontWeight: "900", lineHeight: "1.05", marginBottom: "clamp(20px, 3vw, 32px)", textTransform: "uppercase", letterSpacing: "0", textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
            YOU'VE GOT<br/> A FRONT ROW <br/>SEAT TO HISTORY
          </h1>

          {/* Description Text */}
          <p style={{ fontFamily: '"FWC26-NormalThin", "Inter", Helvetica, Arial, sans-serif', fontSize: "20px", lineHeight: "1.5", letterSpacing: "0", fontWeight: "300", color: "#ffffff", marginBottom: "clamp(28px, 4vw, 40px)", maxWidth: "620px" }}>
            You're on the guest list for the ultimate FIFA World Cup 2026™ day in Toronto, thanks to Visa. Kick it in VIP lounges, take in the view from front-row seats, and unwrap a Match Day Kit made just for you.
            <br style={{ display: "block", content: '""-row', marginTop: "12px" }} />
            </p>
            <p style={{ fontFamily: '"FWC26-NormalThin", "Inter", Helvetica, Arial, sans-serif', fontSize: "14px", lineHeight: "1.5", letterSpacing: "0", fontWeight: "300", color: "#ffffff", marginBottom: "clamp(28px, 4vw, 40px)", maxWidth: "620px" }}>
            <span>Wednesday, June 17, 2026</span>
            <br/>
            FIFA Toronto Stadium (70 Princes' Boulevard, Toronto, ON)
            <br/>
            Recommended arrival 1 hour to kick off
            <br/><br style={{ display: "block", content: '""', marginTop: "4px" }} />
            Kickoff at 7pm ET
          </p>

          {/* RSVP Button and Moneris Logo */}
          <div className="flex-container" style={{ display: "flex", alignItems: "center", gap: "clamp(20px, 8vw, 80px)", flexWrap: "wrap" }}>
            <button 
              onClick={() => {
                setShowForm(true);
              }}
              style={{ 
                backgroundColor: "#E84E1B", 
                color: "#ffffff", 
                border: "none", 
                padding: "clamp(12px, 2vw, 16px) clamp(32px, 6vw, 64px)", 
                fontSize: "clamp(14px, 2vw, 18px)", 
                fontWeight: "700", 
                borderRadius: "8px", 
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "clamp(1px, 0.2vw, 2px)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                fontFamily: '"FWC26-NormalRegular", sans-serif'
              }}
            >
              RSVP
            </button>

            {/* Moneris Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src="/moneris-logo.png" alt="Moneris" style={{ height: "clamp(24px, 3vw, 36px)", width: "auto" }} />
            </div>
          </div>
          </>
          )}

          {formSubmitted && (
            <>
          {/* Thank You Message */}
          <p style={{ fontFamily: '"FWC26-NormalThin", "Inter", Helvetica, Arial, sans-serif', fontSize: "clamp(14px, 2.5vw, 22px)", lineHeight: "clamp(20px, 3.5vw, 32px)", letterSpacing: "0", fontWeight: "300", color: "#ffffff", marginBottom: "clamp(24px, 4vw, 40px)", maxWidth: "620px" }}>
            Thank you for registering for the FIFA World Cup 2026™ thanks to Visa. You will receive an email momentarily with more information on how to access your tickets.
          </p>

          {/* Moneris Logo Only */}
          <div className="flex-container" style={{ display: "flex", alignItems: "center" }}>
            <img src="/moneris-logo.png" alt="Moneris" style={{ height: "clamp(32px, 4vw, 48px)", width: "auto" }} />
          </div>
          </>
          )}
          </div>
        </div>

        {/* Contest Form */}
        {showForm && (
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
        </div>
        

        <label style={{ display: "flex", gap: 12, alignItems: "flex-start", color: "#ffffff", fontSize: "13px", marginTop: "8px", lineHeight: "1.5", fontFamily: '"FWC26-NormalRegular", sans-serif' }}>
          <input type="checkbox" checked={form.optIn} onChange={(e) => onChange("optIn", e.target.checked)} 
            style={{ width: "18px", height: "18px", cursor: "pointer", marginTop: "2px", flexShrink: 0 }} />
          <span>Yes, it's okay to send me text messages including confirmations, changes, updates, and/or promotions. Message frequency varies. Message and data rates may apply. Reply STOP to cancel. View our terms of service & privacy policy.</span>
        </label>

        {error && <div style={{ background: "rgba(255, 255, 255, 0.9)", color: "#C8102E", padding: 16, borderRadius: 8, fontWeight: "600" }}>{error}</div>}

        <button type="submit" disabled={loading} className="form-input" style={{ 
          padding: "16px 32px",
          width: "90%", 
          borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer",
          backgroundColor: "#E84E1B",
          color: "#ffffff",
          fontSize: "18px",
          fontWeight: "700",
          border: "none",
          marginTop: "12px",
          transition: "all 0.3s ease",
          opacity: loading ? 0.6 : 1,
          fontFamily: '"FWC26-NormalRegular", sans-serif'
        }}>
          {loading ? "Submitting..." : "Register"}
        </button>
      </form>
      </div>
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
                How do I access my match tickets?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 1 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 1 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                  <p>The FIFA World Cup 2026™ is a mobile-only entry tournament. You will not receive paper tickets or emails with printable PDFs. To access your tickets, you must download two specific applications: the FIFA World Cup 2026™ App (for your FIFA ID) and the Visa Go App (to receive the tickets).</p>
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
                What is the deadline for claiming my tickets?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 2 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 2 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                  <p>You must register on the Visa Go app at least 20 days prior to the match. If an account is not created by 12 days prior to the match, the tickets will be forfeited or reassigned.</p>
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
                Are there specific requirements for setting up my accounts?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 3 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 3 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                  <p>Yes. You must create your FIFA ID account using the exact same First Name, Last Name, and Email Address that you used to register for the Visa Go app. If these details do not match, you may not be able to access your tickets.</p>
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
                Can I use a screenshot of my ticket to enter?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 4 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 4 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                  <p>No. Screenshots or photos of mobile tickets will not be accepted for stadium entry. You must present the active mobile ticket within the app.</p>
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
                Can I transfer my ticket to someone else?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 5 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 5 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                  <p>No. Access is non-transferable. The tickets are intended specifically for the invited Moneris client or employee.</p>
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
                Can I leave the stadium and re-enter?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 6 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 6 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                  <p>No. There is a strict no re-entry policy once you have scanned your ticket and entered the stadium.</p>
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
                What is the Code of Conduct?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 7 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 7 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                  <p>All guests are expected to treat fans, staff, and players with respect. Abusive, discriminatory, or violent conduct is strictly prohibited and may result in removal.</p>
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
                When do I need to confirm my attendance?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 8 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 8 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6", fontFamily: '"FWC26-NormalThin", sans-serif' }}>
                  <p>Please submit your RSVP via this website immediately. Final guest RSVPs must be completed by May 7, 2026, to ensure you are registered in the system by the global deadline.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code of Conduct Summary Section */}
        <div style={{ maxWidth: "950px", width: "100%", marginTop: "60px", marginBottom: "60px" }}>
          <h2 style={{ fontFamily: '"FWC26-CondensedBlack", sans-serif', fontSize: "clamp(28px, 5vw, 36px)", fontWeight: "700", marginBottom: "40px", textAlign: "center", color: "#ffffff" }}>FIFA Code of Conduct Summary</h2>
          
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
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
          padding: "0 10px"
        }}>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
        </div>
      </main>
    </>
  );
}
