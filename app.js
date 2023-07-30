const express = require('express') // Import Express.js module

// Import routers
const getRouter = require('./router/get')
const postRouter = require('./router/post')

// Import middleware
const { urlencoded } = require('body-parser')
const cookieParser = require('cookie-parser')

const consolidate = require('consolidate')

const app = express() // Create Express.js application
app.use(express.static(__dirname + "/public")) // Serve static files in public directory
app.use(urlencoded({ extended: true })) // Parse request bodies
app.use(cookieParser()) // Parse cookies

// Use Mustache as HTML rendering engine
app.engine('html', consolidate.mustache)
app.set('views', __dirname + "/public")
app.set('view engine', 'html')

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
                <div class="home">
                    <h1 class="home__header">Error 404</h1>
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
