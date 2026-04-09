import { useState, useCallback, useEffect } from "react";
import { api } from "../api/client";

export function useNotifications(token) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError("");
    try {
      const data = await api.getNotifications(token, false);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial load
  useEffect(() => { reload(); }, [reload]);

  const markRead = useCallback(async (notificationId) => {
    // Optimistic UI update first
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await api.markNotificationRead(notificationId, token);
    } catch {
      // Revert on failure
      reload();
    }
  }, [token, reload]);

  const markAllRead = useCallback(async () => {
    // Optimistic
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await api.markAllNotificationsRead(token);
    } catch {
      reload();
    }
  }, [token, reload]);

  return { notifications, unreadCount, loading, error, reload, markRead, markAllRead };
}
