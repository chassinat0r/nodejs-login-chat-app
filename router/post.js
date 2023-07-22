const express = require('express')
const authController = require('../controller/auth') // Import authentication controller

const router = express.Router()

// POST requests
router.post('/sign-up', authController.signUp)
router.post('/sign-in', authController.signIn)

module.exports = router
