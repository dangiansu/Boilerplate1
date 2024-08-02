import { Response } from 'express'

export interface IResponseData<T> {
  res: Response
  statusCode: number
  success: boolean
  message?: string
  data?: T
  error?: { [key: string]: string }
}
