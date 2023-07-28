const express = require('express')
const authController = require('../controller/auth') // Import authentication controller

const router = express.Router()

// POST requests
router.post('/sign-up', authController.signUp)
router.post('/sign-in', authController.signIn)
router.post('/sign-out', authController.signOut)
router.post('/edit', authController.editAccount)
router.post('/delete', authController.deleteAccount)

module.exports = router
