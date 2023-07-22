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

// 404 error page
app.use((req, res, next) => {
    res.end(`
        <!DOCTYPE html>
        <html>
            <head lang="en">
                <meta charset="utf-8">
                <link rel="stylesheet" href="styles.css">
                <title>Error 404</title>
            </head>
            <body>
                <div class="page">
                    <h1 class="page__title">Error 404</h1>
                    <p>The page you are looking for may have:</p>
                    <ul>
                        <li>Been deleted</li>
                        <li>Been moved</li>
                        <li>Never existed</li>
                        <li>Be a typo</li>
                    </ul>
                    <a href="/">Click Here to Go Home</a>
                </div>
            </body>
        </html>
    `)
})

module.exports = app
