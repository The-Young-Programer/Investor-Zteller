/**
 * Secure error handling and logging utilities
 */

// Sanitize error messages for client-side display
export function sanitizeErrorMessage(error: unknown): string {
  // Default generic error message for production
  const defaultErrorMessage = "An unexpected error occurred. Please try again later.";
  
  if (process.env.NODE_ENV === 'development') {
    // In development, provide more detailed error messages
    if (error instanceof Error) {
      return error.message;
    } else if (typeof error === 'string') {
      return error;
    } else {
      return JSON.stringify(error);
    }
  } else {
    // In production, use generic messages to avoid leaking sensitive information
    if (error instanceof Error) {
      // Map known error types to user-friendly messages
      if (error.message.includes('network') || error.message.includes('connect')) {
        return "Network connection error. Please check your internet connection and try again.";
      } else if (error.message.includes('timeout')) {
        return "The request timed out. Please try again later.";
      } else if (error.message.includes('permission') || error.message.includes('access')) {
        return "You don't have permission to perform this action.";
      } else if (error.message.includes('not found') || error.message.includes('404')) {
        return "The requested resource was not found.";
      } else if (error.message.includes('validation') || error.message.includes('invalid')) {
        return "Please check your input and try again.";
      }
    }
    
    // Default to generic message for unhandled error types
    return defaultErrorMessage;
  }
}

// Log errors securely without sensitive information
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const contextPrefix = context ? `[${context}] ` : '';
  
  if (error instanceof Error) {
    console.error(`${timestamp} ${contextPrefix}Error: ${error.message}`);
    if (error.stack && process.env.NODE_ENV === 'development') {
      console.error(`${timestamp} Stack: ${error.stack}`);
    }
  } else if (typeof error === 'string') {
    console.error(`${timestamp} ${contextPrefix}Error: ${error}`);
  } else {
    try {
      console.error(`${timestamp} ${contextPrefix}Error:`, JSON.stringify(error));
    } catch (e) {
      console.error(`${timestamp} ${contextPrefix}Error: [Unstringifiable error object]`);
    }
  }
}

// Format validation errors for API responses
export function formatValidationErrors(errors: Record<string, string[]>): { 
  error: string;
  details?: Record<string, string[]>;
} {
  return {
    error: "Validation failed. Please check your input.",
    details: process.env.NODE_ENV === 'development' ? errors : undefined,
  };
}

// Create a standardized API error response
export function createErrorResponse(error: unknown, statusCode = 500): Response {
  const errorMessage = sanitizeErrorMessage(error);
  
  return new Response(
    JSON.stringify({
      error: errorMessage,
      status: statusCode,
      timestamp: new Date().toISOString(),
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}