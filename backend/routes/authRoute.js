import express from 'express'
import { signup, login, logout, verifyEmail } from '../controllers/authController.js'

const router = express.Router()

// signup endpoint
router.post('/signup', signup)

// login endpoint
router.post('/login', login)

// logout endpoint
router.post('/logout', logout)

router.post('/verify-email', verifyEmail)

export default router