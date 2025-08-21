import { Request, Response, NextFunction } from 'express';
import * as Yup from 'yup';

export const validate = (schema: Yup.ObjectSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log('\n=== Validation Middleware Start ===');
    console.log('Request URL:', req.url);
    console.log('Request Method:', req.method);
    console.log('Schema fields expected:', Object.keys(schema.fields));
    console.log('Received request body:', JSON.stringify(req.body, null, 2));
    
    // Transform the data to match schema expectations
    const transformedData = {
      branch: req.body.branchId,
      product: req.body.productId,
      stock: req.body.stock,
      reorderLevel: req.body.reorderLevel,
      userName: req.body.userName
    };
    
    console.log('Transformed data for validation:', JSON.stringify(transformedData, null, 2));
    
    try {
      const validated = await schema.validate(transformedData, { 
        abortEarly: false,
        stripUnknown: true 
      });
      
      console.log('Validation successful. Final data:', JSON.stringify(validated, null, 2));
      req.body = validated;
      next();
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const detailedError = {
          receivedData: transformedData,
          errors: err.errors,
          fields: err.inner.map(e => ({
            path: e.path,
            value: e.value,
            message: e.message,
            type: e.type
          }))
        };
        
        console.error('Validation failed:', JSON.stringify(detailedError, null, 2));
        
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: err.errors,
          details: detailedError
        });
      }
      console.error('Unexpected validation error:', err);
      next(err);
    }
    console.log('=== Validation Middleware End ===\n');
  };
};