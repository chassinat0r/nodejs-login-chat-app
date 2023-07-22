const { Database } = require('sqlite3')
const { open } = require('sqlite')

// Sign In form for authenticating an existing account
const signInPage = (req, res, next) => {
    res.end(`
        <!DOCTYPE html>
        <html>
            <head lang="en">
                <meta charset="utf-8">
                <link rel="stylesheet" href="/styles.css">
                <title>Sign In</title>
            </head>
            <body>
                <div class="login">
                    <h1 class="login__text">Sign In</h1>
                    <form action="/api/sign-in" method="POST">
                        <fieldset>
                            <label class="login__label" for="email">Email</label>
                            <input type="email" class="login__input" id="email" name="email" required>
                        </fieldset>
                        <fieldset>
                            <label class="login__label" for="password">Password</label>
                            <input type="password" class="login__input" id="password" name="password" required>
                        </fieldset>
                        <p class="login__text"><input type="checkbox" name="rememberme"> Keep me signed in</p>
                        <input type="submit" class="login__submit" value="SIGN IN">
                    </form>
                    <p class="login__text">No account? <a href="/sign-up">Create one.</a></p>
                </div>
            </body>
        </html>
    `)
} 

// Sign Up form for creating a new account
const signUpPage = (req, res, next) => {
    res.end(`
        <!DOCTYPE html>
        <html>
            <head lang="en">
                <meta charset="utf-8">
                <link rel="stylesheet" href="/styles.css">
                <title>Sign Up</title>
            </head>
            <body>
                <div class="login">
                    <h1 class="login__text">Sign Up</h1>
                    <form action="/api/sign-up" method="POST">
                        <fieldset>
                            <label class="login__label" for="firstname">First Name</label>
                            <input type="text" class="login__input" id="firstname" name="firstname" required>
                        </fieldset>
                        <fieldset>
                            <label class="login__label" for="lastname">Last Name</label>
                            <input type="text" class="login__input" id="lastname" name="lastname" required>
                        </fieldset>
                        <fieldset>
                            <label class="login__label" for="email">Email</label>
                            <input type="email" class="login__input" id="email" name="email" required>
                        </fieldset>
                        <fieldset>
                            <label class="login__label" for="password">Password</label>
                            <input type="password" class="login__input" id="password" name="password" minlength=8 required>
                        </fieldset>
                        <input type="submit" class="login__submit" value="SIGN UP">
                    </form>
                    <p class="login__text">Already have an account? <a href="/sign-in">Sign in.</a></p>
                </div>
            </body>
        </html>
    `)
}

// Homepage displayed to signed in users with their first and last name
const homePage = async (req, res, next) => {
    const session = req.cookies.session // Get session stored in cookie

    if (!session) { // No session stored
        res.redirect('/sign-in') // Redirect to sign in
        return
    }

    const id = await getIdFromSession(session) // Get ID corresponding to session

    if (!id) { // Session does not exist in database
        res.clearCookie('session') // Clear cookie because session is invalid
        res.redirect('/sign-in')
        return
    }

    const { firstname: firstName, lastname: lastName } = await getUserDetails(id) // Get first and last name of account

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
                    <h2>Welcome back, ${firstName} ${lastName}</h2>
                    <div class="page__button-panel">
                        <button type="button" class="page__button-panel__button" id="signout-button">Sign Out</button>
                    </div>
                </div>
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script>
                <script src="/scripts/home.js"></script>
            </body>
        </html>
    `)
}

// Function to get ID corresponding to session from database
const getIdFromSession = async (session) => {
    const db = await open({
        filename: "accounts.db",
        driver: Database
    })

    const idSessionRow = await db.get("SELECT id FROM sessions WHERE session = ?", session) // Get ID from entry with session provided

    if (!idSessionRow) { // No entry found
        return false
    }

    const id = idSessionRow.id // Store ID from query result

    await db.close()

    return id
}

// Function to get user details corresponding to ID from database
const getUserDetails = async (id) => {
    const db = await open({
        filename: "accounts.db",
        driver: Database
    })

    const userRow = await db.get("SELECT firstname, lastname FROM users WHERE id = ?", id) // Get first name and last name corresponding to given ID

    if (!userRow) { // No entry found
        return false
    }

    await db.close()

    return userRow
}

module.exports = { 
    signInPage, 
    signUpPage, 
    homePage 
}
