import User, { IUser } from '../models/userModel'
import { parse, isValid, startOfDay, endOfDay } from 'date-fns'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { HTTP_STATUS } from '../config/constants'
import AppError from '../utils/AppError'
import { sendResetPasswordEmail } from '../helper/email'
import { UserQuery } from '../types/userTypes'

export const getAllUsers = async (query: UserQuery = {}): Promise<IUser[]> => {
  const { search, startDate, endDate } = query

  const searchQuery: any = {}

  if (search) {
    const regex = { $regex: search, $options: 'i' }
    searchQuery.$or = [{ firstname: regex }, { lastname: regex }, { bio: regex }]
  }

  const parseDateString = (dateString: string) => {
    const formats = ['dd-MM-yyyy hh:mm a', 'dd-MM-yyyy']

    for (const format of formats) {
      const parsedDate = parse(dateString, format, new Date())
      if (isValid(parsedDate)) {
        return parsedDate
      }
    }

    return null
  }

  const parsedStartDate = startDate ? parseDateString(startDate) : null
  const parsedEndDate = endDate ? parseDateString(endDate) : null

  if (parsedStartDate || parsedEndDate) {
    searchQuery.createdAt = {}
    if (parsedStartDate) {
      searchQuery.createdAt.$gte = startOfDay(parsedStartDate)
    }
    if (parsedEndDate) {
      searchQuery.createdAt.$lte = endOfDay(parsedEndDate)
    }
  }

  const users = await User.find(searchQuery).select('-password')
  return users
}

export const getUserById = async (userId: string): Promise<IUser | null> => {
  const user = await User.findById(userId).select('-password')
  return user
}

export const createUser = async (userData: IUser): Promise<IUser> => {
  const newUser = await User.create(userData)
  return newUser
}

export const login = async (email: string, password: string): Promise<string> => {
  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('INVALID_CREDENTIALS', HTTP_STATUS.UNAUTHORIZED)
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })

  return token
}

export const updateUser = async (
  userId: string,
  userData: Partial<IUser>
): Promise<IUser | null> => {
  const updatedUser = await User.findByIdAndUpdate(userId, userData, {
    new: true,
  }).select('-password')
  return updatedUser
}

export const deleteUser = async (userId: string): Promise<IUser | null> => {
  const deleteuser = await User.findByIdAndDelete(userId)
  return deleteuser
}

export const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
  const user = await User.findById(userId)
  if (user) {
    const isMatch = await user.comparePassword(oldPassword)
    if (isMatch) {
      user.password = newPassword
      await user.save()
      return user
    }
  }
}

export const requestPasswordReset = async (email: string): Promise<string | null> => {
  const user: IUser | null = await User.findOne({ email })
  if (!user) {
    return null
  }

  // Generate a JWT token
  const token = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '10m' })

  // Save the token's hashed version to the user's document
  const resetToken = crypto.createHash('sha256').update(token).digest('hex')
  user.resetPasswordToken = resetToken
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000 // Token valid for 10 minutes
  await user.save()

  const resetUrl = 'http://localhost:3000/api/users/reset-password'
  const resetLink = `${resetUrl}?token=${token}`

  // Send the reset link via email
  await sendResetPasswordEmail(email, resetLink)

  // Return the token
  return token
}

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string }

  const resetToken = crypto.createHash('sha256').update(token).digest('hex')

  const user = await User.findOne({
    email: decoded.email,
    resetPasswordToken: resetToken,
    resetPasswordExpires: { $gt: Date.now() },
  })

  if (!user) {
    throw new AppError('Invalid or expired token', HTTP_STATUS.BAD_REQUEST)
  }

  user.password = newPassword
  user.resetPasswordToken = undefined
  user.resetPasswordExpires = undefined

  await user.save()

  return { success: true, message: 'Password updated successfully' }
}
