import { Request, Response, NextFunction } from 'express';
import { AnySchema, ValidationError, ObjectSchema } from 'yup';

/**
 * Creates a middleware that validates the request body against a provided Yup schema.
 * @param schema The Yup schema to validate against.
 * @returns An Express middleware function.
 */
export const validate = (schema: AnySchema) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate the request body.
    // `abortEarly: false` ensures all validation errors are collected.
    // `stripUnknown: true` removes any properties from the body that are not in the schema.
    const validatedBody = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: false,  // Temporarily disabled to allow dashboardWidgets
    });
    
    // Replace the request body with the validated and sanitized version.
    req.body = validatedBody;
    console.log('Validation Middleware - Validated body:', JSON.stringify(validatedBody, null, 2));

    // If validation is successful, proceed to the next handler (the controller).
    return next();
  } catch (error) {
    // If validation fails, it will be a Yup ValidationError.
    if (error instanceof ValidationError) {
      console.error("Validation Error:", error.errors);
      // Get field order from schema
      const fieldOrder = Object.keys((schema as ObjectSchema<any>).fields || {});
      // Sort errors by field order in schema
      const sortedErrors = error.inner.sort((a, b) => {
        const aIndex = fieldOrder.indexOf(a.path || '');
        const bIndex = fieldOrder.indexOf(b.path || '');
        return aIndex - bIndex;
      });
      // Return a 400 Bad Request with a structured error message.
      return res.status(400).json({
        message: 'Validation failed',
        errors: sortedErrors.map(err => ({
          path: err.path,
          message: err.message,
        })),
      });
    }
    // For any other unexpected errors, pass them to the global error handler.
    return next(error);
  }
};