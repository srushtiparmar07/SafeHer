import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://bswgjfguytayxffuorwy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__aEz4RacAZLZSfBvF-ByuQ_aE0GWonx";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", function () {
  // 1. Get saved email from sessionStorage
  const email = sessionStorage.getItem("authEmail");
  const emailDisplay = document.getElementById("emailDisplay"); // or the tag displaying 'Loading...'
  
  if (emailDisplay && email) {
    emailDisplay.innerText = email;
  }

  const otpForm = document.getElementById("otpForm");

  if (!otpForm) return;

  otpForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    // 2. Combine all 6 input box values into one string
    const inputs = document.querySelectorAll(".otp-input"); // adjust class to match your 6 boxes
    let token = "";
    inputs.forEach((input) => {
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
