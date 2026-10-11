
import { Response } from 'express'

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function ApiResponse(
  res: Response,
  success: boolean,
  message: string,
  statusCode: number,
  data?: unknown,
  errors?: unknown
) {
  const status = statusCode ?? (success ? 200 : 500)
  return res.status(status).json({
    success,
    message,
    ...(success ? { data } : { errors })
  })
}

export function sendPaginated(
  res: Response,
  message: string,
  data: unknown,
  pagination: PaginationMeta,
  statusCode: number = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination
  })
}

export function getPaginationData(
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
}

export function getPaginationParams(
  queryPage?: string,
  queryLimit?: string
) {
  const page = Math.max(1, parseInt(queryPage || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(queryLimit || "10", 10)));
  const skip = (page - 1) * limit;

  return {page, limit, skip}
}