console.log("Website loaded successfully.");

// ─── A) RETRIEVE ALL FORM VALUES & PRINT TO CONSOLE ────────────────────────
// We can't query the form directly from app.js because home.html lives inside
// an <iframe>.  Instead we listen for a custom postMessage that home.html sends
// every time the form is submitted, then log the payload here.
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "formSubmission") {
    const { name, email, subject, message, timestamp } = event.data.payload;
    console.group("📬 Contact Form Submission");
    console.log("Name     :", name);
    console.log("Email    :", email);
    console.log("Subject  :", subject);
    console.log("Message  :", message);
    console.log("Timestamp:", timestamp);
    console.groupEnd();
  }
});

// ─── B) TIME-BASED GREETING ────────────────────────────────────────────────
function getGreeting() {
  const now  = new Date();
  const hour = now.getHours();

  if (hour >= 5  && hour < 12) return "Good Morning! ☀️";
  if (hour >= 12 && hour < 17) return "Good Afternoon! 🌤️";
  if (hour >= 17 && hour < 21) return "Good Evening! 🌆";
  return "Good Night! 🌙";
}

const greeting = getGreeting();
console.log(`%c${greeting}`, "color:#3498db; font-size:18px; font-weight:bold;");

// Expose so the iframe pages can call it too
window.getGreeting = getGreeting;

// ─── C) LIVE DIGITAL CLOCK ─────────────────────────────────────────────────
function updateClock() {
  const now   = new Date();
  let hours   = now.getHours();
  const mins  = String(now.getMinutes()).padStart(2, "0");
  const secs  = String(now.getSeconds()).padStart(2, "0");
  const ampm  = hours >= 12 ? "PM" : "AM";
  hours       = hours % 12 || 12;
  const hStr  = String(hours).padStart(2, "0");

  const timeStr = `${hStr}:${mins}:${secs} ${ampm}`;

  // Update every clock element that may exist across iframes
  document.querySelectorAll(".live-clock").forEach((el) => {
    el.textContent = timeStr;
  });

  // Also broadcast to iframes
  document.querySelectorAll("iframe").forEach((frame) => {
    try {
      frame.contentWindow.postMessage({ type: "clockTick", time: timeStr }, "*");
    } catch (_) {}
  });
}

setInterval(updateClock, 1000);
updateClock(); // run immediately