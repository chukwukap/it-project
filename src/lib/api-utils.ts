import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ZodError, ZodSchema } from "zod";

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================================================
// Error Codes
// ============================================================================

export const ErrorCodes = {
  // Authentication
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",

  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",

  // Resources
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",

  // Server
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
} as const;

// ============================================================================
// Response Helpers
// ============================================================================

export function successResponse<T>(
  data: T,
  status: number = 200,
  meta?: ApiSuccessResponse<T>["meta"]
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true as const,
      data,
      ...(meta && { meta }),
    },
    { status }
  );
}

export function errorResponse(
  code: keyof typeof ErrorCodes,
  message: string,
  status: number = 400,
  details?: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false as const,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

export function unauthorizedResponse(
  message: string = "Authentication required"
) {
  return errorResponse("UNAUTHORIZED", message, 401);
}

export function forbiddenResponse(message: string = "Access denied") {
  return errorResponse("FORBIDDEN", message, 403);
}

export function notFoundResponse(resource: string = "Resource") {
  return errorResponse("NOT_FOUND", `${resource} not found`, 404);
}

export function validationErrorResponse(error: ZodError) {
  const details: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!details[path]) {
      details[path] = [];
    }
    details[path].push(issue.message);
  }

  return errorResponse(
    "VALIDATION_ERROR",
    "Invalid request data",
    400,
    details
  );
}

export function serverErrorResponse(
  message: string = "An unexpected error occurred"
) {
  return errorResponse("INTERNAL_ERROR", message, 500);
}

// ============================================================================
// Request Helpers
// ============================================================================

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session) {
    throw new AuthError("Authentication required");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    throw new ForbiddenError("Admin access required");
  }
  return session;
}

export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<T> {
  const body = await request.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    throw new ValidationError(result.error);
  }

  return result.data;
}

export function parseSearchParams(request: Request) {
  return new URL(request.url).searchParams;
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

// ============================================================================
// Custom Errors
// ============================================================================

export class ApiError extends Error {
  constructor(
    public code: keyof typeof ErrorCodes,
    message: string,
    public status: number = 400,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class AuthError extends ApiError {
  constructor(message: string = "Authentication required") {
    super("UNAUTHORIZED", message, 401);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = "Access denied") {
    super("FORBIDDEN", message, 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = "Resource") {
    super("NOT_FOUND", `${resource} not found`, 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends ApiError {
  constructor(zodError: ZodError) {
    const details: Record<string, string[]> = {};

    for (const issue of zodError.issues) {
      const path = issue.path.join(".") || "root";
      if (!details[path]) {
        details[path] = [];
      }
      details[path].push(issue.message);
    }

    super("VALIDATION_ERROR", "Invalid request data", 400, details);
    this.name = "ValidationError";
  }
}

// ============================================================================
// Error Handler Wrapper
// ============================================================================

// Next.js 16 Route Handler types - params is now a Promise
type NextRouteContext<
  T extends Record<string, string> = Record<string, string>
> = {
  params: Promise<T>;
};

type ApiHandler<T extends Record<string, string> = Record<string, string>> = (
  request: Request,
  context: NextRouteContext<T>
) => Promise<NextResponse>;

type SimpleApiHandler = (request: Request) => Promise<NextResponse>;

export function withErrorHandler<T extends Record<string, string>>(
  handler: ApiHandler<T>
): ApiHandler<T>;
export function withErrorHandler(handler: SimpleApiHandler): SimpleApiHandler;
export function withErrorHandler(
  handler: ApiHandler | SimpleApiHandler
): ApiHandler | SimpleApiHandler {
  return async (request: Request, context?: NextRouteContext) => {
    try {
      if (context) {
        return await (handler as ApiHandler)(request, context);
      }
      return await (handler as SimpleApiHandler)(request);
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof ApiError) {
        return errorResponse(
          error.code,
          error.message,
          error.status,
          error.details
        );
      }

      if (error instanceof Error) {
        return serverErrorResponse(
          process.env.NODE_ENV === "development"
            ? error.message
            : "An unexpected error occurred"
        );
      }

      return serverErrorResponse();
    }
  };
}

// ============================================================================
// Type Exports
// ============================================================================

export type { ZodSchema };
