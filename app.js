// Import modules
const express = require('express')
const { urlencoded } = require('body-parser')
const cookieParser = require('cookie-parser')
const { Database } = require('sqlite3')
const { open } = require('sqlite')

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

// Function to setup database
const setupDatabase = async () => {
    // Open accounts database
    const db = await open({
        filename: "accounts.db",
        driver: Database
    })

    // Create users table if it doesn't exist
    await db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER,
            firstname TEXT,
            lastname TEXT,
            email TEXT UNIQUE,
            password TEXT,
            PRIMARY KEY(id AUTOINCREMENT)
        )
    `)

    // Create sessions table if it doesn't exist
    await db.run(`
        CREATE TABLE IF NOT EXISTS session (
            id INTEGER,
            session TEXT UNIQUE
        )
    `)
}

setupDatabase() // Run function
