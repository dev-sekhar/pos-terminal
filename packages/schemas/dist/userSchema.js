import * as Yup from 'yup';
export const userSchema = Yup.object().shape({
    name: Yup.string()
        .required("Name is required")
        .min(1, "Name must not be empty"),
    email: Yup.string()
        .required("Email is required")
        .email("Invalid email format"),
    password: Yup.string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters"),
    role: Yup.string()
        .required("Role is required")
        .oneOf(['ADMIN', 'MANAGER', 'CASHIER'], "Invalid role"),
    branchId: Yup.number()
        .typeError("Please select a branch")
        .required("Please select a branch")
        .positive("Please select a valid branch")
});
