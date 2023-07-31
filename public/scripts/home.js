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
        <div class="home__container__users-view__list__user" id="user_${username}">${username}</div>
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
            <strong>${username}:</strong> ${content}
        </div>
    `
    $('.home__container__chat-view__chatlog').html(html)

    $('.home__container__chat-view__chatlog')[0].scrollTop = $('.home__container__chat-view__chatlog')[0].scrollHeight // Auto-scroll to bottom of chatlog
})

// Handling the receiving of chatlog for new connections
socket.on('receive chatlog', messages => {
    for (let i = messages.length-1; i > 0; i--) { // Go through each message of chatlog from last (oldest) to first (newest)
        const { username, content } = messages[i]

        // Add message to chatlog
        let html = $('.home__container__chat-view__chatlog').html()
        html += `
            <div class="home__container__chat-view__chatlog__message">
                <strong>${username}:</strong> ${content}
            </div>
        `
        $('.home__container__chat-view__chatlog').html(html)
    }
})

// Handling the receiving of users list for new connections
socket.on('receive users', users => { 
    users.forEach(user => { // Go through each username of users list
        // Add username to users list
        let html = $('.home__container__users-view__list').html()
        html += `
            <div class="home__container__users-view__list__user" id="user_${user}">${user}</div>
        `
        $('.home__container__users-view__list').html(html)
    })
})

// Handling a user disconnecting from the chat
socket.on('user left', username => {
    $('#user_' + username).remove() // Remove element in users list corresponding to username
})

$('.home__container__chat-view__message__send').click(() => { // Send button clicked
    const content = $('.home__container__chat-view__message__body').val() // Get content of message input
    const length = content.length // Get character length of message

    if (length > 0 && length <= 250) { // There is actually a message to send and it doesn't exceed character limit
        socket.emit('send message', {
            username: myUsername,
            content: content
        }) // Send message containing username and content to server
    
        $('.home__container__chat-view__message__body').val("") // Clear message input
        $('.home__container__chat-view__message__char-count').text("0/250") // Reset character count
    }
})

// If enter key pressed, emulate clicking send button
$('.home__container__chat-view__message__body').on('keydown', e => {
    const keyCode = e.keyCode

    if (keyCode == 13) { // Key code "13" is enter
        $('.home__container__chat-view__message__send').click() // Emulate clicking send button
    }
})

// When message input is modified, update the character count
$('.home__container__chat-view__message__body').on('input', () => {
    const length = $('.home__container__chat-view__message__body').val().length // Get length of message content
    $('.home__container__chat-view__message__char-count').text(length + "/250") // Update character count to show length out of 250 maximum characters

    if (length > 250) { // Length exceeds maximum of 250
        $('.home__container__chat-view__message__char-count').css('color', 'red') // Set character count text to red
        $('.home__container__chat-view__message__send').attr('disabled', true) // Disable send button
    } else { // Length stays within limit
        $('.home__container__chat-view__message__char-count').css('color', '') // Remove colour, setting it to default
        $('.home__container__chat-view__message__send').attr('disabled', false) // Enable send button
    }
})
