import { Icon } from "../components/ui/Icons";
import { S } from "../styles/theme";

export function Dashboard({ user, onNav }) {
  const endpoints = [
    { method: "POST",   path: "/trips",                          label: "Create trip"          },
    { method: "GET",    path: "/trips/my",                       label: "My trips"             },
    { method: "GET",    path: "/trips/:id",                      label: "Get trip"             },
    { method: "POST",   path: "/trips/:id/stops",                label: "Add stop"             },
    { method: "DELETE", path: "/trips/:id/stops/:stopId",        label: "Remove stop"          },
    { method: "POST",   path: "/trips/:id/invite",               label: "Invite member"        },
    { method: "POST",   path: "/trips/join",                     label: "Accept invite"        },
    { method: "POST",   path: "/trips/:id/advance",              label: "Advance status"       },
    { method: "POST",   path: "/trips/:id/stops/:sid/vote",      label: "Cast vote"            },
    { method: "GET",    path: "/trips/:id/stops/:sid/votes",     label: "Get tally"            },
    { method: "PATCH",  path: "/trips/:id/stops/:sid/status",    label: "Override status"      },
    { method: "GET",    path: "/trips/:id/itinerary",            label: "Get itinerary"        },
    { method: "GET",    path: "/notifications",                  label: "Get notifications"    },
    { method: "PATCH",  path: "/notifications/:id/read",         label: "Mark read"            },
    { method: "PATCH",  path: "/notifications/read-all",         label: "Mark all read"        },
  ];

  const methodColor = { GET: "#059669", POST: "#2563eb", PUT: "#d97706", PATCH: "#7c3aed", DELETE: "#dc2626" };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px", fontFamily: "Inter, -apple-system, sans-serif" }}>
      
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, borderBottom: "1px solid #f0f0eb", paddingBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 8 }}>
            System Overview
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.6px", marginBottom: 4 }}>
          Good day, {user?.username || user?.profile?.displayName || "traveler"} 👋
        </div>
        </div>
      </div>

      {/* High-Level Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
        <div style={{ ...S.card, padding: "20px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b6b62", textTransform: "uppercase", marginBottom: 4 }}>Service Status</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 700, color: "#16a34a" }}>
             <div style={{ width: 8, height: 8, background: "#16a34a", borderRadius: "50%" }} />
             Operational
          </div>
        </div>
        <div style={{ ...S.card, padding: "20px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b6b62", textTransform: "uppercase", marginBottom: 4 }}>Gateway</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a18" }}>{endpoints.length} Active Endpoints</div>
        </div>
        <div style={{ ...S.card, padding: "20px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b6b62", textTransform: "uppercase", marginBottom: 4 }}>Latest Build</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a18" }}>v5.0.0-stable</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 24 }}>
        
        {/* Left Column: Actions & Docs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={S.card}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 16 }}>Navigation</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => onNav("trips")} style={{ ...S.btnPrimary, padding: "12px", justifyContent: "center", fontSize: 14 }}>
                <Icon.Map /> Launch Trip Manager
              </button>
              <button onClick={() => onNav("notifications")} style={{ ...S.btnSecondary, padding: "12px", justifyContent: "center", fontSize: 14 }}>
                <Icon.Bell /> System Notifications
              </button>
            </div>
          </div>

          <div style={{ ...S.card, background: "#1a1a18", color: "white" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b6b62", textTransform: "uppercase", marginBottom: 12 }}>Developer Resources</div>
            <div style={{ fontSize: 14, marginBottom: 16, lineHeight: 1.5, color: "#d1d1cc" }}>
              Comprehensive API documentation including schemas and auth flows.
            </div>
            <a href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noopener noreferrer" 
               style={{ display: "block", textAlign: "center", padding: "10px", background: "white", color: "#1a1a18", borderRadius: 6, textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
              Open Swagger Docs
            </a>
          </div>
        </div>

        {/* Right Column: Endpoint Registry */}
        <div style={{ ...S.card, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#9ca3af" }}>Endpoint Registry</div>
            <span style={{ fontSize: 10, background: "#f5f5f0", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>REST API</span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 2, overflowY: "auto", maxHeight: "450px", paddingRight: "8px" }}>
            {endpoints.map(ep => (
              <div key={ep.path + ep.method} style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 12, 
                padding: "10px 0", 
                borderBottom: "1px solid #f7f7f5" 
              }}>
                <span style={{ 
                  fontSize: 10, 
                  fontWeight: 800, 
                  fontFamily: "monospace", 
                  color: "white", 
                  background: methodColor[ep.method],
                  padding: "2px 6px",
                  borderRadius: 3,
                  minWidth: 48,
                  textAlign: "center"
                }}>{ep.method}</span>
                <span style={{ fontSize: 12, fontFamily: "monospace", color: "#1a1a18", flex: 1 }}>{ep.path}</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>{ep.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}