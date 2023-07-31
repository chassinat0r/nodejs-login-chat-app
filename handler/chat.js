// Import modules for SQLite database
const { Database } = require('sqlite3')
const { open } = require('sqlite')

// Function to handle a new client connecting
const joinChat = async (io, socket, username) => {
    io.emit('new user', username) // Send the username to all clients

    // Create a message to inform everyone of the new user
    const message = {
        username: "SERVER",
        content: `${username} has joined the chat`
    }

    await getChatLog(socket) // Send the chat log history to the new client
    await sendMessage(io, message) // Send the join message to all clients
}

// Function to send the last 300 entries of the chat log to the new client
const getChatLog = async (socket) => {
    // Open chat database
    const db = await open({
        filename: "chat.db",
        driver: Database
    })

    const messages = await db.all("SELECT * FROM chatlog ORDER BY id DESC LIMIT 300") // Obtain all information about the latest 300 messages
    await db.close()

    socket.emit('receive chatlog', messages) // Send the messages to the new client
}

// Function to handle a user sending a message
const sendMessage = async (io, message) => {
    const { username, content } = message // Get the user who sent the message and its content

    const db = await open({
        filename: "chat.db",
        driver: Database
    })

    await db.run("INSERT INTO chatlog (username, content) VALUES (?, ?)", [username, content]) // Add new entry to chat database containing sender and content
    await db.close()

    io.emit('receive message', {
        username: username,
        content: content
    }) // Send the message to all clients
}

// Function to handle a client disconnecting
const leaveChat = async (io, socket, username) => {
    // Create a message to inform everyone the user left
    const message = {
        username: "SERVER",
        content: `${username} has left the chat`
    }

    await sendMessage(io, message) // Send the leave message

    socket.broadcast.emit('user left', username) // Inform clients the user left, giving their username
}

module.exports = {
    joinChat,
    sendMessage,
    leaveChat
}
