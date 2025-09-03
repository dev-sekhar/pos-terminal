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
  paymentAlert?: {
    totalOverdue: number;
    daysPastDue: number;
    stage: 'normal' | 'readonly' | 'blocked';
    canEdit: boolean;
    isUrgent: boolean;
  };
  paymentStatus?: {
    canLogin: boolean;
    canEdit: boolean;
    daysPastDue: number;
    stage: 'normal' | 'readonly' | 'blocked';
    message?: string;
  };
}