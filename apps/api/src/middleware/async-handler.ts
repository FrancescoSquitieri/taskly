import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncHandler<TReq extends Request = Request> = (
  req: TReq,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export const asyncHandler =
  <TReq extends Request = Request>(handler: AsyncHandler<TReq>): RequestHandler =>
  (req, res, next) => {
    handler(req as TReq, res, next).catch(next);
  };
