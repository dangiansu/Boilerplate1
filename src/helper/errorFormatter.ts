import Joi from 'joi'

export const formatJoiError = (errors: Joi.ValidationErrorItem[]): { [key: string]: string } => {
  return errors.reduce((acc: { [key: string]: string }, error: Joi.ValidationErrorItem) => {
    const path = error.path.join('.') // Handle nested paths if needed
    if (!acc[path]) {
      acc[path] = error.message.replace(/\"/g, '') // Remove quotes and format message
    }
    return acc
  }, {})
}
