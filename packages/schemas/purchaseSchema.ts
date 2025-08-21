import * as Yup from 'yup';

export const purchaseSchema = Yup.object().shape({
  poNumber: Yup.string()
    .required("PO Number is required")
    .min(1, "PO Number must not be empty"),
    
  datetime: Yup.date()
    .required("Date and time is required")
    .typeError("Invalid date format"),
    
  supplierId: Yup.number()
    .typeError("Please select a supplier")
    .required("Please select a supplier")
    .positive("Please select a valid supplier"),
    
  branchId: Yup.number()
    .typeError("Branch ID must be a number")
    .required("Branch is required")
    .positive("Branch ID must be positive"),
    
  items: Yup.array()
    .of(
      Yup.object().shape({
        productId: Yup.number()
          .typeError("Please select a product")
          .required("Please select a product")
          .positive("Please select a valid product"),
        quantity: Yup.number()
          .typeError("Quantity must be a number")
          .required("Quantity is required")
          .positive("Quantity must be greater than zero")
      })
    )
    .required("Items are required")
    .min(1, "At least one item is required"),
    
  total: Yup.number()
    .typeError("Total must be a number")
    .optional()
    .min(0, "Total must be positive"),
    
  status: Yup.string()
    .optional()
    .default("completed")
});

export type PurchaseInput = Yup.InferType<typeof purchaseSchema>;