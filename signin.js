import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";


/* =========================
   FIREBASE CONFIG
========================= */

const firebaseConfig = {
    apiKey: "AIzaSyAsoy6pxPRQ-AC5eYurx6bopmoOcLIzaWE",
    authDomain: "safeher-96bdb.firebaseapp.com",
    projectId: "safeher-96bdb",
    storageBucket: "safeher-96bdb.firebasestorage.app",
    messagingSenderId: "777297641744",
    appId: "1:777297641744:web:91eeb505836708ccad2595"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


/* =========================
   SIGN IN FORM
========================= */

const signinForm =
    document.getElementById("signinForm");

const contactInput =
    document.getElementById("contact");


/* =========================
   RECAPTCHA
========================= */

const recaptchaVerifier =
    new RecaptchaVerifier(
        auth,
        "signInButton",
        {
            size: "invisible"
        }
    );

/* =========================
   SEND OTP
========================= */

signinForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        let phone =
            contactInput.value.trim();


        /* Convert spaces and hyphens */

        phone =
            phone.replace(/[\s-]/g, "");


        /* India number helper */

        if (
            /^[0-9]{10}$/.test(phone)
        ) {

            phone =
                "+91" + phone;

        }


        /* Validate E.164-style number */

        if (
            !/^\+[1-9]\d{7,14}$/.test(phone)
        ) {

            alert(
                "Please enter a valid phone number with country code."
            );

            return;

        }


        const continueButton =
            signinForm.querySelector(
                ".continue-btn"
            );


        continueButton.disabled = true;

        continueButton.textContent =
            "Sending OTP...";


        try {

            const confirmationResult =
                await signInWithPhoneNumber(
                    auth,
                    phone,
                    recaptchaVerifier
                );


            /*
               Save Firebase confirmation result
               temporarily for otp.js
            */

            sessionStorage.setItem(
                "safeherContact",
                phone
            );


            sessionStorage.setItem(
                "safeherLoginType",
                "phone"
            );


            /*
               confirmationResult cannot be stored
               directly in sessionStorage.

               Store its verification ID instead.
            */

            sessionStorage.setItem(
                "safeherVerificationId",
                confirmationResult.verificationId
            );


            /*
               Store the Firebase confirmation
               object in memory for the next page.
            */

            window.safeherConfirmationResult =
                confirmationResult;


            /*
               Move to OTP page.
            */

            window.location.href =
                "otp.html";


        } catch (error) {

            console.error(
                "Firebase OTP error:",
                error
            );


            alert(
                "Unable to send OTP.\n\n" +
                error.message
            );


            continueButton.disabled = false;

            continueButton.innerHTML =
                "Continue <span>→</span>";


            /*
               Reset reCAPTCHA after an error.
            */

            try {

                const widgetId =
                    await recaptchaVerifier.render();

                if (
                    window.grecaptcha
                ) {

                    window.grecaptcha.reset(
                        widgetId
                    );

                }

            } catch (recaptchaError) {

                console.log(
                    recaptchaError
                );

            }

        }

    }
);
