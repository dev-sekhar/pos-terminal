import * as Yup from 'yup';
export const productCategorySchema = Yup.object().shape({
    name: Yup.string()
        .required("Category name is required")
        .min(1, "Category name must not be empty"),
    description: Yup.string()
        .optional(),
    userName: Yup.string()
        .required("User Name is required")
        .min(1, "User Name must not be empty"),
    active: Yup.boolean()
        .optional()
        .default(true)
});
