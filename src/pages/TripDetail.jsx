import { useCallback, useEffect, useState } from "react";
import { S } from "../styles/theme";
import { Icon } from "../components/ui/Icons";
import { Spinner } from "../components/ui/Spinner";
import { StopsList } from "../components/trips/StopsList";
import { MembersList } from "../components/trips/MembersList";
import { api } from "../api/client";
import { Footer } from "../components/ui/Footer";

const STATUS_FLOW = ["PLANNING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "ARCHIVED"];
const STATUS_STYLES = {
  PLANNING:    { bg: "#eff6ff", color: "#1d4ed8", label: "Planning"    },
  CONFIRMED:   { bg: "#f0fdf4", color: "#15803d", label: "Confirmed"   },
  IN_PROGRESS: { bg: "#fff7ed", color: "#c2410c", label: "In progress" },
  COMPLETED:   { bg: "#f5f3ff", color: "#6d28d9", label: "Completed"   },
  ARCHIVED:    { bg: "#f3f4f6", color: "#6b7280", label: "Archived"    },
};

const VOTING_MODE_LABELS = {
  MAJORITY: "Majority",
  UNANIMOUS: "Unanimous",
  ORGANIZER: "Organizer",
};

export function TripDetail({ tripId, token, currentUserRef, onBack }) {
  const [trip,    setTrip]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [tab,     setTab]     = useState("stops"); // "stops" | "members" | "weather"
  const [advancing, setAdvancing] = useState(false);
  const refreshTrip = useCallback( async () => {
    const latest = await api.getTripById(tripId, token);
    setTrip(latest);
    return latest;
  }, [tripId, token]);

  useEffect(() => {
    setLoading(true); setError("");
    refreshTrip()
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [ refreshTrip ]);

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

  const identityCandidates = [
    currentUserRef?.id,
    currentUserRef?.username,
    currentUserRef?.email,
  ]
    .filter(Boolean)
    .map(v => String(v).toLowerCase());

  const myMembership = (trip.members || []).find(m => {
    if (m.active == false) return false;
    const memberKeys = [m.userId, m.username, m.email]
      .filter(Boolean)
      .map(v => String(v).toLowerCase());
    return memberKeys.some(k => identityCandidates.includes(k));
  });
  const isOrganizer   = myMembership?.role === "ORGANIZER";
  const isContributor = ["ORGANIZER", "CONTRIBUTOR"].includes(myMembership?.role);
  const ss            = STATUS_STYLES[trip.status] || STATUS_STYLES.PLANNING;
  const nextStatus    = STATUS_FLOW[STATUS_FLOW.indexOf(trip.status) + 1];
  const totalCost     = (trip.stops || []).reduce((sum, s) => sum + (parseFloat(s.estimatedCost) || 0), 0);

  const handleAddStop = async data => {
    const updated = await api.addStop(trip.id, data, token);
    if (updated?.id) setTrip(updated);
    else  await refreshTrip();
  };

  const handleRemoveStop = async stopId => {
    const updated = await api.removeStop(trip.id, stopId, token);
    if (updated?.id) setTrip(updated);
    else await refreshTrip();
  };

  const handleInvite = async (userId, role) => {
    return api.inviteMember(trip.id, userId, role, token);
  };

  const handleVote = async (stopId, voteType) => {
    const updated = await api.voteStop(trip.id, stopId, voteType, token);
    if (updated?.id) setTrip(updated);
    else await refreshTrip();
 };

  const handleAdvance = async () => {
    setAdvancing(true);
    try {
      const updated = await api.advanceTripStatus(trip.id, token);
      if (updated?.id) setTrip(updated);
      else await refreshTrip();
    } catch (e) {
      setError(e.message);
    } finally {
      setAdvancing(false);
    }
  };
  const tabs = [
    { key: "stops",   label: `Stops (${(trip.stops || []).length})` },
    { key: "members", label: `Members (${(trip.members || []).filter(m => m.active !== false).length})` },
  ];
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 24px" }}>

      {/* Back */}
      <button
        onClick={onBack}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6b62", fontSize: 13, display: "flex", alignItems: "center", gap: 5, marginBottom: 20, padding: 0, fontFamily: "inherit" }}
      >
        ← Back to trips
      </button>

      {error && <div style={{ ...S.error, marginBottom: 16 }}>{error}</div>}

      {/* Trip header */}
      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.4px", margin: 0 }}>{trip.title}</h1>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: ss.bg, color: ss.color }}>
                {ss.label}
              </span>
              {trip.locked && (
                <span style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 3 }}>
                  <Icon.Lock /> Locked
                </span>
              )}
            </div>
            {trip.description && (
              <div style={{ fontSize: 13, color: "#6b6b62", lineHeight: 1.6 }}>{trip.description}</div>
            )}
          </div>

          {/* Advance status button for organizer */}
          {isOrganizer && nextStatus && !trip.locked && (
            <button
              onClick={handleAdvance}
              disabled={advancing}
              style={{ ...S.btnSm, padding: "9px 16px", fontSize: 12, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}
            >
              {advancing ? <Spinner /> : <Icon.ArrowRight />}
              {advancing ? "Advancing…" : `Advance to ${nextStatus.replace("_", " ").toLowerCase()}`}
            </button>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 24, fontSize: 12, color: "#6b6b62", flexWrap: "wrap" }}>
          {trip.startDate && (
            <span>{trip.startDate} → {trip.endDate}</span>
          )}
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Icon.MapPin /> {(trip.stops || []).length} stops
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Icon.Users /> {(trip.members || []).filter(m => m.active !== false).length} members
          </span>
          {totalCost > 0 && (
            <span>Est. total: <strong style={{ color: "#1a1a18" }}>${totalCost.toFixed(2)}</strong></span>
          )}
          {trip.budgetCap && (
            <span>Budget cap: <strong style={{ color: totalCost > trip.budgetCap ? "#dc2626" : "#16a34a" }}>${parseFloat(trip.budgetCap).toFixed(2)}</strong></span>
          )}
          <span>Voting: <strong style={{ color: "#1a1a18" }}>{VOTING_MODE_LABELS[trip.votingMode] || "Majority"}</strong></span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#c0c0b8", fontStyle: "italic" }}>
            {myMembership ? `You are ${myMembership.role.toLowerCase()}` : "View only"}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 2, marginBottom: 16, background: "#f0f0eb", borderRadius: 9, padding: 3, width: "fit-content" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
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
            stops={trip.stops || []}
            isContributor={isContributor && !trip.locked}
            isOrganizer={isOrganizer && !trip.locked}
            canVote={isContributor && !trip.locked}
            currentUserRef={currentUserRef}
            tripId={trip.id}
            token={token}
            onAddStop={handleAddStop}
            onRemoveStop={handleRemoveStop}
            onVoteStop={handleVote}
          />
        )}
        {tab === "members" && (
          <MembersList
            members={trip.members || []}
            isOrganizer={isOrganizer}
            currentUserId={currentUserRef?.id || currentUserRef?.username || ""}
            onInvite={handleInvite}
          />
        )}
      </div>
    <Footer />
    </div>
  );
}
