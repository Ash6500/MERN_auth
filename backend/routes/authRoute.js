import express from 'express'
import { signup, login, logout } from '../controllers/authController.js'

const router = express.Router()

// signup endpoint
router.post('/signup', signup)

// login endpoint
router.post('/login', login)

// logout endpoint
router.post('/logout', logout)

export default router