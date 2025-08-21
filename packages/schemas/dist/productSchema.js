import * as Yup from 'yup';
export const productSchema = Yup.object().shape({
    name: Yup.string()
        .required("Product name is required")
        .min(1, "Product name must not be empty"),
    code: Yup.string()
        .required("Product code is required")
        .min(1, "Product code must not be empty"),
    unit: Yup.string()
        .required("Unit is required")
        .min(1, "Unit must not be empty"),
    price: Yup.number()
        .typeError("Price must be a number")
        .required("Price is required")
        .min(0, "Price must be positive"),
    productCategoryId: Yup.number()
        .typeError("Product category ID must be a number")
        .required("Product category is required")
        .positive("Product category ID must be positive"),
    active: Yup.boolean()
        .optional()
        .default(true)
});
