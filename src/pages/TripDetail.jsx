import { useCallback, useEffect, useState } from "react";
import { S } from "../styles/theme";
import { Icon } from "../components/ui/Icons";
import Spinner from "../components/ui/Spinner";
import StopsList from "../components/trips/StopsList";
import MembersList from "../components/trips/MembersList";
import { api } from "../api/client";
import Footer from "../components/ui/Footer";

const STATUS_FLOW = ["PLANNING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "ARCHIVED"];
const STATUS_STYLES = {
  PLANNING:    { bg: "#eff6ff", color: "#1d4ed8", label: "Planning"    },
  CONFIRMED:   { bg: "#f0fdf4", color: "#15803d", label: "Confirmed"   },
  IN_PROGRESS: { bg: "#fff7ed", color: "#c2410c", label: "In progress" },
  COMPLETED:   { bg: "#f5f3ff", color: "#6d28d9", label: "Completed"   },
  ARCHIVED:    { bg: "#f3f4f6", color: "#6b7280", label: "Archived"    },
};
const VOTING_MODE_LABELS = { MAJORITY: "Majority", UNANIMOUS: "Unanimous", ORGANIZER: "Organizer" };

// ── Category colours (reused in itinerary) ────────────────────────────────
const CAT_COLORS = {
  ACCOMMODATION: { bg: "#eff6ff", color: "#1d4ed8" },
  FOOD:          { bg: "#fef9c3", color: "#a16207" },
  ACTIVITY:      { bg: "#f0fdf4", color: "#15803d" },
  TRANSPORT:     { bg: "#fff7ed", color: "#c2410c" },
  OTHER:         { bg: "#f3f4f6", color: "#4b5563" },
};
const STOP_STATUS_STYLES = {
  CONFIRMED: { color: "#16a34a", label: "Confirmed" },
  REJECTED:  { color: "#dc2626", label: "Rejected"  },
  PROPOSED:  { color: "#d97706", label: "Proposed"  },
};

// ── Itinerary tab component ───────────────────────────────────────────────
function ItineraryTab({ tripId, token }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    setLoading(true); setError("");
    api.getItinerary(tripId, token)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [tripId, token]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "24px 0", color: "#9ca3af", fontSize: 13 }}>
      <Spinner /> Building itinerary…
    </div>
  );
  if (error)  return <div style={S.error}>{error}</div>;
  if (!data)  return null;

  return (
    <div>
      {/* Summary bar */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 18, padding: "12px 14px", background: "#fafaf8", borderRadius: 10, border: "1px solid #f0f0eb", fontSize: 12, color: "#6b6b62" }}>
        <span>
          <strong style={{ color: "#1a1a18", fontSize: 15 }}>${parseFloat(data.totalEstimatedCost || 0).toFixed(2)}</strong>
          {" "}total est. cost
        </span>
        <span>
          <strong style={{ color: "#1a1a18" }}>{data.confirmedStopCount}</strong> confirmed stop{data.confirmedStopCount !== 1 ? "s" : ""}
        </span>
        <span>
          <strong style={{ color: "#1a1a18" }}>{(data.days || []).length}</strong> day{(data.days || []).length !== 1 ? "s" : ""}
        </span>
        {/* Cost by category chips */}
        {data.costByCategory && Object.entries(data.costByCategory).map(([cat, cost]) => {
          const cs = CAT_COLORS[cat] || CAT_COLORS.OTHER;
          return (
            <span key={cat} style={{ padding: "2px 8px", borderRadius: 8, background: cs.bg, color: cs.color, fontSize: 11, fontWeight: 600 }}>
              {cat.charAt(0) + cat.slice(1).toLowerCase()}: ${parseFloat(cost).toFixed(0)}
            </span>
          );
        })}
      </div>

      {/* Day groups */}
      {(data.days || []).length === 0 && (
        <div style={{ textAlign: "center", padding: "28px 0", color: "#9ca3af", fontSize: 13 }}>
          No stops scheduled yet. Add stops with visit dates to build your itinerary.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {(data.days || []).map((day, di) => (
          <div key={day.date || "unscheduled"}>
            {/* Day header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: day.date ? "#1a1a18" : "#e8e8e3", display: "flex", alignItems: "center", justifyContent: "center", color: day.date ? "white" : "#6b6b62", fontSize: 11, fontWeight: 700 }}>
                  {day.date ? di + 1 : "—"}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a18" }}>{day.label}</span>
              </div>
              <span style={{ fontSize: 12, color: "#6b6b62", fontWeight: 600 }}>
                ${parseFloat(day.dailyCost || 0).toFixed(2)}
              </span>
            </div>

            {/* Stops */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 36 }}>
              {(day.stops || []).map((stop, si) => {
                const cs  = CAT_COLORS[stop.category] || CAT_COLORS.OTHER;
                const ss  = STOP_STATUS_STYLES[stop.status] || STOP_STATUS_STYLES.PROPOSED;
                return (
                  <div key={stop.stopId} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "11px 14px", background: "white", border: "1px solid #f0f0eb", borderRadius: 9 }}>
                    {/* Order */}
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#f0f0eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#6b6b62", flexShrink: 0, marginTop: 1 }}>
                      {si + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a18" }}>{stop.name}</span>
                        {stop.mustVisit && (
                          <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 8, background: "#fef3c7", color: "#92400e" }}>Must visit</span>
                        )}
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 8, background: cs.bg, color: cs.color }}>
                          {stop.category.charAt(0) + stop.category.slice(1).toLowerCase()}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: ss.color }}>{ss.label}</span>
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#9ca3af", flexWrap: "wrap" }}>
                        {stop.location     && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Icon.MapPin />{stop.location}</span>}
                        {stop.durationHours && <span>{stop.durationHours}h</span>}
                        {stop.estimatedCost != null && <span style={{ fontWeight: 600, color: "#6b6b62" }}>${parseFloat(stop.estimatedCost).toFixed(2)}</span>}
                        {stop.approveCount > 0 && <span style={{ color: "#16a34a" }}>✓ {stop.approveCount}</span>}
                        {stop.rejectCount  > 0 && <span style={{ color: "#dc2626" }}>✗ {stop.rejectCount}</span>}
                      </div>
                      {stop.notes && (
                        <div style={{ fontSize: 11, color: "#6b6b62", marginTop: 4, fontStyle: "italic" }}>{stop.notes}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main TripDetail ───────────────────────────────────────────────────────
export function TripDetail({ tripId, token, currentUserRef, onBack }) {
  const [trip,      setTrip]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [tab,       setTab]       = useState("stops"); // "stops" | "itinerary" | "members"
  const [advancing, setAdvancing] = useState(false);

  const refreshTrip = useCallback(async () => {
    const latest = await api.getTripById(tripId, token);
    setTrip(latest);
    return latest;
  }, [tripId, token]);

  useEffect(() => {
    setLoading(true); setError("");
    refreshTrip().catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [refreshTrip]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", color: "#9ca3af", gap: 10 }}>
      <Spinner /> Loading trip…
    </div>
  );
  if (error) return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 24px" }}>
      <div style={S.error}>{error}</div>
      <button onClick={onBack} style={{ ...S.btnSecondary, fontSize: 13 }}>← Back to trips</button>
    </div>
  );
  if (!trip) return null;

  const identityCandidates = [currentUserRef?.id, currentUserRef?.username, currentUserRef?.email]
    .filter(Boolean).map(v => String(v).toLowerCase());

  const myMembership = (trip.members || []).find(m => {
    if (m.active === false) return false;
    const keys = [m.userId, m.username, m.email].filter(Boolean).map(v => String(v).toLowerCase());
    return keys.some(k => identityCandidates.includes(k));
  });

  const isOrganizer   = myMembership?.role === "ORGANIZER";
  const isContributor = ["ORGANIZER", "CONTRIBUTOR"].includes(myMembership?.role);
  const ss            = STATUS_STYLES[trip.status] || STATUS_STYLES.PLANNING;
  const nextStatus    = STATUS_FLOW[STATUS_FLOW.indexOf(trip.status) + 1];
  const totalCost     = (trip.stops || []).reduce((s, st) => s + (parseFloat(st.estimatedCost) || 0), 0);

  const handleAddStop    = async data => { const u = await api.addStop(trip.id, data, token); if (u?.id) setTrip(u); else await refreshTrip(); };
  const handleRemoveStop = async sid  => { const u = await api.removeStop(trip.id, sid, token); if (u?.id) setTrip(u); else await refreshTrip(); };
  const handleInvite     = async (userId, role) => api.inviteMember(trip.id, userId, role, token);
  const handleVote       = async (sid, vt) => { const u = await api.voteStop(trip.id, sid, vt, token); if (u?.id) setTrip(u); else await refreshTrip(); };
  const handleAdvance    = async () => {
    setAdvancing(true);
    try { const u = await api.advanceTripStatus(trip.id, token); if (u?.id) setTrip(u); else await refreshTrip(); }
    catch (e) { setError(e.message); }
    finally { setAdvancing(false); }
  };

  const tabs = [
    { key: "stops",     label: `Stops (${(trip.stops || []).length})` },
    { key: "itinerary", label: "Itinerary" },                           // Phase 5
    { key: "members",   label: `Members (${(trip.members || []).filter(m => m.active !== false).length})` },
  ];

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 24px" }}>

      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6b62", fontSize: 13, display: "flex", alignItems: "center", gap: 5, marginBottom: 20, padding: 0, fontFamily: "inherit" }}>
        ← Back to trips
      </button>

      {error && <div style={{ ...S.error, marginBottom: 16 }}>{error}</div>}

      {/* Trip header */}
      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.4px", margin: 0 }}>{trip.title}</h1>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: ss.bg, color: ss.color }}>{ss.label}</span>
              {trip.locked && <span style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 3 }}><Icon.Lock /> Locked</span>}
            </div>
            {trip.description && <div style={{ fontSize: 13, color: "#6b6b62", lineHeight: 1.6 }}>{trip.description}</div>}
          </div>
          {isOrganizer && nextStatus && !trip.locked && (
            <button onClick={handleAdvance} disabled={advancing} style={{ ...S.btnSm, padding: "9px 16px", fontSize: 12, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
              {advancing ? <Spinner /> : <Icon.ArrowRight />}
              {advancing ? "Advancing…" : `Advance to ${nextStatus.replace("_", " ").toLowerCase()}`}
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 24, fontSize: 12, color: "#6b6b62", flexWrap: "wrap" }}>
          {trip.startDate && <span>{trip.startDate} → {trip.endDate}</span>}
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon.MapPin /> {(trip.stops || []).length} stops</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon.Users /> {(trip.members || []).filter(m => m.active !== false).length} members</span>
          {totalCost > 0 && <span>Est. total: <strong style={{ color: "#1a1a18" }}>${totalCost.toFixed(2)}</strong></span>}
          {trip.budgetCap && <span>Budget cap: <strong style={{ color: totalCost > trip.budgetCap ? "#dc2626" : "#16a34a" }}>${parseFloat(trip.budgetCap).toFixed(2)}</strong></span>}
          <span>Voting: <strong style={{ color: "#1a1a18" }}>{VOTING_MODE_LABELS[trip.votingMode] || "Majority"}</strong></span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#c0c0b8", fontStyle: "italic" }}>
            {myMembership ? `You are ${myMembership.role.toLowerCase()}` : "View only"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 16, background: "#f0f0eb", borderRadius: 9, padding: 3, width: "fit-content" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "6px 16px", fontSize: 13, border: "none", cursor: "pointer",
            borderRadius: 7, fontFamily: "inherit",
            fontWeight: tab === t.key ? 600 : 400,
            background: tab === t.key ? "white" : "transparent",
            color: tab === t.key ? "#1a1a18" : "#6b6b62",
            boxShadow: tab === t.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.15s",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={S.card}>
        {tab === "stops" && (
          <StopsList
            stops={trip.stops || []} isContributor={isContributor && !trip.locked}
            isOrganizer={isOrganizer && !trip.locked} canVote={isContributor && !trip.locked}
            currentUserRef={currentUserRef} tripId={trip.id} token={token}
            onAddStop={handleAddStop} onRemoveStop={handleRemoveStop} onVoteStop={handleVote}
          />
        )}
        {tab === "itinerary" && <ItineraryTab tripId={trip.id} token={token} />}
        {tab === "members" && (
          <MembersList
            members={trip.members || []} isOrganizer={isOrganizer}
            currentUserId={currentUserRef?.id || currentUserRef?.username || ""}
            onInvite={handleInvite}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}
