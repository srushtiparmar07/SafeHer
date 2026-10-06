import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://bswgjfguytayxffuorwy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__aEz4RacAZLZSfBvF-ByuQ_aE0GWonx";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- RAZORPAY KEY ID ---
const RAZORPAY_KEY_ID = "rzp_live_ThtMVXdshqqxi2";

document.addEventListener("DOMContentLoaded", async () => {
  // Check if user is authenticated
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    window.location.href = "signin.html";
    return;
  }

  const user = session.user;

  // Populate User Profile Information in the Header
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

  // Check Active Subscription Status from Supabase
  const { data: subs, error: subError } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active");

  const hasActiveSubscription = subs && subs.length > 0;
  const subscriptionSection = document.getElementById("subscriptionSection");

  if (hasActiveSubscription) {
    if (subscriptionSection) subscriptionSection.style.display = "none";
  } else {
    if (subscriptionSection) subscriptionSection.style.display = "block";
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
  const enableShakeBtn = document.getElementById("enableShakeBtn");
  const shakePermissionCard = document.getElementById("shakePermissionCard");

  // Helper function to guard premium features behind active subscription
  function checkSubscriptionGate() {
    if (!hasActiveSubscription) {
      alert("🔒 Premium Feature Locked: Please select a plan above and complete your secure payment to unlock SafeHer emergency features.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    return true;
  }

  // Programmatic alarm sound generator (synthesizes an emergency siren without MP3 files)
  function playEmergencyAlarm() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      let beepCount = 0;
      
      const alarmInterval = setInterval(() => {
        if (beepCount >= 8) {
          clearInterval(alarmInterval);
          return;
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        
        beepCount++;
      }, 400);
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  }

  // 1. Live Location Button Logic — FREE FOR EVERYONE
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

  // 2. Trusted Contacts Page Navigation — FREE FOR ALL
  if (contactsBtn) {
    contactsBtn.addEventListener("click", () => {
      window.location.href = "contacts.html";
    });
  }

  // 3. Safer Routes Page Navigation (PREMIUM)
  if (routesBtn) {
    routesBtn.addEventListener("click", () => {
      if (!checkSubscriptionGate()) return;
      window.location.href = "routes.html";
    });
  }

  // 4. Nearby Help Page Navigation (PREMIUM)
  if (nearbyBtn) {
    nearbyBtn.addEventListener("click", () => {
      if (!checkSubscriptionGate()) return;
      window.location.href = "nearby.html";
    });
  }

  // 5. Emergency Numbers Page Navigation (PREMIUM)
  if (emergencyBtn) {
    emergencyBtn.addEventListener("click", () => {
      if (!checkSubscriptionGate()) return;
      window.location.href = "emergency.html";
    });
  }

  // Core SOS Execution Function
  async function executeSOS(isShake = false) {
    if (!isShake && !checkSubscriptionGate()) return;

    if (!isShake) {
      const confirmSOS = confirm("🚨 EMERGENCY SOS: Are you sure you want to trigger an emergency alert? This will play an alarm, fetch your live location, and alert your trusted contacts.");
      if (!confirmSOS) return;
    }

    playEmergencyAlarm();

    if (sosBtn) {
      sosBtn.innerText = "Processing SOS...";
      sosBtn.disabled = true;
    }

    try {
      const { data: contacts, error: contactError } = await supabase
        .from("trusted_contacts")
        .select("*")
        .eq("user_id", user.id);

      if (contactError || !contacts || contacts.length === 0) {
        alert("SOS Alarm played, but no trusted contacts found! Please add contacts in the Trusted Contacts section first.");
        if (sosBtn) {
          sosBtn.innerText = "Trigger SOS Alert !";
          sosBtn.disabled = false;
        }
        return;
      }

      if (!("geolocation" in navigator)) {
        alert("Geolocation is not supported by your browser.");
        if (sosBtn) {
          sosBtn.innerText = "Trigger SOS Alert !";
          sosBtn.disabled = false;
        }
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

          contacts.forEach((contact, index) => {
            if (contact.phone) {
              const cleanPhone = contact.phone.replace(/\D/g, '');
              setTimeout(() => {
                window.open(`https://wa.me/${cleanPhone}?text=${emergencyMessage}`, '_blank');
              }, index * 500);
            }
          });

          if (sosBtn) {
            sosBtn.innerText = "SOS Alert Dispatched! 🚨";
            sosBtn.style.background = "#10b981";
          }
        },
        (error) => {
          console.error("Location error:", error);
          alert("Could not fetch your GPS location. Alarm played, but location messaging requires GPS permissions.");
          if (sosBtn) {
            sosBtn.innerText = "Trigger SOS Alert !";
            sosBtn.disabled = false;
          }
        },
        { enableHighAccuracy: true }
      );

    } catch (err) {
      console.error("SOS Error:", err);
      alert("An error occurred while processing the SOS alert.");
      if (sosBtn) {
        sosBtn.innerText = "Trigger SOS Alert !";
        sosBtn.disabled = false;
      }
    }
  }

  // 6. Emergency SOS Button Click Logic (PREMIUM)
  if (sosBtn) {
    sosBtn.addEventListener("click", () => executeSOS(false));
  }

  // --- 7. SHAKE-TO-SOS MOTION DETECTION LOGIC ---
  let lastX = 0, lastY = 0, lastZ = 0;
  let lastUpdate = 0;
  let shakeThreshold = 25; 
  let isSosTriggered = false; 

  if (enableShakeBtn) {
    enableShakeBtn.addEventListener("click", async () => {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
          const response = await DeviceMotionEvent.requestPermission();
          if (response === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion, false);
            alert("Shake-to-SOS is now active!");
            if (shakePermissionCard) shakePermissionCard.style.display = 'none';
          } else {
            alert("Permission denied for motion sensors.");
          }
        } catch (err) {
          console.error("Error requesting motion permission:", err);
        }
      } else {
        window.addEventListener('devicemotion', handleDeviceMotion, false);
        alert("Shake-to-SOS is now active!");
        if (shakePermissionCard) shakePermissionCard.style.display = 'none';
      }
    });
  }

  function handleDeviceMotion(e) {
    let current = e.accelerationIncludingGravity;
    if (!current) return;

    let currentTime = Date.now();

    if ((currentTime - lastUpdate) > 100) {
      let diffTime = currentTime - lastUpdate;
      lastUpdate = currentTime;

      let speed = Math.abs(current.x + current.y + current.z - lastX - lastY - lastZ) / diffTime * 10000;

      if (speed > shakeThreshold && !isSosTriggered) {
        isSosTriggered = true;
        console.log("🚨 EMERGENCY SHAKE DETECTED!");
        executeSOS(true);
        
        setTimeout(() => {
          isSosTriggered = false;
        }, 10000);
      }

      lastX = current.x;
      lastY = current.y;
      lastZ = current.z;
    }
  }

  // 8. Logout Logic
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      sessionStorage.clear();
      window.location.href = "signin.html";
    });
  }

  // --- 9. RAZORPAY CHECKOUT MODAL HANDLER (DB-SYNCED VERSION) ---
  document.querySelectorAll('.pay-razorpay-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const planName = e.currentTarget.getAttribute('data-plan');
      const amountInRupees = parseFloat(e.currentTarget.getAttribute('data-amount'));
      const amountInPaise = amountInRupees * 100;

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: "INR",
        name: "SafeHer Safety Companion",
        description: `${planName} Subscription Plan`,
        image: "safer-logo-transparent.png",
        handler: async function (response) {
          const paymentId = response.razorpay_payment_id;
          
          // Save subscription directly into Supabase user_subscriptions table
          const { data, error } = await supabase
            .from('user_subscriptions')
            .insert([
              {
                user_id: user.id,
                razorpay_payment_id: paymentId,
                plan_type: planName,
                status: 'active'
              }
            ]);

          if (error) {
            console.error("Supabase Insertion Error:", error);
            alert(`Payment successful (${paymentId}), but database sync failed: ${error.message}. Please check RLS policies in Supabase.`);
          } else {
            console.log("Successfully saved subscription to database:", data);
            alert(`🎉 Payment Successful! Your ${planName} plan is now active and saved.`);
          }

          if (subscriptionSection) {
            subscriptionSection.style.display = "none";
          }

          // Reload page to reflect active subscription state from the database
          window.location.reload();
        },
        prefill: {
          email: user.email,
          name: user.user_metadata?.name || user.email.split("@")[0]
        },
        theme: {
          color: "#0d6efd"
        }
      };

      const rzpModal = new Razorpay(options);
      rzpModal.open();
    });
  });
});
