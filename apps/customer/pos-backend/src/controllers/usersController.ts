import { Request, Response, NextFunction } from 'express'; // Import NextFunction for error handling
import { AuthenticatedRequest } from '../types/express';
import * as userService from '../services/usersService';

/**
 * Creates the UserContextPayload object that the service layer expects.
 * It combines the user info from the JWT (via authMiddleware) with the
 * tenant's DATABASE ID (via tenantMiddleware).
 * @param req The authenticated request object.
 * @returns The context payload for the service layer.
 */
const createServiceContext = (req: AuthenticatedRequest) => {
  return {
    ...req.user,
    // This is the critical fix: use the tenant's database ID, not the subdomain.
    tenantId: req.tenant.id,
  };
};


// All function signatures now use the standard `(req: Request, res: Response)`
export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Assert the type on the first line to get type safety
    const context = createServiceContext(req as AuthenticatedRequest);
    const users = await userService.listUsers(context);
    res.json(users);
  } catch (error: any) {
    next(error); // Pass errors to the global error handler
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const userId = parseInt(req.params.id, 10);
    const user = await userService.getUserById(userId, context);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error: any) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const newUser = await userService.createUser(req.body, context);
    res.status(201).json(newUser);
  } catch (error: any) {
    if (error.message && error.message.includes('limit exceeded')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const userId = parseInt(req.params.id, 10);
    const updatedUser = await userService.updateUser(userId, req.body, context);
    res.json(updatedUser);
  } catch (error: any) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = createServiceContext(req as AuthenticatedRequest);
    const userId = parseInt(req.params.id, 10);
    await userService.deleteUser(userId, context);
    res.status(204).send();
  } catch (error: any) {
    next(error);
  }
};