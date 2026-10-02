import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://bswgjfguytayxffuorwy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__aEz4RacAZLZSfBvF-ByuQ_aE0GWonx";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Verify user session silently in the background
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return; // If user isn't logged in, don't run shake listener

  const user = session.user;

  // 2. Shake detection state variables
  let lastX = 0, lastY = 0, lastZ = 0;
  let lastUpdate = 0;
  let shakeThreshold = 25; // Sensitivity threshold
  let isSosTriggered = false; // Cooldown flag to prevent double-triggering

  // Automatically start listening for motion (Android & standard browsers work instantly)
  if (window.DeviceMotionEvent) {
    // For iOS 13+ devices requiring explicit permission
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      // We check if permission was previously granted or prompt them gracefully
      // Note: iOS requires a user gesture to request motion permission. 
      // If you have an "Enable Shake" button on your dashboard, keep it. 
      // Otherwise, you can listen directly if permission was already granted.
    } else {
      window.addEventListener('devicemotion', handleDeviceMotion, false);
    }
  }

  function handleDeviceMotion(e) {
    let current = e.accelerationIncludingGravity;
    if (!current) return;

    let currentTime = Date.now();

    // Check motion metrics every 100ms
    if ((currentTime - lastUpdate) > 100) {
      let diffTime = currentTime - lastUpdate;
      lastUpdate = currentTime;

      let speed = Math.abs(current.x + current.y + current.z - lastX - lastY - lastZ) / diffTime * 10000;

      // If shake crosses threshold and SOS isn't already cooling down
      if (speed > shakeThreshold && !isSosTriggered) {
        isSosTriggered = true;
        
        console.log("🚨 GLOBAL EMERGENCY SHAKE DETECTED!");
        triggerBackgroundSOS(user.id);
        
        // Cooldown timer for 10 seconds to avoid accidental repetitive triggers
        setTimeout(() => {
          isSosTriggered = false;
        }, 10000);
      }

      lastX = current.x;
      lastY = current.y;
      lastZ = current.z;
    }
  }

  // 3. Background SOS Execution Handler
  async function triggerBackgroundSOS(userId) {
    try {
      // Fetch trusted contacts from Supabase
      const { data: contacts, error: contactError } = await supabase
        .from("trusted_contacts")
        .select("*")
        .eq("user_id", userId);

      if (contactError || !contacts || contacts.length === 0) {
        console.warn("Shake SOS triggered, but no trusted contacts found.");
        alert("🚨 Shake SOS Triggered! However, no trusted contacts were found. Please add contacts in your dashboard.");
        return;
      }

      if (!("geolocation" in navigator)) {
        alert("Geolocation is not supported by your browser.");
        return;
      }

      // Fetch precise GPS location and dispatch WhatsApp alerts
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
          
          const emergencyMessage = encodeURIComponent(
            `🚨 EMERGENCY SHAKE SOS! I need help immediately. My current live location is: ${mapsLink}`
          );

          contacts.forEach((contact, index) => {
            if (contact.phone) {
              const cleanPhone = contact.phone.replace(/\D/g, '');
              setTimeout(() => {
                window.open(`https://wa.me/${cleanPhone}?text=${emergencyMessage}`, '_blank');
              }, index * 500);
            }
          });

          alert("🚨 Emergency SOS Dispatched via Shake!");
        },
        (error) => {
          console.error("Location error during shake SOS:", error);
          alert("Shake detected, but could not fetch your GPS location. Please check device location permissions.");
        },
        { enableHighAccuracy: true }
      );

    } catch (err) {
      console.error("Background SOS Error:", err);
    }
  }
});
