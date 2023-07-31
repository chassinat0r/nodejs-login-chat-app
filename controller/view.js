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

    const { username } = await getUserDetails(id) // Get username of account

    res.end(`
        <!DOCTYPE html>
        <html>
            <head lang="en">
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Home</title>
                <link rel="stylesheet" href="/styles.css">
            </head>
            <body>
                <div class="home">
                    <div class="home__container">
                        <div class="home__container__users-view">
                            <h2 class="home__header">Users</h2>
                            <div class="home__container__users-view__list"></div>
                            <div class="home__container__users-view__buttons">
                                <button type="button" class="home__container__users-view__buttons__btn" id="editaccount-button">Edit Account</button>
                                <button type="button" class="home__container__users-view__buttons__btn" id="deleteaccount-button">Delete Account</button>
                                <button type="button" class="home__container__users-view__buttons__btn" id="signout-button">Sign Out</button>
                            </div>
                        </div>
                        <div class="home__container__chat-view">
                            <h2 class="home__header">Chat</h2>
                            <div class="home__container__chat-view__chatlog"></div>
                            <div class="home__container__chat-view__message">
                                <input type="text" class="home__container__chat-view__message__body" placeholder="Type message here..." required>
                                <button type="button" class="home__container__chat-view__message__send">SEND</button>
                                <div class="home__container__chat-view__message__char-count">0/250</div>
                            </div>
                        </div>
                    </div>
                </div>
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script>
                <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
                <script>
                    const myUsername = "${username}"
                </script>
                <script src="scripts/home.js"></script>
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

    const { displayname: displayName, username } = await getUserDetails(id)

    res.end(`
        <!DOCTYPE html>
        <html>
            <head lang="en">
                <meta charset="utf-8">
                <link rel="stylesheet" href="/styles.css">
                <title>Edit Account Details</title>
            </head>
            <body>
                <div class="home">
                    <h1 class="home__header">Edit Account Details</h1>
                    <div class="home__edit">
                        <form action="/api/edit" method="POST">
                            <fieldset>
                                <label class="login__label" for="username">Username</label>
                                <input type="text" class="login__input" id="username" name="username" placeholder="${username}">
                            </fieldset>
                            <fieldset>
                                <label class="login__label" for="password">Password</label>
                                <input type="password" class="login__input" id="password" name="password">
                            </fieldset>
                            <div class="page__edit__separator"></div>
                            <fieldset>
                                <label class="login__label" for="verifypassword">Enter current password</label>
                                <input type="password" class="login__input" id="verifypassword" name="verifypassword" required>
                            </fieldset>
                            <input type="submit" class="login__submit" value="UPDATE DETAILS">
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
