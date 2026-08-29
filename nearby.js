document.addEventListener("DOMContentLoaded", function () {

    const locationButton =
        document.getElementById("locationButton");

    const locationStatus =
        document.getElementById("locationStatus");

    const policeButton =
        document.getElementById("policeButton");

    const hospitalButton =
        document.getElementById("hospitalButton");

    const profileButton =
        document.getElementById("profileButton");


    /* =========================
       GET CURRENT LOCATION
    ========================== */

    if (locationButton) {

        locationButton.addEventListener("click", function () {

            if (!navigator.geolocation) {

                alert(
                    "Your browser does not support location services."
                );

                return;
            }


            locationStatus.textContent =
                "Finding your location...";

            locationButton.disabled = true;

            navigator.geolocation.getCurrentPosition(

                function (position) {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;


                    localStorage.setItem(
                        "safeherLatitude",
                        latitude
                    );

                    localStorage.setItem(
                        "safeherLongitude",
                        longitude
                    );


                    locationStatus.textContent =
                        "Location detected successfully";


                    locationButton.textContent =
                        "Located ✓";

                    locationButton.disabled = false;


                    alert(
                        "Your location has been detected.\n\n" +
                        "Latitude: " +
                        latitude.toFixed(5) +
                        "\nLongitude: " +
                        longitude.toFixed(5)
                    );

                },


                function (error) {

                    locationButton.disabled = false;

                    locationStatus.textContent =
                        "Unable to detect location";


                    if (error.code === 1) {

                        alert(
                            "Location permission was denied. " +
                            "Please allow location access in your browser."
                        );

                    } else {

                        alert(
                            "Unable to find your location. " +
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

        });

    }


    /* =========================
       OPEN NEARBY POLICE
    ========================== */

    if (policeButton) {

        policeButton.addEventListener(
            "click",
            function () {

                openNearbyPlace("police");

            }
        );

    }


    /* =========================
       OPEN NEARBY HOSPITAL
    ========================== */

    if (hospitalButton) {

        hospitalButton.addEventListener(
            "click",
            function () {

                openNearbyPlace("hospital");

            }
        );

    }


    /* =========================
       FIND NEARBY PLACE
    ========================== */

    function openNearbyPlace(type) {

        const latitude =
            localStorage.getItem("safeherLatitude");

        const longitude =
            localStorage.getItem("safeherLongitude");


        if (!latitude || !longitude) {

            alert(
                "Please click 'Find Me' first so SafeHer can use your location."
            );

            return;
        }


        let searchType = "";

        if (type === "police") {

            searchType =
                "police stations";

        } else {

            searchType =
                "hospitals";

        }


        const mapURL =
            "https://www.google.com/maps/search/" +
            encodeURIComponent(searchType) +
            "/@" +
            latitude +
            "," +
            longitude +
            ",14z";


        window.open(
            mapURL,
            "_blank"
        );

    }


    /* =========================
       PROFILE
    ========================== */

    if (profileButton) {

        profileButton.addEventListener(
            "click",
            function () {

                alert(
                    "Profile feature will be added soon."
                );

            }
        );

    }

});
