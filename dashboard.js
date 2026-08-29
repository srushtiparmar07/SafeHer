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

    const sosButton =
        document.getElementById("sosButton");

    const safetyStatus =
        document.getElementById("safetyStatus");

    let sosTimer;


    sosButton.addEventListener(
        "mousedown",
        startSOS
    );

    sosButton.addEventListener(
        "mouseup",
        cancelSOS
    );

    sosButton.addEventListener(
        "mouseleave",
        cancelSOS
    );

    sosButton.addEventListener(
        "touchstart",
        startSOS
    );

    sosButton.addEventListener(
        "touchend",
        cancelSOS
    );


    function startSOS(event) {

        event.preventDefault();

        sosButton.innerHTML =
            "<span>3</span><small>HOLDING...</small>";

        let countdown = 3;

        sosTimer = setInterval(function () {

            countdown--;

            sosButton.innerHTML =
                "<span>" +
                countdown +
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


        const savedContacts =
            JSON.parse(
                localStorage.getItem("safeherContacts")
            ) || [];


        if (savedContacts.length === 0) {

            alert(
                "🚨 SOS ACTIVATED\n\n" +
                "You don't have any trusted contacts yet.\n\n" +
                "Please add a trusted contact first."
            );

        } else {

            const contactNames =
                savedContacts
                    .map(function (contact) {

                        return "• " +
                            contact.name +
                            " (" +
                            contact.phone +
                            ")";

                    })
                    .join("\n");


            alert(
                "🚨 SOS ACTIVATED\n\n" +
                "Trusted contacts that would be alerted:\n\n" +
                contactNames +
                "\n\n" +
                "Real SMS/call alerts will be connected in a later step."
            );

        }

    }


    /* =========================
       LIVE LOCATION
    ========================= */

    const locationButton =
        document.getElementById("locationButton");

    locationButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "location.html";

        }
    );


    /* =========================
       SAFER ROUTES
    ========================= */

    const routesButton =
        document.getElementById("routesButton");

    routesButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "routes.html";

        }
    );


    /* =========================
       NEARBY HELP
    ========================= */

    const nearbyHelpButton =
        document.getElementById("nearbyHelpButton");

    nearbyHelpButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "nearby.html";

        }
    );


    /* =========================
       TRUSTED CONTACTS
    ========================= */

    const contactsButton =
        document.getElementById("contactsButton");

    contactsButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "contacts.html";

        }
    );


    /* =========================
       SAFETY CHECK
    ========================= */

    const checkButton =
        document.getElementById("checkButton");

    checkButton.addEventListener(
        "click",
        function () {

            safetyStatus.textContent =
                "Safety check completed — you are safe";

            alert(
                "Safety check completed!"
            );

        }
    );


    /* =========================
       EMERGENCY NUMBERS
    ========================= */

    const emergencyButton =
        document.getElementById("emergencyButton");

    emergencyButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "emergency.html";

        }
    );


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
