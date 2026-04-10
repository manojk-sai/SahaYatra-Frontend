import { S } from "../../styles/theme";
import { Icon } from "../ui/Icons";
import brandLogo from "../../../public/logo-sy.png";

export function Nav({ user, screen, onNav, onLogout, unreadCount = 0 }) {
  return (
    <nav style={S.nav}>
      <div style={S.navBrand}>
        <img src={brandLogo} alt="Saha Yatra" style={{ width: 32, height: 32, marginRight: 8 }} />
        Saha Yatra
      </div>

      <div style={S.navLinks}>
        <button style={S.navLink(screen === "dashboard")} onClick={() => onNav("dashboard")}>
          Dashboard
        </button>
        <button style={S.navLink(screen === "trips")} onClick={() => onNav("trips")}>
          My Trips
        </button>
        {/* Phase 5: Notifications nav link */}
        
        <button style={S.navLink(screen === "profile")} onClick={() => onNav("profile")}>
          Profile
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Bell icon shortcut with unread count badge */}
        <button
          onClick={() => onNav("notifications")}
          title={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
          style={{
            position: "relative", background: "none",
            border: "1px solid #e8e8e3", borderRadius: 7,
            padding: "5px 8px", cursor: "pointer",
            color: unreadCount > 0 ? "#1a1a18" : "#6b6b62",
            display: "flex", alignItems: "center",
          }}
        >
          {unreadCount > 0 ? <Icon.BellDot /> : <Icon.Bell />}
          {unreadCount > 0 && (
            <span style={{
              position: "absolute", top: -5, right: -5,
              minWidth: 16, height: 16, borderRadius: 8,
              background: "#ef4444", color: "white",
              fontSize: 10, fontWeight: 700, fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 3px", border: "1.5px solid white",
            }}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        <div style={{ fontSize: 13, color: "#6b6b62" }}>
          {user?.username || "User"}
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "#1a1a18", display: "flex", alignItems: "center",
          justifyContent: "center", color: "white", fontSize: 13, fontWeight: 700,
        }}>
          {(user?.username || "U")[0].toUpperCase()}
        </div>
        <button
          onClick={onLogout}
          title="Sign out"
          style={{ background: "none", border: "1px solid #e8e8e3", borderRadius: 7, padding: "5px 8px", cursor: "pointer", color: "#6b6b62", display: "flex", alignItems: "center" }}
        >
          <Icon.Logout />
        </button>
      </div>
    </nav>
  );
}
