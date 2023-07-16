const { Database } = require('sqlite3')
const { open } = require('sqlite')
const bcrypt = require('bcrypt')

// Function openDatabase
// Take in path of database and return object
const openDatabase = async (path) => {
    return open({
        filename: path,
        driver: Database
    })
}

// Function register
// Get details submitted in sign-up form and register account
const register = async (req, res) => {
    // Get form details
    const firstName = req.body.firstname
    const lastName = req.body.lastname
    const email = req.body.email
    const password = req.body.password

    const db = await openDatabase("accounts.db") // Open accounts database

    const emailTaken = await db.get("SELECT * FROM users WHERE email = ?", email) // Fetch first entry of users table with email

    if (emailTaken) { // Entry found
        res.status(409).end("Email already in use.") // 409 "conflict" error and message
        return false // Terminate function
    }

    const hash = await bcrypt.hash(password, 10) // Hash password

    // Insert entry into users table
    await db.run("INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)", [firstName, lastName, email, hash])

    res.redirect("/sign-in") // Redirect to sign in page

    return true // Indicate success
}

module.exports = { register }
