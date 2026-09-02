import {
    getAuth,
    PhoneAuthProvider,
    signInWithCredential
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


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

const db = getFirestore(app);


/* =========================
   ELEMENTS
========================= */

const contactDisplay =
    document.getElementById("contactDisplay");

const otpInputs =
    document.querySelectorAll(".otp-input");

const otpForm =
    document.getElementById("otpForm");

const resendBtn =
    document.getElementById("resendBtn");

const timerDisplay =
    document.getElementById("timer");


/* =========================
   DISPLAY PHONE NUMBER
========================= */

const contact =
    sessionStorage.getItem("safeherContact");

if (contact) {

    contactDisplay.textContent =
        contact;

} else {

    contactDisplay.textContent =
        "your registered phone number";
}


/* =========================
   OTP INPUT BEHAVIOUR
========================= */

otpInputs.forEach(function (input, index) {

    input.addEventListener("input", function () {

        this.value =
            this.value.replace(/[^0-9]/g, "");

        if (
            this.value.length === 1 &&
            index < otpInputs.length - 1
        ) {

            otpInputs[index + 1].focus();

        }

    });


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


/* =========================
   VERIFY OTP
========================= */

otpForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        let otp = "";

        otpInputs.forEach(function (input) {

            otp += input.value;

        });


        if (otp.length !== 6) {

            alert(
                "Please enter the complete 6-digit OTP."
            );

            return;
        }


        const verificationId =
            sessionStorage.getItem(
                "safeherVerificationId"
            );


        if (!verificationId) {

            alert(
                "Your OTP session has expired. Please request a new OTP."
            );

            window.location.href =
                "signin.html";

            return;
        }


        const verifyButton =
            otpForm.querySelector(".verify-btn");


        verifyButton.disabled = true;

        verifyButton.textContent =
            "Verifying...";


        try {

            /* =========================
               CREATE FIREBASE CREDENTIAL
            ========================= */

            const credential =
                PhoneAuthProvider.credential(
                    verificationId,
                    otp
                );


            /* =========================
               SIGN IN WITH FIREBASE
            ========================= */

            const userCredential =
                await signInWithCredential(
                    auth,
                    credential
                );


            const user =
                userCredential.user;


            console.log(
                "Firebase user signed in:",
                user.uid
            );


            /* =========================
               FIRESTORE USER DOCUMENT
            ========================= */

            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const userSnapshot =
                await getDoc(userRef);


            if (!userSnapshot.exists()) {

                /* First time user */

                await setDoc(
                    userRef,
                    {
                        phone: user.phoneNumber || contact,
                        createdAt: serverTimestamp(),
                        lastLogin: serverTimestamp()
                    }
                );

                console.log(
                    "New SafeHer user created in Firestore."
                );

            } else {

                /* Existing user */

                await setDoc(
                    userRef,
                    {
                        phone: user.phoneNumber || contact,
                        lastLogin: serverTimestamp()
                    },
                    {
                        merge: true
                    }
                );

                console.log(
                    "Existing SafeHer user updated."
                );
            }


            /* =========================
               LOGIN SUCCESS
            ========================= */

            sessionStorage.setItem(
                "safeherLoggedIn",
                "true"
            );


            sessionStorage.removeItem(
                "safeherVerificationId"
            );


            window.location.href =
                "dashboard.html";


        } catch (error) {

            console.error(
                "OTP verification error:",
                error
            );


            alert(
                "Invalid or expired OTP. Please try again."
            );


            verifyButton.disabled = false;

            verifyButton.textContent =
                "Verify & Continue →";

        }

    }
);


/* =========================
   RESEND TIMER
========================= */

let timeLeft = 60;

resendBtn.disabled = true;


const countdown =
    setInterval(function () {

        timeLeft--;


        timerDisplay.textContent =
            "Resend available in " +
            timeLeft +
            "s";


        if (timeLeft <= 0) {

            clearInterval(countdown);


            timerDisplay.textContent =
                "You can now request a new OTP.";


            resendBtn.disabled = false;

        }

    }, 1000);


/* =========================
   RESEND OTP
========================= */

resendBtn.addEventListener(
    "click",
    function () {

        alert(
            "Please go back to Sign In and request a new OTP."
        );


        window.location.href =
            "signin.html";

    }
);
