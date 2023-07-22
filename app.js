const express = require('express') // Import Express.js module

// Import routers
const getRouter = require('./router/get')
const postRouter = require('./router/post')

// Import middleware
const { urlencoded } = require('body-parser')
const cookieParser = require('cookie-parser')

const app = express() // Create Express.js application
app.use(express.static(__dirname + "/public")) // Serve static files in public directory
app.use(urlencoded({ extended: true })) // Parse request bodies
app.use(cookieParser()) // Parse cookies

// Enable routers for GET/POST requests
app.use("/api", postRouter)
app.use("/", getRouter)

module.exports = app
