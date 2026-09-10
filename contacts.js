import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/* =========================================================
   1. SUPABASE SETUP
   Replace these two values with your project credentials:
   - Dashboard -> Project Settings -> API
========================================================= */
const SUPABASE_URL = "https://bswgjfguytayxffuorwy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__aEz4RacAZLZSfBvF-ByuQ_aE0GWonx";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* =========================================================
   2. MAIN APPLICATION LOGIC
========================================================= */
document.addEventListener("DOMContentLoaded", async function () {
  const contactForm = document.getElementById("contactForm");
  const contactsList = document.getElementById("contactsList");
  const emptyState = document.getElementById("emptyState");
  const contactCount = document.getElementById("contactCount");

  let contacts = [];

  /* =========================
     CHECK AUTHENTICATION
  ========================= */
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    alert("Please sign in to access your trusted contacts.");
    window.location.href = "signin.html";
    return;
  }

  /* =========================
     LOAD CONTACTS FROM SUPABASE
  ========================= */
  async function loadContacts() {
    try {
      const { data, error } = await supabase
        .from("trusted_contacts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      contacts = data || [];
      displayContacts();
    } catch (error) {
      console.error("Error loading contacts:", error);
      alert("Unable to load your trusted contacts.");
    }
  }

  /* =========================
     DISPLAY CONTACTS IN HTML
  ========================= */
  function displayContacts() {
    contactsList.innerHTML = "";

    if (contacts.length === 0) {
      contactsList.appendChild(emptyState);
      contactCount.textContent = "0 contacts";
      return;
    }

    contacts.forEach(function (contact) {
      const card = document.createElement("div");
      card.className = "contact-card";

      const firstLetter = contact.name ? contact.name.charAt(0).toUpperCase() : "?";

      card.innerHTML = `
        <div class="contact-avatar">
          ${firstLetter}
        </div>

        <div class="contact-details">
          <h3>${contact.name}</h3>
          <p>📱 ${contact.phone}</p>
          <p class="contact-relation">${contact.relation}</p>
        </div>

        <div class="contact-actions">
          <button class="contact-action edit-action" data-id="${contact.id}" title="Edit contact">
            ✏️
          </button>
          <button class="contact-action delete-action" data-id="${contact.id}" title="Delete contact">
            🗑️
          </button>
        </div>
      `;

      contactsList.appendChild(card);
    });

    contactCount.textContent =
      contacts.length + (contacts.length === 1 ? " contact" : " contacts");

    /* EDIT BUTTON LISTENERS */
    document.querySelectorAll(".edit-action").forEach(function (button) {
      button.addEventListener("click", function () {
        editContact(this.dataset.id);
      });
    });

    /* DELETE BUTTON LISTENERS */
    document.querySelectorAll(".delete-action").forEach(function (button) {
      button.addEventListener("click", function () {
        deleteContact(this.dataset.id);
      });
    });
  }

  /* =========================
     ADD A NEW CONTACT
  ========================= */
  contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("contactName").value.trim();
    const phone = document.getElementById("contactPhone").value.trim();
    const relation = document.getElementById("contactRelation").value;

    if (!name || !phone || !relation) {
      alert("Please fill in all contact details.");
      return;
    }

    const phonePattern = /^\+?[0-9\s-]{10,15}$/;
    if (!phonePattern.test(phone)) {
      alert("Please enter a valid phone number.");
      return;
    }

    try {
      const { error } = await supabase.from("trusted_contacts").insert([
        {
          user_id: user.id,
          name: name,
          phone: phone,
          relation: relation,
        },
      ]);

      if (error) throw error;

      contactForm.reset();
      await loadContacts();

      alert(name + " has been added to your trusted contacts.");
    } catch (error) {
      console.error("Error adding contact:", error);
      alert("Unable to save the trusted contact.");
    }
  });

  /* =========================
     DELETE A CONTACT
  ========================= */
  async function deleteContact(id) {
    const contact = contacts.find((item) => item.id === id);

    if (!contact) return;

    const confirmed = confirm(`Remove ${contact.name} from your trusted contacts?`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("trusted_contacts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      await loadContacts();
      alert("Contact removed.");
    } catch (error) {
      console.error("Error deleting contact:", error);
      alert("Unable to remove the contact.");
    }
  }

  /* =========================
     EDIT A CONTACT
  ========================= */
  async function editContact(id) {
    const contact = contacts.find((item) => item.id === id);

    if (!contact) return;

    const newName = prompt("Enter contact name:", contact.name);
    if (newName === null) return;

    const newPhone = prompt("Enter phone number:", contact.phone);
    if (newPhone === null) return;

    const newRelation = prompt("Enter relationship:", contact.relation);
    if (newRelation === null) return;

    if (!newName.trim() || !newPhone.trim() || !newRelation.trim()) {
      alert("All fields are required.");
      return;
    }

    const phonePattern = /^\+?[0-9\s-]{10,15}$/;
    if (!phonePattern.test(newPhone.trim())) {
      alert("Please enter a valid phone number.");
      return;
    }

    try {
      const { error } = await supabase
        .from("trusted_contacts")
        .update({
          name: newName.trim(),
          phone: newPhone.trim(),
          relation: newRelation.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      await loadContacts();
      alert("Contact updated successfully.");
    } catch (error) {
      console.error("Error updating contact:", error);
      alert("Unable to update the contact.");
    }
  }

  /* =========================
     PROFILE BUTTON
  ========================= */
  const profileButton = document.getElementById("profileNavButton");
  if (profileButton) {
    profileButton.addEventListener("click", function () {
      alert("Profile feature will be added soon.");
    });
  }

  /* =========================
     INITIAL LOAD
  ========================= */
  loadContacts();
});
