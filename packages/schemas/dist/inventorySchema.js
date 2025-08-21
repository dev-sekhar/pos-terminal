import * as Yup from 'yup';
export const inventorySchema = Yup.object().shape({
    branchId: Yup.number()
        .typeError("Branch ID must be a number")
        .required("Branch is required")
        .positive("Branch ID must be positive"),
    productId: Yup.number()
        .typeError("Product ID must be a number")
        .required("Product is required")
        .positive("Product ID must be positive"),
    stock: Yup.number()
        .typeError("Stock must be a number")
        .required("Stock is required")
        .min(0, "Stock must be positive"),
    reorderLevel: Yup.number()
        .typeError("Reorder level must be a number")
        .required("Reorder level is required")
        .min(0, "Reorder level must be positive"),
});
