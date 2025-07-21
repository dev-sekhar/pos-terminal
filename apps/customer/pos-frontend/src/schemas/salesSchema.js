import * as Yup from "yup";
import saleItemSchema from "./saleItemSchema";

const salesSchema = Yup.object().shape({
  datetime: Yup.string().required("Date/Time is required"),
  invoice: Yup.string().required("Invoice number is required"),
  salesperson: Yup.string().required("Salesperson is required"),
  branch: Yup.string().required("Branch is required"),
  paymentType: Yup.string().required("Payment type is required"),
  discount: Yup.number().typeError("Discount must be a number").min(0).max(100),
  items: Yup.array().of(saleItemSchema).min(1, "At least one item is required"),
});

export default salesSchema;
