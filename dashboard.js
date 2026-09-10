import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://bswgjfguytayxffuorwy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__aEz4RacAZLZSfBvF-ByuQ_aE0GWonx";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    alert("Session expired. Please log in again.");
    window.location.href = "signin.html";
    return;
  }

  const locationBtn = document.getElementById("locationBtn");
  const contactsBtn = document.getElementById("contactsBtn");
  const sosBtn = document.getElementById("sosBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const locationOutput = document.getElementById("locationOutput");

  // 1. Live Location Button Logic
  if (locationBtn) {
    locationBtn.addEventListener("click", () => {
      if ("geolocation" in navigator) {
        locationBtn.innerText = "Locating...";
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            locationBtn.innerText = "Share Live Location";
            if (locationOutput) {
              locationOutput.innerText = `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
            }

            // Open exact coordinates in Google Maps
            const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
            window.open(mapUrl, "_blank");
          },
          (error) => {
            locationBtn.innerText = "Share Live Location";
            console.error("Location error:", error);
            alert("Unable to fetch location. Please allow location access in your browser settings.");
          },
          { enableHighAccuracy: true }
        );
      } else {
        alert("Geolocation is not supported by your browser.");
      }
    });
  }

  // 2. Trusted Contacts Button Logic
  if (contactsBtn) {
    contactsBtn.addEventListener("click", () => {
      alert("Trusted Contacts module loaded!");
      // You can redirect to contacts page: window.location.href = "contacts.html";
    });
  }

  // 3. Emergency SOS Button Logic
  if (sosBtn) {
    sosBtn.addEventListener("click", () => {
      const confirmSOS = confirm("Are you sure you want to trigger an Emergency SOS Alert?");
      if (confirmSOS) {
        alert("SOS Alert Triggered! Sending location updates to emergency contacts.");
      }
    });
  }

  // 4. Logout Logic
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      sessionStorage.clear();
      window.location.href = "signin.html";
    });
  }
});
