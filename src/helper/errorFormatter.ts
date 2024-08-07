import Joi from 'joi'

export const formatJoiError = (errors: Joi.ValidationErrorItem[]): { [key: string]: string } => {
  return errors.reduce((acc: { [key: string]: string }, error: Joi.ValidationErrorItem) => {
    const path = error.path.join('.') 
    if (!acc[path]) {
      acc[path] = error.message.replace(/\"/g, '') 
    }
    return acc
  }, {})
}
