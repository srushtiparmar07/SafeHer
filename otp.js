import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://bswgjfguytayxffuorwy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__aEz4RacAZLZSfBvF-ByuQ_aE0GWonx";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", function () {
  const otpForm = document.getElementById("otpForm");
  const otpInput = document.getElementById("otpInput");
  const email = sessionStorage.getItem("authEmail");

  if (!otpForm) return;

  otpForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const token = otpInput ? otpInput.value.trim() : "";

    if (!token) {
      alert("Please enter the verification code.");
      return;
    }

    if (!email) {
      alert("Session expired. Please sign in again.");
      window.location.href = "signin.html";
      return;
    }

    try {
      // 1. Verify Email OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: token,
        type: "email",
      });

      if (error) throw error;

      const user = data.user;

      // 2. Check & Create Database Profile
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from("profiles").insert([
          {
            id: user.id,
            email: user.email || email,
            full_name: "SafeHer User",
            created_at: new Date().toISOString(),
          },
        ]);
      }

      sessionStorage.removeItem("authEmail");
      alert("Signed in successfully!");
      window.location.href = "dashboard.html";
    } catch (error) {
      console.error("Verification Error:", error);
      alert(error.message || "Invalid code. Please try again.");
    }
  });
});
