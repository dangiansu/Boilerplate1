export interface IUser extends Document {
  firstname: string
  lastname: string
  email: string
  password: string
  bio: string
  createdAt: Date
  updatedAt: Date
  resetPasswordToken?: string
  resetPasswordExpires?: number
}

export interface UserQuery {
  search?: string
  startDate?: string
  endDate?: string
}

export interface MailOptions {
  from: string
  to: string
  subject: string
  html: string
}

export interface Response {
  success: boolean
  message: string
  data: any
}

export interface ChangePasswordResponse {
  success: boolean
  message: string
  user?: Omit<IUser, 'password'>
}
