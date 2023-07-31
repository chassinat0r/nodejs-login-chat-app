// Import SQLite modules
const { Database } = require('sqlite3')
const { open } = require('sqlite')

const bcrypt = require('bcrypt') // Import bcrypt hashing implementation
const { v4: uuidv4 } = require('uuid') // Import UUIDv4 function

const { getUserDetails, getIdFromSession } = require('./view')

// Function to sign up an account 
const signUp = async (req, res) => {
    // Get information provided in form
    const { username, password } = req.body

    // Open accounts database
    const db = await open({
        filename: "accounts.db",
        driver: Database
    })

    // Check if username is not already taken
    const usernameTaken = await db.get("SELECT * FROM users WHERE username = ?", username)

    if (usernameTaken) {
        res.status(409).end("Username already in use.") // 409 "conflict" error
        return false // Terminate function
    }

    const hash = await bcrypt.hash(password, 10) // Hash password using bcrypt

    // Insert new entry into users table
    await db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hash])
    await db.close()

    res.redirect('/sign-in') // Redirect to sign in page

    return true
}

// Function to sign in to an account 
const signIn = async (req, res) => {
    // Get credentials provided in form
    const { username, password, rememberme: rememberMe } = req.body

    const db = await open({
        filename: "accounts.db",
        driver: Database
    })

    const userRow = await db.get("SELECT id, password FROM users WHERE username = ?", username) // Get ID and password from entry with provided username

    if (!userRow) { // No entry found, meaning the username is not registered
        res.status(401).end("Incorrect username or password.") // 401 "unauthorised" error
        return false
    }

    const { id, password: hash } = userRow // Get ID and hashed password from entry

    await db.close()

    // Check if the password submitted in form matches the hash
    const passwordsMatch = await bcrypt.compare(password, hash) 

    if (!passwordsMatch) {
        res.status(401).end("Incorrect username or password.")
        return false
    }

    const session = await generateSession(id) // Generate unique session code and store it in table

    if (rememberMe) { // User checked remember me box
        res.cookie('session', session, {
            httpOnly: true, // Cannot be accessed outside of HTTP
            expires: new Date(Date.now() + 31536000000) // Expire in a year
        })
    } else {
        res.cookie('session', session, {
            httpOnly: true,
        }) // Expires when web browser closed
    }

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
    res.end()
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

// Function to verify password and update account details
const editAccount = async (req, res) => {
    const db = await open({
        filename: "accounts.db",
        driver: Database
    })

    const { verifypassword: verifyPassword } = req.body

    const session = req.cookies.session // Get session from browser cookies

    const { id, username: oldUsername, password: oldHash } = await getUserDetails(session) // Get current details about user from database

    // Check if password given as verification is correct
    const verifyPasswordCorrect = await bcrypt.compare(verifyPassword, oldHash)

    if (!verifyPasswordCorrect) { // Isn't correct
        res.status(401).end("Incorrect password") // 401 "unauthorised"
        return false
    }
    
    // Get details from form, or if left empty default to old ones
    const username = req.body.username || oldUsername
    const password = req.body.password /// Get plaintext password

    // Check if new username is not already taken by another account
    const usernameTaken = await db.get("SELECT * FROM users WHERE username = ?", username)

    if (usernameTaken && oldUsername !== username) { // Username is already in use and it's not the user's current username
        res.status(409).end("Username already in use.")
        return false
    }

    var hash = await bcrypt.hash(password, 10) // Hash password

    if (!password) { // If password is empty
        hash = oldHash // Default to hashed password already in database
    }

    // Update entry
    await db.run("UPDATE users SET username = ?, password = ? WHERE id = ?", [username, hash, id])
    await db.close()

    res.redirect('/') // Refresh page
    return true
}

// Function to permanently delete account from database
const deleteAccount = async (req, res) => {
    const db = await open({
        filename: "accounts.db",
        driver: Database
    })

    const { verifypassword: verifyPassword } = req.body // Get password to verify user

    const session = req.cookies.session // Get session from cookie

    const { id, password: hash } = await getUserDetails(session) // Get account password as bcrypt hash

    // Check that password for verification is correct
    const verifyPasswordCorrect = await bcrypt.compare(verifyPassword, hash)

    if (!verifyPasswordCorrect) {
        res.status(401).end("Incorrect password")
        return false
    }

    // Delete account and all sessions
    await db.run("DELETE FROM users WHERE id = ?", id)
    await db.run("DELETE FROM sessions WHERE id = ?", id)
    await db.close()

    res.clearCookie('session') // Clear session cookie
    res.redirect('/sign-in') // Go to sign in page
    return true
}

module.exports = {
    signUp,
    signIn,
    signOut,
    editAccount,
    deleteAccount
}
