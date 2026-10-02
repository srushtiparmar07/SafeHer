import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://bswgjfguytayxffuorwy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__aEz4RacAZLZSfBvF-ByuQ_aE0GWonx";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Check user authentication session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    window.location.href = "signin.html";
    return;
  }

  const user = session.user;

  // DOM Elements
  const contactForm = document.getElementById("contactForm");
  const contactsList = document.getElementById("contactsList");
  const contactCount = document.getElementById("contactCount");
  const emptyState = document.getElementById("emptyState");

  // Load existing contacts on page load
  await loadTrustedContacts();

  // 2. Handle Adding a New Contact
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("contactName").value.trim();
      const phone = document.getElementById("contactPhone").value.trim();
      const relation = document.getElementById("contactRelation").value;

      if (!name || !phone || !relation) {
        alert("Please fill in all fields.");
        return;
      }

      try {
        // Step A: Check current contact count for this user
        const { data: existingContacts, error: countError } = await supabase
          .from("trusted_contacts")
          .select("id")
          .eq("user_id", user.id);

        if (countError) throw countError;

        const currentCount = existingContacts ? existingContacts.length : 0;

        // Step B: Check active subscription status to determine limits
        const { data: subs, error: subError } = await supabase
          .from("user_subscriptions")
          .select("status")
          .eq("user_id", user.id)
          .eq("status", "active");

        if (subError) throw subError;

        const isPremium = subs && subs.length > 0;

        // Step C: Enforce Rules (Free = max 4, Premium = max 12)
        if (!isPremium && currentCount >= 4) {
          alert("🔒 Free Tier Limit Reached: You can add up to 4 trusted contacts for free. Upgrade to SafeHer Premium to add up to 12 contacts!");
          return;
        }

        if (isPremium && currentCount >= 12) {
          alert("You have reached the maximum limit of 12 trusted contacts for your premium account.");
          return;
        }

        // Step D: Insert new contact into Supabase
        const { error: insertError } = await supabase
          .from("trusted_contacts")
          .insert([
            {
              user_id: user.id,
              name: name,
              phone: phone,
              relation: relation
            }
          ]);

        if (insertError) throw insertError;

        alert("Trusted contact added successfully!");
        contactForm.reset();
        await loadTrustedContacts();

      } catch (err) {
        console.error("Error adding contact:", err);
        alert("Failed to add contact. Please try again.");
      }
    });
  }

  // 3. Fetch and Render Trusted Contacts
  async function loadTrustedContacts() {
    try {
      const { data: contacts, error } = await supabase
        .from("trusted_contacts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!contacts || contacts.length === 0) {
        if (contactCount) contactCount.textContent = "0 contacts";
        if (emptyState) emptyState.style.display = "block";
        return;
      }

      // Hide empty state and update count
      if (emptyState) emptyState.style.display = "none";
      if (contactCount) contactCount.textContent = `${contacts.length} contact${contacts.length > 1 ? 's' : ''}`;

      // Clear list container except empty state template
      contactsList.innerHTML = "";

      contacts.forEach(contact => {
        const contactCard = document.createElement("div");
        contactCard.className = "contact-card"; // Make sure your contacts.css styles this class nicely
        contactCard.innerHTML = `
          <div class="contact-info">
            <h4>${escapeHTML(contact.name)}</h4>
            <p>📞 ${escapeHTML(contact.phone)}</p>
            <span class="contact-badge">${escapeHTML(contact.relation || 'Contact')}</span>
          </div>
          <button class="delete-contact-btn" data-id="${contact.id}" title="Remove Contact">🗑️</button>
        `;
        contactsList.appendChild(contactCard);
      });

      // Attach event listeners to delete buttons
      document.querySelectorAll(".delete-contact-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const contactId = e.target.getAttribute("data-id");
          if (confirm("Are you sure you want to remove this contact from your emergency network?")) {
            await deleteContact(contactId);
          }
        });
      });

    } catch (err) {
      console.error("Error loading contacts:", err);
    }
  }

  // 4. Delete Contact Function
  async function deleteContact(contactId) {
    try {
      const { error } = await supabase
        .from("trusted_contacts")
        .delete()
        .eq("id", contactId)
        .eq("user_id", user.id);

      if (error) throw error;

      alert("Contact removed successfully.");
      await loadTrustedContacts();
    } catch (err) {
      console.error("Error deleting contact:", err);
      alert("Failed to delete contact.");
    }
  }

  // Utility to prevent XSS injection
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
});
