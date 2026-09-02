import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* =========================
   FIREBASE CONFIG
========================= */

const firebaseConfig = {
    apiKey: "AIzaSyAsoy6pxPRQ-AC5eYurx6bopmoOcLIzaWE",
    authDomain: "safeher-96bdb.firebaseapp.com",
    projectId: "safeher-96bdb",
    storageBucket: "safeher-96bdb.firebasestorage.app",
    messagingSenderId: "777297641744",
    appId: "1:777297641744:web:91eeb505836708ccad2595"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


/* =========================
   WAIT FOR USER LOGIN
========================= */

document.addEventListener("DOMContentLoaded", function () {

    const contactForm =
        document.getElementById("contactForm");

    const contactsList =
        document.getElementById("contactsList");

    const emptyState =
        document.getElementById("emptyState");

    const contactCount =
        document.getElementById("contactCount");


    let contacts = [];


    /* =========================
       CHECK AUTHENTICATION
    ========================= */

    const user = auth.currentUser;


    if (!user) {

        alert(
            "Please sign in to access your trusted contacts."
        );

        window.location.href =
            "signin.html";

        return;
    }


    /* =========================
       FIRESTORE CONTACTS
    ========================= */

    const contactsCollection =
        collection(
            db,
            "users",
            user.uid,
            "trustedContacts"
        );


    /* =========================
       LOAD CONTACTS
    ========================= */

    async function loadContacts() {

        try {

            const snapshot =
                await getDocs(
                    contactsCollection
                );


            contacts = [];


            snapshot.forEach(function (document) {

                contacts.push({

                    id: document.id,

                    ...document.data()

                });

            });


            displayContacts();


        } catch (error) {

            console.error(
                "Error loading contacts:",
                error
            );


            alert(
                "Unable to load your trusted contacts."
            );

        }

    }


    /* =========================
       DISPLAY CONTACTS
    ========================= */

    function displayContacts() {

        contactsList.innerHTML = "";


        if (contacts.length === 0) {

            contactsList.appendChild(
                emptyState
            );

            contactCount.textContent =
                "0 contacts";

            return;
        }


        contacts.forEach(function (contact) {

            const card =
                document.createElement("div");


            card.className =
                "contact-card";


            const firstLetter =
                contact.name
                    .charAt(0)
                    .toUpperCase();


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
                        class="contact-action edit-action"
                        data-id="${contact.id}"
                        title="Edit contact"
                    >
                        ✏️
                    </button>

                    <button
                        class="contact-action delete-action"
                        data-id="${contact.id}"
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
            (
                contacts.length === 1
                    ? " contact"
                    : " contacts"
            );


        /* EDIT BUTTONS */

        document
            .querySelectorAll(".edit-action")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        editContact(
                            this.dataset.id
                        );

                    }
                );

            });


        /* DELETE BUTTONS */

        document
            .querySelectorAll(".delete-action")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        deleteContact(
                            this.dataset.id
                        );

                    }
                );

            });

    }


    /* =========================
       ADD CONTACT
    ========================= */

    contactForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("contactName")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("contactPhone")
                    .value
                    .trim();


            const relation =
                document
                    .getElementById("contactRelation")
                    .value;


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


            try {

                await addDoc(
                    contactsCollection,
                    {
                        name: name,
                        phone: phone,
                        relation: relation,
                        createdAt: serverTimestamp()
                    }
                );


                contactForm.reset();


                await loadContacts();


                alert(
                    name +
                    " has been added to your trusted contacts."
                );


            } catch (error) {

                console.error(
                    "Error adding contact:",
                    error
                );


                alert(
                    "Unable to save the trusted contact."
                );

            }

        }
    );


    /* =========================
       DELETE CONTACT
    ========================= */

    async function deleteContact(id) {

        const contact =
            contacts.find(function (item) {

                return item.id === id;

            });


        if (!contact) {
            return;
        }


        const confirmed =
            confirm(
                "Remove " +
                contact.name +
                " from your trusted contacts?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await deleteDoc(
                doc(
                    db,
                    "users",
                    user.uid,
                    "trustedContacts",
                    id
                )
            );


            await loadContacts();


            alert(
                "Contact removed."
            );


        } catch (error) {

            console.error(
                "Error deleting contact:",
                error
            );


            alert(
                "Unable to remove the contact."
            );

        }

    }


    /* =========================
       EDIT CONTACT
    ========================= */

    async function editContact(id) {

        const contact =
            contacts.find(function (item) {

                return item.id === id;

            });


        if (!contact) {
            return;
        }


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


        const phonePattern =
            /^\+?[0-9\s-]{10,15}$/;


        if (!phonePattern.test(newPhone.trim())) {

            alert(
                "Please enter a valid phone number."
            );

            return;
        }


        try {

            await updateDoc(
                doc(
                    db,
                    "users",
                    user.uid,
                    "trustedContacts",
                    id
                ),
                {
                    name: newName.trim(),
                    phone: newPhone.trim(),
                    relation: newRelation.trim(),
                    updatedAt: serverTimestamp()
                }
            );


            await loadContacts();


            alert(
                "Contact updated successfully."
            );


        } catch (error) {

            console.error(
                "Error updating contact:",
                error
            );


            alert(
                "Unable to update the contact."
            );

        }

    }


    /* =========================
       PROFILE BUTTON
    ========================= */

    const profileButton =
        document.getElementById(
            "profileNavButton"
        );


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
       INITIAL LOAD
    ========================= */

    loadContacts();

});
