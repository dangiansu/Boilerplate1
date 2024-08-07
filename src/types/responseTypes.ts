export interface RegisterRequest {
  firstname: string
  lastname: string
  email: string
  password: string
  bio: string
  resetPasswordToken?: string
  resetPasswordExpires?: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface UpdateUserRequest {
  firstname?: string
  lastname?: string
  email?: string
  bio?: string
}

export interface ResetPasswordRequest {
  resetPasswordToken: string
  newPassword: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}
