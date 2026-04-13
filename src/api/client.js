const API_BASE = "http://localhost:8080";
const ZIPPOPOTAM_BASE = "https://api.zippopotam.us/us";
export class ApiError extends Error {
  constructor(message, status, fieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function normalizeError(data, status) {
  const fieldErrors = data?.errors && typeof data.errors === "object" ? data.errors : {};
  const message = data?.message || data?.detail || data?.error ||
  (Object.keys(fieldErrors).length ? "Please correct the fields.": `Error ${status}`);
  return new ApiError(message, status, fieldErrors);
}

async function request(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw normalizeError(data, res.status);
  return data;
}

function extractTrip(payload) {
  const isTrip = c =>
    c && typeof c === "object" && c.id &&
    (c.title !== undefined || c.status !== undefined ||
     Array.isArray(c.stops) || Array.isArray(c.members));
  const candidates = [payload, payload?.trip, payload?.updatedTrip, payload?.data?.trip, payload?.data];
  return candidates.find(isTrip) || null;
}

export const api = {
  // ── Phase 1: Auth ────────────────────────────────────
  async login(username, password) {
    return request("POST", "/auth/login", { username, password });
  },
  async register(formData) {
    return request("POST", "/auth/register", formData);
  },
  async getCurrentUser(token) {
    return request("GET", "/users/me", null, token);
  },
  async updateProfile(profileData, token) {
    return request("PUT", "/users/me", profileData, token);
  },

  // ── Phase 2: Trips ───────────────────────────────────
  async createTrip(data, token) {
    return request("POST", "/trips", data, token);
  },
  async getMyTrips(token) {
    return request("GET", "/trips/my", null, token);
  },
  async getPublicTrips() {
    return request("GET", "/trips/public", null, null);
  },
  async getTripById(tripId, token) {
    const data = await request("GET", `/trips/${tripId}`, null, token);
    return extractTrip(data) || data;
  },
  async updateTrip(tripId, data, token) {
    return request("PATCH", `/trips/${tripId}`, data, token);
  },
  async advanceTripStatus(tripId, token) {
    const data = await request("POST", `/trips/${tripId}/advance`, null, token);
    return extractTrip(data) || data;
  },
  async lockTrip(tripId, token) {
    return request("POST", `/trips/${tripId}/lock`, null, token);
  },

  // ── Phase 2: Stops ───────────────────────────────────
  async addStop(tripId, data, token) {
    const r = await request("POST", `/trips/${tripId}/stops`, data, token);
    return extractTrip(r) || r;
  },
  async removeStop(tripId, stopId, token) {
    const r = await request("DELETE", `/trips/${tripId}/stops/${stopId}`, null, token);
    return extractTrip(r) || r;
  },
  async reorderStops(tripId, orderedIds, token) {
    const r = await request("PATCH", `/trips/${tripId}/stops/reorder`, orderedIds, token);
    return extractTrip(r) || r;
  },

  // ── Phase 2: Members ─────────────────────────────────
  async inviteMember(tripId, userId, role, token) {
    const r = await request("POST", `/trips/${tripId}/invite`, { userId, role }, token);
    return extractTrip(r) || r;
  },
  async acceptInvite(inviteToken, token) {
    return request("POST", `/trips/join?token=${inviteToken}`, null, token);
  },
  async leaveTrip(tripId, token) {
    return request("POST", `/trips/${tripId}/leave`, null, token);
  },
  async transferOwnership(tripId, newOrganizerId, token) {
    return request("POST", `/trips/${tripId}/transfer`, { newOrganizerId }, token);
  },

  // ── Phase 3: Voting ──────────────────────────────────
  async voteStop(tripId, stopId, voteType, token) {
    const r = await request("POST", `/trips/${tripId}/stops/${stopId}/vote`, { voteType }, token);
    return extractTrip(r) || r;
  },
  async getStopVotes(tripId, stopId, token) {
    return request("GET", `/trips/${tripId}/stops/${stopId}/votes`, null, token);
  },

  // ── Phase 5: Notifications ───────────────────────────
  async getNotifications(token, unread = false) {
    return request("GET", `/notifications${unread ? "?unread=true" : ""}`, null, token);
  },

  async markNotificationRead(notificationId, token) {
    const res = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok && res.status !== 204) throw new ApiError(`Error ${res.status}`, res.status);
  },

  async markAllNotificationsRead(token) {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok && res.status !== 204) throw new ApiError(`Error ${res.status}`, res.status);
  },

  // ── Phase 5: Itinerary ───────────────────────────────
  async getItinerary(tripId, token) {
    return request("GET", `/trips/${tripId}/itinerary`, null, token);
  },

   // ── Utilities: US city/zipcode lookup ───────────────
  async lookupCityByZip(zipcode) {
    const zip = String(zipcode || "").trim();
    const res = await fetch(`${ZIPPOPOTAM_BASE}/${encodeURIComponent(zip)}`);
    if (!res.ok) throw new ApiError("Invalid zipcode", res.status);
    const data = await res.json();
    const place = data?.places?.[0];
    if (!place) throw new ApiError("Unable to resolve city from zipcode", 422);
    return {
      city: place["place name"],
      state: place["state abbreviation"],
      zipCode: data["post code"],
      places: (data.places || []).map((p) => ({
        city: p["place name"],
        state: p["state abbreviation"],
      })),
    };
  },

  async lookupZipByCity(cityWithState) {
    const raw = String(cityWithState || "").trim();
    const [city, state] = raw.split(",").map((v) => (v || "").trim());
    if (!city || !state) {
      throw new ApiError("Use city format: City, ST", 400);
    }

    const res = await fetch(`${ZIPPOPOTAM_BASE}/${encodeURIComponent(state)}/${encodeURIComponent(city)}`);
    if (!res.ok) throw new ApiError("Could not find zipcode for selected city", res.status);
    const data = await res.json();
    const first = data?.places?.[0];
    if (!first) throw new ApiError("Could not find zipcode for selected city", 422);
    return {
      zipCode: first["post code"],
      city: first["place name"],
      state: first["state abbreviation"],
      zipCodes: (data.places || []).map((p) => p["post code"]),
    };
  },
};
