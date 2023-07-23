# Node.js/Express.js login system

<strong>THIS IS A WORK IN PROGRESS, FEATURES MAY BE MISSING.</strong>

## What is this project?

A login system in Node.js/Express.js. This includes the ability to register, login, view, edit, and delete an account at any time. Passwords are hashed using bcrypt and account information and sessions are stored in a SQLite database.

## Features

🟢 = Fully working | 🟡 = Partly working/in progress | 🟠 = To be added | 🔴 = Broken

* Database 🟢
* Sign Up 🟢
* Sign In 🟢
* Session management system 🟢
* Homepage 🟡
* Edit account 🟠
* Delete account 🟠
* Email verification 🟠
* Remember me 🟢

## Installation instructions

### Dependencies

* Node.js v17 or newer
* NPM package manager
* Git

### Terminal/command prompt

```
git clone https://github.com/chasc0des/nodejs-express-login-system.git
cd nodejs-express-login-system
npm install .
npm start
```

By default, the program can be accessed on ``http://localhost:8080`` or from another machine on your network, ``http://<YOUR IP ADDRESS>:8080``.

## Screenshots
<img src="screenshots/sign-in.png" alt="Sign In form" style="width: 100%">

<img src="screenshots/sign-up.png" alt="Sign Up form" style="width: 100%">

<img src="screenshots/home.png" alt="Homepage (private info hidden)" style="width: 100%">

<img src="screenshots/404.png" alt="Error 404 not found" style="width: 100%">
