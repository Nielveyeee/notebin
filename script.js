document.addEventListener("DOMContentLoaded", () => {
  const notesDiv = document.getElementById("notes");

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

  /* ===== CREATE NOTE ===== */
  const createBtn = document.getElementById("createBtn");

  createBtn.onclick = () => {
    const now = Date.now();

    // Rate limit (15 seconds)
    if (now - lastPostTime < 15000) {
      alert("Please wait before posting again.");
      return;
    }

    const name = prompt("Your name (leave blank for Anonymous):");
    const to = prompt("To:");
    let message = prompt("Your note:");

    if (!message || !to) return;

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

    const note = document.createElement("div");
    note.className = "note";
    note.innerHTML = `
      <div class="meta">
        Created by | ${name || "Unknown"}
      </div>

      <strong>To ${to}</strong>
      <p>${message}</p>
    `;

    notesDiv.prepend(note);
  };
});