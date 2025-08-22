import * as Yup from 'yup';

export const settingsSchema = Yup.object().shape({
  currency: Yup.string().optional(),
  timezone: Yup.string().optional(),
  paymentTypes: Yup.array().of(Yup.string()).optional(),
  units: Yup.array().of(Yup.string()).optional(),
  tenantDisplayName: Yup.string().optional(),
  logo: Yup.string().optional(),
  financialYearStart: Yup.string().oneOf(['January', 'April', 'July', 'October']).optional(),
  taxRate: Yup.number().optional(),
  companyName: Yup.string().optional(),
  companyAddress: Yup.string().optional(),
  dashboardWidgets: Yup.object().shape({
    totalToday: Yup.boolean().optional(),
    mtdChart: Yup.boolean().optional(),
    fytdChart: Yup.boolean().optional(),
    topToday: Yup.boolean().optional(),
    topMonth: Yup.boolean().optional(),
    topYear: Yup.boolean().optional()
  }).optional()
});

export type SettingsInput = Yup.InferType<typeof settingsSchema>;