document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       CHECK LOGIN STATUS
    ========================= */

    const loggedIn = sessionStorage.getItem("safeherLoggedIn");

    if (!loggedIn) {
        window.location.href = "signin.html";
        return;
    }


    /* =========================
       SOS BUTTON
    ========================= */

    const sosButton = document.getElementById("sosButton");
    const safetyStatus = document.getElementById("safetyStatus");

    let sosTimer;

    sosButton.addEventListener("mousedown", startSOS);
    sosButton.addEventListener("mouseup", cancelSOS);
    sosButton.addEventListener("mouseleave", cancelSOS);

    sosButton.addEventListener("touchstart", startSOS);
    sosButton.addEventListener("touchend", cancelSOS);


    function startSOS(event) {

        event.preventDefault();

        sosButton.innerHTML =
            "<span>3</span><small>HOLDING...</small>";

        let countdown = 3;

        sosTimer = setInterval(function () {

            countdown--;

            sosButton.innerHTML =
                "<span>" + countdown +
                "</span><small>HOLDING...</small>";

            if (countdown <= 0) {

                clearInterval(sosTimer);

                activateSOS();

            }

        }, 1000);

    }


    function cancelSOS() {

        clearInterval(sosTimer);

        sosButton.innerHTML =
            "<span>SOS</span><small>HOLD</small>";

    }


    function activateSOS() {

        sosButton.innerHTML =
            "<span>🚨</span><small>ALERT SENT</small>";

        safetyStatus.textContent =
            "Emergency alert activated";

        alert(
            "SOS activated! In the final version, your trusted contacts and emergency services can be notified."
        );

    }


    /* =========================
       LIVE LOCATION
    ========================= */

    const locationButton =
        document.getElementById("locationButton");

    locationButton.addEventListener("click", function () {

        if (!navigator.geolocation) {

            alert(
                "Geolocation is not supported by your browser."
            );

            return;

        }

        locationButton.disabled = true;

        alert(
            "Requesting your current location..."
        );


        navigator.geolocation.getCurrentPosition(

            function (position) {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                sessionStorage.setItem(
                    "safeherLatitude",
                    latitude
                );

                sessionStorage.setItem(
                    "safeherLongitude",
                    longitude
                );

                locationButton.disabled = false;

                alert(
                    "Location found!\n\nLatitude: " +
                    latitude.toFixed(5) +
                    "\nLongitude: " +
                    longitude.toFixed(5)
                );

            },

            function () {

                locationButton.disabled = false;

                alert(
                    "Unable to access your location. Please allow location permission."
                );

            }

        );

    });


    /* =========================
       SAFER ROUTES
    ========================= */

    const routesButton =
        document.getElementById("routesButton");

    routesButton.addEventListener("click", function () {

        alert(
            "Safer Routes feature is coming next!\n\nIt will help you compare available routes using safety-related information such as nearby police stations and hospitals."
        );

    });


    /* =========================
       NEARBY HELP
    ========================= */

    const nearbyHelpButton =
        document.getElementById("nearbyHelpButton");

    nearbyHelpButton.addEventListener("click", function () {

        alert(
            "Nearby Help will show nearby police stations and hospitals using your current location."
        );

    });


    /* =========================
       TRUSTED CONTACTS
    ========================= */

    const contactsButton =
        document.getElementById("contactsButton");

    contactsButton.addEventListener("click", function () {

        alert(
            "Trusted Contacts will allow you to add family members or friends who receive your safety alerts."
        );

    });


    /* =========================
       SAFETY CHECK
    ========================= */

    const checkButton =
        document.getElementById("checkButton");

    checkButton.addEventListener("click", function () {

        safetyStatus.textContent =
            "Safety check completed — you are safe";

        alert(
            "Safety check completed!"
        );

    });


    /* =========================
       EMERGENCY NUMBERS
    ========================= */

    const emergencyButton =
        document.getElementById("emergencyButton");

    emergencyButton.addEventListener("click", function () {

        alert(
            "Emergency Numbers\n\nPolice: 112\nAmbulance: 112\nWomen Helpline: 181"
        );

    });


    /* =========================
       BOTTOM NAVIGATION
    ========================= */

    const locationNavButton =
        document.getElementById("locationNavButton");

    const contactsNavButton =
        document.getElementById("contactsNavButton");

    const profileNavButton =
        document.getElementById("profileNavButton");


    locationNavButton.addEventListener(
        "click",
        function () {

            locationButton.click();

        }
    );


    contactsNavButton.addEventListener(
        "click",
        function () {

            contactsButton.click();

        }
    );


    profileNavButton.addEventListener(
        "click",
        function () {

            alert(
                "Profile feature will be added next."
            );

        }
    );

});
