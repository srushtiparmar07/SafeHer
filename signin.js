const signinForm = document.getElementById("signinForm");
const contactInput = document.getElementById("contact");

signinForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const phone = contactInput.value.trim();

    const phonePattern =
        /^\+?[0-9\s-]{10,15}$/;

    if (!phonePattern.test(phone)) {

        alert("Please enter a valid phone number.");

        return;
    }

    sessionStorage.setItem(
        "safeherContact",
        phone
    );

    sessionStorage.setItem(
        "safeherLoginType",
        "phone"
    );

    window.location.href = "otp.html";

});
