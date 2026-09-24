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

  // Populate User Profile Information in the Header
  const user = session.user;
  if (user && user.email) {
    const userEmailElements = document.querySelectorAll("#userEmail, #profileEmail, .profile-email");
    userEmailElements.forEach(el => {
      el.textContent = user.email;
    });

    const userNameElements = document.querySelectorAll("#userName, #profileName, .profile-name");
    const username = user.email.split("@")[0];
    const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
    userNameElements.forEach(el => {
      el.textContent = formattedName;
    });
  }

  // Selectors for all feature buttons & elements
  const locationBtn = document.getElementById("locationBtn");
  const contactsBtn = document.getElementById("contactsBtn");
  const routesBtn = document.getElementById("routesBtn");
  const nearbyBtn = document.getElementById("nearbyBtn");
  const emergencyBtn = document.getElementById("emergencyBtn");
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
            
            locationBtn.innerText = "Share Live Location →";
            if (locationOutput) {
              locationOutput.innerText = `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
            }

            // Open exact coordinates in Google Maps
            const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
            window.open(mapUrl, "_blank");
          },
          (error) => {
            locationBtn.innerText = "Share Live Location →";
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

  // 2. Trusted Contacts Page Navigation
  if (contactsBtn) {
    contactsBtn.addEventListener("click", () => {
      window.location.href = "contacts.html";
    });
  }

  // 3. Safer Routes Page Navigation
  if (routesBtn) {
    routesBtn.addEventListener("click", () => {
      window.location.href = "routes.html";
    });
  }

  // 4. Nearby Help Page Navigation
  if (nearbyBtn) {
    nearbyBtn.addEventListener("click", () => {
      window.location.href = "nearby.html";
    });
  }

  // 5. Emergency Numbers Page Navigation
  if (emergencyBtn) {
    emergencyBtn.addEventListener("click", () => {
      window.location.href = "emergency.html";
    });
  }

  // 6. Emergency SOS Button Logic (Fetches contacts & shares live location)
  if (sosBtn) {
    sosBtn.addEventListener("click", async () => {
      const confirmSOS = confirm("🚨 EMERGENCY SOS: Are you sure you want to trigger an emergency alert? This will fetch your live location and prepare alerts for your trusted contacts.");
      if (!confirmSOS) return;

      sosBtn.innerText = "Processing SOS...";
      sosBtn.disabled = true;

      try {
        // Fetch Trusted Contacts from Supabase for this logged-in user
        const { data: contacts, error: contactError } = await supabase
          .from("trusted_contacts")
          .select("*")
          .eq("user_id", user.id);

        if (contactError || !contacts || contacts.length === 0) {
          alert("SOS Triggered, but no trusted contacts found! Please add contacts in the Trusted Contacts section first.");
          sosBtn.innerText = "Trigger SOS Alert !";
          sosBtn.disabled = false;
          return;
        }

        // Get Current GPS Location
        if (!("geolocation" in navigator)) {
          alert("Geolocation is not supported by your browser.");
          sosBtn.innerText = "Trigger SOS Alert !";
          sosBtn.disabled = false;
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
            
            const emergencyMessage = encodeURIComponent(
              `🚨 EMERGENCY SOS! I need help immediately. My current live location is: ${mapsLink}`
            );

            // Automatically open messaging/WhatsApp links for each saved contact with location attached
            contacts.forEach((contact, index) => {
              if (contact.phone) {
                const cleanPhone = contact.phone.replace(/\D/g, '');
                setTimeout(() => {
                  window.open(`https://wa.me/${cleanPhone}?text=${emergencyMessage}`, '_blank');
                }, index * 500);
              }
            });

            sosBtn.innerText = "SOS Alert Dispatched! 🚨";
            sosBtn.style.background = "#10b981"; // Turns button green on success
          },
          (error) => {
            console.error("Location error:", error);
            alert("Could not fetch your GPS location. Please check your device location permissions.");
            sosBtn.innerText = "Trigger SOS Alert !";
            sosBtn.disabled = false;
          },
          { enableHighAccuracy: true }
        );

      } catch (err) {
        console.error("SOS Error:", err);
        alert("An error occurred while processing the SOS alert.");
        sosBtn.innerText = "Trigger SOS Alert !";
        sosBtn.disabled = false;
      }
    });
  }

  // 7. Logout Logic
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      sessionStorage.clear();
      window.location.href = "signin.html";
    });
  }
});
