import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error("Error:", err.message);

  if (err.name === "AppError") {
    const appErr = err as AppError;
    return res.status(appErr.statusCode).json({
      success: false,
      message: appErr.message,
    });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: (err as any).issues ?? err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
