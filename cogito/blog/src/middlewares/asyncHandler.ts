import { Request, Response, NextFunction, RequestHandler } from 'express'

export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
  try {
    await  fn(req, res, next);
  } catch (error) {
    next(error); // Pass the error to Express error handler
  }
  }
}

