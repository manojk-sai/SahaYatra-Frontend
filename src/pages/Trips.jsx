import { useEffect, useState } from "react";
import { S } from "../styles/theme";
import { Icon } from "../components/ui/Icons";
import Spinner from "../components/ui/Spinner";
import { TripCard } from "../components/trips/TripCard";
import { CreateTripModal } from "../components/trips/CreateTripModal";
import { useTrips } from "../hooks/useTrips";
import { api } from "../api/client";
import { Input } from "../components/ui/Input";

export function Trips({ token, currentUserRef, onOpenTrip }) {
  const { trips, loading, error, loadMyTrips, createTrip } = useTrips(token);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [tab,        setTab]        = useState("my"); // "my" | "public"
  const [publicTrips, setPublicTrips] = useState([]);
  const [pubLoading,  setPubLoading]  = useState(false);
  const [joinToken, setJoinToken] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");

  useEffect(() => { loadMyTrips(); }, [loadMyTrips]);

  useEffect(() => {
    if (tab !== "public") return;
    setPubLoading(true);
      api.getPublicTrips()
      .then(d => {
        const allPublic = Array.isArray(d) ? d : [];
        setPublicTrips(allPublic.filter(trip => trip.visibility === "public"));
      })
      .catch(() => {})
      .finally(() => setPubLoading(false));
  }, [tab]);

  const handleCreate = async data => {
    await createTrip(data);
    setShowCreate(false);
  };

  const handleJoinTrip = async e => {
    e.preventDefault();
    if (!joinToken.trim()) {
      setJoinError("Invite token is required.");
      return;
    }

    setJoinError("");
    setJoinSuccess("");
    setJoinLoading(true);
    try {
      await api.acceptInvite(joinToken.trim(), token);
      await loadMyTrips();
      setJoinSuccess("Trip joined successfully.");
      setJoinToken("");
    } catch (err) {
      setJoinError(err.message);
    } finally {
      setJoinLoading(false);
    }
  };

  const myIdentity = [
    currentUserRef?.id,
    currentUserRef?.username,
  ]
    .filter(Boolean)
    .map(value => String(value).toLowerCase());

  const myTrips = trips.filter(trip => {
    const members = Array.isArray(trip.members) ? trip.members : [];
    if(members.length === 0) return false;
    return members.some(member => {
      const active = member.active !== false;
      if (!active) return false;
      const keys = [member.userId, member.username]
        .filter(Boolean)
        .map(v => String(v).toLowerCase());
      return keys.some(k => myIdentity.includes(k));
    });
  });
  const displayed = tab === "my" ? myTrips : publicTrips;
  const isLoading = tab === "my" ? loading : pubLoading;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 24px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 4 }}>Trips</div>
          <div style={{ fontSize: 13, color: "#6b6b62" }}>Plan and manage your collaborative travel routes.</div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ ...S.btnSm, padding: "10px 18px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
        >
          <Icon.Plus /> New trip
        </button>
        <button
          onClick={() => { setShowJoin(true); setJoinError(""); setJoinSuccess(""); }}
          style={{ ...S.btnSecondary, padding: "10px 18px", fontSize: 13, marginLeft: 8 }}
        >
          Join trip
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, background: "#f0f0eb", borderRadius: 9, padding: 3, width: "fit-content" }}>
        {[
          { key: "my",     label: "My trips"     },
          { key: "public", label: "Public trips"  },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "6px 16px", fontSize: 13, border: "none", cursor: "pointer",
              borderRadius: 7, fontFamily: "inherit", fontWeight: tab === t.key ? 600 : 400,
              background: tab === t.key ? "white" : "transparent",
              color: tab === t.key ? "#1a1a18" : "#6b6b62",
              boxShadow: tab === t.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {error && <div style={S.error}>{error}</div>}

      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0", color: "#9ca3af", gap: 10 }}>
          <Spinner /> Loading trips…
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: "center", padding: "56px 0" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🗺️</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a18", marginBottom: 6 }}>
            {tab === "my" ? "No trips yet" : "No public trips"}
          </div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>
            {tab === "my" ? "Create your first trip and start planning." : "No public trips available right now."}
          </div>
          {tab === "my" && (
            <button
              onClick={() => setShowCreate(true)}
              style={{ ...S.btnSm, padding: "10px 20px", fontSize: 13, margin: "0 auto" }}
            >
              <Icon.Plus /> Create trip
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {displayed.map(trip => (
            <TripCard
              key={trip.id}
              trip={trip}
              onOpen={() => onOpenTrip(trip.id)}
              disabled={tab == "public" && trip.visibility !== "PUBLIC"}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateTripModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
       {showJoin && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.28)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div style={{ ...S.card, width: "min(520px, 100%)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Join a trip</div>
            <div style={{ fontSize: 13, color: "#6b6b62", marginBottom: 14 }}>
              Paste the invite token shared by the organizer.
            </div>

            {joinError && <div style={{ ...S.error, marginBottom: 10 }}>{joinError}</div>}
            {joinSuccess && (
              <div style={{ marginBottom: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: 8, padding: "10px 12px", fontSize: 12 }}>
                {joinSuccess}
              </div>
            )}

            <form onSubmit={handleJoinTrip}>
              <Input
                label="Invite token"
                value={joinToken}
                onChange={setJoinToken}
                placeholder="Paste token here"
                autoFocus
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" style={{ ...S.btnPrimary, fontSize: 12, padding: "9px 16px" }} disabled={joinLoading}>
                  {joinLoading ? <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Spinner /> Joining…</span> : "Join trip"}
                </button>
                <button
                  type="button"
                  style={{ ...S.btnSecondary, fontSize: 12, padding: "9px 14px" }}
                  onClick={() => { setShowJoin(false); setJoinError(""); setJoinSuccess(""); }}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
