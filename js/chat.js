/* ═══════════════════════════════════════
   ILYA — Chat Service
   GPT 5.2 Pro, Gemini 3 PRO, DeepSeek
   ═══════════════════════════════════════ */

const Chat = {
  activeModel: null,
  deepseekModel: '1',
  conversationId: null,  // for DeepSeek memory
  isSending: false,

  // ─── MODEL ENDPOINTS ───
  APIS: {
    gpt: {
      name: 'GPT 5.2 Pro',
      call: async (text) => {
        const url = `http://tan1s0.x10.network/openai/index.php?text=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const json = await res.json();
        return json.response || json.message || JSON.stringify(json);
      }
    },
    gemini: {
      name: 'Gemini 3 PRO',
      call: async (text) => {
        const url = `http://tan1s0.x10.network/google/index.php?text=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const json = await res.json();
        return json.response || json.message || JSON.stringify(json);
      }
    },
    deepseek: {
      name: 'DeepSeek',
      call: async (text, model, convId) => {
        const body = { model: model || '1', message: text };
        if (convId) body.conversation_id = convId;
        const res = await fetch('https://zecora0.serv00.net/deepseek.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const json = await res.json();
        // Store conversation_id for memory
        if (json.conversation_id) Chat.conversationId = json.conversation_id;
        return json.response || json.message || JSON.stringify(json);
      }
    }
  },

  selectModel(model) {
    // Check if model is disabled
    let models = {};
    try { models = JSON.parse(localStorage.getItem('ilya_models')) || {}; } catch {}
    if (models[model] === false) {
      UI.toast('هذا النموذج غير متاح حالياً', 'error');
      return;
    }

    if (model === 'deepseek') {
      document.getElementById('deepseek-sub').classList.remove('hidden');
      return;
    }
    Chat.activeModel = model;
    Chat.conversationId = null;
    Chat.openChatInterface();
  },

  selectDeepSeek(subModel) {
    Chat.activeModel = 'deepseek';
    Chat.deepseekModel = subModel;
    Chat.conversationId = null;
    Chat.openChatInterface();
  },

  openChatInterface() {
    document.getElementById('chat-model-select').classList.add('hidden');
    const iface = document.getElementById('chat-interface');
    iface.classList.remove('hidden');

    const modelNames = {
      gpt: 'GPT 5.2 Pro',
      gemini: 'Gemini 3 PRO',
      deepseek: `DeepSeek ${Chat.deepseekModel === '1' ? 'V3.2' : Chat.deepseekModel === '2' ? 'R1' : 'Coder'}`
    };
    document.getElementById('chat-active-model').textContent = modelNames[Chat.activeModel] || '';

    // Clear messages
    const msgs = document.getElementById('chat-messages');
    msgs.innerHTML = `
      <div class="chat-welcome">
        <div class="chat-welcome-icon">◈</div>
        <div>ابدأ محادثتك — النموذج: ${modelNames[Chat.activeModel]}</div>
      </div>
    `;
    document.getElementById('chat-input').focus();
  },

  backToModels() {
    document.getElementById('chat-interface').classList.add('hidden');
    document.getElementById('chat-model-select').classList.remove('hidden');
    document.getElementById('deepseek-sub').classList.add('hidden');
    Chat.activeModel = null;
    Chat.conversationId = null;
  },

  onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      Chat.send();
    }
  },

  autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  },

  async send() {
    if (Chat.isSending) return;
    const input = document.getElementById('chat-input');
    const text  = input.value.trim();
    if (!text) return;

    Chat.isSending = true;
    input.value = '';
    input.style.height = 'auto';

    const user = App.currentUser;

    // Add user bubble
    Chat.addMessage('user', text, user?.avatar || 'https://iili.io/B04MxcX.md.jpg');

    // Add thinking
    const thinkId = Chat.addThinking();

    try {
      let response;
      const api = Chat.APIS[Chat.activeModel];
      if (!api) throw new Error('النموذج غير متاح');

      if (Chat.activeModel === 'deepseek') {
        response = await api.call(text, Chat.deepseekModel, Chat.conversationId);
      } else {
        response = await api.call(text);
      }

      Chat.removeThinking(thinkId);
      Chat.addMessage('ai', response);

      // Record usage
      if (user) Auth.recordServiceUse(user.id, 'chat');

    } catch (err) {
      Chat.removeThinking(thinkId);
      Chat.addMessage('ai', 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
      console.error('Chat error:', err);
    }

    Chat.isSending = false;
  },

  addMessage(type, text, avatarSrc) {
    const container = document.getElementById('chat-messages');

    // Remove welcome message if exists
    const welcome = container.querySelector('.chat-welcome');
    if (welcome) welcome.remove();

    const row = document.createElement('div');
    row.className = `msg-row ${type}`;

    const avatarEl = type === 'user'
      ? `<div class="msg-avatar"><img src="${avatarSrc || 'https://iili.io/B04MxcX.md.jpg'}" alt="u"></div>`
      : `<div class="msg-avatar-ai">◈</div>`;

    const msgId = 'msg-' + Date.now();
    row.innerHTML = `
      ${type === 'ai' ? avatarEl : ''}
      <div>
        <div class="msg-bubble" id="${msgId}">${escapeHtml(text).replace(/\n/g,'<br>')}</div>
        <div class="msg-actions">
          <button class="copy-btn" onclick="Chat.copyText('${msgId}')">نسخ</button>
        </div>
      </div>
      ${type === 'user' ? avatarEl : ''}
    `;
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
    return row;
  },

  addThinking() {
    const container = document.getElementById('chat-messages');
    const id = 'think-' + Date.now();
    const row = document.createElement('div');
    row.className = 'msg-row ai';
    row.id = id;
    row.innerHTML = `
      <div class="msg-avatar-ai">◈</div>
      <div class="msg-thinking">
        <div class="thinking-dot"></div>
        <div class="thinking-dot"></div>
        <div class="thinking-dot"></div>
      </div>
    `;
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
    return id;
  },

  removeThinking(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  },

  copyText(msgId) {
    const el = document.getElementById(msgId);
    if (!el) return;
    const text = el.innerText;
    navigator.clipboard.writeText(text).then(() => UI.toast('تم النسخ', 'success'));
  }
};
