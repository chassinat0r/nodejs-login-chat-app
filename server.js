// Import SQLite modules
const { Database } = require('sqlite3')
const { open } = require('sqlite')

const app = require('./app') // Import Express.js application

const { Server } = require('socket.io')
const http = require('http')

const chatHandler = require('./handler/chat')

// Function to setup database if it doesn't exist; this will run on start
const setupDatabase = async () => {
    // Open accounts database
    const accDb = await open({
        filename: "accounts.db",
        driver: Database
    })

    // Create tables if they do not exist
    await accDb.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER,
            username TEXT UNIQUE,
            password TEXT,
            PRIMARY KEY(id AUTOINCREMENT)
        )
    `)
    await accDb.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER,
            session TEXT UNIQUE
        )
    `)

    await accDb.close() // Close database

    // Open chat database
    const chatDb = await open({
        filename: "chat.db",
        driver: Database
    })

    // Create table for storing chat history
    await chatDb.run(`
        CREATE TABLE IF NOT EXISTS chatlog (
            id INTEGER,
            username TEXT,
            content TEXT,
            timestamp TEXT,
            PRIMARY KEY(id AUTOINCREMENT)
        )
    `)

    await chatDb.close()
}

setupDatabase() 

const server = http.createServer(app) // Create HTTP server running Express.js application

const io = new Server(server) // Setup Socket.IO server

const clients = {} // JSON of all connected clients

io.on('connection', socket => { // On a new client connection
    socket.on('hello', username => { // Client joins chat
        const usernames = [] // Array of just usernames
        Object.keys(clients).forEach(id => { // Go through each Socket.IO ID in clients JSON
            usernames.push(clients[id]) // Push corresponding username
        })

        socket.emit('receive users', usernames) // Send list of connected usernames to new client
        chatHandler.joinChat(io, socket, username) // Inform other users of joining and get chat history
        
        clients[socket.id] = username // Add new client to clients JSON
    })

    socket.on('disconnect', () => { // Client disconnects
        const username = clients[socket.id] // Get username

        chatHandler.leaveChat(io, socket, username) // Inform other clients of leaving

        delete clients[socket.id] // Delete from clients JSON
    })

    socket.on('send message', message => { // Client sends chat message
        chatHandler.sendMessage(io, message) // Send message to all clients
    })
})

// Run HTTP server on port given by environment variable, or if none set, default to 8080
const PORT = process.env.PORT || 8080

server.listen(PORT, () => {
    console.log("Server running on port " + PORT)
})
