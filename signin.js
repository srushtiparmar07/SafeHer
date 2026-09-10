import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

/* =========================
   SUPABASE CONFIGURATION
========================= */

const SUPABASE_URL = 'https://bswgjfguytayxffuorwy.supabase.co';
const SUPABASE_KEY = 'sb_publishable__aEz4RacAZLZSfBvF-ByuQ_aE0GWonx';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* =========================
   ELEMENTS
========================= */

const signinForm = document.getElementById("signinForm");
const contactInput = document.getElementById("contact");
const signInButton = document.getElementById("signInButton");

/* =========================
   FORM SUBMIT
========================= */

if (signinForm) {
    signinForm.addEventListener("submit", function (event) {
        event.preventDefault();
        sendOTP();
    });
}

/* =========================
   SEND OTP VIA SUPABASE
========================= */

async function sendOTP() {
    let phone = contactInput.value.trim();

    // Clean space and hyphen formatting
    phone = phone.replace(/[\s-]/g, "");

    /* Add India country code (+91) if 10-digit number is entered */
    if (/^[0-9]{10}$/.test(phone)) {
        phone = "+91" + phone;
    }

    /* Validate international E.164 phone format */
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
        alert("Please enter a valid phone number with country code.");
        return;
    }

    // Update UI state
    signInButton.disabled = true;
    signInButton.innerHTML = "Sending OTP...";

    try {
        /* Request Phone OTP from Supabase Auth */
        const { data, error } = await supabase.auth.signInWithOtp({
            phone: phone
        });

        if (error) throw error;

        /* Save phone number to session storage for the OTP page */
        sessionStorage.setItem("safeherContact", phone);

        /* Redirect to OTP verification page */
        window.location.href = "otp.html";

    } catch (error) {
        console.error("Supabase Phone Auth Error:", error);

        alert("Unable to send OTP.\n\n" + (error.message || "Unknown error occurred."));

        // Reset UI state on error
        signInButton.disabled = false;
        signInButton.innerHTML = "Continue <span>→</span>";
    }
}
