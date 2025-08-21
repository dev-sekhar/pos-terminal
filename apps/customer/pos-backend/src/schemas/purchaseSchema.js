import * as Yup from "yup";
import purchaseItemSchema from "./purchaseItemSchema";

const purchaseSchema = Yup.object().shape({
  datetime: Yup.string().required("Date/Time is required"),
  poNumber: Yup.string().required("PO number is required"),
  supplier: Yup.string().required("Supplier is required"),
  branch: Yup.string().required("Branch is required"),
  userName: Yup.string().required("User Name is required"),
  items: Yup.array()
    .of(purchaseItemSchema)
    .min(1, "At least one item is required"),
});

export default purchaseSchema;
