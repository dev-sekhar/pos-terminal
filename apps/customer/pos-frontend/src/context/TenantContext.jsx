import React, { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_TENANTS = ['AcmeCorp', 'BetaInc'];

const TenantContext = createContext();

export const useTenant = () => useContext(TenantContext);

function getSubdomain() {
  const host = window.location.hostname;
  const parts = host.split('.');
  if (parts.length > 2) {
    return parts[0];
  }
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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.tenant && user.tenant.name) return user.tenant.name;
    const sub = getSubdomain();
    if (sub) return sub; // Use subdomain if present
    const saved = localStorage.getItem('tenantName');
    return saved || DEFAULT_TENANTS[0];
  });
  const [tenantLocked, setTenantLocked] = useState(() => !!localStorage.getItem('token'));

  useEffect(() => {
    localStorage.setItem('tenantName', tenant);
  }, [tenant]);

  useEffect(() => {
    localStorage.setItem('tenantsList', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    const sub = getSubdomain();
    if (sub && tenants.map(t => t.toLowerCase()).includes(sub.toLowerCase()) && tenant.toLowerCase() !== sub.toLowerCase()) {
      setTenant(tenants.find(t => t.toLowerCase() === sub.toLowerCase()));
    }
  }, [tenants]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setTenantLocked(!!token);
  }, []);

  useEffect(() => {
    if (tenantLocked) {
      setTenants([tenant]);
    }
  }, [tenant, tenantLocked]);

  useEffect(() => {
    // If the current tenant is not in tenants, set tenants to [tenant] and lock
    if (!tenants.includes(tenant)) {
      setTenants([tenant]);
      setTenantLocked(true);
    }
  }, [tenant, tenants]);

  const setTenantAndLock = (tenantValue) => {
    setTenant(tenantValue);
    setTenantLocked(true);
    localStorage.setItem('tenantName', tenantValue);
  };

  return (
    <TenantContext.Provider value={{ tenant, setTenant, tenants, setTenants, tenantLocked, setTenantAndLock }}>
      {children}
    </TenantContext.Provider>
  );
}; 