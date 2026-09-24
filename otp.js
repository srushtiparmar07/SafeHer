import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://bswgjfguytayxffuorwy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__aEz4RacAZLZSfBvF-ByuQ_aE0GWonx";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", function () {
  // 1. Get saved email from sessionStorage
  const email = sessionStorage.getItem("authEmail");
  const emailDisplay = document.getElementById("emailDisplay");
  
  if (emailDisplay && email) {
    emailDisplay.innerText = email;
  }

  // --- OTP AUTO-TABBING / AUTO-ADVANCE LOGIC ---
  const otpInputs = document.querySelectorAll(".otp-input");

  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value;
      
      // Keep only the last character typed if multiple characters entered
      if (value.length > 1) {
        e.target.value = value.charAt(value.length - 1);
      }

      // Automatically move focus to the next input box
      if (e.target.value && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    // Handle Backspace to move focus to the previous input box
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });

  // --- 60-SECOND RESEND OTP TIMER ---
  const resendBtn = document.getElementById("resendOtpBtn"); // Make sure your resend link/button has this ID
  let timeLeft = 60;
  let timerId = null;

  function startResendTimer() {
    timeLeft = 60;
    if (resendBtn) {
      resendBtn.style.pointerEvents = "none";
      resendBtn.style.opacity = "0.5";
    }

    timerId = setInterval(() => {
      if (timeLeft > 0) {
        if (resendBtn) {
          resendBtn.textContent = `Resend OTP in ${timeLeft}s`;
        }
        timeLeft--;
      } else {
        clearInterval(timerId);
        if (resendBtn) {
          resendBtn.textContent = "Resend OTP";
          resendBtn.style.pointerEvents = "auto";
          resendBtn.style.opacity = "1";
        }
      }
    }, 1000);
  }

  // Start the timer automatically on page load
  startResendTimer();

  // Handle Resend OTP click event
  if (resendBtn) {
    resendBtn.addEventListener("click", async function (e) {
      e.preventDefault();
      if (timeLeft === 0) {
        if (!email) {
          alert("Session email missing. Please sign in again.");
          return;
        }

        try {
          // Request new OTP from Supabase
          const { error } = await supabase.auth.signInWithOtp({ email: email });
          if (error) throw error;

          alert("A new verification code has been sent!");
          startResendTimer(); // Restart the 60s countdown
        } catch (err) {
          console.error("Resend error:", err);
          alert(err.message || "Failed to resend verification code.");
        }
      }
    });
  }

  const otpForm = document.getElementById("otpForm");

  if (!otpForm) return;

  otpForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    // 2. Combine all 6 input box values into one string
    let token = "";
    otpInputs.forEach((input) => {
      token += input.value.trim();
    });

    // Check if the user entered all 6 digits
    if (token.length !== 6) {
      alert("Please enter the complete 6-digit verification code.");
      return;
    }

    if (!email) {
      alert("Session expired. Please go back and sign in again.");
      window.location.href = "signin.html";
      return;
    }

    try {
      // 3. Verify OTP with Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: token,
        type: "email",
      });

      if (error) throw error;

      alert("Verification successful!");
      window.location.href = "dashboard.html"; // Redirect to your app's home screen
    } catch (error) {
      console.error("Verification error:", error);
      alert(error.message || "Invalid or expired verification code.");
    }
  });
});
