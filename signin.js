import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


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
   ELEMENTS
========================= */

const signinForm =
    document.getElementById("signinForm");

const contactInput =
    document.getElementById("contact");

const signInButton =
    document.getElementById("signInButton");


/* =========================
   INVISIBLE RECAPTCHA
========================= */

const recaptchaVerifier =
    new RecaptchaVerifier(
        auth,
        "signInButton",
        {
            size: "invisible",

            callback: function () {
                sendOTP();
            },

            "expired-callback": function () {
                console.log(
                    "reCAPTCHA expired. Please try again."
                );
            }
        }
    );


/* =========================
   FORM SUBMIT
========================= */

signinForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        sendOTP();

    }
);


/* =========================
   SEND OTP
========================= */

async function sendOTP() {

    let phone =
        contactInput.value.trim();


    phone =
        phone.replace(
            /[\s-]/g,
            ""
        );


    /* Add India country code
       if 10-digit number is entered */

    if (
        /^[0-9]{10}$/.test(phone)
    ) {

        phone =
            "+91" + phone;

    }


    if (
        !/^\+[1-9]\d{7,14}$/.test(phone)
    ) {

        alert(
            "Please enter a valid phone number with country code."
        );

        return;

    }


    signInButton.disabled = true;

    signInButton.innerHTML =
        "Sending OTP...";


    try {

        const confirmationResult =
            await signInWithPhoneNumber(
                auth,
                phone,
                recaptchaVerifier
            );


        /*
           Save phone number.
        */

        sessionStorage.setItem(
            "safeherContact",
            phone
        );


        /*
           Save verification ID.
        */

        sessionStorage.setItem(
            "safeherVerificationId",
            confirmationResult.verificationId
        );


        /*
           Go to OTP page.
        */

        window.location.href =
            "otp.html";


    } catch (error) {

        console.error(
            "Firebase Phone Auth Error:",
            error
        );


        alert(
            "Unable to send OTP.\n\n" +
            error.code +
            "\n\n" +
            error.message
        );


        signInButton.disabled =
            false;

        signInButton.innerHTML =
            "Continue <span>→</span>";


        /*
           Reset reCAPTCHA so another attempt
           can be made.
        */

        try {

            recaptchaVerifier.clear();

        } catch (resetError) {

            console.log(
                resetError
            );

        }

    }

}
