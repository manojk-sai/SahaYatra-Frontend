import { useState } from "react";
import { S } from "../styles/theme";
import { Icon } from "../components/ui/Icons";
import Spinner from "../components/ui/Spinner";

const TYPE_META = {
  STOP_PROPOSED:       { emoji: "📍", label: "Stop proposed",      bg: "#eff6ff", color: "#1d4ed8" },
  VOTE_RESOLVED:       { emoji: "🗳️", label: "Vote resolved",      bg: "#f0fdf4", color: "#15803d" },
  MEMBER_JOINED:       { emoji: "👤", label: "Member joined",      bg: "#fdf4ff", color: "#7e22ce" },
  TRIP_STATUS_CHANGED: { emoji: "🚀", label: "Trip status changed", bg: "#fff7ed", color: "#c2410c" },
};

function formatTime(ts) {
  if (!ts) return "";
  try {
    const d   = new Date(ts);
    const now = new Date();
    const diffM = Math.floor((now - d) / 60_000);
    if (diffM < 1)  return "just now";
    if (diffM < 60) return `${diffM}m ago`;
    const diffH = Math.floor(diffM / 60);
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7)  return `${diffD}d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch { return ""; }
}

export function Notifications({ notifications, unreadCount, loading, error, onMarkRead, onMarkAllRead, onOpenTrip }) {
  const [filter, setFilter] = useState("all"); // "all" | "unread"

  const displayed = filter === "unread"
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 24px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 4 }}>
            Notifications
          </div>
          <div style={{ fontSize: 13, color: "#6b6b62" }}>
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up"}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            style={{ ...S.btnSecondary, fontSize: 12, padding: "7px 14px", display: "flex", alignItems: "center", gap: 5 }}
          >
            <Icon.Check /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 16, background: "#f0f0eb", borderRadius: 9, padding: 3, width: "fit-content" }}>
        {[
          { key: "all",    label: `All (${notifications.length})`         },
          { key: "unread", label: `Unread (${unreadCount})`                },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            style={{
              padding: "6px 16px", fontSize: 13, border: "none", cursor: "pointer",
              borderRadius: 7, fontFamily: "inherit",
              fontWeight: filter === t.key ? 600 : 400,
              background: filter === t.key ? "white" : "transparent",
              color: filter === t.key ? "#1a1a18" : "#6b6b62",
              boxShadow: filter === t.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && <div style={S.error}>{error}</div>}

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "32px 0", color: "#9ca3af", fontSize: 13 }}>
          <Spinner /> Loading notifications…
        </div>
      )}

      {/* Empty state */}
      {!loading && displayed.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>
            {filter === "unread" ? "✅" : "🔔"}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a18", marginBottom: 6 }}>
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </div>
          <div style={{ fontSize: 13, color: "#9ca3af" }}>
            {filter === "unread"
              ? "Switch to All to see your history."
              : "Notifications appear here when stops are proposed, votes resolve, or members join."}
          </div>
        </div>
      )}

      {/* Notification list */}
      {!loading && displayed.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {displayed.map(n => {
            const meta = TYPE_META[n.type] || { emoji: "📣", label: n.type, bg: "#f5f5f0", color: "#6b6b62" };
            return (
              <div
                key={n.id}
                style={{
                  display: "flex", gap: 12, alignItems: "flex-start",
                  padding: "13px 16px",
                  background: n.read ? "white" : "#fafaf8",
                  border: `1px solid ${n.read ? "#e8e8e3" : "#e2e2dc"}`,
                  borderLeft: `3px solid ${n.read ? "#e8e8e3" : meta.color}`,
                  borderRadius: 10,
                  transition: "border-color 0.15s",
                }}
              >
                {/* Type icon */}
                <div style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  background: meta.bg, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 16,
                }}>
                  {meta.emoji}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 3 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 6px", borderRadius: 8, background: meta.bg, color: meta.color }}>
                      {meta.label}
                    </span>
                    {!n.read && (
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                    )}
                    <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>
                      {formatTime(n.createdAt)}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "#1a1a18", lineHeight: 1.5, marginBottom: 6 }}>
                    {n.message}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    {n.tripTitle && (
                      <span style={{ fontSize: 11, color: "#6b6b62" }}>
                        Trip: <strong style={{ color: "#1a1a18" }}>{n.tripTitle}</strong>
                      </span>
                    )}
                    {n.tripId && onOpenTrip && (
                      <button
                        onClick={() => onOpenTrip(n.tripId)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          fontSize: 11, color: "#2563eb", fontFamily: "inherit",
                          padding: 0, display: "flex", alignItems: "center", gap: 3,
                          textDecoration: "underline", textUnderlineOffset: 2,
                        }}
                      >
                        Open trip <Icon.ChevronRight />
                      </button>
                    )}
                  </div>
                </div>

                {/* Mark read button */}
                {!n.read && (
                  <button
                    onClick={() => onMarkRead(n.id)}
                    title="Mark as read"
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "#c0c0b8", padding: 4, flexShrink: 0,
                      display: "flex", alignItems: "center",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "#1a1a18"}
                    onMouseLeave={e => e.currentTarget.style.color = "#c0c0b8"}
                  >
                    <Icon.Check />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}