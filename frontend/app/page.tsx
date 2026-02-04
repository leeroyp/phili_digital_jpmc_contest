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
  consent: boolean;
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
    consent: false,
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
    if (form.guestFirstName.length > 50) return "Guest first name must be 50 characters or less";
    if (form.guestLastName.length > 50) return "Guest last name must be 50 characters or less";

    return null;
  }

  return (
    <>
      {/* White Header */}
      <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e5e5e5", padding: "12px 24px", position: "sticky", top: 0, zIndex: 100, height: "64px", display: "flex", alignItems: "center" }}>
        <div style={{ width: "100%", display: "flex", alignItems: "center", maxWidth: "100%" }}>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#1434CB", letterSpacing: "-0.5px", cursor: "pointer" }}>
            VISA
          </div>
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
          <style>
            {`
              @media (max-width: 475px) {
                .hero-content > * {
                  text-align: center !important;
                }
                .hero-content .flex-container {
                  justify-content: center !important;
                }
              }
            `}
          </style>
          <div className="hero-content">
          {/* VISA | FIFA Logo */}
          <div className="flex-container" style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 2vw, 16px)", marginBottom: "12px" }}>
            <span style={{ fontSize: "clamp(28px, 6vw, 48px)", fontWeight: "900", letterSpacing: "-2px", fontStyle: "italic" }}>VISA</span>
            <div style={{ width: "2px", height: "clamp(32px, 5vw, 48px)", backgroundColor: "#ffffff", opacity: 0.6 }}></div>
            <div style={{ width: "clamp(40px, 7vw, 56px)", height: "clamp(48px, 8vw, 64px)", backgroundColor: "#ffffff", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "6px" }}>
              <div style={{ fontSize: "clamp(16px, 3vw, 24px)", marginBottom: "2px" }}>🏆</div>
              <span style={{ fontSize: "clamp(9px, 1.5vw, 12px)", fontWeight: "900", color: "#000", letterSpacing: "-0.5px" }}>FIFA</span>
            </div>
          </div>

          <p style={{ fontSize: "clamp(11px, 1.8vw, 14px)", marginBottom: "clamp(24px, 4vw, 48px)", opacity: 0.9, fontWeight: "300" }}>Worldwide Partner</p>

          {!showForm && !formSubmitted && (
            <>
          {/* RSVP TODAY Heading */}
          <h1 style={{ fontSize: "clamp(36px, 8vw, 72px)", fontWeight: "900", lineHeight: "1.1", marginBottom: "clamp(16px, 3vw, 32px)", textTransform: "uppercase", letterSpacing: "clamp(1px, 0.3vw, 3px)", textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
            RSVP TODAY
          </h1>

          {/* Description Text */}
          <p style={{ fontFamily: '"Inter", Helvetica, Arial, sans-serif', fontSize: "clamp(14px, 2.5vw, 22px)", lineHeight: "clamp(20px, 3.5vw, 32px)", letterSpacing: "0", fontWeight: "300", color: "#ffffff", marginBottom: "clamp(24px, 4vw, 40px)", maxWidth: "620px" }}>
            Ut dollabo repraep ellatempore velignis doleni tecata volecaborro moNum quatum dollab im aut et molorrum delessim velique consequaest, core
          </p>

          {/* RSVP Button and Moneris Logo */}
          <div className="flex-container" style={{ display: "flex", alignItems: "center", gap: "clamp(20px, 8vw, 80px)", flexWrap: "wrap" }}>
            <button 
              onClick={() => {
                setShowForm(true);
                setTimeout(() => {
                  const formElement = document.getElementById('contest-form');
                  if (formElement) {
                    const yOffset = -80; // Offset for header + spacing
                    const y = formElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }, 100);
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
                boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
              }}
            >
              RSVP
            </button>

            {/* Moneris Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "clamp(32px, 4vw, 40px)", height: "clamp(32px, 4vw, 40px)", borderRadius: "50%", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#C8102E", fontWeight: "900", fontSize: "clamp(16px, 2.5vw, 20px)" }}>M</span>
              </div>
              <span style={{ fontSize: "clamp(16px, 2.5vw, 20px)", fontWeight: "600" }}>Moneris</span>
            </div>
          </div>
          </>
          )}

          {formSubmitted && (
            <>
          {/* Thank You Message */}
          <p style={{ fontFamily: '"Inter", Helvetica, Arial, sans-serif', fontSize: "clamp(14px, 2.5vw, 22px)", lineHeight: "clamp(20px, 3.5vw, 32px)", letterSpacing: "0", fontWeight: "300", color: "#ffffff", marginBottom: "clamp(24px, 4vw, 40px)", maxWidth: "620px" }}>
            Thank you for registering for the FIFA World Cup 2026™ thanks to Visa. You will receive an email momentarily with more information on how to access your tickets.
          </p>

          {/* Moneris Logo Only */}
          <div className="flex-container" style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "clamp(32px, 4vw, 40px)", height: "clamp(32px, 4vw, 40px)", borderRadius: "50%", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#C8102E", fontWeight: "900", fontSize: "clamp(16px, 2.5vw, 20px)" }}>M</span>
              </div>
              <span style={{ fontSize: "clamp(16px, 2.5vw, 20px)", fontWeight: "600" }}>Moneris</span>
            </div>
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
            <h1 style={{ 
              fontSize: "clamp(28px, 4vw, 36px)", 
              fontWeight: "700", 
              marginBottom: "32px", 
              color: "#ffffff",
              textAlign: "center"
            }}>Contest Entry</h1>

            <form onSubmit={onSubmit} style={{ display: "grid", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <label style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600" }}>
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
          <label style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600" }}>
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <label style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600" }}>
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
          <label style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600" }}>
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <label style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600" }}>
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

        
          <label style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600" }}>
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

          <label style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600" }}>
            Phone Number
            <input value={form.phone} onChange={(e) => onChange("phone", e.target.value)} required
              style={{ 
                display: "block", 
                width: "44%", 
                padding: "12px 16px",
                marginTop: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: 8,
                fontSize: "16px",
                color: "#333"
              }} />
          </label>
        

        <label style={{ display: "flex", gap: 12, alignItems: "flex-start", color: "#ffffff", fontSize: "13px", marginTop: "8px", lineHeight: "1.5" }}>
          <input type="checkbox" checked={form.optIn} onChange={(e) => onChange("optIn", e.target.checked)} 
            style={{ width: "18px", height: "18px", cursor: "pointer", marginTop: "2px", flexShrink: 0 }} />
          <span>Yes, it's okay to send me text messages including confirmations, changes, updates, and/or promotions. Message frequency varies. Message and data rates may apply. Reply STOP to cancel. View our terms of service & privacy policy.</span>
        </label>

        <label style={{ display: "flex", gap: 12, alignItems: "center", color: "#ffffff", fontSize: "14px", marginTop: "8px" }}>
          <input type="checkbox" checked={form.consent} onChange={(e) => onChange("consent", e.target.checked)} required 
            style={{ width: "18px", height: "18px", cursor: "pointer" }} />
          I agree to the contest rules and privacy policy.
        </label>

        {error && <div style={{ background: "rgba(255, 255, 255, 0.9)", color: "#C8102E", padding: 16, borderRadius: 8, fontWeight: "600" }}>{error}</div>}

        <button type="submit" disabled={loading} style={{ 
          padding: "16px 32px",
          width: "48%", 
          borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer",
          backgroundColor: "#E84E1B",
          color: "#ffffff",
          fontSize: "18px",
          fontWeight: "700",
          border: "none",
          marginTop: "12px",
          transition: "all 0.3s ease",
          opacity: loading ? 0.6 : 1
        }}>
          {loading ? "Submitting..." : "Submit Entry"}
        </button>
      </form>
      </div>
        )}

        {/* FAQ Section */}
        <div style={{ maxWidth: "950px", width: "100%", marginTop: "80px", marginBottom: "60px" }}>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: "700", marginBottom: "40px", textAlign: "center", color: "#ffffff" }}>Frequently Asked Questions</h2>
          
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
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
                  fontWeight: "600",
                  color: "#ffffff"
                }}
              >
                What is this contest about?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 1 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 1 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6" }}>
                  <p>This contest gives eligible cardholders the opportunity to win FIFA World Cup 26™ tickets or a VIP Experience package. Simply enter for your chance to experience the thrill of the world's biggest football event.</p>
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
                  fontWeight: "600",
                  color: "#ffffff"
                }}
              >
                Is this contest available in other countries?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 2 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 2 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6" }}>
                  <p>This contest is available to eligible residents of Canada. Please review the complete terms and conditions for specific eligibility requirements.</p>
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
                  fontWeight: "600",
                  color: "#ffffff"
                }}
              >
                How do I enter once I have an eligible card?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 3 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 3 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6" }}>
                  <p>Simply click the RSVP button above, fill out the entry form with your information, and submit. Once verified, you'll be entered into the draw for a chance to win.</p>
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
                  fontWeight: "600",
                  color: "#ffffff"
                }}
              >
                How old do I need to be to enter the contest?
                <span style={{ fontSize: "24px", transition: "transform 0.3s", transform: openFaq === 4 ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {openFaq === 4 && (
                <div style={{ paddingBottom: "24px", color: "#ffffff", opacity: 0.9, lineHeight: "1.6" }}>
                  <p>Participants must be 18 years of age or older at the time of entry. Additional eligibility requirements may apply. Please refer to the official rules for complete details.</p>
                </div>
              )}
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
