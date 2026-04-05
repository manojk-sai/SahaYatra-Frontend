import { useEffect, useState } from "react";
import { S } from "../styles/theme";
import { Icon } from "../components/ui/Icons";
import { Spinner } from "../components/ui/Spinner";
import { TripCard } from "../components/trips/TripCard";
import { CreateTripModal } from "../components/trips/CreateTripModal";
import { useTrips } from "../hooks/useTrips";

export function Trips({ token, onOpenTrip }) {
  const { trips, loading, error, loadMyTrips, createTrip } = useTrips(token);
  const [showCreate, setShowCreate] = useState(false);
  const [tab,        setTab]        = useState("my"); // "my" | "public"
  const [publicTrips, setPublicTrips] = useState([]);
  const [pubLoading,  setPubLoading]  = useState(false);

  useEffect(() => { loadMyTrips(); }, [loadMyTrips]);

  useEffect(() => {
    if (tab !== "public") return;
    setPubLoading(true);
    import("../api/client").then(({ api }) =>
      api.getPublicTrips()
        .then(d => setPublicTrips(Array.isArray(d) ? d : []))
        .catch(() => {})
        .finally(() => setPubLoading(false))
    );
  }, [tab]);

  const handleCreate = async data => {
    await createTrip(data);
    setShowCreate(false);
  };

  const displayed = tab === "my" ? trips : publicTrips;
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
            <TripCard key={trip.id} trip={trip} onOpen={() => onOpenTrip(trip.id)} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateTripModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
