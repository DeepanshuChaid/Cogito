export const errorHandler = (err, req, res, next) => {
    console.error("💥 Unhandled Error:", err);
    const status = typeof err.status === "number" ? err.status : 500;
    const message = typeof err.message === "string"
        ? err.message
        : "Internal Server Error";
    res.status(status).json({
        message,
    });
};
