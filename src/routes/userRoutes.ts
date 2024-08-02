import { Router } from 'express'
import * as UserController from '../controllers/userController'
import protect from '../middlewares/authMiddleware'
import {
  validateRegister,
  validateLogin,
  validateUpdateUser,
  validateResetPassword,
  validateChangePassword,
} from '../validation/uservalidation'

const router: Router = Router()

// Public routes
router.post('/register', validateRegister, UserController.createUser)
router.post('/login', validateLogin, UserController.login)
router.post('/request-password-reset', UserController.requestPasswordReset)
router.put('/reset-password', validateResetPassword, UserController.resetPassword)

// Protected routes
router.get('/getusers', protect, UserController.getUsers)
router.get('/:id', protect, UserController.getUserById)
router.put('/update/:id', protect, validateUpdateUser, UserController.updateUser)
router.delete('/delete/:id', protect, UserController.deleteUser)
router.put('/change-password/:id', protect, validateChangePassword, UserController.changePassword)

export default router
