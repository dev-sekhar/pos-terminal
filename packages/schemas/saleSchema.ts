import * as Yup from 'yup';

const saleItemSchema = Yup.object().shape({
  productId: Yup.number()
    .typeError("Please select a product")
    .required("Please select a product")
    .positive("Please select a valid product"),
    
  quantity: Yup.number()
    .typeError("Quantity must be a number")
    .required("Quantity is required")
    .positive("Quantity must be positive")
    .integer("Quantity must be a whole number"),
    
  price: Yup.number()
    .typeError("Price must be a number")
    .required("Price is required")
    .min(0, "Price must be positive"),
    
  discount: Yup.number()
    .typeError("Discount must be a number")
    .optional()
    .min(0, "Discount must be positive")
    .default(0),
    
  tax: Yup.number()
    .typeError("Tax must be a number")
    .optional()
    .min(0, "Tax must be positive")
    .default(0)
});

export const saleSchema = Yup.object().shape({
  invoice: Yup.string()
    .required("Invoice number is required")
    .min(1, "Invoice number must not be empty"),
    
  total: Yup.number()
    .typeError("Total must be a number")
    .optional()
    .min(0, "Total must be positive"),
    
  discount: Yup.number()
    .typeError("Discount must be a number")
    .optional()
    .min(0, "Discount must be positive")
    .default(0),
    
  paymentType: Yup.string()
    .optional(),
    
  datetime: Yup.date()
    .typeError("Date must be a valid date")
    .required("Date is required"),
    
  userId: Yup.number()
    .typeError("User ID must be a number")
    .required("Salesperson is required")
    .positive("User ID must be positive"),
    
  branchId: Yup.number()
    .typeError("Branch ID must be a number")
    .required("Branch is required")
    .positive("Branch ID must be positive"),
    
  items: Yup.array()
    .of(saleItemSchema)
    .required("Sale items are required")
    .min(1, "At least one item is required"),
    
  userName: Yup.string()
    .required("User Name is required")
    .min(1, "User Name must not be empty"),
    
  status: Yup.string()
    .optional()
    .oneOf(['completed', 'pending', 'cancelled'], "Invalid status")
    .default('completed')
});

export type SaleInput = Yup.InferType<typeof saleSchema>;
export type SaleItemInput = Yup.InferType<typeof saleItemSchema>;