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
    return request("GET", `/trips/${tripId}`, null, token);
  },
  async updateTrip(tripId, data, token) {
    return request("PATCH", `/trips/${tripId}`, data, token);
  },
  async advanceTripStatus(tripId, token) {
    return request("POST", `/trips/${tripId}/advance`, null, token);
  },
  async lockTrip(tripId, token) {
    return request("POST", `/trips/${tripId}/lock`, null, token);
  },

  // ── Phase 2: Stops ───────────────────────────────────
  async addStop(tripId, data, token) {
    return request("POST", `/trips/${tripId}/stops`, data, token);
  },
  async removeStop(tripId, stopId, token) {
    return request("DELETE", `/trips/${tripId}/stops/${stopId}`, null, token);
  },
  async reorderStops(tripId, orderedIds, token) {
    return request("PATCH", `/trips/${tripId}/stops/reorder`, orderedIds, token);
  },
  async voteStop(tripId, stopId, voteType, token) {
    return request("POST", `/trips/${tripId}/stops/${stopId}/vote`, { voteType }, token);
  },

  // ── Phase 2: Members ─────────────────────────────────
  async inviteMember(tripId, userId, role, token) {
    return request("POST", `/trips/${tripId}/invite`, { userId, role }, token);
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
};
