const FONT = "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif";

export const S = {

  // ── Layout ──────────────────────────────────────────
  page: {
    minHeight: "100vh",
    background: "#f4f4f0",
    fontFamily: FONT,
    color: "#1a1a18",
    width: "100%",
  },

  // ── Auth ────────────────────────────────────────────
  authWrap: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    background: "#f4f4f0",
    width: "100%",
  },
  authLeft: {
    background: "#1a1a18",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "48px",
    position: "relative",
    overflow: "hidden",
  },
  authRight: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px",
    background: "#f4f4f0",
  },
  authForm: {
    width: "100%",
    maxWidth: 400,
  },

  // ── Form fields ─────────────────────────────────────
  inputWrap: { marginBottom: 16, position: "relative" },

  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "#6b6b62",
    marginBottom: 6,
    fontFamily: FONT,
  },

  input: {
    width: "100%",
    padding: "10px 14px",
    fontSize: 14,
    border: "1.5px solid #e2e2dc",
    borderRadius: 8,
    background: "#ffffff",
    color: "#1a1a18",
    outline: "none",
    fontFamily: FONT,
    boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s",
    lineHeight: 1.5,
  },

  // ── Buttons ─────────────────────────────────────────
  btnPrimary: {
    width: "100%",
    padding: "11px 20px",
    background: "#1a1a18",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: "0.01em",
    cursor: "pointer",
    fontFamily: FONT,
    transition: "opacity 0.15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  btnSecondary: {
    padding: "9px 16px",
    background: "transparent",
    color: "#1a1a18",
    border: "1.5px solid #d4d4cc",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: FONT,
    fontWeight: 500,
    transition: "border-color 0.15s, background 0.15s",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
  },

  btnSm: {
    padding: "7px 14px",
    background: "#1a1a18",
    color: "#ffffff",
    border: "none",
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: FONT,
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    whiteSpace: "nowrap",
  },

  // ── Navigation — full width ──────────────────────────
  nav: {
    height: 60,
    background: "#ffffff",
    borderBottom: "1px solid #e8e8e3",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    // Full-width padding — no max-width constraint on the nav itself
    padding: "0 40px",
    position: "sticky",
    top: 0,
    zIndex: 100,
    width: "100%",
    boxShadow: "0 1px 0 #e8e8e3",
  },

  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: "-0.3px",
    color: "#1a1a18",
    fontFamily: FONT,
  },

  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: 2,
  },

  navLink: (active) => ({
    padding: "7px 16px",
    borderRadius: 8,
    fontSize: 14,
    color: active ? "#1a1a18" : "#6b6b62",
    background: active ? "#f0f0eb" : "transparent",
    cursor: "pointer",
    border: "none",
    fontFamily: FONT,
    fontWeight: active ? 600 : 400,
    transition: "all 0.15s",
    position: "relative",
  }),

  // ── Cards ────────────────────────────────────────────
  card: {
    background: "#ffffff",
    border: "1px solid #e8e8e3",
    borderRadius: 14,
    padding: "22px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },

  // ── Alerts ───────────────────────────────────────────
  error: {
    padding: "10px 14px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    fontSize: 13,
    color: "#dc2626",
    marginBottom: 16,
    fontFamily: FONT,
  },

  success: {
    padding: "10px 14px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: 8,
    fontSize: 13,
    color: "#16a34a",
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontFamily: FONT,
  },
};
