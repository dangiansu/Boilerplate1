import Joi from 'joi'
import {
  RegisterRequest,
  LoginRequest,
  UpdateUserRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '../types/responseTypes'

const registerSchema = Joi.object<RegisterRequest>({
  firstname: Joi.string().min(1).required(),
  lastname: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  bio: Joi.string().required(),
})

const loginSchema = Joi.object<LoginRequest>({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
})

const updateUserSchema = Joi.object<UpdateUserRequest>({
  firstname: Joi.string().min(1),
  lastname: Joi.string().min(1),
  email: Joi.string().email(),
  bio: Joi.string(),
})

const resetPasswordSchema = Joi.object<ResetPasswordRequest>({
  newPassword: Joi.string().min(6).required(),
})

const changePasswordSchema = Joi.object<ChangePasswordRequest>({
  oldPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
})

export { registerSchema, loginSchema, updateUserSchema, resetPasswordSchema, changePasswordSchema }
