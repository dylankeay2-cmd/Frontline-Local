(function () {
  const WORKER_URL = 'https://frontline-chatbot-frontlinelocal.dylankeay2.workers.dev/chat';
  const BRAND_COLOR = '#1a73e8';
  const OPENING_MESSAGE = "Hi! I'm the receptionist for [BUSINESS_NAME]. What can I help you with today?";

  let messages = [];
  let isOpen = false;
  let isTyping = false;

  // ── Inject styles ──────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #fl-chat-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: ${BRAND_COLOR};
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.22);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      transition: transform 0.15s ease;
    }
    #fl-chat-btn:hover { transform: scale(1.08); }
    #fl-chat-btn svg { width: 26px; height: 26px; fill: #fff; }

    #fl-chat-window {
      position: fixed;
      bottom: 110px;
      right: 24px;
      width: 360px;
      max-width: calc(100vw - 32px);
      height: 520px;
      max-height: calc(100vh - 110px);
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      display: flex;
      flex-direction: column;
      z-index: 9998;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      transform: scale(0.92) translateY(12px);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.18s ease, opacity 0.18s ease;
    }
    #fl-chat-window.open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: all;
    }

    #fl-chat-header {
      background: ${BRAND_COLOR};
      color: #fff;
      padding: 14px 16px;
      font-weight: 600;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    #fl-chat-header .fl-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255,255,255,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    #fl-chat-header .fl-title { flex: 1; }
    #fl-chat-header .fl-subtitle {
      font-size: 11px;
      font-weight: 400;
      opacity: 0.85;
    }
    #fl-close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #fff;
      opacity: 0.8;
      padding: 4px;
      display: flex;
      align-items: center;
    }
    #fl-close-btn:hover { opacity: 1; }
    #fl-close-btn svg { width: 18px; height: 18px; fill: #fff; }

    #fl-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #f7f8fa;
    }
    #fl-messages::-webkit-scrollbar { width: 4px; }
    #fl-messages::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

    .fl-msg {
      max-width: 82%;
      padding: 10px 13px;
      border-radius: 14px;
      line-height: 1.45;
      word-break: break-word;
    }
    .fl-msg.bot {
      background: #fff;
      color: #1a1a1a;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .fl-msg.user {
      background: ${BRAND_COLOR};
      color: #fff;
      border-bottom-right-radius: 4px;
      align-self: flex-end;
    }

    .fl-typing {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 10px 13px;
      background: #fff;
      border-radius: 14px;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .fl-typing span {
      width: 7px;
      height: 7px;
      background: #bbb;
      border-radius: 50%;
      animation: fl-bounce 1.2s infinite;
    }
    .fl-typing span:nth-child(2) { animation-delay: 0.2s; }
    .fl-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes fl-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }

    #fl-input-area {
      display: flex;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid #eee;
      background: #fff;
      flex-shrink: 0;
    }
    #fl-input {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 22px;
      padding: 9px 14px;
      font-size: 14px;
      outline: none;
      font-family: inherit;
      resize: none;
      line-height: 1.4;
      max-height: 80px;
      overflow-y: auto;
      transition: border-color 0.15s;
      color: #111;
      background: #fff;
    }
    #fl-input:focus { border-color: ${BRAND_COLOR}; }
    #fl-input::placeholder { color: #111; opacity: 1; }
    #fl-send-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: ${BRAND_COLOR};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      align-self: flex-end;
      transition: background 0.15s;
    }
    #fl-send-btn:hover { background: #1557b0; }
    #fl-send-btn:disabled { background: #ccc; cursor: default; }
    #fl-send-btn svg { width: 17px; height: 17px; fill: #fff; }

    #fl-powered {
      text-align: center;
      font-size: 10px;
      color: #bbb;
      padding: 6px;
      background: #fff;
      letter-spacing: 0.02em;
    }
  `;
  document.head.appendChild(style);

  // ── Build DOM ──────────────────────────────────────────────────────────────
  const btn = document.createElement('button');
  btn.id = 'fl-chat-btn';
  btn.setAttribute('aria-label', 'Open chat');
  btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`;

  const win = document.createElement('div');
  win.id = 'fl-chat-window';
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', 'Chat with us');
  win.innerHTML = `
    <div id="fl-chat-header">
      <div class="fl-avatar">💬</div>
      <div class="fl-title">
        <div>[BUSINESS_NAME]</div>
        <div class="fl-subtitle">AI Receptionist · Usually replies instantly</div>
      </div>
      <button id="fl-close-btn" aria-label="Close chat">
        <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
      </button>
    </div>
    <div id="fl-messages"></div>
    <div id="fl-input-area">
      <textarea id="fl-input" placeholder="Type a message…" rows="1" aria-label="Message input"></textarea>
      <button id="fl-send-btn" aria-label="Send message" disabled>
        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
    <div id="fl-powered">Powered by Frontline Local AI</div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(win);

  // ── Elements ───────────────────────────────────────────────────────────────
  const messagesEl = win.querySelector('#fl-messages');
  const inputEl = win.querySelector('#fl-input');
  const sendBtn = win.querySelector('#fl-send-btn');
  const closeBtn = win.querySelector('#fl-close-btn');

  // ── Helpers ────────────────────────────────────────────────────────────────
  function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = `fl-msg ${role}`;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'fl-typing';
    div.id = 'fl-typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const indicator = document.getElementById('fl-typing-indicator');
    if (indicator) indicator.remove();
  }

  function setInputEnabled(enabled) {
    inputEl.disabled = !enabled;
    sendBtn.disabled = !enabled;
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isTyping) return;

    inputEl.value = '';
    inputEl.style.height = 'auto';
    addMessage('user', text);
    messages.push({ role: 'user', content: text });

    isTyping = true;
    setInputEnabled(false);
    showTyping();

    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      const data = await res.json();
      hideTyping();

      const reply = data.response || data.error || 'Something went wrong — please try again.';
      addMessage('bot', reply);
      messages.push({ role: 'assistant', content: reply });
    } catch (err) {
      hideTyping();
      addMessage('bot', 'Connection issue — please refresh and try again.');
    }

    isTyping = false;
    setInputEnabled(true);
    inputEl.focus();
  }

  function openChat() {
    isOpen = true;
    win.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    inputEl.focus();

    if (messages.length === 0) {
      addMessage('bot', OPENING_MESSAGE);
      messages.push({ role: 'assistant', content: OPENING_MESSAGE });
    }
  }

  function closeChat() {
    isOpen = false;
    win.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }

  // ── Events ─────────────────────────────────────────────────────────────────
  btn.addEventListener('click', () => isOpen ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);

  inputEl.addEventListener('input', function () {
    sendBtn.disabled = !this.value.trim() || isTyping;
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 80) + 'px';
  });

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeChat();
  });
})();
