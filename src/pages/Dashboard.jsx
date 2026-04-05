import { Icon } from "../components/ui/Icons";
import { S } from "../styles/theme";

export function Dashboard({ user, token, onNav }) {
  const phases = [
    { num: 1, name: "Foundation",     status: "done",     detail: "Spring Boot, MongoDB, JWT auth live"  },
    { num: 2, name: "Trip & Members", status: "done",     detail: "Documents, roles, invite flow"        },
    { num: 3, name: "Voting System",  status: "next",     detail: "Strategy pattern, vote resolution"    },
    { num: 4, name: "Weather",        status: "upcoming", detail: "Async API, aggregation pipeline"      },
    { num: 5, name: "Notifications",  status: "upcoming", detail: "Spring Events, itinerary export"      },
    { num: 6, name: "Deploy",         status: "upcoming", detail: "Testcontainers, Railway deploy"       },
  ];

  const phase2Endpoints = [
    { method: "POST",   path: "/trips",                   label: "Create trip"            },
    { method: "GET",    path: "/trips/my",                label: "My trips"               },
    { method: "GET",    path: "/trips/public",            label: "Public trips"           },
    { method: "GET",    path: "/trips/:id",               label: "Get trip"               },
    { method: "PATCH",  path: "/trips/:id",               label: "Update trip"            },
    { method: "POST",   path: "/trips/:id/stops",         label: "Add stop"               },
    { method: "DELETE", path: "/trips/:id/stops/:stopId", label: "Remove stop"            },
    { method: "PATCH",  path: "/trips/:id/stops/reorder", label: "Reorder stops"          },
    { method: "POST",   path: "/trips/:id/invite",        label: "Invite member"          },
    { method: "POST",   path: "/trips/join",              label: "Accept invite by token" },
    { method: "POST",   path: "/trips/:id/advance",       label: "Advance trip status"    },
    { method: "POST",   path: "/trips/:id/lock",          label: "Lock trip"              },
  ];

  const methodColor = { GET: "#059669", POST: "#2563eb", PUT: "#d97706", PATCH: "#7c3aed", DELETE: "#dc2626" };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px" }}>

      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.6px", marginBottom: 4 }}>
          Good day, {user?.profile?.displayName || user?.email?.split("@")[0] || "traveler"} 👋
        </div>
        <div style={{ fontSize: 14, color: "#6b6b62" }}>Phase 2 complete — trips, stops, and membership are live.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Build roadmap */}
        <div style={{ ...S.card, gridColumn: "1 / -1" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b6b62", marginBottom: 16 }}>Build roadmap</div>
          <div style={{ display: "flex", position: "relative" }}>
            {phases.map((p, i) => (
              <div key={p.num} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                {i < phases.length - 1 && (
                  <div style={{ position: "absolute", top: 16, left: "50%", width: "100%", height: 2, background: p.status === "done" ? "#1a1a18" : "#e8e8e3", zIndex: 0 }} />
                )}
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", zIndex: 1,
                  background: p.status === "done" ? "#1a1a18" : p.status === "next" ? "#f5f5f0" : "#f5f5f0",
                  border: p.status === "done" ? "2px solid #1a1a18" : p.status === "next" ? "2px solid #1a1a18" : "2px solid #e2e2dc",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: p.status === "done" ? "white" : p.status === "next" ? "#1a1a18" : "#c0c0b8",
                  fontSize: 12, fontWeight: 700, marginBottom: 10,
                }}>
                  {p.status === "done" ? <Icon.Check /> : p.num}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: p.status === "upcoming" ? "#b0b0a8" : "#1a1a18", textAlign: "center", marginBottom: 2 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", lineHeight: 1.4, padding: "0 4px" }}>
                  {p.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={S.card}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b6b62", marginBottom: 14 }}>Quick actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              onClick={() => onNav("trips")}
              style={{ ...S.btnPrimary, display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon.Map /> Browse my trips</span>
              <Icon.ArrowRight />
            </button>
            <button
              onClick={() => onNav("trips")}
              style={{ ...S.btnSecondary, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}
            >
              <Icon.Plus /> Create new trip
            </button>
          </div>
        </div>

        {/* Phase 2 endpoints */}
        <div style={S.card}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b6b62", marginBottom: 12 }}>Phase 2 endpoints</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 220, overflowY: "auto" }}>
            {phase2Endpoints.map(ep => (
              <div key={ep.path + ep.method} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "monospace", color: methodColor[ep.method], minWidth: 42 }}>
                  {ep.method}
                </span>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: "#374151", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {ep.path}
                </span>
                <span style={{ fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap" }}>{ep.label}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, padding: "7px 10px", background: "#f0fdf4", borderRadius: 6, fontSize: 11, color: "#16a34a", display: "flex", gap: 6, alignItems: "center" }}>
            <Icon.Check /> 12 endpoints live
          </div>
        </div>

        {/* Swagger */}
        <div style={{ ...S.card, gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>API Documentation</div>
            <div style={{ fontSize: 12, color: "#6b6b62" }}>Test all Phase 1 + Phase 2 endpoints in Swagger UI</div>
          </div>
          <a
            href="http://localhost:8080/swagger-ui.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...S.btnSm, textDecoration: "none", padding: "10px 18px", fontSize: 13 }}
          >
            Open Swagger UI →
          </a>
        </div>
      </div>
    </div>
  );
}
