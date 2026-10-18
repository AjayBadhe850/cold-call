import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    res.status(400).json({
      error: 'Validation Error',
      details: formattedErrors
    });
    return;
  }

  // Handle malformed JSON request body
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: 'Invalid JSON payload'
    });
    return;
  }

  // General server error - do not expose stack trace or private internals to client
  console.error('[API Error]:', err?.message || err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message && status < 500 ? err.message : 'Internal Server Error'
  });
}
