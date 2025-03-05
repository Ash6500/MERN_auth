import express from 'express'
import { signup, login, logout, verifyEmail, forgotPassword, resetPassword, checkAuth } from '../controllers/authController.js'
import { verifyToken } from '../middleware/verifyToken.js'

const router = express.Router()

// check auth
router.get('/check-auth', verifyToken, checkAuth)

// signup endpoint
router.post('/signup', signup)

// login endpoint
router.post('/login', login)

// logout endpoint
router.post('/logout', logout)

// Verify email endpoint
router.post('/verify-email', verifyEmail)

// forgot password endpoint
router.post('/forgot-password', forgotPassword)

// reset password endpoint
router.post('/reset-password/:token', resetPassword)

export default router