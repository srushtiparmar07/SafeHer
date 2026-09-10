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

const contactDisplay = document.getElementById("contactDisplay");
const otpInputs = document.querySelectorAll(".otp-input");
const otpForm = document.getElementById("otpForm");
const resendBtn = document.getElementById("resendBtn");
const timerDisplay = document.getElementById("timer");

/* =========================
   DISPLAY PHONE NUMBER
========================= */

const contact = sessionStorage.getItem("safeherContact");

if (contact) {
    contactDisplay.textContent = contact;
} else {
    contactDisplay.textContent = "your registered phone number";
}

/* =========================
   OTP INPUT BEHAVIOUR
========================= */

otpInputs.forEach(function (input, index) {
    input.addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");

        if (this.value.length === 1 && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }
    });

    input.addEventListener("keydown", function (event) {
        if (event.key === "Backspace" && this.value === "" && index > 0) {
            otpInputs[index - 1].focus();
        }
    });
});

/* =========================
   VERIFY OTP VIA SUPABASE
========================= */

if (otpForm) {
    otpForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        let otp = "";
        otpInputs.forEach(function (input) {
            otp += input.value;
        });

        if (otp.length !== 6) {
            alert("Please enter the complete 6-digit OTP.");
            return;
        }

        if (!contact) {
            alert("Your OTP session has expired. Please request a new OTP.");
            window.location.href = "signin.html";
            return;
        }

        const verifyButton = otpForm.querySelector(".verify-btn");
        verifyButton.disabled = true;
        verifyButton.textContent = "Verifying...";

        try {
            /* Verify Phone OTP with Supabase */
            const { data, error } = await supabase.auth.verifyOtp({
                phone: contact,
                token: otp,
                type: 'sms'
            });

            if (error) throw error;

            const user = data.user;

            /* Manage Profile in Supabase public.profiles */
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .maybeSingle();

                if (!profile) {
                    /* First-time user: Create profile record */
                    await supabase
                        .from("profiles")
                        .insert([
                            {
                                id: user.id,
                                phone: user.phone || contact,
                                updated_at: new Date()
                            }
                        ]);
                } else {
                    /* Existing user: Update timestamp */
                    await supabase
                        .from("profiles")
                        .update({ updated_at: new Date() })
                        .eq("id", user.id);
                }
            }

            /* Clear temporary storage and redirect */
            sessionStorage.setItem("safeherLoggedIn", "true");
            window.location.href = "dashboard.html";

        } catch (error) {
            console.error("Supabase OTP verification error:", error);
            alert("Invalid or expired OTP. Please try again.");

            verifyButton.disabled = false;
            verifyButton.textContent = "Verify & Continue →";
        }
    });
}

/* =========================
   RESEND TIMER
========================= */

let timeLeft = 60;
if (resendBtn) resendBtn.disabled = true;

const countdown = setInterval(function () {
    timeLeft--;

    if (timerDisplay) {
        timerDisplay.textContent = "Resend available in " + timeLeft + "s";
    }

    if (timeLeft <= 0) {
        clearInterval(countdown);
        if (timerDisplay) timerDisplay.textContent = "You can now request a new OTP.";
        if (resendBtn) resendBtn.disabled = false;
    }
}, 1000);

/* =========================
   RESEND OTP
========================= */

if (resendBtn) {
    resendBtn.addEventListener("click", function () {
        alert("Please go back to Sign In and request a new OTP.");
        window.location.href = "signin.html";
    });
}
