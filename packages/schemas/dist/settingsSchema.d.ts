import * as Yup from 'yup';
export declare const settingsSchema: Yup.ObjectSchema<{
    currency: string | undefined;
    timezone: string | undefined;
    paymentTypes: (string | undefined)[] | undefined;
    units: (string | undefined)[] | undefined;
    tenantDisplayName: string | undefined;
    logo: string | undefined;
    taxRate: number | undefined;
    companyName: string | undefined;
    companyAddress: string | undefined;
    dashboardWidgets: {} | undefined;
}, Yup.AnyObject, {
    currency: undefined;
    timezone: undefined;
    paymentTypes: "";
    units: "";
    tenantDisplayName: undefined;
    logo: undefined;
    taxRate: undefined;
    companyName: undefined;
    companyAddress: undefined;
    dashboardWidgets: {};
}, "">;
export type SettingsInput = Yup.InferType<typeof settingsSchema>;
