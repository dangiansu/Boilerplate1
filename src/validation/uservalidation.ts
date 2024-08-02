import { responseMessage, responseData } from '../helper/response'
import {
  registerSchema,
  loginSchema,
  updateUserSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './validationSchemas'
import { Request, Response, NextFunction } from 'express'
import { formatJoiError } from '../helper/errorFormatter'
import { HTTP_STATUS } from '../config/constants'
import Joi from 'joi'

const schemas: { [key: string]: Joi.ObjectSchema | Joi.ArraySchema } = {
  register: registerSchema,
  login: loginSchema,
  update: updateUserSchema,
  resetPassword: resetPasswordSchema,
  changePassword: changePasswordSchema,
}

export const validate = (schemaName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const schema = schemas[schemaName]

    if (!schema) {
      return responseData({
        res,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        success: false,
        message: responseMessage('not_found', 'validation schema'),
      })
    }

    // Combine body, params, and query for validation
    const data = {
      ...req.body,
      ...req.params,
      ...req.query,
    }

    // Validate data against the schema with abortEarly set to false
    const { error } = schema.validate(data, { allowUnknown: true, abortEarly: false })

    if (error) {
      // Format the error messages
      const formattedErrors = formatJoiError(error.details)

      return responseData({
        res,
        success: false,
        statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        message: responseMessage('unprocessable_entity'),
        error: formattedErrors,
      })
    }

    next()
  }
}

// Export specific validators
export const validateRegister = validate('register')
export const validateLogin = validate('login')
export const validateUpdateUser = validate('update')
export const validateResetPassword = validate('resetPassword')
export const validateChangePassword = validate('changePassword')
