import { Request, Response, NextFunction } from 'express'
import { HTTP_STATUS, MESSAGES } from '../config/constants'
import AppError from '../utils/AppError'
import User, { IUser } from '../models/userModel'
import * as userService from '../services/userService'
import { responseData, responseMessage } from '../helper/response'

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { search, startDate, endDate } = req.query

    const users = await userService.getAllUsers({
      search: search as string,
      startDate: startDate as string,
      endDate: endDate as string,
    })
    responseData({
      res,
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: responseMessage('success', 'get', 'user'),
      data: users,
    })
  } catch (error) {
    return next(new AppError(MESSAGES.SERVER, HTTP_STATUS.INTERNAL_SERVER_ERROR))
  }
}

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const userId = req.params.id

    // Check if the user ID is a valid MongoDB ObjectId
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError('This type of id is not valid', HTTP_STATUS.BAD_REQUEST))
    }

    const user = await userService.getUserById(userId)
    if (!user) {
      return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND))
    }

    responseData({
      res,
      statusCode: HTTP_STATUS.OK,
      success: true,
      data: user,
    })
  } catch (error) {
    return next(new AppError(MESSAGES.SERVER, HTTP_STATUS.INTERNAL_SERVER_ERROR))
  }
}

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const userData: IUser = req.body
    const existingUser = await User.findOne({ email: userData.email })

    if (existingUser) {
      return responseData({
        res,
        statusCode: HTTP_STATUS.BAD_REQUEST,
        success: false,
        message: responseMessage('success', 'created', 'user'),
        data: null,
      })
    }

    const newUser = await userService.createUser(userData)

    responseData({
      res,
      statusCode: HTTP_STATUS.CREATED,
      success: true,
      message: responseMessage('success', 'updated', 'users'),
      data: newUser,
    })
  } catch (error) {
    return next(new AppError(MESSAGES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR))
  }
}

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { email, password } = req.body

    const token = await userService.login(email, password)

    responseData({
      res,
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: responseMessage('user_logged', 'login', 'user'),
      data: { token },
    })
  } catch (error) {
    return next(new AppError(MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED))
  }
}

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const userId = req.params.id

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError('This type of id is not valid', HTTP_STATUS.BAD_REQUEST))
    }

    const userData: Partial<IUser> = req.body

    if (Object.keys(userData).length === 0) {
      return next(new AppError(MESSAGES.EMPTY_BODY, HTTP_STATUS.BAD_REQUEST))
    }

    if (userData.email) {
      return next(new AppError(MESSAGES.EMAIL_UPDATE_FORBIDDEN, HTTP_STATUS.FORBIDDEN))
    }

    const updatedUser = await userService.updateUser(userId, userData)

    if (!updatedUser) {
      return next(new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND))
    }

    responseData({
      res,
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: responseMessage('updated', 'update', 'user'),
      data: updatedUser,
    })
  } catch (error) {
    return next(new AppError(MESSAGES.SERVER, HTTP_STATUS.INTERNAL_SERVER_ERROR))
  }
}

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const userId = req.params.id

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError('This type of id is not valid', HTTP_STATUS.BAD_REQUEST))
    }

    const deletedUser = await userService.deleteUser(userId)

    if (!deletedUser) {
      return next(new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND))
    }

    responseData({
      res,
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: responseMessage('deleted', 'delete', 'user'),
      data: null,
    })
  } catch (error) {
    return next(new AppError(MESSAGES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR))
  }
}

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { oldPassword, newPassword } = req.body
  const userId = req.params.id

  if (oldPassword === newPassword) {
    return next(new AppError(MESSAGES.SAME_PASSWORD_ERROR, HTTP_STATUS.BAD_REQUEST))
  }

  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new AppError('Invalid user ID format', HTTP_STATUS.BAD_REQUEST))
  }

  try {
    const updatedUser = await userService.changePassword(userId, oldPassword, newPassword)

    if (!updatedUser) {
      return next(new AppError(MESSAGES.WRONG_PASSWORD, HTTP_STATUS.NOT_FOUND))
    }

    responseData({
      res,
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: 'Password changed successfully',
      data: null,
    })
  } catch (error) {
    return next(new AppError(MESSAGES.SERVER, HTTP_STATUS.INTERNAL_SERVER_ERROR))
  }
}

export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { email } = req.body

  if (!email) {
    return next(new AppError('Email is required', HTTP_STATUS.BAD_REQUEST))
  }

  try {
    const token = await userService.requestPasswordReset(email)

    if (!token) {
      return next(new AppError('User not found or email could not be sent', HTTP_STATUS.NOT_FOUND))
    }

    responseData({
      res,
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: MESSAGES.EMAIL_SEND,
      data: { token },
    })
  } catch (error) {
    return next(new AppError(MESSAGES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR))
  }
}

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { newPassword } = req.body
  const { token } = req.query

  if (!newPassword) {
    return next(new AppError('New password is required', HTTP_STATUS.BAD_REQUEST))
  }

  if (typeof token !== 'string') {
    return next(new AppError('Valid token is required', HTTP_STATUS.BAD_REQUEST))
  }

  try {
    const result = await userService.resetPassword(token, newPassword)

    if (!result.success) {
      return next(new AppError(result.message, HTTP_STATUS.BAD_REQUEST))
    }

    responseData({
      res,
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: result.message,
      data: null,
    })
  } catch (error) {
    return next(new AppError(MESSAGES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR))
  }
}
