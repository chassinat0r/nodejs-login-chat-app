// Import modules
const express = require('express')
const { urlencoded } = require('body-parser')
const cookieParser = require('cookie-parser')

// Setup Express application
const app = express()
app.use(express.static(__dirname + "/public")) // Serve static files from public directory
app.use(urlencoded({ extended: true })) // Parse request bodies
app.use(cookieParser()) // Read and write browser cookies

const PORT = 8080

// Run app on specified port
app.listen(PORT, () => {
    console.log("App running on port " + PORT)
})
