const express = require('express')
const viewController = require('../controller/view') // Import view controller

const router = express.Router() // Create Express.js router

// GET requests
router.get('/sign-up', viewController.signUpPage)
router.get('/sign-in', viewController.signInPage)
router.get('/', viewController.homePage)
router.get('/edit', viewController.editPage)
router.get('/delete', viewController.deletePage)

module.exports = router
