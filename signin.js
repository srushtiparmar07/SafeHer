const signinForm = document.getElementById("signinForm");
const contactInput = document.getElementById("contact");

signinForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const contact = contactInput.value.trim();

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const phonePattern =
        /^\+?[0-9\s-]{10,15}$/;

    if (emailPattern.test(contact)) {

        sessionStorage.setItem("safeherContact", contact);
        sessionStorage.setItem("safeherLoginType", "email");

        window.location.href = "otp.html";

    } else if (phonePattern.test(contact)) {

        sessionStorage.setItem("safeherContact", contact);
        sessionStorage.setItem("safeherLoginType", "phone");

        window.location.href = "otp.html";

    } else {

        alert(
            "Please enter a valid email address or phone number."
        );

    }
});
