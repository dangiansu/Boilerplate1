import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import AppError from '../utils/AppError'
import { IUser } from '../models/userModel'
import { HTTP_STATUS } from '../config/constants'

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser
  }
}

const protect = (req: Request, res: Response, next: NextFunction): void => {
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', HTTP_STATUS.FORBIDDEN)
    )
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      return next(new AppError('Token expired', HTTP_STATUS.UNAUTHORIZED))
    }
    req.user = decoded as IUser
    next()
  })
}

export default protect
