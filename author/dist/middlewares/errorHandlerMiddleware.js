export const errorHandler = (err, req, res, next) => {
    console.error('💥 Unhandled Error:', err);
    // Safely get message
    let message = 'Internal Server Error';
    if (err instanceof Error) {
        message = err.message;
    }
    else if (typeof err === 'object' && err !== null && 'error' in err) {
        // @ts-ignore
        message = err.error;
    }
    res.status(500).json({ error: message, message });
};
