import { useState } from "react";
import { S } from "../../styles/theme";
import { Icon } from "../ui/Icons";
import { Input } from "../ui/Input";
import { Spinner } from "../ui/Spinner";

const ROLE_STYLES = {
  ORGANIZER:   { bg: "#fef9c3", color: "#a16207", label: "Organizer"   },
  CONTRIBUTOR: { bg: "#eff6ff", color: "#1d4ed8", label: "Contributor" },
  VIEWER:      { bg: "#f3f4f6", color: "#4b5563", label: "Viewer"      },
};

export function MembersList({ members = [], isOrganizer, currentUserId, onInvite }) {
  const [showInvite, setShowInvite] = useState(false);
  const [userId,     setUserId]     = useState("");
  const [role,       setRole]       = useState("CONTRIBUTOR");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [token,      setToken]      = useState("");

  const activeMembers = members.filter(m => m.active !== false);

  const handleInvite = async e => {
    e.preventDefault();
    if (!userId.trim()) { setError("User ID is required."); return; }
    setError(""); setLoading(true);
    try {
      const result = await onInvite(userId.trim(), role);
      setToken(result.inviteToken || "");
      setUserId(""); setRole("CONTRIBUTOR");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b6b62" }}>
          Members · {activeMembers.length}
        </div>
        {isOrganizer && !showInvite && (
          <button
            onClick={() => setShowInvite(true)}
            style={{ ...S.btnSm, fontSize: 12, padding: "6px 12px", display: "flex", alignItems: "center", gap: 5 }}
          >
            <Icon.Send /> Invite
          </button>
        )}
      </div>

      {/* Member rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {activeMembers.map(m => {
          const rs = ROLE_STYLES[m.role] || ROLE_STYLES.VIEWER;
          const isYou = m.userId === currentUserId;
          return (
            <div key={m.userId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#fafaf8", borderRadius: 8, border: "1px solid #f0f0eb" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1a1a18", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {(m.displayName || m.userId || "?")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a18" }}>
                  {m.displayName || m.userId}
                  {isYou && <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 400, marginLeft: 6 }}>you</span>}
                </div>
                {m.joinedAt && <div style={{ fontSize: 11, color: "#9ca3af" }}>Joined {m.joinedAt.split("T")[0]}</div>}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: rs.bg, color: rs.color }}>
                {rs.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Invite form */}
      {showInvite && (
        <div style={{ background: "#fafaf8", border: "1px dashed #d4d4cc", borderRadius: 10, padding: "14px 16px", marginTop: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#6b6b62", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Invite member</div>
          {error && <div style={{ ...S.error, marginBottom: 10 }}>{error}</div>}

          {/* Token display after successful invite */}
          {token && (
            <div style={{ marginBottom: 14, padding: "10px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", marginBottom: 5 }}>Invite token generated</div>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "#374151", wordBreak: "break-all", lineHeight: 1.6 }}>{token}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 6 }}>Share this token with the user. They join via POST /trips/join?token=…</div>
              <button onClick={() => navigator.clipboard?.writeText(token)} style={{ ...S.btnSm, marginTop: 8, fontSize: 11, background: "#f0f0eb", color: "#1a1a18" }}>
                Copy token
              </button>
            </div>
          )}

          <form onSubmit={handleInvite}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "flex-end" }}>
              <Input label="User ID" value={userId} onChange={setUserId} placeholder="username" autoFocus />
              <div style={S.inputWrap}>
                <label style={S.label}>Role</label>
                <select value={role} onChange={e => setRole(e.target.value)} style={{ ...S.input, fontSize: 13 }}>
                  <option value="CONTRIBUTOR">Contributor</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" style={{ ...S.btnPrimary, fontSize: 12, padding: "9px 16px" }} disabled={loading}>
                {loading ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Spinner /> Sending…</span> : "Send invite"}
              </button>
              <button type="button" onClick={() => { setShowInvite(false); setToken(""); setError(""); }} style={{ ...S.btnSecondary, fontSize: 12, padding: "9px 14px" }}>
                Close
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
