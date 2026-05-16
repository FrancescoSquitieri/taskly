import type { Response } from 'express';
import type { ApiResponse, PaginatedResult } from '@repo/types/api';

export const respondOk = <TData>(res: Response, data: TData, status = 200): Response => {
  const body: ApiResponse<TData> = { ok: true, data };
  return res.status(status).json(body);
};

export const respondCreated = <TData>(res: Response, data: TData): Response =>
  respondOk(res, data, 201);

export const respondPaginated = <TItem>(
  res: Response,
  payload: PaginatedResult<TItem>,
): Response => respondOk(res, payload);
