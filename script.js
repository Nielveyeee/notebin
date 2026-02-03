document.addEventListener("DOMContentLoaded", () => {
  const notesDiv = document.getElementById("notes");
  const createBtn = document.getElementById("createBtn");

  /* ===== BAD WORD FILTER ===== */
  const badWords = [
    "fuck",
    "shit",
    "bitch",
    "asshole",
    "slut",
    "whore",
    "rape",
    "kill"
  ];

  function censorText(text) {
    let censored = text;
    badWords.forEach(word => {
      const regex = new RegExp(word, "gi");
      censored = censored.replace(regex, "****");
    });
    return censored;
  }

  /* ===== ANTI-SPAM ===== */
  let lastPostTime = 0;
  let lastMessage = "";

  /* ===== FETCH NOTES FROM DATABASE ===== */
  async function loadNotes() {
    try {
      const res = await fetch("/.netlify/functions/notes"); // GET request
      const notes = await res.json();

      notesDiv.innerHTML = "";
      notes.forEach(note => {
        const noteDiv = document.createElement("div");
        noteDiv.className = "note";
        noteDiv.innerHTML = `
          <div class="meta">Created by | ${note.name || "Unknown"}</div>
          <strong>To ${note.to_whom}</strong>
          <p>${note.message}</p>
        `;
        notesDiv.appendChild(noteDiv);
      });
    } catch (err) {
      console.error("Failed to load notes:", err);
    }
  }

  // Load notes on page load
  loadNotes();

  /* ===== CREATE NOTE ===== */
  createBtn.onclick = async () => {
    const now = Date.now();

    // Rate limit (15 seconds)
    if (now - lastPostTime < 15000) {
      alert("Please wait before posting again.");
      return;
    }

    const name = prompt("Your name (leave blank for Anonymous):");
    const to_whom = prompt("To:");
    let message = prompt("Your note:");

    if (!message || !to_whom) return;

    // Minimum length
    if (message.length < 5) {
      alert("Your note is too short.");
      return;
    }

    // Duplicate check
    if (message === lastMessage) {
      alert("Duplicate message detected.");
      return;
    }

    // Censor bad words
    message = censorText(message);

    lastPostTime = now;
    lastMessage = message;

    try {
      // Send note to Neon database via Netlify function
      await fetch("/.netlify/functions/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, to_whom, message }),
      });

      // Reload notes to show the new one
      await loadNotes();
    } catch (err) {
      console.error("Failed to create note:", err);
      alert("Failed to save note. Try again.");
    }
  };
});
