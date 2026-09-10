import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/* =========================================================
   1. SUPABASE SETUP
   Replace these two values with your project credentials:
   - Dashboard -> Project Settings -> API
========================================================= */
const SUPABASE_URL = "https://bswgjfguytayxffuorwy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__aEz4RacAZLZSfBvF-ByuQ_aE0GWonx";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* =========================================================
   2. DASHBOARD LOGIC
========================================================= */
document.addEventListener("DOMContentLoaded", async function () {
  const userNameElement = document.getElementById("userName");
  const signOutButton = document.getElementById("signOutButton");
  const sosButton = document.getElementById("sosButton");

  /* =========================
     CHECK AUTHENTICATION
  ========================= */
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    alert("Please sign in to access your dashboard.");
    window.location.href = "signin.html";
    return;
  }

  /* =========================
     LOAD USER PROFILE
  ========================= */
  async function loadUserProfile() {
    try {
      // Fetch user profile from your 'profiles' table
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, name")
        .eq("id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      }

      // Display name from profile, user metadata, or default to email/phone
      const displayName =
        profile?.full_name ||
        profile?.name ||
        user.user_metadata?.full_name ||
        user.phone ||
        user.email ||
        "User";

      if (userNameElement) {
        userNameElement.textContent = displayName;
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
    }
  }

  /* =========================
     EMERGENCY SOS ACTION
  ========================= */
  if (sosButton) {
    sosButton.addEventListener("click", async function () {
      const confirmed = confirm("Are you sure you want to send an emergency SOS alert?");
      if (!confirmed) return;

      try {
        // Record emergency event in Supabase
        const { error } = await supabase.from("emergency_events").insert([
          {
            user_id: user.id,
            status: "active",
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;

        alert("Emergency SOS alert recorded! Notifying your trusted contacts...");
      } catch (error) {
        console.error("Error triggering SOS:", error);
        alert("Unable to trigger SOS alert. Please call local emergency services immediately.");
      }
    });
  }

  /* =========================
     SIGN OUT LOGIC
  ========================= */
  if (signOutButton) {
    signOutButton.addEventListener("click", async function () {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        window.location.href = "signin.html";
      } catch (error) {
        console.error("Error signing out:", error);
        alert("Failed to sign out. Please try again.");
      }
    });
  }

  /* =========================
     INITIAL LOAD
  ========================= */
  loadUserProfile();
});
