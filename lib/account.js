const { Database } = require('sqlite3')
const { open } = require('sqlite')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')

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

// Function login
// Get credentials submitted in sign-in form, authenticate them, and generate session for cookie
const login = async (req, res) => {
    // Get credentials
    const email = req.body.email
    const password = req.body.password

    const db = await openDatabase("accounts.db")

    const emailExists = await db.get("SELECT * FROM users WHERE email = ?", email) 

    if (!emailExists) { // No entry found, meaning there is no account with that email
        res.status(401).end("Incorrect email or password.") // 401 "unauthorised" and error message
        return false
    }

    const hash = emailExists.password // Get hashed password from query

    const passwordsMatch = await bcrypt.compare(password, hash) // Compare password submitted in form to hash

    if (!passwordsMatch) { // The passwords do not match
        res.status(401).end("Incorrect email or password.")
        return false
    }

    const id = emailExists.id // Get ID from query

    const session = await generateSession(id) // Generate session and store alongside ID in sessions table

    res.cookie('session', session) // Save cookie with session
    res.end("Sign in successful") // Placeholder text indicating success

    return true
}

// Function generateSession
// Continually generate session using UUID until a unique one is found
const generateSession = async (id) => {
    var session // Empty variable allows us to generate session over and over until a unique one is found

    const db = await openDatabase("accounts.db")

    while (true) { // Loop until break
        session = uuidv4() // Generate UUID and store in session

        const sessionTaken = await db.get("SELECT * FROM sessions WHERE session = ?", session) // Fetch first entry of sessions table with generated session

        if (!sessionTaken) { // No entry found, meaning session is free to be used
            break // Exit loop
        }
    }

    await db.run("INSERT INTO sessions (session, id) VALUES (?, ?)", [session, id]) // Insert entry containing id and session into sessions table

    return session
}

module.exports = { register, login }
