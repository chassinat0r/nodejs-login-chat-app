// Import SQLite modules
const { Database } = require('sqlite3')
const { open } = require('sqlite')

const app = require('./app') // Import Express.js application

// Function to setup database if it doesn't exist; this will run on start
const setupDatabase = async () => {
    // Open accounts database
    const db = await open({
        filename: "accounts.db",
        driver: Database
    })

    // Create tables if they do not exist
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
    await db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER,
            session TEXT UNIQUE
        )
    `)

    await db.close() // Close database
}

setupDatabase() 

// Run Express.js app on specified port
const PORT = 8080

app.listen(PORT, () => {
    console.log("App running on port " + PORT)
})
