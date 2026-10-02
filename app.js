(() => {
  const MESSAGES_KEY = "agentcube.chat.messages.v1";
  const SESSION_NAME_KEY = "agentcube.chat.currentName";

  const loginView = document.getElementById("loginform");
  const chatView = document.getElementById("wrapper");
  const loginForm = document.getElementById("login");
  const nameInput = document.getElementById("name");
  const loginError = document.getElementById("login-error");
  const welcomeName = document.getElementById("welcome-name");
  const chatbox = document.getElementById("chatbox");
  const messageForm = document.getElementById("message-form");
  const messageInput = document.getElementById("usermsg");
  const exitLink = document.getElementById("exit");

  let lastRenderedState = "";
  let pollTimer = null;
  const broadcast = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("agentcube-chat") : null;

  function getCurrentName() {
    return sessionStorage.getItem(SESSION_NAME_KEY) || "";
  }

  function setCurrentName(name) {
    sessionStorage.setItem(SESSION_NAME_KEY, name);
  }

  function clearCurrentName() {
    sessionStorage.removeItem(SESSION_NAME_KEY);
  }

  function loadMessages() {
    try {
      const raw = localStorage.getItem(MESSAGES_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      return [];
    }
  }

  function saveMessages(messages) {
    const serialized = JSON.stringify(messages);
    localStorage.setItem(MESSAGES_KEY, serialized);
    lastRenderedState = serialized;

    if (broadcast) {
      broadcast.postMessage({ type: "messages-updated" });
    }
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function renderMessages() {
    const messages = loadMessages();
    chatbox.textContent = "";

    messages.forEach((message) => {
      const row = document.createElement("div");
      row.className = "msgln";

      if (message.type === "system") {
        const info = document.createElement("span");
        info.className = "left-info";

        info.append(document.createTextNode("User "));

        const user = document.createElement("b");
        user.className = "user-name-left";
        user.textContent = message.name || "Unknown";
        info.append(user);

        info.append(document.createTextNode(" has left the chat session."));
        row.append(info);
      } else {
        const time = document.createElement("span");
        time.className = "chat-time";
        time.textContent = formatTime(message.time);
        row.append(time);
        row.append(document.createTextNode(" "));

        const user = document.createElement("b");
        user.className = "user-name";
        user.textContent = message.name;
        row.append(user);
        row.append(document.createTextNode(" "));

        const text = document.createElement("span");
        text.className = "message-text";
        text.textContent = message.text;
        row.append(text);
      }

      chatbox.append(row);
    });

    chatbox.scrollTop = chatbox.scrollHeight;
    lastRenderedState = JSON.stringify(messages);
  }

  function appendChatMessage(name, text) {
    const messages = loadMessages();
    messages.push({
      type: "chat",
      name,
      text,
      time: new Date().toISOString()
    });
    saveMessages(messages);
    renderMessages();
  }

  function appendLeaveMessage(name) {
    const messages = loadMessages();
    messages.push({
      type: "system",
      name,
      time: new Date().toISOString()
    });
    saveMessages(messages);
    renderMessages();
  }

  function showChat() {
    const currentName = getCurrentName();
    welcomeName.textContent = currentName;
    loginView.hidden = true;
    chatView.hidden = false;
    renderMessages();
    messageInput.focus();
  }

  function showLogin() {
    loginView.hidden = false;
    chatView.hidden = true;
    loginForm.reset();
    loginError.hidden = true;
    nameInput.focus();
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    if (!name) {
      loginError.hidden = false;
      nameInput.focus();
      return;
    }

    setCurrentName(name);
    loginError.hidden = true;
    showChat();
  });

  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = messageInput.value.trim();
    if (!text) {
      messageInput.value = "";
      return;
    }

    appendChatMessage(getCurrentName(), text);
    messageInput.value = "";
    messageInput.focus();
  });

  exitLink.addEventListener("click", (event) => {
    event.preventDefault();

    const shouldLeave = window.confirm("Are you sure you want to end the session?");
    if (!shouldLeave) {
      return;
    }

    const name = getCurrentName();
    if (name) {
      appendLeaveMessage(name);
    }

    clearCurrentName();
    showLogin();
  });

  if (broadcast) {
    broadcast.addEventListener("message", () => {
      renderMessages();
    });
  }

  pollTimer = window.setInterval(() => {
    const raw = localStorage.getItem(MESSAGES_KEY) || "[]";
    if (raw !== lastRenderedState) {
      renderMessages();
    }
  }, 1500);

  window.addEventListener("beforeunload", () => {
    if (pollTimer) {
      window.clearInterval(pollTimer);
    }
    if (broadcast) {
      broadcast.close();
    }
  });

  if (getCurrentName()) {
    showChat();
  } else {
    showLogin();
  }
})();
