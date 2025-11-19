import { Elysia } from 'elysia';
import { AppError, type ErrorResponse } from '~/core/errors';
import { logger } from '~/core/logger';

export const errorHandler = () =>
  new Elysia({ name: 'error-handler' }).onError(({ error, set, request }) => {
    const requestId = request.headers.get('x-request-id') ?? 
                     request.headers.get('x-correlation-id') ?? 
                     crypto.randomUUID();
    
    const timestamp = new Date().toISOString();
    const path = new URL(request.url).pathname;

    // Handle known application errors
    if (error instanceof AppError) {
      const errorResponse: ErrorResponse = {
        error: {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
          requestId,
          timestamp,
          path,
          context: error.context,
        },
      };

      // Log operational errors at warning level
      if (error.isOperational) {
        logger.warn({
          error: {
            name: error.name,
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            stack: error.stack,
            context: error.context,
          },
          requestId,
          path,
          method: request.method,
        }, `Operational error: ${error.message}`);
      } else {
        // Log programming errors at error level
        logger.error({
          error: {
            name: error.name,
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            stack: error.stack,
            context: error.context,
          },
          requestId,
          path,
          method: request.method,
        }, `Programming error: ${error.message}`);
      }

      set.status = error.statusCode;
      return errorResponse;
    }

    // Handle validation errors from Elysia
    if ('code' in error && error.code === 'VALIDATION') {
      const errorMessage = String(error).includes('validation') ? String(error) : 'Validation failed';
      
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          requestId,
          timestamp,
          path,
          context: {
            details: errorMessage,
          },
        },
      };

      logger.warn({
        error: {
          name: 'ValidationError',
          message: errorMessage,
          code: error.code,
        },
        requestId,
        path,
        method: request.method,
      }, 'Validation error');

      set.status = 400;
      return errorResponse;
    }

    // Handle authentication errors from Better Auth
    if (typeof error === 'object' && error && 'message' in error && 
        (error.message?.includes('Unauthorized') ?? error.message?.includes('Authentication'))) {
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Authentication required',
          code: 'AUTHENTICATION_ERROR',
          statusCode: 401,
          requestId,
          timestamp,
          path,
        },
      };

      logger.warn({
        error: {
          name: ('name' in error && error.name) ?? 'AuthError',
          message: error.message,
          stack: ('stack' in error && error.stack) ?? undefined,
        },
        requestId,
        path,
        method: request.method,
      }, 'Authentication error');

      set.status = 401;
      return errorResponse;
    }

    // Handle unexpected errors
    const errorMessage = (typeof error === 'object' && error && 'message' in error) 
      ? error.message as string 
      : 'Unknown error occurred';

    const errorResponse: ErrorResponse = {
      error: {
        message: process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : errorMessage,
        code: 'INTERNAL_ERROR',
        statusCode: 500,
        requestId,
        timestamp,
        path,
        ...(process.env.NODE_ENV !== 'production' && {
          context: {
            stack: (typeof error === 'object' && error && 'stack' in error) ? error.stack : undefined,
            name: (typeof error === 'object' && error && 'name' in error) ? error.name : 'Unknown',
          },
        }),
      },
    };

    // Log unexpected errors at error level
    logger.error({
      error: {
        name: (typeof error === 'object' && error && 'name' in error) ? error.name : 'Unknown',
        message: errorMessage,
        stack: (typeof error === 'object' && error && 'stack' in error) ? error.stack : undefined,
        code: (typeof error === 'object' && error && 'code' in error) ? error.code : undefined,
      },
      requestId,
      path,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
    }, `Unexpected error: ${errorMessage}`);

    // TODO: Send to Sentry or other error tracking service
    // await sendToSentry(error, { requestId, path, method: request.method });

    set.status = 500;
    return errorResponse;
  });