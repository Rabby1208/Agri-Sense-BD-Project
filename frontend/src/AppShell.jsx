
import { useEffect, useState } from "react";

import App from "./App";
import AuthPage from "./components/AuthPage";
import FarmerDashboard from "./components/FarmerDashboard";
import BuyerDashboard from "./components/BuyerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ExpertDashboard from "./components/ExpertDashboard";

// Get saved user and token
function getSavedUser() {
  try {
    const savedUser = localStorage.getItem("agrisense_user");
    const token = localStorage.getItem("agrisense_token");

    if (!savedUser || !token) {
      return null;
    }

    return JSON.parse(savedUser);
  } catch (error) {
    console.error("Unable to read saved user:", error);
    return null;
  }
}

// Determine initial page
function getInitialPage() {
  const hash = window.location.hash;

  if (hash === "#login" || hash === "#register") {
    return "auth";
  }

  return getSavedUser() ? "dashboard" : "home";
}

function AppShell() {
  const [page, setPage] = useState(getInitialPage);

  const [authMode, setAuthMode] = useState(
    window.location.hash === "#register" ? "register" : "login"
  );

  const [user, setUser] = useState(getSavedUser);

  // Handle browser hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;

      if (hash === "#login") {
        setAuthMode("login");
        setPage("auth");
      } else if (hash === "#register") {
        setAuthMode("register");
        setPage("auth");
      } else {
        setPage(user ? "dashboard" : "home");
      }
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [user]);

  // Login success
  const handleLogin = (loggedInUser, token) => {
    if (!loggedInUser || !loggedInUser.role || !token) {
      console.error("Invalid login response");
      return;
    }

    localStorage.setItem("agrisense_token", token);

    localStorage.setItem(
      "agrisense_user",
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);
    setPage("dashboard");

    window.dispatchEvent(new Event("agrisense-auth-changed"));

    window.history.replaceState(
      null,
      "",
      window.location.pathname
    );
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("agrisense_token");
    localStorage.removeItem("agrisense_user");

    setUser(null);
    setPage("home");

    window.dispatchEvent(new Event("agrisense-auth-changed"));

    window.history.replaceState(
      null,
      "",
      window.location.pathname
    );
  };

  // Open login or register
  const openAuth = (mode) => {
    setAuthMode(mode);
    setPage("auth");

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}#${mode}`
    );
  };

  // Return to home
  const handleBack = () => {
    setPage("home");

    window.history.replaceState(
      null,
      "",
      window.location.pathname
    );
  };

  // Authentication page
  if (page === "auth") {
    return (
      <AuthPage
        initialMode={authMode}
        onLogin={handleLogin}
        onBack={handleBack}
      />
    );
  }

  // Role-based dashboard routing
  if (user && page === "dashboard") {
    switch (user.role) {
      case "FARMER":
        return (
          <FarmerDashboard
            user={user}
            onLogout={handleLogout}
          />
        );

      case "BUYER":
        return (
          <BuyerDashboard
            user={user}
            onLogout={handleLogout}
          />
        );

      case "ADMIN":
        return (
          <AdminDashboard
            user={user}
            onLogout={handleLogout}
          />
        );

      case "AGRI_EXPERT":
        return (
          <ExpertDashboard
            user={user}
            onLogout={handleLogout}
          />
        );

      default:
        return (
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "15px",
              padding: "30px",
              textAlign: "center"
            }}
          >
            <h2>Unknown account role</h2>

            <p>
              Your account role is not recognized.
              Please contact the administrator.
            </p>

            <button onClick={handleLogout}>
              Logout
            </button>
          </div>
        );
    }
  }

  // Public Homepage
  return <App />;
}

export default AppShell;
