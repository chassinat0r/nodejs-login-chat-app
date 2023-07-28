const { Database } = require('sqlite3')
const { open } = require('sqlite')

// Sign In form for authenticating an existing account
const signInPage = (req, res, next) => {
    res.render('sign-in.html')
} 

// Sign Up form for creating a new account
const signUpPage = (req, res, next) => {
    res.render('sign-up.html')
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
                        <button type="button" class="page__button-panel__button" id="editaccount-button">Edit Account</button>
                        <button type="button" class="page__button-panel__button danger" id="deleteaccount-button">Delete Account</button>
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

    const userRow = await db.get("SELECT * FROM users WHERE id = ?", id) // Get user information corresponding to given ID

    if (!userRow) { // No entry found
        return false
    }

    await db.close()

    return userRow
}

// Form for editing account details
const editPage = async (req, res, next) => {
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

    const { firstname: firstName, lastname: lastName, email } = await getUserDetails(id)

    res.end(`
        <!DOCTYPE html>
        <html>
            <head lang="en">
                <meta charset="utf-8">
                <link rel="stylesheet" href="styles.css">
                <title>Edit Account Details</title>
            </head>
            <body>
                <div class="page">
                    <h1 class="page__title">Edit Account Details</h1>
                    <div class="page__edit">
                        <form action="/api/edit" method="POST">
                            <fieldset>
                                <label class="page__edit__label" for="firstname">First Name</label>
                                <input type="text" class="page__edit__input" id="firstname" name="firstname" placeholder="${firstName}">
                            </fieldset>
                            <fieldset>
                                <label class="page__edit__label" for="lastname">Last Name</label>
                                <input type="text" class="page__edit__input" id="lastname" name="lastname" placeholder="${lastName}">
                            </fieldset>
                            <fieldset>
                                <label class="page__edit__label" for="email">Email</label>
                                <input type="email" class="page__edit__input" id="email" name="email" placeholder="${email}">
                            </fieldset>
                            <fieldset>
                                <label class="page__edit__label" for="password">Password</label>
                                <input type="password" class="page__edit__input" id="password" name="password">
                            </fieldset>
                            <div class="page__edit__separator"></div>
                            <fieldset>
                                <label class="page__edit__label" for="verifypassword">Enter current password</label>
                                <input type="password" class="page__edit__input" id="verifypassword" name="verifypassword" required>
                            </fieldset>
                            <input type="submit" class="page__edit__submit" value="UPDATE DETAILS">
                        </form>
                    </div>
                </div>
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script>
            </body>
        </html>
    `)
}

// Form for deleting account
const deletePage = (req, res, next) => {
    const session = req.cookies.session

    if (!session) {
        res.redirect('/sign-in')
        return
    }

    res.render('delete.html')
}

module.exports = { 
    signInPage, 
    signUpPage, 
    homePage,
    editPage,
    deletePage,
    getIdFromSession,
    getUserDetails
}
