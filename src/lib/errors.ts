export type AppErrorCode =
  | 'UNAUTHENTICATED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'CONFLICT';

export class AppError extends Error {
  code: AppErrorCode;
  fieldErrors?: Record<string, string[]>;
  statusCode: number;

  constructor(message: string, code: AppErrorCode = 'BAD_REQUEST', statusCode: number = 400, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}

export function mapPostgresError(error: unknown): { code: AppErrorCode; message: string; statusCode: number } {
  if (!error || typeof error !== 'object') {
    return { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.', statusCode: 500 };
  }

  const err = error as { code?: string; message?: string };
  const code = err.code || err.message || '';
  const message = err.message || '';

  // Postgres Error Code 23505 = Unique Violation
  if (code === '23505' || message.includes('unique constraint')) {
    if (message.includes('sku')) {
      return { code: 'CONFLICT', message: 'An item with this SKU already exists.', statusCode: 409 };
    }
    return { code: 'CONFLICT', message: 'A record with these details already exists.', statusCode: 409 };
  }

  // Postgres Error Code 23514 = Check Violation
  if (code === '23514' || message.includes('check constraint')) {
    if (message.includes('quantity') || message.includes('delta')) {
      return { code: 'BAD_REQUEST', message: 'Not enough stock available.', statusCode: 400 };
    }
    return { code: 'BAD_REQUEST', message: 'Invalid data provided violating business rules.', statusCode: 400 };
  }

  // Postgres Error Code 23503 = Foreign Key Violation
  if (code === '23503') {
    return { code: 'BAD_REQUEST', message: 'Referenced entity does not exist.', statusCode: 400 };
  }

  // Postgres Error Code P0002 = No Data Found
  if (code === 'P0002' || message === 'item_not_found') {
    return { code: 'NOT_FOUND', message: 'The requested item was not found.', statusCode: 404 };
  }

  // Default fallback - never leak raw SQL or stack traces to client
  return { code: 'INTERNAL_ERROR', message: 'A database error occurred. Please try again.', statusCode: 500 };
}
