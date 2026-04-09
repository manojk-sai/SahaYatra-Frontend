import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Spinner } from "../ui/Spinner";

const CATEGORY_STYLES = {
  TRANSPORT: { bg: "#eff6ff", color: "#1d4ed8", label: "Transport", dot: "#3b82f6" },
  FOOD:      { bg: "#fef9c3", color: "#92400e", label: "Food",      dot: "#f59e0b" },
  ACTIVITY:  { bg: "#f0fdf4", color: "#15803d", label: "Activity",  dot: "#22c55e" },
  STAY:      { bg: "#f5f3ff", color: "#6d28d9", label: "Stay",      dot: "#8b5cf6" },
  OTHER:     { bg: "#f3f4f6", color: "#4b5563", label: "Other",     dot: "#9ca3af" },
};

const STATUS_STYLES = {
  CONFIRMED: { color: "#15803d", label: "Confirmed" },
  REJECTED:  { color: "#dc2626", label: "Rejected"  },
  PENDING:   { color: "#c2410c", label: "Pending"   },
};

function CostBar({ costByCategory, total }) {
  if (!total) return null;
  const categories = Object.entries(costByCategory).filter(([, v]) => v > 0);
  return (
    <div>
      <div style={{ display: "flex", height: 6, borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
        {categories.map(([cat, val]) => {
          const pct = (val / total) * 100;
          const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES.OTHER;
          return (
            <div key={cat} style={{ width: `${pct}%`, background: style.dot, transition: "width 0.4s" }} />
          );
        })}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
        {categories.map(([cat, val]) => {
          const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES.OTHER;
          return (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6b6b62", fontFamily: "'Georgia', serif" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: style.dot, flexShrink: 0 }} />
              {style.label}: <strong style={{ color: "#1a1a18" }}>${val}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StopCard({ stop }) {
  const catStyle = CATEGORY_STYLES[stop.category] || CATEGORY_STYLES.OTHER;
  const statusStyle = STATUS_STYLES[stop.status] || STATUS_STYLES.PENDING;

  return (
    <div style={{
      display: "flex",
      gap: 12,
      padding: "12px 0",
      borderBottom: "1px solid #f0f0eb",
    }}>
      {/* Timeline dot */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 3 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: catStyle.dot, flexShrink: 0 }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18", fontFamily: "'Georgia', serif" }}>
              {stop.name}
            </span>
            {stop.mustVisit && (
              <span style={{
                marginLeft: 6, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                textTransform: "uppercase", color: "#c2410c", fontFamily: "'Georgia', serif",
              }}>★ Must Visit</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
            <span style={{
              fontSize: 10, padding: "2px 7px", borderRadius: 10, fontWeight: 600, letterSpacing: "0.05em",
              background: catStyle.bg, color: catStyle.color, fontFamily: "'Georgia', serif",
            }}>
              {catStyle.label}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px", fontSize: 12, color: "#6b6b62", fontFamily: "'Georgia', serif" }}>
          {stop.location && <span>📍 {stop.location}</span>}
          {stop.durationHours && <span>⏱ {stop.durationHours}h</span>}
          {stop.estimatedCost != null && <span>💰 ${stop.estimatedCost}</span>}
          <span style={{ color: statusStyle.color, fontWeight: 600 }}>{statusStyle.label}</span>
        </div>

        {stop.notes && (
          <div style={{ marginTop: 5, fontSize: 12, color: "#9ca3af", fontStyle: "italic", fontFamily: "'Georgia', serif" }}>
            {stop.notes}
          </div>
        )}

        {/* Votes */}
        {(stop.approveCount > 0 || stop.rejectCount > 0) && (
          <div style={{ display: "flex", gap: 8, marginTop: 5 }}>
            <span style={{ fontSize: 11, color: "#15803d", fontFamily: "'Georgia', serif" }}>
              👍 {stop.approveCount}
            </span>
            <span style={{ fontSize: 11, color: "#dc2626", fontFamily: "'Georgia', serif" }}>
              👎 {stop.rejectCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ItineraryView({ tripId, token }) {
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tripId || !token) return;
    setLoading(true);
    setError("");
    api._request("GET", `/trips/${tripId}/itinerary`, null, token)
      .then(data => setItinerary(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [tripId, token]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0", gap: 10, color: "#9ca3af" }}>
      <Spinner /> Loading itinerary…
    </div>
  );

  if (error) return (
    <div style={{ padding: "16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626", fontFamily: "'Georgia', serif" }}>
      {error}
    </div>
  );

  if (!itinerary) return null;

  return (
    <div>
      {/* Summary row */}
      <div style={{
        display: "flex", gap: 20, flexWrap: "wrap",
        padding: "14px 18px", background: "#fafaf8",
        borderRadius: 10, marginBottom: 20,
        border: "1px solid #f0f0eb",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a18", fontFamily: "'Georgia', serif" }}>
            ${itinerary.totalEstimatedCost || 0}
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'Georgia', serif" }}>
            Total Est. Cost
          </div>
        </div>
        <div style={{ width: 1, background: "#e8e8e3", flexShrink: 0 }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a18", fontFamily: "'Georgia', serif" }}>
            {itinerary.confirmedStopCount || 0}
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'Georgia', serif" }}>
            Confirmed Stops
          </div>
        </div>
        <div style={{ width: 1, background: "#e8e8e3", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 180 }}>
          {itinerary.costByCategory && (
            <CostBar costByCategory={itinerary.costByCategory} total={itinerary.totalEstimatedCost} />
          )}
        </div>
      </div>

      {/* Days */}
      {(itinerary.days || []).length === 0 ? (
        <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "40px 0", fontFamily: "'Georgia', serif" }}>
          No itinerary days found
        </div>
      ) : (
        itinerary.days.map((day) => (
          <div key={day.date} style={{ marginBottom: 24 }}>
            {/* Day header */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 10,
            }}>
              <div style={{
                fontSize: 12, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", color: "#6b6b62", fontFamily: "'Georgia', serif",
              }}>
                {day.label}
              </div>
              {day.dailyCost > 0 && (
                <div style={{ fontSize: 12, color: "#6b6b62", fontFamily: "'Georgia', serif" }}>
                  Daily: <strong style={{ color: "#1a1a18" }}>${day.dailyCost}</strong>
                </div>
              )}
            </div>

            {/* Stops */}
            {day.stops.length === 0 ? (
              <div style={{ fontSize: 13, color: "#c0c0b8", fontStyle: "italic", fontFamily: "'Georgia', serif", paddingLeft: 22 }}>
                No stops planned for this day
              </div>
            ) : (
              <div style={{ paddingLeft: 8 }}>
                {day.stops
                  .sort((a, b) => (a.visitOrder ?? 0) - (b.visitOrder ?? 0))
                  .map(stop => (
                    <StopCard key={stop.stopId} stop={stop} />
                  ))
                }
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
