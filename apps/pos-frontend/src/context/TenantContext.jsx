import React, { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_TENANTS = ['AcmeCorp', 'BetaInc'];

const TenantContext = createContext();

export const useTenant = () => useContext(TenantContext);

function getSubdomain() {
  const host = window.location.hostname;
  // e.g., acme.yourapp.com or acme.localhost
  const parts = host.split('.');
  if (parts.length > 2) {
    return parts[0];
  }
  // For localhost:3000 or similar, support acme.localhost
  if (parts.length === 2 && parts[1] === 'localhost') {
    return parts[0];
  }
  return null;
}

export const TenantProvider = ({ children }) => {
  const [tenants, setTenants] = useState(() => {
    const saved = localStorage.getItem('tenantsList');
    return saved ? JSON.parse(saved) : DEFAULT_TENANTS;
  });
  const [tenant, setTenant] = useState(() => {
    const sub = getSubdomain();
    const saved = localStorage.getItem('currentTenant');
    if (sub && (saved === null || saved === undefined)) {
      // If subdomain matches a known tenant, use it
      const match = DEFAULT_TENANTS.find(t => t.toLowerCase() === sub.toLowerCase());
      if (match) return match;
      // Otherwise, use subdomain as tenant
      return sub;
    }
    return saved || DEFAULT_TENANTS[0];
  });

  useEffect(() => {
    localStorage.setItem('currentTenant', tenant);
  }, [tenant]);

  useEffect(() => {
    localStorage.setItem('tenantsList', JSON.stringify(tenants));
  }, [tenants]);

  // If subdomain changes, update tenant
  useEffect(() => {
    const sub = getSubdomain();
    if (sub && tenants.map(t => t.toLowerCase()).includes(sub.toLowerCase()) && tenant.toLowerCase() !== sub.toLowerCase()) {
      setTenant(tenants.find(t => t.toLowerCase() === sub.toLowerCase()));
    }
  }, [tenants]);

  return (
    <TenantContext.Provider value={{ tenant, setTenant, tenants, setTenants }}>
      {children}
    </TenantContext.Provider>
  );
}; 