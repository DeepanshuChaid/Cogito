import { AppError } from "./appError.js";
export const errorHandler = (err, req, res, next) => {
    console.error("💥 ERROR:", err);
    // Default values
    let statusCode = 500;
    let message = "Internal Server Error";
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof Error) {
        message = err.message;
    }
    res.status(statusCode).json({
        success: false,
        message,
    });
};
