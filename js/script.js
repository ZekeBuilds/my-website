// =============================================================================
// script.js  —  Exercise 4: FormSubmit Integration with Client-Side Filtering
// =============================================================================
// Linked via <script src="js/script.js" defer></script> in home.html
// =============================================================================


// ─────────────────────────────────────────────────────────────────────────────
// GREETING (time-based)
// ─────────────────────────────────────────────────────────────────────────────
function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5  && hour < 12) return "Good Morning! ☀️";
    if (hour >= 12 && hour < 17) return "Good Afternoon! 🌤️";
    if (hour >= 17 && hour < 21) return "Good Evening! 🌆";
    return "Good Night! 🌙";
}

const greetingEl = document.getElementById("greeting-text");
if (greetingEl) greetingEl.textContent = getGreeting();

// ─────────────────────────────────────────────────────────────────────────────
// LIVE CLOCK
// ─────────────────────────────────────────────────────────────────────────────
function updateClock() {
    const now  = new Date();
    let   h    = now.getHours();
    const m    = String(now.getMinutes()).padStart(2, "0");
    const s    = String(now.getSeconds()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    const clockEl = document.getElementById("live-clock");
    if (clockEl) clockEl.textContent = `${String(h).padStart(2,"0")}:${m}:${s} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

// Also respond to clock ticks broadcast from the parent frame (app.js)
window.addEventListener("message", (e) => {
    if (e.data?.type === "clockTick") {
        const el = document.getElementById("live-clock");
        if (el) el.textContent = e.data.time;
    }
});


// =============================================================================
// TOAST NOTIFICATION SYSTEM
// =============================================================================
function showToast(type, title, text, duration = 5500) {
    const icons     = { error: "✕", warning: "⚠", success: "✓" };
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || "!"}</div>
        <div class="toast-body">
            <div class="toast-title">${title}</div>
            <div class="toast-text">${text}</div>
        </div>
        <button class="toast-close" aria-label="Dismiss">✕</button>
        <div class="toast-progress" style="animation-duration:${duration}ms"></div>
    `;

    container.appendChild(toast);

    const dismiss = () => {
        toast.classList.add("removing");
        setTimeout(() => toast.remove(), 320);
    };

    toast.querySelector(".toast-close").addEventListener("click", dismiss);
    setTimeout(dismiss, duration);
}


// =============================================================================
// SPAM FILTER 1 — RATE LIMITING
// Exercise spec: restrict to max 3 submissions per minute (60 seconds)
// =============================================================================
let submitTimes = []; // stores timestamps of recent submissions

function isRateLimited() {
    const now = Date.now();

    // Keep only submissions from the last 60 seconds
    submitTimes = submitTimes.filter(time => now - time < 60000);

    // If already 3 submissions in the last minute, block
    if (submitTimes.length >= 3) {
        return true;
    }

    // Otherwise, record this submission and allow
    submitTimes.push(now);
    return false;
}


// =============================================================================
// SPAM FILTER 2 — TIME-BASED FILTERING
// Exercise spec: reject submissions completed in under 2 seconds (likely bots)
// =============================================================================

// Record when the form loads
const formLoadTime = Date.now();

function isTooFast() {
    const submitTime    = Date.now();
    const secondsTaken  = (submitTime - formLoadTime) / 1000;

    return secondsTaken < 2;
}


// =============================================================================
// SPAM FILTER 3 — SPAM KEYWORD DETECTION
// Exercise spec: scan message for commonly used spam-related terms
// =============================================================================
const spamWords = [
    "free money", "buy now", "click here", "subscribe", "promo",
    "win now", "limited offer", "make money", "earn cash", "casino",
    "viagra", "loan offer", "weight loss", "100% free", "act now",
    "dear friend", "you have won", "congratulations you"
];

function containsSpam(message) {
    const lowerMessage = message.toLowerCase();

    return spamWords.some(word => lowerMessage.includes(word));
}


// =============================================================================
// COMPREHENSIVE VALIDATION (Exercise spec: email format, min/max lengths,
// real-time feedback, explicit error messages, visual indicators)
// =============================================================================
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const rules = {
    name:    { min: 2,   max: 100,  label: "Full Name" },
    email:   { min: 5,   max: 254,  label: "Email" },
    subject: { min: 3,   max: 150,  label: "Subject" },
    message: { min: 10,  max: 2000, label: "Message" }
};

/**
 * Set a field to error, success, or neutral (null) state.
 * Updates: input border, inline error/success text, label colour.
 */
function setFieldState(id, state, errorMsg) {
    const input   = document.getElementById(id);
    const errEl   = document.getElementById(id + "Error");
    const validEl = document.getElementById(id + "Valid");
    const group   = document.getElementById("group-" + id);

    if (!input || !errEl || !validEl || !group) return;

    // Reset first
    input.classList.remove("field-invalid", "field-valid");
    errEl.classList.remove("visible");
    validEl.classList.remove("visible");
    group.classList.remove("has-error", "has-success");

    if (state === "error") {
        input.classList.add("field-invalid");
        errEl.textContent = errorMsg;
        errEl.classList.add("visible");
        group.classList.add("has-error");
    } else if (state === "success") {
        input.classList.add("field-valid");
        validEl.classList.add("visible");
        group.classList.add("has-success");
    }
    // state === null → neutral, already reset above
}

/**
 * Validate a single field against its rules.
 * Returns { ok: boolean, msg: string }
 */
function validateField(id, showValid = true) {
    const input = document.getElementById(id);
    if (!input) return { ok: true };

    const val = input.value.trim();
    const r   = rules[id];

    if (!val) {
        const m = `${r.label} is required.`;
        setFieldState(id, "error", m);
        return { ok: false, msg: m };
    }
    if (val.length < r.min) {
        const m = `${r.label} must be at least ${r.min} characters (you entered ${val.length}).`;
        setFieldState(id, "error", m);
        return { ok: false, msg: m };
    }
    if (val.length > r.max) {
        const m = `${r.label} must be under ${r.max} characters.`;
        setFieldState(id, "error", m);
        return { ok: false, msg: m };
    }
    if (id === "email" && !EMAIL_REGEX.test(val)) {
        const m = "Please enter a valid email address (e.g. user@example.com).";
        setFieldState(id, "error", m);
        return { ok: false, msg: m };
    }

    if (showValid) setFieldState(id, "success");
    else           setFieldState(id, null);
    return { ok: true };
}

/** Shake a field to draw attention to it */
function shakeField(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("shake");
    void el.offsetWidth; // force reflow to restart CSS animation
    el.classList.add("shake");
    el.addEventListener("animationend", () => el.classList.remove("shake"), { once: true });
}

// Real-time validation feedback as the user types / leaves a field
["name", "email", "subject", "message"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("input", () => {
        if (el.value.trim().length > 0) validateField(id, true);
        else setFieldState(id, null);
    });

    el.addEventListener("blur", () => {
        // Validate on blur if they've typed anything or already in error state
        if (el.value.trim().length > 0 || el.classList.contains("field-invalid")) {
            validateField(id, true);
        }
    });
});


// =============================================================================
// FORM SUBMIT HANDLER
// Applies all four filters in order before submitting to FormSubmit
// =============================================================================
const form = document.querySelector("form");

if (form) {
    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const fieldIds = ["name", "email", "subject", "message"];

        // ── Step 1: Comprehensive validation ──────────────────────────────────
        const results = fieldIds.map(id => ({ id, ...validateField(id, true) }));
        const errors  = results.filter(r => !r.ok);

        if (errors.length > 0) {
            // Shake every invalid field
            errors.forEach(r => shakeField(r.id));

            // Show validation summary box above the button
            const summary = document.getElementById("validationSummary");
            const list    = document.getElementById("validationList");
            if (summary && list) {
                list.innerHTML        = errors.map(r => `<li>${r.msg}</li>`).join("");
                summary.style.display = "block";
                // Animate it back into view in case the user scrolled away
                summary.classList.remove("summary-animate");
                void summary.offsetWidth;
                summary.classList.add("summary-animate");
                summary.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }

            // Toast: list all problems
            showToast(
                "error",
                `${errors.length} field${errors.length > 1 ? "s need" : " needs"} attention`,
                errors.map(r => r.msg).join(" • "),
                6500
            );

            // Flash the submit button red
            const btn = document.getElementById("submitBtn");
            if (btn) {
                btn.classList.add("btn-error");
                btn.addEventListener("animationend", () => btn.classList.remove("btn-error"), { once: true });
            }

            return; // stop here, do not submit
        }

        // All fields valid — hide summary
        const summary = document.getElementById("validationSummary");
        if (summary) summary.style.display = "none";

        const name    = document.getElementById("name").value.trim();
        const email   = document.getElementById("email").value.trim();
        const subject = document.getElementById("subject").value.trim();
        const message = document.getElementById("message").value.trim();

        // ── Step 2: Time-based filter ──────────────────────────────────────────
        if (isTooFast()) {
            showToast(
                "warning",
                "Submission too fast",
                "Your message was submitted in under 2 seconds — that looks automated. Please wait a moment and try again.",
                7000
            );
            shakeField("message");
            return;
        }

        // ── Step 3: Spam keyword detection ────────────────────────────────────
        if (containsSpam(message) || containsSpam(subject)) {
            showToast(
                "warning",
                "Message blocked",
                "Your message contains keywords commonly associated with spam. Please revise and try again.",
                7000
            );
            if (containsSpam(subject)) {
                shakeField("subject");
                setFieldState("subject", "error", "Subject contains blocked spam keywords.");
            }
            if (containsSpam(message)) {
                shakeField("message");
                setFieldState("message", "error", "Message contains blocked spam keywords.");
            }
            return;
        }

        // ── Step 4: Rate limiting ─────────────────────────────────────────────
        if (isRateLimited()) {
            showToast(
                "warning",
                "Too many submissions",
                "You've submitted this form 3 times in the last minute. Please wait before trying again.",
                8000
            );
            return;
        }

        // ── All checks passed: log and submit ─────────────────────────────────
        const timestamp = new Date().toLocaleString();

        console.group("📬 Contact Form Submission");
        console.log("Name     :", name);
        console.log("Email    :", email);
        console.log("Subject  :", subject);
        console.log("Message  :", message);
        console.log("Timestamp:", timestamp);
        console.groupEnd();

        // Notify parent frame (app.js) via postMessage
        try {
            window.parent.postMessage({
                type: "formSubmission",
                payload: { name, email, subject, message, timestamp }
            }, "*");
        } catch (_) {}

        // Loading UI
        const btn     = document.getElementById("submitBtn");
        const btnText = document.getElementById("btnText");
        const spinner = document.getElementById("btnSpinner");
        if (btn)     btn.disabled          = true;
        if (btnText) btnText.style.display  = "none";
        if (spinner) spinner.style.display  = "inline-flex";

        const formEl = this;

        // AJAX submit to FormSubmit (no page redirect)
        fetch(this.action, {
            method: "POST",
            body: new FormData(this),
            headers: { "Accept": "application/json" }
        })
        .then(res => {
            if (!res.ok) throw new Error("Network response was not ok");

            // Show inline success banner, hide form
            formEl.style.display = "none";
            const successEl = document.getElementById("successMessage");
            if (successEl) successEl.style.display = "flex";

            showToast("success", "Message sent!", "I'll get back to you as soon as possible.", 5000);

            // Reset everything after 6 seconds
            setTimeout(() => {
                formEl.reset();
                formEl.style.display = "block";
                if (successEl) successEl.style.display = "none";
                fieldIds.forEach(id => setFieldState(id, null));
            }, 6000);
        })
        .catch(err => {
            console.error("FormSubmit error:", err);
            showToast(
                "error",
                "Send failed",
                "Could not deliver your message. Please try again or email me directly.",
                7000
            );
        })
        .finally(() => {
            if (btn)     btn.disabled          = false;
            if (btnText) btnText.style.display  = "inline";
            if (spinner) spinner.style.display  = "none";
        });
    });
}