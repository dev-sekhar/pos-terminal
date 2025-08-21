import * as Yup from 'yup';
export const supplierSchema = Yup.object().shape({
    name: Yup.string()
        .required("Supplier name is required")
        .min(1, "Supplier name must not be empty"),
    contact: Yup.string()
        .required("Contact is required")
        .min(1, "Contact must not be empty"),
    email: Yup.string()
        .required("Email is required")
        .email("Invalid email format"),
    address: Yup.string()
        .optional(),
    active: Yup.boolean()
        .optional()
        .default(true)
});
