// ICOS Website Chatbot Bridge
// Connects UI → local ICOS backend (http://localhost:3001/chat)

const ICOS_ENDPOINT = "http://localhost:3001/chat";

// DOM bindings (expected structure)
const inputEl = document.getElementById("chat-input");
const sendBtn = document.getElementById("chat-send");
const messagesEl = document.getElementById("chat-messages");

function appendMessage(role, text) {
    if (!messagesEl) return;

    const msg = document.createElement("div");
    msg.className = `msg msg-${role}`;
    msg.textContent = text;
    messagesEl.appendChild(msg);

    messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendMessage(message) {
    if (!message || message.trim().length === 0) return;

    appendMessage("user", message);

    try {
        const res = await fetch(ICOS_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });

        const data = await res.json();

        const reply =
            data?.reply ||
            data?.message ||
            "No response";

        appendMessage("assistant", reply);

    } catch (err) {
        appendMessage("assistant", "Connection error");
        console.error("ICOS bridge error:", err);
    }
}

// Event wiring
if (sendBtn) {
    sendBtn.addEventListener("click", () => {
        if (!inputEl) return;
        sendMessage(inputEl.value);
        inputEl.value = "";
    });
}

if (inputEl) {
    inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            sendMessage(inputEl.value);
            inputEl.value = "";
        }
    });
}