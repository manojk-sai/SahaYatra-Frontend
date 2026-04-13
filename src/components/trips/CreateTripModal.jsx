import { useState } from "react";
import { S } from "../../styles/theme";
import { Icon } from "../ui/Icons";
import { Input } from "../ui/Input";
import Spinner from "../ui/Spinner";
import { ApiError } from "../../api/client";

export function CreateTripModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    title: "", description: "", startDate: "", endDate: "",
    budgetCap: "", visibility: "INVITE_ONLY", votingMode: "MAJORITY",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [errors, setErrors] = useState({});

  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Title is required";
    if (!form.startDate) nextErrors.startDate = "Start date is required";
    if (!form.endDate) nextErrors.endDate = "End date is required";
    if (form.startDate && form.endDate && form.startDate > form.endDate) nextErrors.endDate = "End date must be after start date";
    if (form.budgetCap && Number(form.budgetCap) <= 0) nextErrors.budgetCap = "Budget cap must be a positive number";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setError("Please fix the errors in the form");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await onCreate({
        title:       form.title.trim(),
        description: form.description || undefined,
        startDate:   form.startDate,
        endDate:     form.endDate,
        budgetCap:   form.budgetCap ? parseFloat(form.budgetCap) : undefined,
        visibility:  form.visibility,
        votingMode:  form.votingMode,
      });
      onClose();
    } catch (err) {
      if(err instanceof ApiError){
        setError(err.fieldErrors || {});
      }
      setError(err.message || "An error occurred while creating the trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ ...S.card, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px" }}>New trip</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6b62", display: "flex", alignItems: "center", padding: 4 }}>
            <Icon.X />
          </button>
        </div>

        {error && <div style={S.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <Input label="Trip title" value={form.title} onChange={set("title")} placeholder="e.g. Tokyo Adventure" error={errors.title} autoFocus />

          <div style={S.inputWrap}>
            <label style={S.label}>Description <span style={{ fontWeight: 400, textTransform: "none", color: "#aaa" }}>(optional)</span></label>
            <textarea
              value={form.description}
              onChange={e => set("description")(e.target.value)}
              placeholder="What's the plan?"
              rows={2}
              style={{ ...S.input, resize: "vertical", lineHeight: 1.6 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Start date" type="date" value={form.startDate} onChange={set("startDate")} error={errors.startDate} />
            <Input label="End date"   type="date" value={form.endDate}   onChange={set("endDate")}   error={errors.endDate} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Budget cap ($)" type="number" value={form.budgetCap} onChange={set("budgetCap")} placeholder="0.00" error={errors.budgetCap} />
            <div style={S.inputWrap}>
              <label style={S.label}>Visibility</label>
              <select value={form.visibility} onChange={e => set("visibility")(e.target.value)} style={{ ...S.input }}>
                <option value="PRIVATE">Private</option>
                <option value="INVITE_ONLY">Invite only</option>
                <option value="PUBLIC">Public</option>
              </select>
            </div>
          </div>
          <div style={S.inputWrap}>
            <label style={S.label}>Voting mode</label>
            <select value={form.votingMode} onChange={e => set("votingMode")(e.target.value)} style={{ ...S.input }}>
              <option value="MAJORITY">Majority</option>
              <option value="UNANIMOUS">Unanimous</option>
              <option value="ORGANIZER">Organizer decides</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="submit" style={S.btnPrimary} disabled={loading}>
              {loading ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Spinner /> Creating…</span> : "Create trip"}
            </button>
            <button type="button" onClick={onClose} style={{ ...S.btnSecondary, flex: "0 0 auto" }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
