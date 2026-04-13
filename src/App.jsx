import { useState } from "react";
import { S } from "./styles/theme";
import { Nav } from "./components/layout/Nav";
import { LoginScreen } from "./pages/LoginScreen";
import { RegisterScreen } from "./pages/RegisterScreen";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { Trips } from "./pages/Trips";
import { TripDetail } from "./pages/TripDetail";
import { Notifications } from "./pages/Notifications";
import { useNotifications } from "./hooks/useNotifications";

export default function App() {
  const isLikelyJwt = (value) => typeof value === "string" && value.split(".").length === 3;

  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("rw_token") || "";
    if (storedToken && !isLikelyJwt(storedToken)) {
      localStorage.removeItem("rw_token");
      return "";
    }
    return storedToken;
  });
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem("rw_user") || "null"); } catch { return null; }
  });
  const [screen,       setScreen]       = useState(() => {
    const hasToken = !!localStorage.getItem("rw_token");
    const hasUser  = !!localStorage.getItem("rw_user");
    return (hasToken && hasUser) ? "dashboard" : "login";
  });
  const [activeTripId, setActiveTripId] = useState(null);

  // Phase 5: notification state — only active when authenticated
  const {
    notifications,
    unreadCount,
    loading: notifLoading,
    error:   notifError,
    reload:  reloadNotifs,
    markRead,
    markAllRead,
  } = useNotifications(token);

  const handleLogin = (tok, usr) => {
    setToken(tok); setUser(usr);
    if (isLikelyJwt(tok)) {
      localStorage.setItem("rw_token", tok);
    } else {
      localStorage.removeItem("rw_token");
    }
    localStorage.setItem("rw_user", JSON.stringify(usr));
    setScreen("dashboard");
  };

  const handleLogout = () => {
    setToken(""); setUser(null);
    localStorage.removeItem("rw_token");
    localStorage.removeItem("rw_user");
    setScreen("login");
  };

  const handleUserUpdate = updated => {
    setUser(updated);
    localStorage.setItem("rw_user", JSON.stringify(updated));
  };

  const openTrip = tripId => { setActiveTripId(tripId); setScreen("tripDetail"); };
  const closeTrip = ()   => { setActiveTripId(null);    setScreen("trips");     };

  // Open trip from notification click
  const openTripFromNotif = tripId => {
    setActiveTripId(tripId);
    setScreen("tripDetail");
  };

  if (screen === "login")    return <LoginScreen    onLogin={handleLogin} onGoRegister={() => setScreen("register")} />;
  if (screen === "register") return <RegisterScreen onLogin={handleLogin} onGoLogin={() => setScreen("login")} />;

  const currentUserRef = {
    id:       user?.id || user?._id || user?.userId || "",
    username: user?.username || "",
    email:    user?.email    || "",
  };

  return (
    <div style={S.page}>
      <style>{`* { box-sizing: border-box; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <Nav
        user={user}
        screen={screen}
        onNav={setScreen}
        onLogout={handleLogout}
        unreadCount={unreadCount}       // Phase 5: badge count
      />

      {screen === "dashboard"     && <Dashboard user={user} token={token} onNav={setScreen} />}
      {screen === "trips"         && <Trips token={token} currentUserRef={currentUserRef} onOpenTrip={openTrip} />}
      {screen === "tripDetail"    && activeTripId && (
        <TripDetail token={token} tripId={activeTripId} currentUserRef={currentUserRef} onBack={closeTrip} />
      )}
      {screen === "profile"       && <Profile user={user} token={token} onUserUpdate={handleUserUpdate} />}

      {/* Phase 5: Notifications screen */}
      {screen === "notifications" && (
        <Notifications
          notifications={notifications}
          unreadCount={unreadCount}
          loading={notifLoading}
          error={notifError}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onOpenTrip={openTripFromNotif}
        />
      )}
    </div>
  );
}
