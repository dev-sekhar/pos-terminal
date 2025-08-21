import * as Yup from "yup";

// The `export` keyword is added directly to the constant declaration.
// This makes `branchSchema` a named export from this module.
export const branchSchema = Yup.object().shape({
  name: Yup.string()
    .required("Branch name is required.")
    .min(3, "Branch name must be at least 3 characters long."),
  
  tag: Yup.string()
    .required("Branch tag is required.")
    .matches(/^[A-Z0-9_-]+$/, "Tag can only contain uppercase letters, numbers, underscores, and hyphens."),
    
  location: Yup.string().optional(),
  
  active: Yup.boolean().default(true),
});

// We also export the inferred TypeScript type for potential use in services.
export type BranchInput = Yup.InferType<typeof branchSchema>;