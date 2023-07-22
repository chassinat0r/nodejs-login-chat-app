// Import SQLite modules
const { Database } = require('sqlite3')
const { open } = require('sqlite')

const bcrypt = require('bcrypt') // Import bcrypt hashing implementation
const { v4: uuidv4 } = require('uuid') // Import UUIDv4 function

// Function to sign up an account 
const signUp = async (req, res) => {
    // Get information provided in form
    const firstName = req.body.firstname
    const lastName = req.body.lastname
    const email = req.body.email
    const password = req.body.password

    // Open accounts database
    const db = await open({
        filename: "accounts.db",
        driver: Database
    })

    // Check if email is not already taken
    const emailTaken = await db.get("SELECT * FROM users WHERE email = ?", email)

    if (emailTaken) {
        res.status(409).end("Email already in use.") // 409 "conflict" error
        return false // Terminate function
    }

    const hash = await bcrypt.hash(password, 10) // Hash password using bcrypt

    // Insert new entry into users table
    await db.run("INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)", [firstName, lastName, email, hash])
    await db.close()

    res.redirect('/sign-in') // Redirect to sign in page

    return true
}

// Function to sign in to an account 
const signIn = async (req, res) => {
    // Get credentials provided in form
    const email = req.body.email
    const password = req.body.password

    const db = await open({
        filename: "accounts.db",
        driver: Database
    })

    const userRow = await db.get("SELECT id, password FROM users WHERE email = ?", email) // Get ID and password from entry with provided email

    if (!userRow) { // No entry found, meaning the email is not registered
        res.status(401).end("Incorrect email or password.") // 401 "unauthorised" error
        return false
    }

    const { id, password: hash } = userRow // Get ID and hashed password from entry

    await db.close()

    // Check if the password submitted in form matches the hash
    const passwordsMatch = await bcrypt.compare(password, hash) 

    if (!passwordsMatch) {
        res.status(401).end("Incorrect email or password.")
        return false
    }

    const session = await generateSession(id) // Generate unique session code and store it in table

    res.cookie('session', session) // Save cookie
    res.redirect('/') // Redirect to homepage

    return true
}

// Function to sign out of account
const signOut = async (req, res) => {
    const session = req.cookies.session // Get session cookie value

    const db = await open({
        filename: "accounts.db",
        driver: Database
    })

    // Delete session from database
    await db.run("DELETE FROM sessions WHERE session = ?", session)
    await db.close()

    res.clearCookie('session') // Clear session cookie
}

// Function to generate and write session token to database
const generateSession = async (id) => {
    const db = await open({
        filename: "accounts.db",
        driver: Database
    })

    var session

    // Continually generate session until a unique one is found; collision for UUIDv4 is rare but a good precaution against errors
    while (true) {
        session = uuidv4() // Generate UUIDv4

        // Check if session is already in use
        const sessionTaken = await db.get("SELECT * FROM sessions WHERE session = ?", session)

        if (!sessionTaken) { // Not in use
            break // End loop
        }
    }

    // Insert new entry into sessions table
    await db.run("INSERT INTO sessions (id, session) VALUES (?, ?)", [id, session])
    await db.close()

    return session
}

module.exports = {
    signUp,
    signIn,
    signOut
}
