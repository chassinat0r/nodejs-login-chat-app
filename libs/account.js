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
    res.redirect('/') // Go to homepage

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

// Function idFromSession
// Obtain ID from the sessions table corresponding to session obtained from cookie 
const idFromSession = async (session) => {
    const db = await openDatabase("accounts.db")

    const sessionValid = await db.get("SELECT id FROM sessions WHERE session = ?", session) // Fetch ID from entry of sessions table where session is equal to that of cookie

    if (!sessionValid) { // No entry found
        return false
    }

    const id = sessionValid.id // Otherwise, obtain ID from entry

    return id
}

// Function getUserDetails
// Use session stored in cookie to obtain first name, last name, and email of the signed in user
const getUserDetails = async (req, res) => {
    const session = req.cookies.session // Get value of session cookie

    const id = await idFromSession(session) // Get ID of account using session

    if (!id) { // No ID found, which could mean: no session cookie saved or the session deleted from table
        res.clearCookie('session') // Clear the cookie
        res.redirect('/sign-in') // Go to sign in page
        return
    }

    const db = await openDatabase("accounts.db")

    const userDetails = await db.get("SELECT * FROM users WHERE id = ?", id) // Get all data from entry of users table corresponding to ID

    if (!userDetails) { // No entry found
        res.end("This user no longer exists.")
        return
    }

    // Get details from entry
    const firstName = userDetails.firstname
    const lastName = userDetails.lastname
    const email = userDetails.email

    // Show HTML page with details
    res.end(`
    <!DOCTYPE html>
    <html>
        <head lang="en">
            <meta charset="utf-8">
            <link rel="stylesheet" href="/styles.css">
            <title>Home</title>
        </head>
        <body>
            <div class="page">
                <h1 class="page__title">Home</h1>
                <p><strong>First Name:</strong> <span id="firstname">${firstName}</span></p>
                <p><strong>Last Name:</strong> <span id="lastname">${lastName}</span></p>
                <p><strong>Email:</strong> <span id="email">${email}</span></p>
            </div>
        </body>
    </html>
    `) 
}

module.exports = { register, login, getUserDetails }
