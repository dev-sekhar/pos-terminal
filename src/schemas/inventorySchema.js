import * as Yup from "yup";

const inventorySchema = Yup.object().shape({
  branch: Yup.string().required("Branch is required"),
  product: Yup.string().required("Product is required"),
  stock: Yup.number()
    .typeError("Stock must be a number")
    .required("Stock is required")
    .min(0, "Stock must be positive"),
  reorderLevel: Yup.number()
    .typeError("Reorder level must be a number")
    .required("Reorder level is required")
    .min(0, "Reorder level must be positive"),
  userName: Yup.string().required("User Name is required"),
});

export default inventorySchema;
