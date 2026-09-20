import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://bswgjfguytayxffuorwy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__aEz4RacAZLZSfBvF-ByuQ_aE0GWonx";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Verify Session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    alert("Session expired. Please log in again.");
    window.location.href = "signin.html";
    return;
  }

  // 2. Populate User Information
  const user = session.user;
  const email = user.email;
  const username = email.split("@")[0];
  const formattedName = username.charAt(0).toUpperCase() + username.slice(1);

  const profileNameEl = document.getElementById("profileName");
  const profileEmailEl = document.getElementById("profileEmail");
  const profileAvatarEl = document.getElementById("profileAvatar");

  if (profileNameEl) profileNameEl.textContent = formattedName;
  if (profileEmailEl) profileEmailEl.textContent = email;
  if (profileAvatarEl) profileAvatarEl.textContent = formattedName.charAt(0).toUpperCase();

  // 3. Handle Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      sessionStorage.clear();
      window.location.href = "signin.html";
    });
  }
});
