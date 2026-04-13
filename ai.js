/* ═══════════════════════════════════════════════════════════
   ILYA AI Platform — AI Services Module (ai.js)
   All 7 models · Full chat UI · Error handling
═══════════════════════════════════════════════════════════ */
const ILYAAI = {

  // ── Models List ──────────────────────────────────────
  showList() {
    ILYA.registerPageRender('ai', () => this.showList());
    const t    = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    const cfg  = ILYA.state.config;

    document.getElementById('page-ai').innerHTML = `
      <div class="page-wrap">
        <div class="page-hdr">
          <button class="back-btn" id="back-ai">
            <i class="fa-solid fa-arrow-right"></i><i class="fa-solid fa-arrow-left"></i>
          </button>
          <div class="page-title">
            <i class="fa-solid fa-wand-magic-sparkles" style="margin-inline-end:8px;color:var(--c-neon)"></i>${t('ai_srv')}
          </div>
        </div>

        <div class="note-box note-info" style="margin-bottom:18px">
          <i class="fa-solid fa-circle-info" style="margin-inline-end:7px"></i>
          ${isAr
            ? 'اختر النموذج المناسب واضغط عليه للبدء. انقر على الصورة المصغرة لتكبيرها.'
            : 'Choose a model and tap it to start. Tap the thumbnail to enlarge.'}
        </div>

        <div id="models-list"></div>
      </div>
    `;

    ILYA.showPage('ai');
    document.getElementById('back-ai')?.addEventListener('click', () => ILYADashboard.show());

    const container = document.getElementById('models-list');
    AI_MODELS.forEach(model => {
      const enabled = cfg[model.cfgKey] !== 'false';
      const name    = isAr ? model.nameAr : model.nameEn;
      const desc    = isAr ? model.descAr : model.descEn;
      const typeLabel = model.type === 'text'
        ? (isAr ? 'نص ← صورة' : 'Text → Image')
        : model.type === 'image'
        ? (isAr ? 'صورة ← صورة' : 'Image → Image')
        : (isAr ? 'إنشاء وتعديل' : 'Create & Edit');

      const card = document.createElement('div');
      card.className = 'model-card' + (!enabled ? ' model-disabled' : '');
      card.innerHTML = `
        <img src="${model.img}" class="model-thumb" alt="${ILYA.esc(name)}"
             onerror="this.src='https://iili.io/B04MxcX.md.jpg'" loading="lazy">
        <div class="model-info">
          <div class="model-name">
            <i class="fa-solid ${model.icon}" style="color:var(--c-neon);margin-inline-end:7px;font-size:.85rem"></i>${ILYA.esc(name)}
          </div>
          <div class="model-desc">${ILYA.esc(desc)}</div>
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span class="model-badge"><i class="fa-solid fa-layer-group" style="font-size:.65rem"></i> ${typeLabel}</span>
            ${!enabled ? `<span class="badge-off"><i class="fa-solid fa-ban" style="font-size:.65rem"></i> ${isAr ? 'معطّل' : 'Disabled'}</span>` : ''}
          </div>
        </div>
        ${enabled ? '<i class="fa-solid fa-chevron-left model-arrow"></i>' : ''}
      `;
      [dir = 'ltr'] && card.querySelector('.model-arrow')?.classList.replace('fa-chevron-left','fa-chevron-right');

      // Thumbnail → lightbox
      card.querySelector('.model-thumb')?.addEventListener('click', e => {
        e.stopPropagation();
        ILYA.openLightbox(model.img);
      });

      if (enabled) card.addEventListener('click', () => this.showInterface(model.id));
      container.appendChild(card);
    });

    // Fix arrow direction based on lang
    this._fixArrows();
  },

  _fixArrows() {
    document.querySelectorAll('.model-arrow').forEach(el => {
      el.className = 'fa-solid model-arrow ' +
        (document.documentElement.dir === 'rtl' ? 'fa-chevron-left' : 'fa-chevron-right');
    });
  },

  // ── Model Interface ───────────────────────────────────
  showInterface(modelId) {
    const model = AI_MODELS.find(m => m.id === modelId);
    if (!model) return;
    ILYA.state.modelId = modelId;
    ILYA.registerPageRender('model', () => this.showInterface(modelId));

    const isAr = ILYA.state.lang === 'ar';
    const name = isAr ? model.nameAr : model.nameEn;
    const desc = isAr ? model.descAr : model.descEn;

    document.getElementById('page-model').innerHTML = `
      <div class="page-wrap">
        <div class="page-hdr">
          <button class="back-btn" id="back-model">
            <i class="fa-solid fa-arrow-right"></i><i class="fa-solid fa-arrow-left"></i>
          </button>
          <div class="page-title" style="font-size:.95rem">${ILYA.esc(name)}</div>
        </div>

        <!-- Hero -->
        <div class="model-hero" style="margin-bottom:14px">
          <img src="${model.img}" class="hero-thumb" alt="${ILYA.esc(name)}"
               onclick="ILYA.openLightbox('${model.img}')"
               onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
          <div class="hero-name">
            <i class="fa-solid ${model.icon}" style="margin-inline-end:8px"></i>${ILYA.esc(name)}
          </div>
          <div class="hero-desc">${ILYA.esc(desc)}</div>
        </div>

        <!-- Settings -->
        <div class="settings-panel" id="settings-panel">
          ${this._buildSettings(model)}
        </div>

        <!-- Chat Area -->
        <div class="chat-wrap" id="chat-wrap">
          <div class="chat-msgs" id="chat-msgs"></div>
        </div>

        <!-- Input -->
        <div class="input-box" id="input-box">
          ${model.type === 'image' ? `
            <input type="url" id="img-url" class="form-ctrl"
              placeholder="${ILYA.t('img_url')} (https://...)"
              style="background:none;border:none;padding:0">
          ` : model.type === 'both' ? `
            <textarea id="prompt-input" rows="3" placeholder="${ILYA.t('write_desc')}"></textarea>
            <div style="margin-top:8px;border-top:1px solid var(--c-border);padding-top:8px">
              <input type="url" id="img-url-opt" class="form-ctrl"
                placeholder="${ILYA.t('img_url')} (${isAr ? 'اختياري — للتعديل' : 'optional — for editing'})"
                style="background:none;border:none;padding:0;font-size:.82rem;color:var(--c-t3)">
            </div>
          ` : `
            <textarea id="prompt-input" rows="3" placeholder="${ILYA.t('write_desc')}"></textarea>
          `}
          <div class="input-footer">
            <span class="input-hint">
              <i class="fa-solid fa-circle-info" style="margin-inline-end:4px;opacity:.5"></i>
              ${isAr ? 'اضغط إرسال للبدء' : 'Press send to generate'}
            </span>
            <button class="send-btn" id="send-btn">
              <i class="fa-solid fa-bolt" id="send-icon"></i>
              <span id="send-txt">${ILYA.t('send')}</span>
            </button>
          </div>
        </div>

        ${this._footer()}
      </div>
    `;

    ILYA.showPage('model');
    document.getElementById('back-model')?.addEventListener('click', () => this.showList());
    document.getElementById('send-btn')?.addEventListener('click', () => this._send(model));

    // Enter to send (Ctrl+Enter or just Enter on single-line)
    document.getElementById('prompt-input')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._send(model); }
    });
  },

  // ── Build Settings ────────────────────────────────────
  _buildSettings(model) {
    const t    = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    const p    = model.params;

    const sel = (id, label, opts, icon) => `
      <div>
        <label class="form-lbl"><i class="fa-solid ${icon}" style="margin-inline-end:5px;color:var(--c-t4)"></i>${label}</label>
        <select id="${id}" class="form-ctrl">${opts.map(o =>
          typeof o === 'object'
            ? `<option value="${o.v}">${o.l}</option>`
            : `<option value="${o}">${o}</option>`
        ).join('')}</select>
      </div>`;

    if (!p || Object.keys(p).length === 0) {
      return `<div class="note-box note-info" style="font-size:.8rem">
        <i class="fa-solid fa-circle-info" style="margin-inline-end:7px"></i>
        ${isAr ? 'أدخل الوصف وأرسل — لا إعدادات إضافية لهذا النموذج' : 'Enter description and send — no extra settings for this model'}
      </div>`;
    }

    let html = '<div class="settings-row">';

    if (model.id === 'text_to_image') {
      html += sel('p-ratio',   t('ratio'),   p.ratios,   'fa-crop');
      html += sel('p-upscale', t('quality'), p.upscales, 'fa-star');
      html += '</div><div class="settings-row full">';
      html += sel('p-count',   t('count'),   p.counts,   'fa-images');

    } else if (model.id === 'image_to_anime') {
      html += sel('p-ratio',  t('ratio'),  p.ratios,  'fa-crop');
      html += sel('p-gender', t('gender'), p.genders, 'fa-venus-mars');
      html += '</div><div class="settings-row full">';
      html += sel('p-style',  t('style'),  p.styles.map(s => ({ v:s, l:s.replace(/_/g,' ') })), 'fa-palette');

    } else if (model.id === 'seedream') {
      html += sel('p-ratio', t('ratio'), p.ratios, 'fa-crop');
      html += sel('p-style', t('style'), p.styles.map(s => ({ v:s, l:s.replace(/_/g,' ') })), 'fa-palette');
      html += '</div><div>';
      html += `<div class="note-box note-warn" style="margin-top:10px;font-size:.77rem">
        <i class="fa-solid fa-triangle-exclamation" style="margin-inline-end:6px"></i>
        ${isAr ? 'يجب كتابة الوصف باللغة الإنجليزية لهذا النموذج' : 'Description must be written in English for this model'}
      </div>`;

    } else if (model.id === 'image_to_personal') {
      html += sel('p-ratio',  t('ratio'),  p.ratios,  'fa-crop');
      html += sel('p-gender', t('gender'), p.genders.map(g => ({ v:g, l: g === 'male' ? (isAr ? 'ذكر':'Male') : (isAr ? 'أنثى':'Female') })), 'fa-venus-mars');
      html += '</div><div class="settings-row full">';
      html += sel('p-style', t('style'), p.styles.map(s => ({ v:s, l:s.replace(/_/g,' ') })), 'fa-palette');

    } else if (model.id === 'flux_max') {
      html += sel('p-ratio', t('ratio'), p.ratios, 'fa-crop');

    } else if (model.id === 'nano_banana_pro') {
      html += sel('p-ratio', t('ratio'), p.ratios, 'fa-crop');
      html += sel('p-res',   t('resolution'), p.resolutions, 'fa-expand');
    }

    html += '</div>';
    return html;
  },

  _val(id) { const el = document.getElementById(id); return el ? el.value : null; },

  // ── Send / Generate ───────────────────────────────────
  async _send(model) {
    const isAr    = ILYA.state.lang === 'ar';
    const sendBtn = document.getElementById('send-btn');
    const sendTxt = document.getElementById('send-txt');
    const sendIco = document.getElementById('send-icon');

    // Collect input
    let prompt  = '';
    let imgUrl  = '';

    if (model.type === 'text') {
      prompt = document.getElementById('prompt-input')?.value?.trim();
      if (!prompt) { ILYA.toast(isAr ? 'أدخل وصفاً' : 'Enter a description', 'error'); return; }
    } else if (model.type === 'image') {
      imgUrl = document.getElementById('img-url')?.value?.trim();
      if (!imgUrl) { ILYA.toast(isAr ? 'أدخل رابط الصورة' : 'Enter image URL', 'error'); return; }
      prompt = imgUrl;
    } else { // both
      prompt = document.getElementById('prompt-input')?.value?.trim();
      imgUrl = document.getElementById('img-url-opt')?.value?.trim() || '';
      if (!prompt) { ILYA.toast(isAr ? 'أدخل وصفاً' : 'Enter a description', 'error'); return; }
    }

    // Show chat
    const chatWrap = document.getElementById('chat-wrap');
    const chatMsgs = document.getElementById('chat-msgs');
    chatWrap.style.display = 'block';

    // Disable send
    sendBtn.disabled    = true;
    sendTxt.textContent = ILYA.t('generating');
    sendIco.className   = 'fa-solid fa-spinner fa-spin';

    // User bubble
    const ub = document.createElement('div');
    ub.className = 'bubble bubble-user';
    if (model.type === 'image') {
      ub.innerHTML = `
        <div style="font-size:.78rem;color:var(--c-t3);margin-bottom:6px">${isAr ? 'الصورة المُرسلة:' : 'Input image:'}</div>
        <img src="${ILYA.esc(imgUrl)}" style="max-width:180px;border-radius:10px;margin-bottom:4px" onerror="this.style.display='none'">
        <div style="font-size:.74rem;color:var(--c-t4);word-break:break-all">${ILYA.esc(imgUrl)}</div>`;
    } else {
      ub.innerHTML = `<div>${ILYA.esc(prompt)}</div>`;
      if (imgUrl) ub.innerHTML += `<div style="margin-top:6px;font-size:.76rem;color:var(--c-t3)"><i class="fa-solid fa-image" style="margin-inline-end:4px"></i>${ILYA.esc(imgUrl)}</div>`;
    }
    chatMsgs.appendChild(ub);

    // AI typing bubble
    const aib = document.createElement('div');
    aib.className = 'bubble bubble-ai';
    aib.innerHTML = `
      <div class="bubble-ai-label">
        <i class="fa-solid fa-robot" style="color:var(--c-neon)"></i>
        ILYA AI
      </div>
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
      <div style="font-size:.76rem;color:var(--c-t4);margin-top:6px">
        <i class="fa-solid fa-circle-notch fa-spin" style="margin-inline-end:5px"></i>${ILYA.t('generating')}
      </div>`;
    chatMsgs.appendChild(aib);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;

    // Call API
    let resultImgs = [];
    let success    = false;

    try {
      const result = await this._callAPI(model, prompt, imgUrl);
      if (result && result.length > 0) {
        resultImgs = result;
        success    = true;
      }
    } catch(err) {
      console.error('AI Error:', err);
    }

    // Update bubble with result
    if (success) {
      const imgsHtml = resultImgs.map(url => `
        <div style="margin-bottom:10px">
          <img src="${ILYA.esc(url)}" class="result-img"
               onclick="ILYA.openLightbox('${ILYA.esc(url)}')"
               onerror="this.parentElement.innerHTML='<div style=color:var(--c-t3);font-size:.8rem>⚠️ ${isAr ? 'تعذّر تحميل الصورة' : 'Image failed to load'}</div>'">
          <div class="result-actions">
            <a href="${ILYA.esc(url)}" target="_blank" class="btn btn-sm btn-info">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> ${ILYA.t('open_link')}
            </a>
            <a href="${ILYA.esc(url)}" download class="btn btn-sm btn-success">
              <i class="fa-solid fa-download"></i> ${ILYA.t('download')}
            </a>
          </div>
        </div>`).join('');

      aib.innerHTML = `
        <div class="bubble-ai-label">
          <i class="fa-solid fa-robot" style="color:var(--c-neon)"></i>
          ILYA AI
        </div>
        <div style="font-size:.82rem;color:#44ff88;margin-bottom:10px">
          <i class="fa-solid fa-circle-check" style="margin-inline-end:5px"></i>${ILYA.t('result_ready')}
        </div>
        ${imgsHtml}`;

      // Log
      DB.logActivity(ILYA.state.user.id, model.id, prompt, resultImgs[0]);
    } else {
      aib.innerHTML = `
        <div class="bubble-ai-label">
          <i class="fa-solid fa-robot" style="color:var(--c-neon)"></i>
          ILYA AI
        </div>
        <div style="color:#ff6688;font-size:.85rem">
          <i class="fa-solid fa-circle-exclamation" style="margin-inline-end:6px"></i>${ILYA.t('error_gen')}
        </div>`;
    }

    chatMsgs.scrollTop = chatMsgs.scrollHeight;

    // Re-enable
    sendBtn.disabled    = false;
    sendTxt.textContent = ILYA.t('send');
    sendIco.className   = 'fa-solid fa-bolt';

    // Clear input
    const pi = document.getElementById('prompt-input');
    if (pi) pi.value = '';
  },

  // ── API Caller ────────────────────────────────────────
  async _callAPI(model, prompt, imgUrl) {
    const p = model.params;

    // Helper to fetch with timeout
    const fetchWithTimeout = async (url, opts = {}, ms = 45000) => {
      const ctrl = new AbortController();
      const tid  = setTimeout(() => ctrl.abort(), ms);
      try {
        const res  = await fetch(url, { ...opts, signal: ctrl.signal });
        clearTimeout(tid);
        return res;
      } catch(e) {
        clearTimeout(tid);
        throw e;
      }
    };

    if (model.id === 'text_to_image') {
      const ratio   = this._val('p-ratio')   || '1:1';
      const upscale = this._val('p-upscale') || '4';
      const count   = this._val('p-count')   || '1';
      const url = `https://viscodev.x10.mx/v-gen/api.php?prompt=${encodeURIComponent(prompt)}&ratio=${ratio}&count=${count}&upscale=${upscale}`;
      const res  = await fetchWithTimeout(url);
      const data = await res.json();
      if (data.success && data.images) return data.images;
      return null;
    }

    if (model.id === 'image_to_anime') {
      const ratio  = this._val('p-ratio')  || 'auto';
      const gender = this._val('p-gender') || 'Female';
      const style  = this._val('p-style')  || 'manga';
      const url = `https://viscodev.x10.mx/image-an/api.php?links=${encodeURIComponent(imgUrl)}&gender=${gender}&style=${style}&ratio=${ratio}`;
      const res  = await fetchWithTimeout(url);
      const data = await res.json();
      if (data.success && data.image_url) return [data.image_url];
      return null;
    }

    if (model.id === 'seedream') {
      const ratio = this._val('p-ratio') || 'square';
      const style = this._val('p-style') || 'none';
      const url = `https://viscodev.x10.mx/SeedReam/api.php?action=generate&prompt=${encodeURIComponent(prompt)}&style=${style}&aspect_ratio=${ratio}`;
      const res  = await fetchWithTimeout(url);
      const data = await res.json();
      if (data.success && data.image_url) return [data.image_url];
      return null;
    }

    if (model.id === 'image_to_personal') {
      const ratio  = this._val('p-ratio')  || '1:1';
      const gender = this._val('p-gender') || 'male';
      const style  = this._val('p-style')  || 'linkedin_exec';
      const url = `https://viscodev.x10.mx/maker-ai/api.php?links=${encodeURIComponent(imgUrl)}&gender=${gender}&style=${style}&ratio=${ratio}`;
      const res  = await fetchWithTimeout(url);
      const data = await res.json();
      if (data.success && data.image_url) return [data.image_url];
      return null;
    }

    if (model.id === 'flux_max') {
      const ratio = this._val('p-ratio') || '1:1';
      const url = `https://viscodev.x10.mx/Flux-MAX/api.php?prompt=${encodeURIComponent(prompt)}&aspect_ratio=${ratio}`;
      const res  = await fetchWithTimeout(url);
      const data = await res.json();
      if (data.success && data.image_url) return [data.image_url];
      return null;
    }

    if (model.id === 'nano_banana_2') {
      // GET request
      const url = `http://de3.bot-hosting.net:21007/kilwa-img?text=${encodeURIComponent(prompt)}`;
      const res  = await fetchWithTimeout(url);
      const data = await res.json();
      if (data.status === 'success' && data.image_url) return [data.image_url];
      return null;
    }

    if (model.id === 'nano_banana_pro') {
      // POST request
      const ratio = this._val('p-ratio') || '1:1';
      const res_q = this._val('p-res')   || '4K';
      const body  = new URLSearchParams({ text: prompt, ratio, res: res_q });
      if (imgUrl) {
        body.append('links', imgUrl);
      }
      const res  = await fetchWithTimeout('https://zecora0.serv00.net/ai/NanoBanana.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      const data = await res.json();
      if (data.success && data.url) return [data.url];
      return null;
    }

    return null;
  },

  _footer() {
    const cfg  = ILYA.state.config;
    const t    = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    return `
      <div class="page-foot">
        <div>ILYA AI © ${new Date().getFullYear()} — ${t('copyright')}</div>
        <div>
          <a href="${cfg.tg_link || 'https://t.me/swc_t'}" target="_blank">
            <i class="fa-brands fa-telegram"></i> Telegram
          </a>
          &nbsp;·&nbsp;
          <a href="${cfg.dev_site || 'https://black3web.github.io/Blackweb/'}" target="_blank">
            <i class="fa-solid fa-globe"></i> ${t('dev_site_btn')}
          </a>
        </div>
      </div>`;
  },
};
