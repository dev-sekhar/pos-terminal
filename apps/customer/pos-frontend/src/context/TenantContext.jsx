import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { authenticatedFetch } from "../utils/api";
import { useUser } from "./UserContext";

const TenantContext = createContext();
export const useTenant = () => useContext(TenantContext);

export const TenantProvider = ({ children }) => {
  const { user } = useUser();

  const [tenant, setTenant] = useState("");
  const [tenants, setTenants] = useState([]);
  const [tenantLocked, setTenantLocked] = useState(false);
  const [branding, setBranding] = useState({
    tenantDisplayName: "",
    logo: null,
  });

  const setTenantAndLock = (tenantName) => {
    setTenant(tenantName);
    setTenantLocked(true);
  };

  useEffect(() => {
    const fetchBrandingInfo = async () => {
      if (user) {
        try {
          const data = await authenticatedFetch("/api/tenants/public-info");
          setBranding(data.branding);
          setTenant(data.name);
          setTenantLocked(true);
        } catch (error) {
          console.error("Failed to fetch tenant branding:", error);
        }
      } else {
        setBranding({ tenantDisplayName: "", logo: null });
        setTenant("");
        setTenantLocked(false);
      }
    };
    fetchBrandingInfo();
  }, [user]);

  const value = useMemo(
    () => ({
      tenant,
      setTenant,
      tenants,
      setTenants,
      tenantLocked,
      setTenantAndLock,
      branding,
    }),
    [tenant, tenants, tenantLocked, branding]
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
};
