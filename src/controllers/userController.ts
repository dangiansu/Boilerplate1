import { Request, Response, NextFunction } from 'express'
import { HTTP_STATUS } from '../config/constants'
import AppError from '../utils/AppError'
import User, { IUser } from '../models/userModel'
import * as userService from '../services/userService'
import { responseData, responseMessage } from '../helper/response'
import asyncHandler from '../utils/asynhandler'

export const getUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
  }
)

export const getUserById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.params.id

    // Check if the user ID is a valid MongoDB ObjectId
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('This type of id is not valid', HTTP_STATUS.BAD_REQUEST)
    }

    const user = await userService.getUserById(userId)
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND)
    }

    responseData({
      res,
      statusCode: HTTP_STATUS.OK,
      success: true,
      data: user,
    })
  }
)

export const createUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userData: IUser = req.body
    const existingUser = await User.findOne({ email: userData.email })

    if (existingUser) {
      return next(new AppError('user already exist', HTTP_STATUS.BAD_REQUEST))
    }

    const newUser = await userService.createUser(userData)

    responseData({
      res,
      statusCode: HTTP_STATUS.CREATED,
      success: true,
      message: responseMessage('success', 'created', 'user'),
      data: newUser,
    })
  }
)

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body

    const token = await userService.login(email, password)

    responseData({
      res,
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: responseMessage('user_logged', 'login', 'user'),
      data: { token },
    })
  }
)

export const updateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.params.id

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('This type of id is not valid', HTTP_STATUS.BAD_REQUEST)
    }

    const userData: Partial<IUser> = req.body

    if (Object.keys(userData).length === 0) {
      throw new AppError('Empty body is not required', HTTP_STATUS.BAD_REQUEST)
    }

    if (userData.email) {
      throw new AppError('you cant update email', HTTP_STATUS.FORBIDDEN)
    }

    const updatedUser = await userService.updateUser(userId, userData)

    if (!updatedUser) {
      throw new AppError('user not found', HTTP_STATUS.NOT_FOUND)
    }

    responseData({
      res,
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: responseMessage('updated', 'update', 'user'),
      data: updatedUser,
    })
  }
)

export const deleteUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.params.id

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('This type of id is not valid', HTTP_STATUS.BAD_REQUEST)
    }

    const deletedUser = await userService.deleteUser(userId)

    if (!deletedUser) {
      throw new AppError('user not found', HTTP_STATUS.NOT_FOUND)
    }

    responseData({
      res,
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: responseMessage('deleted', 'delete', 'user'),
      data: null,
    })
  }
)

export const changePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const { oldPassword, newPassword } = req.body
    const userId = req.params.id

    if (oldPassword === newPassword) {
      return next(new AppError('oldpassword and newpassword are same', HTTP_STATUS.BAD_REQUEST))
    }

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError('Invalid user ID format', HTTP_STATUS.BAD_REQUEST))
    }

    const updatedUser = await userService.changePassword(userId, oldPassword, newPassword)

    if (!updatedUser) {
      return next(new AppError('Wrong password', HTTP_STATUS.NOT_FOUND))
    }

    responseData({
      res,
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: 'Password changed successfully',
      data: null,
    })
  }
)

export const requestPasswordReset = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const { email } = req.body

    if (!email) {
      return next(new AppError('Email is required', HTTP_STATUS.BAD_REQUEST))
    }

    const token = await userService.requestPasswordReset(email)

    if (!token) {
      return next(new AppError('User not found or email could not be sent', HTTP_STATUS.NOT_FOUND))
    }

    responseData({
      res,
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: 'email send succussesfully',
      data: { token },
    })
  }
)

export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const { newPassword } = req.body
    const { token } = req.query

    if (!newPassword) {
      return next(new AppError('New password is required', HTTP_STATUS.BAD_REQUEST))
    }

    if (typeof token !== 'string') {
      return next(new AppError('Valid token is required', HTTP_STATUS.BAD_REQUEST))
    }

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
  }
)
