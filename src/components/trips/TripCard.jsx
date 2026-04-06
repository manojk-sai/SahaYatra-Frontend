import { S } from "../../styles/theme";
import { Icon } from "../ui/Icons";

const STATUS_STYLES = {
  PLANNING:    { bg: "#eff6ff", color: "#1d4ed8", label: "Planning"    },
  CONFIRMED:   { bg: "#f0fdf4", color: "#15803d", label: "Confirmed"   },
  IN_PROGRESS: { bg: "#fff7ed", color: "#c2410c", label: "In progress" },
  COMPLETED:   { bg: "#f5f3ff", color: "#6d28d9", label: "Completed"   },
  ARCHIVED:    { bg: "#f3f4f6", color: "#6b7280", label: "Archived"    },
};

const VISIBILITY_LABELS = {
  PRIVATE:     "Private",
  INVITE_ONLY: "Invite only",
  PUBLIC:      "Public",
};
const VOTING_MODE_LABELS = {
  MAJORITY: "Majority",
  UNANIMOUS: "Unanimous",
  ORGANIZER: "Organizer",
};

export function TripCard({ trip, onOpen, disabled = false }) {
  const ss        = STATUS_STYLES[trip.status] || STATUS_STYLES.PLANNING;
  const activeM   = (trip.members || []).filter(m => m.active !== false).length;
  const stopCount = (trip.stops  || []).length;

  return (
    <div
      onClick={() => { if (!disabled) onOpen(); }}
      style={{
        ...S.card,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.72 : 1,
        transition: "border-color 0.15s, box-shadow 0.15s",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "#c8c8c0";
        e.currentTarget.style.boxShadow   = "0 2px 12px rgba(0,0,0,0.07)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#e8e8e3";
        e.currentTarget.style.boxShadow   = "none";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a18", letterSpacing: "-0.2px", marginBottom: 3 }}>
            {trip.title}
          </div>
          {trip.description && (
            <div style={{ fontSize: 12, color: "#6b6b62", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {trip.description}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: ss.bg, color: ss.color }}>
            {ss.label}
          </span>
          {trip.locked && (
            <span style={{ fontSize: 10, color: "#9ca3af", display: "flex", alignItems: "center", gap: 3 }}>
              <Icon.Lock /> Locked
            </span>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "#9ca3af" }}>
        {trip.startDate && (
          <span>{trip.startDate} → {trip.endDate}</span>
        )}
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Icon.MapPin /> {stopCount} stop{stopCount !== 1 ? "s" : ""}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Icon.Users /> {activeM} member{activeM !== 1 ? "s" : ""}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#c0c0b8" }}>
          {VOTING_MODE_LABELS[trip.votingMode] || "Majority"}. {VISIBILITY_LABELS[trip.visibility]}
        </span>
      </div>
    </div>
  );
}
