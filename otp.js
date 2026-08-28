const contactDisplay = document.getElementById("contactDisplay");
const otpInputs = document.querySelectorAll(".otp-input");
const otpForm = document.getElementById("otpForm");
const resendBtn = document.getElementById("resendBtn");
const timerDisplay = document.getElementById("timer");

/* Display the email or phone number entered on Sign In page */

const contact = sessionStorage.getItem("safeherContact");

if (contact) {
    contactDisplay.textContent = contact;
} else {
    contactDisplay.textContent = "your registered contact";
}


/* Automatically move to next OTP box */

otpInputs.forEach((input, index) => {

    input.addEventListener("input", function () {

        /* Allow only numbers */

        this.value = this.value.replace(/[^0-9]/g, "");

        if (this.value.length === 1 && index < otpInputs.length - 1) {

            otpInputs[index + 1].focus();

        }

    });


    /* Backspace moves to previous box */

    input.addEventListener("keydown", function (event) {

        if (
            event.key === "Backspace" &&
            this.value === "" &&
            index > 0
        ) {

            otpInputs[index - 1].focus();

        }

    });

});


/* OTP verification */

otpForm.addEventListener("submit", function (event) {

    event.preventDefault();

    let otp = "";

    otpInputs.forEach(function (input) {

        otp += input.value;

    });


    if (otp.length !== 6) {

        alert("Please enter the complete 6-digit OTP.");

        return;

    }


    /*
       DEMO VERSION ONLY

       For now, any 6-digit code will continue.

       Later, Firebase will verify the real OTP.
    */

    sessionStorage.setItem("safeherLoggedIn", "true");

    window.location.href = "dashboard.html";

});


/* =========================
   RESEND OTP TIMER
========================= */

let timeLeft = 60;

resendBtn.disabled = true;


const countdown = setInterval(function () {

    timeLeft--;

    timerDisplay.textContent =
        "Resend available in " + timeLeft + "s";


    if (timeLeft <= 0) {

        clearInterval(countdown);

        timerDisplay.textContent =
            "You can now request a new OTP.";

        resendBtn.disabled = false;

    }

}, 1000);


/* Resend OTP */

resendBtn.addEventListener("click", function () {

    alert(
        "A new OTP would be sent to " +
        (contact || "your registered contact")
    );

    timeLeft = 60;

    resendBtn.disabled = true;


    const newCountdown = setInterval(function () {

        timeLeft--;

        timerDisplay.textContent =
            "Resend available in " + timeLeft + "s";


        if (timeLeft <= 0) {

            clearInterval(newCountdown);

            timerDisplay.textContent =
                "You can now request a new OTP.";

            resendBtn.disabled = false;

        }

    }, 1000);

});
