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
    <BrowserRouter>
      {/* --- THIS IS THE CORRECTED ORDER --- */}
      {/* TenantProvider has no dependencies, so it can be on the outside. */}
      <TenantProvider>
        {/* UserProvider is next, as other contexts depend on it. */}
        <UserProvider>
          {/* BranchProvider needs the user, so it must be inside UserProvider. */}
          <BranchProvider>
            {/* SettingsProvider needs the user, so it must also be inside UserProvider. */}
            <SettingsProvider>
              <App />
            </SettingsProvider>
          </BranchProvider>
        </UserProvider>
      </TenantProvider>
    </BrowserRouter>
  </React.StrictMode>
);
