import { useState, useCallback } from "react";
import { api } from "../api/client";

export function useTrips(token) {
  const [trips,   setTrips]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const loadMyTrips = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await api.getMyTrips(token);
      setTrips(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createTrip = useCallback(async (formData) => {
    const trip = await api.createTrip(formData, token);
    setTrips(prev => [trip, ...prev]);
    return trip;
  }, [token]);

  const updateTripInList = useCallback((updated) => {
    setTrips(prev => prev.map(t => t.id === updated.id ? updated : t));
  }, []);

  const removeTripFromList = useCallback((tripId) => {
    setTrips(prev => prev.filter(t => t.id !== tripId));
  }, []);

  return { trips, loading, error, loadMyTrips, createTrip, updateTripInList, removeTripFromList };
}
