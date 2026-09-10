import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://bswgjfguytayxffuorwy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__aEz4RacAZLZSfBvF-ByuQ_aE0GWonx";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", function () {
  const signInForm = document.getElementById("signInForm");
  const emailInput = document.getElementById("emailInput"); // Update ID in HTML if needed

  if (!signInForm) return;

  signInForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = emailInput ? emailInput.value.trim() : "";

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
      });

      if (error) throw error;

      sessionStorage.setItem("authEmail", email);
      alert("Verification code sent to your email!");
      window.location.href = "otp.html";
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert(error.message || "Failed to send code.");
    }
  });
});
