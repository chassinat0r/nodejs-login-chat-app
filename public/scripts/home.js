$('#signout-button').click(() => { // When signout button is clicked
    $.post("/api/sign-out", () => { // Send POST request to /api/sign-out
        location.href = "/sign-in" // Once done, redirect to sign in page
    })
})

$('#editaccount-button').click(() => { // When edit account button is clicked
    location.href = "/edit" // Go to edit page
})

$('#deleteaccount-button').click(() => {
    location.href = "/delete"
})

var socket = io() // Connect to Socket.IO server

socket.emit('hello', myUsername) // Send username to server and announce joining

// Handling the joining of a new user
socket.on('new user', username => {
    let html = $('.home__container__users-view__list').html() // Get HTML content of users list
    // Add new username to users list
    html += `
        <div class="home__container__users-view__list__user" id="user_${username}">
            <span>${username}</span>
        </div>
    ` 
    $('.home__container__users-view__list').html(html) // Update HTML
})

// Handling the receiving of a text message
socket.on('receive message', message => {
    const { username, content } = message // Get username and content from message

    let html = $('.home__container__chat-view__chatlog').html() // Get HTML content of chatlog
    // Add new message to chatlog
    html += `
        <div class="home__container__chat-view__chatlog__message">
            <span><strong>${username}:</strong> ${content}</span>
        </div>
    `
    $('.home__container__chat-view__chatlog').html(html)

    $('.home__container__chat-view__chatlog')[0].scrollTop = $('.home__container__chat-view__chatlog')[0].scrollHeight // Auto-scroll to bottom of chatlog
})

// Handling the receiving of chatlog for new connections
socket.on('receive chatlog', messages => {
    messages.forEach(message => { // Go through each message of chatlog
        const { username, content } = message

        // Add message to chatlog
        let html = $('.home__container__chat-view__chatlog').html()
        html += `
            <div class="home__container__chat-view__chatlog__message">
                <span><strong>${username}:</strong> ${content}</span>
            </div>
        `
        $('.home__container__chat-view__chatlog').html(html)
    })
})

// Handling the receiving of users list for new connections
socket.on('receive users', users => { 
    users.forEach(user => { // Go through each username of users list
        // Add username to users list
        let html = $('.home__container__users-view__list').html()
        html += `
            <div class="home__container__users-view__list__user" id="user_${user}">
                <span>${user}</span>
            </div>
        `
        $('.home__container__users-view__list').html(html)
    })
})

// Handling a user disconnecting from the chat
socket.on('user left', username => {
    $('#user_' + username).remove() // Remove element in users list corresponding to username
})

// Function to send message
const sendMessage = () => {
    const content = $('.home__container__chat-view__message__body').val() // Get content of message input

    if (content.length > 0) { // There is actually a message to send
        socket.emit('send message', {
            username: myUsername,
            content: content
        }) // Send message containing username and content to server
    
        $('.home__container__chat-view__message__body').val("") // Clear message input
    }
}

$('.home__container__chat-view__message__send').click(() => { // Send button clicked
    sendMessage() // Send message
})

// If enter key pressed, send message
$('.home__container__chat-view__message__body').on('keyup', e => {
    const keyCode = e.keyCode

    if (keyCode == 13) {
        e.preventDefault()
        sendMessage()
    }
})
