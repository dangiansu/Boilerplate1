import { Request, Response, NextFunction } from 'express'
import AppError from '../utils/AppError'

const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction): Response => {
  const statusCode = err.statusCode || 500
  const errorMessage = err.message || 'Internal Server Error'

  return res.status(statusCode).json({
    status: 'error',
    message: errorMessage,
  })
}

export default errorHandler
