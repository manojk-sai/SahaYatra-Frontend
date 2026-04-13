import { useEffect, useMemo, useState } from "react";
import { S } from "../../styles/theme";
import { US_CITIES } from "../../data/usCities";

export function CitySelector({ label = "City", value, onChange, error }) {
  const isPresetValue = useMemo(() => US_CITIES.includes(value || ""), [value]);
  const [useCustom, setUseCustom] = useState(() => !!value && !US_CITIES.includes(value));

  useEffect(() => {
    if (!value) return;
    setUseCustom(!US_CITIES.includes(value));
  }, [value]);

  const selectedValue = useCustom ? "__custom__" : (isPresetValue ? value : "");

  const onSelect = (next) => {
    if (next === "__custom__") {
      setUseCustom(true);
      onChange("");
      return;
    }

    setUseCustom(false);
    onChange(next);
  };

  return (
    <div style={S.inputWrap}>
      {label && <label style={S.label}>{label}</label>}
      <select
        value={selectedValue}
        onChange={(e) => onSelect(e.target.value)}
        style={{ ...S.input, borderColor: error ? "#fca5a5" : "#e2e2dc" }}
      >
        <option value="">Select a city</option>
        {US_CITIES.map((city) => (
          <option key={city} value={city}>{city}</option>
        ))}
        <option value="__custom__">Other location</option>
      </select>

      {useCustom && (
        <input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your location"
          style={{ ...S.input, marginTop: 8, borderColor: error ? "#fca5a5" : "#e2e2dc" }}
        />
      )}

      {error && <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>{error}</div>}
    </div>
  );
}