document.addEventListener("DOMContentLoaded", function () {

    const contactForm = document.getElementById("contactForm");
    const contactsList = document.getElementById("contactsList");
    const emptyState = document.getElementById("emptyState");
    const contactCount = document.getElementById("contactCount");

    let contacts = JSON.parse(
        localStorage.getItem("safeherContacts")
    ) || [];


    /* =========================
       DISPLAY CONTACTS
    ========================= */

    function displayContacts() {

        contactsList.innerHTML = "";

        if (contacts.length === 0) {

            contactsList.appendChild(emptyState);

            contactCount.textContent = "0 contacts";

            return;
        }


        contacts.forEach(function (contact, index) {

            const card = document.createElement("div");

            card.className = "contact-card";


            const firstLetter =
                contact.name.charAt(0).toUpperCase();


            card.innerHTML = `

                <div class="contact-avatar">
                    ${firstLetter}
                </div>

                <div class="contact-details">

                    <h3>
                        ${contact.name}
                    </h3>

                    <p>
                        📱 ${contact.phone}
                    </p>

                    <p class="contact-relation">
                        ${contact.relation}
                    </p>

                </div>

                <div class="contact-actions">

                    <button
                        class="contact-action"
                        onclick="editContact(${index})"
                        title="Edit contact"
                    >
                        ✏️
                    </button>

                    <button
                        class="contact-action delete-action"
                        onclick="deleteContact(${index})"
                        title="Delete contact"
                    >
                        🗑️
                    </button>

                </div>

            `;


            contactsList.appendChild(card);

        });


        contactCount.textContent =
            contacts.length +
            (contacts.length === 1 ? " contact" : " contacts");

    }


    /* =========================
       ADD CONTACT
    ========================= */

    contactForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const name =
            document.getElementById("contactName").value.trim();

        const phone =
            document.getElementById("contactPhone").value.trim();

        const relation =
            document.getElementById("contactRelation").value;


        if (!name || !phone || !relation) {

            alert(
                "Please fill in all contact details."
            );

            return;
        }


        const phonePattern =
            /^\+?[0-9\s-]{10,15}$/;


        if (!phonePattern.test(phone)) {

            alert(
                "Please enter a valid phone number."
            );

            return;
        }


        const newContact = {

            name: name,

            phone: phone,

            relation: relation

        };


        contacts.push(newContact);


        saveContacts();


        contactForm.reset();


        alert(
            name + " has been added to your trusted contacts."
        );

    });


    /* =========================
       SAVE CONTACTS
    ========================= */

    function saveContacts() {

        localStorage.setItem(
            "safeherContacts",
            JSON.stringify(contacts)
        );

        displayContacts();

    }


    /* =========================
       DELETE CONTACT
    ========================= */

    window.deleteContact = function (index) {

        const contact =
            contacts[index];


        const confirmed =
            confirm(
                "Remove " +
                contact.name +
                " from your trusted contacts?"
            );


        if (!confirmed) {
            return;
        }


        contacts.splice(index, 1);


        saveContacts();


        alert(
            "Contact removed."
        );

    };


    /* =========================
       EDIT CONTACT
    ========================= */

    window.editContact = function (index) {

        const contact =
            contacts[index];


        const newName =
            prompt(
                "Enter contact name:",
                contact.name
            );


        if (newName === null) {
            return;
        }


        const newPhone =
            prompt(
                "Enter phone number:",
                contact.phone
            );


        if (newPhone === null) {
            return;
        }


        const newRelation =
            prompt(
                "Enter relationship:",
                contact.relation
            );


        if (newRelation === null) {
            return;
        }


        if (
            newName.trim() === "" ||
            newPhone.trim() === "" ||
            newRelation.trim() === ""
        ) {

            alert(
                "All fields are required."
            );

            return;
        }


        contacts[index] = {

            name: newName.trim(),

            phone: newPhone.trim(),

            relation: newRelation.trim()

        };


        saveContacts();


        alert(
            "Contact updated successfully."
        );

    };


    /* =========================
       PROFILE BUTTON
    ========================= */

    const profileButton =
        document.getElementById("profileNavButton");


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


    /* =========================
       INITIAL DISPLAY
    ========================= */

    displayContacts();

});
