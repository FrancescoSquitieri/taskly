export interface ApiSuccess<TData> {
  ok: true;
  data: TData;
}

export interface ApiFieldError {
  path: string;
  message: string;
}

export interface ApiFailure {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: ApiFieldError[];
  };
}

export type ApiResponse<TData> = ApiSuccess<TData> | ApiFailure;

export interface PaginatedResult<TItem> {
  items: TItem[];
  nextCursor: string | null;
}
