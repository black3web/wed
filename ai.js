// ============================================================
//   ILYA AI Platform — AI Services Module (ai.js)
//   Handles: model list, model interface, chat, API calls
// ============================================================

const ILYAAI = {

  // ── Models List ──────────────────────────────────────────
  showList() {
    const t    = (k) => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    const cfg  = ILYA.state.config;

    const page = document.getElementById('page-ai');
    page.innerHTML = `
      <div class="page-inner">
        <div class="page-header">
          <button class="page-header-back" id="back-from-ai">←</button>
          <div class="page-title">${t('ai_services')}</div>
        </div>
        <div style="font-size:.82rem;color:var(--text-2);line-height:1.7;margin-bottom:20px;padding:14px 16px;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--radius-md)">
          ${isAr
            ? '🎨 اختر نموذج الذكاء الاصطناعي المناسب لاحتياجاتك. انقر على الصورة لتكبيرها.'
            : '🎨 Choose the AI model that suits your needs. Click the preview to enlarge it.'}
        </div>
        <div class="model-list" id="models-container"></div>
      </div>
    `;

    ILYA.showPage('ai');
    document.getElementById('back-from-ai').addEventListener('click', () => ILYADashboard.show());

    const container = document.getElementById('models-container');

    ILYA.AI_MODELS.forEach(model => {
      const enabled = cfg[model.configKey] !== 'false';
      const name    = isAr ? model.nameAr : model.nameEn;
      const desc    = isAr ? model.descAr : model.descEn;

      const card = document.createElement('div');
      card.className = 'model-card' + (enabled ? '' : ' service-disabled');
      card.innerHTML = `
        <img src="${model.img}" alt="${name}" class="model-thumb"
             onerror="this.src='https://iili.io/B04MxcX.md.jpg'" loading="lazy">
        <div class="model-info">
          <div class="model-name">${name}</div>
          <div class="model-desc">${desc}</div>
          <div>
            <span class="model-tag">${model.type === 'text' ? (isAr ? 'نص→صورة' : 'Text→Image') : (isAr ? 'صورة→صورة' : 'Image→Image')}</span>
            ${!enabled ? `<span class="disabled-label" style="margin-right:6px">${isAr ? 'معطّل' : 'Disabled'}</span>` : ''}
          </div>
        </div>
        ${enabled ? '<div class="model-arrow">›</div>' : ''}
      `;

      // Thumbnail lightbox
      card.querySelector('.model-thumb').addEventListener('click', (e) => {
        e.stopPropagation();
        ILYA.openLightbox(model.img);
      });

      if (enabled) {
        card.addEventListener('click', () => this.showInterface(model.id));
      }

      container.appendChild(card);
    });
  },

  // ── Model Interface ───────────────────────────────────────
  showInterface(modelId) {
    const model  = ILYA.AI_MODELS.find(m => m.id === modelId);
    if (!model) return;
    ILYA.state.modelId    = modelId;
    ILYA.state.chatHistory = [];

    const t    = (k) => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    const name = isAr ? model.nameAr : model.nameEn;
    const desc = isAr ? model.descAr : model.descEn;

    const page = document.getElementById('page-model');
    page.innerHTML = `
      <div class="page-inner">
        <div class="page-header">
          <button class="page-header-back" id="back-from-model">←</button>
          <div class="page-title">${name}</div>
        </div>

        <!-- Hero -->
        <div class="model-hero" style="margin-bottom:16px">
          <img src="${model.img}" alt="${name}" class="model-hero-img"
               onclick="ILYA.openLightbox('${model.img}')"
               onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
          <div class="model-hero-name">${name}</div>
          <div class="model-hero-desc">${desc}</div>
        </div>

        <!-- Settings -->
        <div class="glass-card" style="margin-bottom:16px" id="settings-panel">
          ${this._buildSettings(model)}
        </div>

        <!-- Chat area -->
        <div class="glass-card" id="chat-section" style="margin-bottom:12px;display:none">
          <div class="chat-area" id="chat-area"></div>
        </div>

        <!-- Input -->
        <div class="input-area">
          ${model.type === 'text' ? `
            <textarea id="prompt-input" rows="3"
              placeholder="${t('write_desc')}"></textarea>
          ` : `
            <input type="url" id="img-url-input" class="form-input"
              placeholder="${t('image_url')}"
              style="background:none;border:none;padding:0;margin-bottom:8px">
          `}
          <div class="input-footer">
            <div style="font-size:.75rem;color:var(--text-3)">
              ${isAr ? 'اضغط إرسال لبدء التوليد' : 'Press send to generate'}
            </div>
            <button class="send-btn" id="send-btn">
              <span id="send-icon">⚡</span>
              <span id="send-text">${t('send')}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    ILYA.showPage('model');

    document.getElementById('back-from-model').addEventListener('click', () => this.showList());
    document.getElementById('send-btn').addEventListener('click', () => this._send(model));
  },

  _buildSettings(model) {
    const t    = (k) => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    const p    = model.params;
    let html   = '';

    const labelStyle = 'font-size:.8rem;font-weight:600;color:var(--text-2);margin-bottom:6px;display:block';

    if (model.id === 'text_to_image') {
      html = `
        <div class="settings-grid">
          <div>
            <label style="${labelStyle}">${t('ratio')}</label>
            <select id="param-ratio" class="select-field">
              ${p.ratios.map(r => `<option value="${r}">${r}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="${labelStyle}">${t('quality')}</label>
            <select id="param-upscale" class="select-field">
              ${p.upscales.map(u => `<option value="${u.val}">${u.lbl}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="${labelStyle}">${t('count')}</label>
            <select id="param-count" class="select-field">
              ${p.counts.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
        </div>`;

    } else if (model.id === 'image_to_anime') {
      html = `
        <div class="settings-grid">
          <div>
            <label style="${labelStyle}">${t('ratio')}</label>
            <select id="param-ratio" class="select-field">
              ${p.ratios.map(r => `<option value="${r}">${r}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="${labelStyle}">${t('gender')}</label>
            <select id="param-gender" class="select-field">
              ${p.genders.map(g => `<option value="${g}">${g}</option>`).join('')}
            </select>
          </div>
          <div class="settings-grid full" style="grid-column:1/-1">
            <label style="${labelStyle}">${t('style')}</label>
            <select id="param-style" class="select-field">
              ${p.styles.map(s => `<option value="${s}">${s.replace(/_/g,' ')}</option>`).join('')}
            </select>
          </div>
        </div>`;

    } else if (model.id === 'seedream') {
      html = `
        <div class="settings-grid">
          <div>
            <label style="${labelStyle}">${t('ratio')}</label>
            <select id="param-ratio" class="select-field">
              ${p.ratios.map(r => `<option value="${r}">${r}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="${labelStyle}">${t('style')}</label>
            <select id="param-style" class="select-field">
              ${p.styles.map(s => `<option value="${s}">${s.replace(/_/g,' ')}</option>`).join('')}
            </select>
          </div>
        </div>
        <div style="margin-top:10px;padding:10px 12px;background:rgba(255,150,0,.08);border:1px solid rgba(255,150,0,.2);border-radius:var(--radius-sm);font-size:.78rem;color:rgba(255,180,0,.8)">
          ⚠️ ${isAr ? 'يجب كتابة الوصف باللغة الإنجليزية لهذا النموذج' : 'Description must be written in English for this model'}
        </div>`;

    } else if (model.id === 'image_to_personal') {
      html = `
        <div class="settings-grid">
          <div>
            <label style="${labelStyle}">${t('ratio')}</label>
            <select id="param-ratio" class="select-field">
              ${p.ratios.map(r => `<option value="${r}">${r}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="${labelStyle}">${t('gender')}</label>
            <select id="param-gender" class="select-field">
              ${p.genders.map(g => `<option value="${g}">${g === 'male' ? (isAr ? 'ذكر' : 'Male') : (isAr ? 'أنثى' : 'Female')}</option>`).join('')}
            </select>
          </div>
          <div style="grid-column:1/-1">
            <label style="${labelStyle}">${t('style')}</label>
            <select id="param-style" class="select-field">
              ${p.styles.map(s => `<option value="${s}">${s.replace(/_/g,' ')}</option>`).join('')}
            </select>
          </div>
        </div>`;

    } else if (model.id === 'flux_max') {
      html = `
        <div>
          <label style="${labelStyle}">${t('ratio')}</label>
          <select id="param-ratio" class="select-field">
            ${p.ratios.map(r => `<option value="${r}">${r}</option>`).join('')}
          </select>
        </div>`;
    }

    return html || '';
  },

  _getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : null;
  },

  async _send(model) {
    const isAr   = ILYA.state.lang === 'ar';
    const sendBtn = document.getElementById('send-btn');
    const sendTxt = document.getElementById('send-text');
    const sendIco = document.getElementById('send-icon');

    // Get input
    let userInput = '';
    let imgUrl    = '';

    if (model.type === 'text') {
      userInput = document.getElementById('prompt-input')?.value?.trim();
      if (!userInput) {
        ILYA.toast(isAr ? 'الرجاء إدخال وصف' : 'Please enter a description', 'error');
        return;
      }
    } else {
      imgUrl = document.getElementById('img-url-input')?.value?.trim();
      if (!imgUrl) {
        ILYA.toast(isAr ? 'الرجاء إدخال رابط الصورة' : 'Please enter an image URL', 'error');
        return;
      }
      userInput = imgUrl;
    }

    // Show chat
    const chatSection = document.getElementById('chat-section');
    const chatArea    = document.getElementById('chat-area');
    chatSection.style.display = 'block';

    // Disable button
    sendBtn.disabled  = true;
    sendTxt.textContent = ILYA.t('generating');
    sendIco.textContent = '⏳';

    // User bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble bubble-user';
    userBubble.innerHTML = model.type === 'image'
      ? `<img src="${imgUrl}" style="max-width:200px;border-radius:8px;margin-bottom:6px" onerror="this.style.display='none'"><br><span style="font-size:.8rem;color:var(--text-3)">${imgUrl}</span>`
      : `<span>${this._esc(userInput)}</span>`;
    chatArea.appendChild(userBubble);

    // AI typing bubble
    const aiBubble = document.createElement('div');
    aiBubble.className = 'chat-bubble bubble-ai';
    aiBubble.innerHTML = `
      <div style="font-size:.8rem;color:var(--text-3);margin-bottom:8px">🤖 ILYA AI</div>
      <div class="typing-dots">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
      <div style="font-size:.78rem;color:var(--text-3);margin-top:6px">${ILYA.t('generating')}</div>
    `;
    chatArea.appendChild(aiBubble);
    chatArea.scrollTop = chatArea.scrollHeight;

    // Build API URL / params
    let resultUrl = null;
    let resultImgs = [];
    let success   = false;

    try {
      const apis = {
        text_to_image:     'https://viscodev.x10.mx/v-gen/api.php',
        image_to_anime:    'https://viscodev.x10.mx/image-an/api.php',
        seedream:          'https://viscodev.x10.mx/SeedReam/api.php',
        image_to_personal: 'https://viscodev.x10.mx/maker-ai/api.php',
        flux_max:          'https://viscodev.x10.mx/Flux-MAX/api.php',
      };

      const baseUrl = apis[model.id];
      let   fetchUrl;

      if (model.id === 'text_to_image') {
        const ratio   = this._getVal('param-ratio')   || '1:1';
        const upscale = this._getVal('param-upscale') || '4';
        const count   = this._getVal('param-count')   || '1';
        fetchUrl = `${baseUrl}?prompt=${encodeURIComponent(userInput)}&ratio=${ratio}&count=${count}&upscale=${upscale}`;

      } else if (model.id === 'image_to_anime') {
        const ratio  = this._getVal('param-ratio')  || 'auto';
        const gender = this._getVal('param-gender') || 'Female';
        const style  = this._getVal('param-style')  || 'manga';
        fetchUrl = `${baseUrl}?links=${encodeURIComponent(imgUrl)}&gender=${gender}&style=${style}&ratio=${ratio}`;

      } else if (model.id === 'seedream') {
        const ratio = this._getVal('param-ratio') || 'square';
        const style = this._getVal('param-style') || 'none';
        fetchUrl = `${baseUrl}?action=generate&prompt=${encodeURIComponent(userInput)}&style=${style}&aspect_ratio=${ratio}`;

      } else if (model.id === 'image_to_personal') {
        const ratio  = this._getVal('param-ratio')  || '1:1';
        const gender = this._getVal('param-gender') || 'male';
        const style  = this._getVal('param-style')  || 'linkedin_exec';
        fetchUrl = `${baseUrl}?links=${encodeURIComponent(imgUrl)}&gender=${gender}&style=${style}&ratio=${ratio}`;

      } else if (model.id === 'flux_max') {
        const ratio = this._getVal('param-ratio') || '1:1';
        fetchUrl = `${baseUrl}?prompt=${encodeURIComponent(userInput)}&aspect_ratio=${ratio}`;
      }

      const resp = await fetch(fetchUrl);
      const data = await resp.json();

      if (data.success) {
        // Extract image URL(s)
        if (data.images && Array.isArray(data.images)) {
          resultImgs = data.images;
          resultUrl  = data.images[0];
        } else if (data.image_url) {
          resultImgs = [data.image_url];
          resultUrl  = data.image_url;
        }
        success = true;
      }

    } catch (err) {
      console.error('AI API Error:', err);
    }

    // Replace typing bubble with result
    if (success && resultImgs.length > 0) {
      const imgsHtml = resultImgs.map(url => `
        <div style="margin-bottom:12px">
          <img src="${url}" alt="AI Result"
               style="width:100%;border-radius:var(--radius-md);cursor:zoom-in;border:1px solid var(--glass-border)"
               onclick="ILYA.openLightbox('${url}')"
               onerror="this.style.display='none'">
          <div style="display:flex;gap:8px;margin-top:10px">
            <a href="${url}" target="_blank" class="btn-sm btn-info">
              🔗 ${ILYA.t('open_link')}
            </a>
            <a href="${url}" download class="btn-sm btn-success">
              ⬇ ${ILYA.t('download')}
            </a>
          </div>
        </div>
      `).join('');

      aiBubble.innerHTML = `
        <div style="font-size:.8rem;color:var(--text-3);margin-bottom:12px">🤖 ILYA AI</div>
        <div style="font-size:.85rem;color:#44ff88;margin-bottom:12px">✓ ${ILYA.t('result_ready')}</div>
        ${imgsHtml}
      `;
      // Log activity
      await ILYA.logActivity(model.id, userInput, resultUrl);
    } else {
      aiBubble.innerHTML = `
        <div style="font-size:.8rem;color:var(--text-3);margin-bottom:8px">🤖 ILYA AI</div>
        <div style="color:#ff6688;font-size:.88rem">${ILYA.t('error_gen')}</div>
      `;
    }

    chatArea.scrollTop = chatArea.scrollHeight;

    // Re-enable button
    sendBtn.disabled    = false;
    sendTxt.textContent = ILYA.t('send');
    sendIco.textContent = '⚡';

    // Clear prompt input
    const promptEl = document.getElementById('prompt-input');
    if (promptEl) promptEl.value = '';
  },

  _esc(str) {
    return String(str || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
};
