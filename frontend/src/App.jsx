import React, { useState, useEffect } from "react";
// set token in header
import { setToken } from "./services/api.js";
import Auth from "./components/Auth";
import Dashboard from "./pages/Dashboard";

const saved = localStorage.getItem("user");
const savedToken = localStorage.getItem("token");
if (savedToken) setToken(savedToken);

const App = () => {
  // if user available save them improve it don't save sensitive data like token in localstorage
  const [user, setUser] = useState(saved ? JSON.parse(saved) : null);

  // Logout out user by removing or saved user from localstorage improve make it server side
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  // Remove Trading view Logo injected by lightweight-charts library
  useEffect(() => {
    const removeLogo = () => {
      const element = document.getElementById("tv-attr-logo");

      if (element) {
        element.remove();
      }
    };

    // Remove it if it already exists
    removeLogo();

    // Watch for dynamically added elements
    const observer = new MutationObserver(() => {
      removeLogo();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Optimize version only check the newly added component
  // useEffect(() => {
  //   const removeLogo = () => {
  //     document.getElementById("tv-attr-logo")?.remove();
  //   };

  //   removeLogo();

  //   const observer = new MutationObserver((mutations) => {
  //     for (const mutation of mutations) {
  //       for (const node of mutation.addedNodes) {
  //         if (node.nodeType === Node.ELEMENT_NODE) {
  //           const element = node;

  //           if (element.id === "tv-attr-logo") {
  //             element.remove();
  //           }

  //           element.querySelector?.("#tv-attr-logo")?.remove();
  //         }
  //       }
  //     }
  //   });

  //   observer.observe(document.body, {
  //     childList: true,
  //     subtree: true,
  //   });

  //   return () => observer.disconnect();
  // }, []);

  if (!user) return <Auth onLogin={setUser} />;
  return <Dashboard user={user} onLogout={logout} />;
};

export default App;
