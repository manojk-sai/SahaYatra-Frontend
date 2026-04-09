const API_BASE = "http://localhost:8080";

async function request(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || `Error ${res.status}`);
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
    if (!res.ok && res.status !== 204) throw new Error(`Error ${res.status}`);
  },

  async markAllNotificationsRead(token) {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok && res.status !== 204) throw new Error(`Error ${res.status}`);
  },

  // ── Phase 5: Itinerary ───────────────────────────────
  async getItinerary(tripId, token) {
    return request("GET", `/trips/${tripId}/itinerary`, null, token);
  },
};
