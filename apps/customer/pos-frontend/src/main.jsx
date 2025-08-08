import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

import { TenantProvider } from "./context/TenantContext";
import { BranchProvider } from "./context/BranchContext";
import { UserProvider } from "./context/UserContext";
import { SettingsProvider } from "./context/SettingsContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* BrowserRouter is the top-level wrapper */}
    <BrowserRouter>
      {/* --- THIS IS THE FINAL, CORRECT ORDER --- */}
      {/* UserProvider has no dependencies on the others, so it can be on the outside. */}
      <UserProvider>
        {/* All other contexts depend on the user, so they must be nested inside. */}
        <TenantProvider>
          <BranchProvider>
            <SettingsProvider>
              <App />
            </SettingsProvider>
          </BranchProvider>
        </TenantProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
