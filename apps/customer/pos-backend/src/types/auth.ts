export interface ClientLoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    tenantId: string;
    role: string;
    // ...other user fields
  };
  tenant: {
    id: string;
    subdomain: string;
    // ...other tenant fields
  };
}