import * as Yup from 'yup';
export declare const settingsSchema: Yup.ObjectSchema<{
    currency: string | undefined;
    timezone: string | undefined;
    paymentTypes: (string | undefined)[] | undefined;
    units: (string | undefined)[] | undefined;
    tenantDisplayName: string | undefined;
    logo: string | undefined;
    financialYearStart: "January" | "April" | "July" | "October" | undefined;
    taxRate: number | undefined;
    companyName: string | undefined;
    companyAddress: string | undefined;
    dashboardWidgets: {
        totalToday?: boolean | undefined;
        mtdChart?: boolean | undefined;
        fytdChart?: boolean | undefined;
        topToday?: boolean | undefined;
        topMonth?: boolean | undefined;
        topYear?: boolean | undefined;
    } | undefined;
}, Yup.AnyObject, {
    currency: undefined;
    timezone: undefined;
    paymentTypes: "";
    units: "";
    tenantDisplayName: undefined;
    logo: undefined;
    financialYearStart: undefined;
    taxRate: undefined;
    companyName: undefined;
    companyAddress: undefined;
    dashboardWidgets: {
        totalToday: undefined;
        mtdChart: undefined;
        fytdChart: undefined;
        topToday: undefined;
        topMonth: undefined;
        topYear: undefined;
    };
}, "">;
export type SettingsInput = Yup.InferType<typeof settingsSchema>;
