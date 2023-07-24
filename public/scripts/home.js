$('#signout-button').click(() => { // When signout button is clicked
    $.post("/api/sign-out", () => { // Send POST request to /api/sign-out
        location.href = "/sign-in" // Once done, redirect to sign in page
    })
})

$('#editaccount-button').click(() => {
    location.href = "/edit"
})
