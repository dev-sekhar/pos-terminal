import * as Yup from 'yup';
export const settingsSchema = Yup.object().shape({
    currency: Yup.string().optional(),
    timezone: Yup.string().optional(),
    paymentTypes: Yup.array().of(Yup.string()).optional(),
    units: Yup.array().of(Yup.string()).optional(),
    tenantDisplayName: Yup.string().optional(),
    logo: Yup.string().optional(),
    taxRate: Yup.number().optional(),
    companyName: Yup.string().optional(),
    companyAddress: Yup.string().optional(),
    dashboardWidgets: Yup.object().optional()
});
