document.addEventListener("DOMContentLoaded", function () {

    const detectLocationButton =
        document.getElementById("detectLocation");

    const currentLocation =
        document.getElementById("currentLocation");

    const destinationInput =
        document.getElementById("destination");

    const findRoutesButton =
        document.getElementById("findRoutes");

    const routeResults =
        document.getElementById("routeResults");

    const mapButtons =
        document.querySelectorAll(".map-button");


    let latitude = null;
    let longitude = null;


    /* =========================
       DETECT CURRENT LOCATION
    ========================== */

    if (detectLocationButton) {

        detectLocationButton.addEventListener(
            "click",
            function () {

                if (!navigator.geolocation) {

                    alert(
                        "Location services are not supported by your browser."
                    );

                    return;
                }


                currentLocation.textContent =
                    "Detecting your location...";

                detectLocationButton.disabled = true;


                navigator.geolocation.getCurrentPosition(

                    function (position) {

                        latitude =
                            position.coords.latitude;

                        longitude =
                            position.coords.longitude;


                        localStorage.setItem(
                            "safeherLatitude",
                            latitude
                        );

                        localStorage.setItem(
                            "safeherLongitude",
                            longitude
                        );


                        currentLocation.textContent =
                            "Current location detected ✓";


                        detectLocationButton.textContent =
                            "Located ✓";

                        detectLocationButton.disabled =
                            false;


                        alert(
                            "Your current location has been detected."
                        );

                    },


                    function (error) {

                        detectLocationButton.disabled =
                            false;

                        currentLocation.textContent =
                            "Location unavailable";


                        if (error.code === 1) {

                            alert(
                                "Location permission was denied. " +
                                "Please allow location access and try again."
                            );

                        } else {

                            alert(
                                "Unable to detect your location. " +
                                "Please try again."
                            );

                        }

                    },

                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }

                );

            }
        );

    }


    /* =========================
       FIND SAFER ROUTES
    ========================== */

    if (findRoutesButton) {

        findRoutesButton.addEventListener(
            "click",
            function () {

                const destination =
                    destinationInput.value.trim();


                if (!latitude || !longitude) {

                    latitude =
                        localStorage.getItem(
                            "safeherLatitude"
                        );

                    longitude =
                        localStorage.getItem(
                            "safeherLongitude"
                        );

                }


                if (!latitude || !longitude) {

                    alert(
                        "Please detect your current location first."
                    );

                    return;
                }


                if (!destination) {

                    alert(
                        "Please enter your destination."
                    );

                    destinationInput.focus();

                    return;
                }


                routeResults.classList.remove("hidden");


                routeResults.scrollIntoView({
                    behavior: "smooth"
                });

            }
        );

    }


    /* =========================
       OPEN ROUTE IN GOOGLE MAPS
    ========================== */

    mapButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const destination =
                    destinationInput.value.trim();


                if (!destination) {

                    alert(
                        "Please enter your destination first."
                    );

                    destinationInput.focus();

                    return;
                }


                if (!latitude || !longitude) {

                    latitude =
                        localStorage.getItem(
                            "safeherLatitude"
                        );

                    longitude =
                        localStorage.getItem(
                            "safeherLongitude"
                        );

                }


                if (!latitude || !longitude) {

                    alert(
                        "Please detect your current location first."
                    );

                    return;
                }


                const mapsURL =
                    "https://www.google.com/maps/dir/?api=1" +
                    "&origin=" +
                    encodeURIComponent(
                        latitude + "," + longitude
                    ) +
                    "&destination=" +
                    encodeURIComponent(destination) +
                    "&travelmode=walking";


                window.open(
                    mapsURL,
                    "_blank"
                );

            }
        );

    });


    /* =========================
       LOAD SAVED LOCATION
    ========================== */

    const savedLatitude =
        localStorage.getItem(
            "safeherLatitude"
        );

    const savedLongitude =
        localStorage.getItem(
            "safeherLongitude"
        );


    if (savedLatitude && savedLongitude) {

        latitude = savedLatitude;
        longitude = savedLongitude;

        currentLocation.textContent =
            "Previously detected location ✓";

        detectLocationButton.textContent =
            "Update";

    }

});
