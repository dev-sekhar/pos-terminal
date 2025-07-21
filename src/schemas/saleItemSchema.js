import * as Yup from "yup";

const saleItemSchema = Yup.object().shape({
  productId: Yup.mixed().required("Product is required"),
  name: Yup.string().required("Product name is required"),
  qty: Yup.number()
    .typeError("Quantity must be a number")
    .required("Quantity is required")
    .min(1),
  price: Yup.number()
    .typeError("Price must be a number")
    .required("Price is required")
    .min(0),
  discount: Yup.number().typeError("Discount must be a number").min(0).max(100),
  tax: Yup.number().typeError("Tax must be a number").min(0).max(100),
});

export default saleItemSchema;
