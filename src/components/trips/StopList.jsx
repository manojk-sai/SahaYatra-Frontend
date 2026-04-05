import { useState } from "react";
import { S } from "../../styles/theme";
import { Icon } from "../ui/Icons";
import { Input } from "../ui/Input";
import { Spinner } from "../ui/Spinner";

const CATEGORY_COLORS = {
  ACCOMMODATION: { bg: "#eff6ff", color: "#1d4ed8" },
  FOOD:          { bg: "#fef9c3", color: "#a16207" },
  ACTIVITY:      { bg: "#f0fdf4", color: "#15803d" },
  TRANSPORT:     { bg: "#fff7ed", color: "#c2410c" },
  OTHER:         { bg: "#f3f4f6", color: "#4b5563" },
};

const STATUS_COLORS = {
  PROPOSED:  { color: "#d97706", label: "Proposed"  },
  CONFIRMED: { color: "#16a34a", label: "Confirmed" },
  REJECTED:  { color: "#dc2626", label: "Rejected"  },
};

function AddStopForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({
    name: "", location: "", category: "ACTIVITY",
    visitDate: "", durationHours: "", estimatedCost: "", notes: "", mustVisit: false,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name) { setError("Stop name is required."); return; }
    setError(""); setLoading(true);
    try {
      await onAdd({
        name:          form.name,
        location:      form.location || undefined,
        category:      form.category,
        visitDate:     form.visitDate || undefined,
        durationHours: form.durationHours ? parseInt(form.durationHours) : undefined,
        estimatedCost: form.estimatedCost ? parseFloat(form.estimatedCost) : undefined,
        notes:         form.notes || undefined,
        mustVisit:     form.mustVisit,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#fafaf8", border: "1px dashed #d4d4cc", borderRadius: 10, padding: "16px 18px", marginTop: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#6b6b62", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>Add stop</div>
      {error && <div style={{ ...S.error, marginBottom: 12 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Input label="Name" value={form.name} onChange={set("name")} placeholder="e.g. Shinjuku Gyoen" autoFocus />
          <Input label="Location" value={form.location} onChange={set("location")} placeholder="City or address" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div style={S.inputWrap}>
            <label style={S.label}>Category</label>
            <select value={form.category} onChange={e => set("category")(e.target.value)} style={{ ...S.input, fontSize: 13 }}>
              {["ACCOMMODATION","FOOD","ACTIVITY","TRANSPORT","OTHER"].map(c => (
                <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <Input label="Visit date" type="date" value={form.visitDate} onChange={set("visitDate")} />
          <Input label="Duration (hrs)" type="number" value={form.durationHours} onChange={set("durationHours")} placeholder="2" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Input label="Estimated cost ($)" type="number" value={form.estimatedCost} onChange={set("estimatedCost")} placeholder="0.00" />
          <div style={S.inputWrap}>
            <label style={S.label}>Notes</label>
            <input value={form.notes} onChange={e => set("notes")(e.target.value)} placeholder="Optional notes" style={{ ...S.input, fontSize: 13 }} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <input type="checkbox" id="mustVisit" checked={form.mustVisit} onChange={e => set("mustVisit")(e.target.checked)} style={{ width: 14, height: 14, cursor: "pointer" }} />
          <label htmlFor="mustVisit" style={{ fontSize: 12, color: "#6b6b62", cursor: "pointer" }}>Mark as must-visit (non-voteable)</label>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" style={{ ...S.btnPrimary, fontSize: 12, padding: "9px 16px" }} disabled={loading}>
            {loading ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Spinner /> Adding…</span> : "Add stop"}
          </button>
          <button type="button" onClick={onCancel} style={{ ...S.btnSecondary, fontSize: 12, padding: "9px 14px" }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export function StopsList({ stops = [], isContributor, onAddStop, onRemoveStop }) {
  const [showForm,  setShowForm]  = useState(false);
  const [removing,  setRemoving]  = useState(null);

  const handleAdd = async data => {
    await onAddStop(data);
    setShowForm(false);
  };

  const handleRemove = async stopId => {
    setRemoving(stopId);
    try { await onRemoveStop(stopId); }
    finally { setRemoving(null); }
  };

  const sorted = [...stops].sort((a, b) => a.visitOrder - b.visitOrder);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b6b62" }}>
          Stops · {stops.length}
        </div>
        {isContributor && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{ ...S.btnSm, fontSize: 12, padding: "6px 12px", display: "flex", alignItems: "center", gap: 5 }}
          >
            <Icon.Plus /> Add stop
          </button>
        )}
      </div>

      {/* Empty state */}
      {stops.length === 0 && !showForm && (
        <div style={{ textAlign: "center", padding: "28px 0", color: "#9ca3af", fontSize: 13 }}>
          No stops yet. {isContributor ? "Add your first stop below." : ""}
        </div>
      )}

      {/* Stop rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map((stop, i) => {
          const catStyle = CATEGORY_COLORS[stop.category] || CATEGORY_COLORS.OTHER;
          const stStatus = STATUS_COLORS[stop.status]     || STATUS_COLORS.PROPOSED;
          return (
            <div key={stop.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: "#fafaf8", borderRadius: 10, border: "1px solid #f0f0eb" }}>
              {/* Order badge */}
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#e8e8e3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#6b6b62", flexShrink: 0, marginTop: 1 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a18" }}>{stop.name}</span>
                  {stop.mustVisit && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10, background: "#fef3c7", color: "#92400e" }}>Must visit</span>
                  )}
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10, background: catStyle.bg, color: catStyle.color }}>
                    {stop.category.charAt(0) + stop.category.slice(1).toLowerCase()}
                  </span>
                  <span style={{ fontSize: 10, color: stStatus.color, fontWeight: 600 }}>{stStatus.label}</span>
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#9ca3af", flexWrap: "wrap" }}>
                  {stop.location     && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Icon.MapPin />{stop.location}</span>}
                  {stop.visitDate    && <span>{stop.visitDate}</span>}
                  {stop.durationHours && <span>{stop.durationHours}h</span>}
                  {stop.estimatedCost != null && <span>${parseFloat(stop.estimatedCost).toFixed(2)}</span>}
                </div>
                {stop.notes && <div style={{ fontSize: 11, color: "#6b6b62", marginTop: 4, fontStyle: "italic" }}>{stop.notes}</div>}
              </div>
              {/* Remove */}
              {isContributor && !stop.mustVisit && (
                <button
                  onClick={() => handleRemove(stop.id)}
                  disabled={removing === stop.id}
                  title="Remove stop"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4, flexShrink: 0, display: "flex", alignItems: "center", transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#dc2626"}
                  onMouseLeave={e => e.currentTarget.style.color = "#d1d5db"}
                >
                  {removing === stop.id ? <Spinner /> : <Icon.Trash />}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {showForm && <AddStopForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />}
    </div>
  );
}
