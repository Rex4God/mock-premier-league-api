import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger';
import { AuthResponse } from '../interfaces/responses/auth-response.interface';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    return authHeader.split(' ')[1];
  }
  return null;
};

const sendErrorResponse = (res: Response, statusCode: number, message: string): void => {
  res.status(statusCode).json({
    status: false,
    error: 'Authentication failed',
    message,
  });
};

export const authMiddleware = (roles: string[]) => async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      logger.warn('Missing token in request');
      return sendErrorResponse(res, StatusCodes.UNAUTHORIZED, 'Token is missing or invalid!');
    }

    const authResponse: AuthResponse = await authService.validateToken(token);

    if (authResponse.status === 'error') {
      logger.warn(`Invalid token: ${authResponse.message}`);
      return sendErrorResponse(res, authResponse.statusCode || StatusCodes.UNAUTHORIZED, authResponse.message || 'Invalid or expired token');
    }

    const user = authResponse.data;

    if (roles.length && user && !roles.includes(user.role)) {
      logger.warn(`Unauthorized access attempt by user ${user.userId} with role ${user.role}`);
      return sendErrorResponse(res, StatusCodes.FORBIDDEN, 'You do not have sufficient privileges to access this resource');
    }

    req.user = {
      userId: user.userId,
      role: user.role,
    };

    next();
  } catch (error) {
    logger.error('Token validation error', { error });
    return sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Something went wrong during token validation');
  }
};

export default authMiddleware;
