const signinForm = document.getElementById("signinForm");
const contactInput = document.getElementById("contact");

signinForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const contact = contactInput.value.trim();

    if (contact === "") {

        alert("Please enter your email address or phone number.");
        return;

    }

    sessionStorage.setItem(
        "safeherContact",
        contact
    );

    sessionStorage.setItem(
        "safeherLoggedIn",
        "true"
    );

    window.location.href = "dashboard.html";

});
