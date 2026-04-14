/* ═══════════════════════════════════════════════════════════
   ILYA AI Platform v3 — AI Services (ai.js)
   7 Models · Retry · Upload · Queue · Gallery Save
═══════════════════════════════════════════════════════════ */
const ILYAAI = {

  /* ── Models List ─────────────────────────────────────── */
  showList() {
    ILYA.reg('ai', () => this.showList());
    const t    = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    const cfg  = ILYA.state.config;

    document.getElementById('page-ai').innerHTML = `
      <div class="pg">
        <div class="pg-hdr">
          <button class="back-btn" id="back-ai">
            <i class="fa-solid fa-arrow-right"></i><i class="fa-solid fa-arrow-left"></i>
          </button>
          <div class="pg-title">
            <i class="fa-solid fa-wand-magic-sparkles" style="margin-inline-end:8px;color:var(--neon)"></i>${t('ai_srv')}
          </div>
        </div>

        <div class="note-info" style="margin-bottom:16px">
          <i class="fa-solid fa-circle-info" style="margin-inline-end:7px"></i>
          ${isAr
            ? 'اختر النموذج المناسب لاحتياجاتك. انقر على الصورة المصغرة لتكبيرها.'
            : 'Choose a model for your needs. Tap the thumbnail to enlarge it.'}
        </div>

        <div id="models-list"></div>
        ${ILYA.footer()}
      </div>`;

    ILYA.go('ai');
    document.getElementById('back-ai')?.addEventListener('click', () => ILYADashboard.show());

    const container = document.getElementById('models-list');
    AI_MODELS.forEach(model => {
      const enabled = cfg[model.cfgKey] !== 'false';
      const name    = isAr ? model.nameAr : model.nameEn;
      const desc    = isAr ? model.descAr : model.descEn;
      const typeLabel = {
        text:  isAr ? 'نص → صورة'   : 'Text → Image',
        image: isAr ? 'صورة → صورة' : 'Image → Image',
        both:  isAr ? 'إنشاء وتعديل': 'Create & Edit',
      }[model.type] || '';

      const card = document.createElement('div');
      card.className = 'model-card' + (!enabled ? ' disabled' : '');
      card.innerHTML = `
        <img src="${model.img}" class="model-thumb" alt="${ILYA.esc(name)}"
             loading="lazy" onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
        <div class="model-info">
          <div class="model-name">
            <i class="fa-solid ${model.icon}"></i>${ILYA.esc(name)}
          </div>
          <div class="model-desc">${ILYA.esc(desc)}</div>
          <div class="model-tags">
            <span class="model-tag">${typeLabel}</span>
            ${model.isNew  ? `<span class="model-tag tag-new">NEW</span>` : ''}
            ${!enabled     ? `<span class="model-tag" style="background:rgba(255,100,0,.15);color:#ff8844">${isAr ? 'معطّل':'Disabled'}</span>` : ''}
          </div>
        </div>
        ${enabled ? `<i class="fa-solid ${document.documentElement.dir==='rtl'?'fa-chevron-left':'fa-chevron-right'} model-arrow"></i>` : ''}
      `;

      card.querySelector('.model-thumb')?.addEventListener('click', e => {
        e.stopPropagation();
        ILYA.openLightbox(model.img);
      });
      if (enabled) card.addEventListener('click', () => this.showModel(model.id));
      container.appendChild(card);
    });
  },

  /* ── Model Interface ─────────────────────────────────── */
  showModel(modelId) {
    const model = AI_MODELS.find(m => m.id === modelId);
    if (!model) return;
    ILYA.state.modelId = modelId;
    ILYA.reg('model', () => this.showModel(modelId));

    const isAr = ILYA.state.lang === 'ar';
    const name = isAr ? model.nameAr : model.nameEn;
    const desc = isAr ? model.descAr : model.descEn;
    const t    = k => ILYA.t(k);

    document.getElementById('page-model').innerHTML = `
      <div class="pg">
        <div class="pg-hdr">
          <button class="back-btn" id="back-model">
            <i class="fa-solid fa-arrow-right"></i><i class="fa-solid fa-arrow-left"></i>
          </button>
          <div class="pg-title" style="font-size:.95rem">${ILYA.esc(name)}</div>
        </div>

        <div class="gen-wrap">
          <!-- Hero -->
          <div class="model-hero">
            <img src="${model.img}" class="hero-img" alt="${ILYA.esc(name)}"
                 onclick="ILYA.openLightbox('${model.img}')"
                 onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
            <div class="hero-name"><i class="fa-solid ${model.icon}" style="margin-inline-end:8px"></i>${ILYA.esc(name)}</div>
            <div class="hero-desc">${ILYA.esc(desc)}</div>
          </div>

          <!-- Settings (collapsible) -->
          ${this._buildSettingsCard(model)}

          <!-- Image input (for image/both models) -->
          ${model.type === 'image' || model.type === 'both' ? this._buildImageInput(model) : ''}

          <!-- Text input -->
          ${model.type === 'text' || model.type === 'both' ? `
            <div class="gen-input-area" id="prompt-area">
              <textarea id="prompt-input" class="gen-textarea"
                placeholder="${t('write_desc')}"
                rows="3"
                aria-label="${t('write_desc')}"></textarea>
              <div class="gen-input-footer">
                <span class="gen-hint"><i class="fa-solid fa-lightbulb" style="margin-inline-end:4px;opacity:.5"></i>${isAr ? 'كن تفصيلياً للحصول على نتائج أفضل':'Be detailed for better results'}</span>
                <button class="gen-send-btn" id="gen-btn">
                  <i class="fa-solid fa-bolt" id="gen-icon"></i>
                  <span id="gen-txt">${t('send')}</span>
                </button>
              </div>
            </div>` : `
            <div style="text-align:center;padding:6px 0">
              <button class="gen-send-btn" id="gen-btn" style="margin:0 auto">
                <i class="fa-solid fa-bolt" id="gen-icon"></i>
                <span id="gen-txt">${t('send')}</span>
              </button>
            </div>`}

          <!-- Results -->
          <div id="gen-results"></div>
        </div>

        ${ILYA.footer()}
      </div>`;

    ILYA.go('model');
    document.getElementById('back-model')?.addEventListener('click', () => this.showList());
    document.getElementById('gen-btn')?.addEventListener('click', () => this._generate(model));

    // Enter key on textarea
    document.getElementById('prompt-input')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._generate(model); }
    });

    // Settings toggle
    document.getElementById('settings-toggle')?.addEventListener('click', () => {
      document.getElementById('settings-card')?.classList.toggle('open');
    });

    // Image input tabs
    this._bindImageInput(model);
  },

  /* ── Settings Card ───────────────────────────────────── */
  _buildSettingsCard(model) {
    const t    = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    const p    = model.params;
    if (!p || !Object.keys(p).length) return '';

    const sel = (id, lbl, icon, opts) => `
      <div>
        <div class="settings-label"><i class="fa-solid ${icon}"></i>${lbl}</div>
        <select id="${id}" class="form-ctrl">${opts.map(o =>
          typeof o === 'object'
            ? `<option value="${o.v}">${o.l}</option>`
            : `<option value="${o}">${o}</option>`
        ).join('')}</select>
      </div>`;

    let inner = '<div class="settings-grid">';

    if (model.id === 'v1') {
      inner += sel('p-ratio',   t('ratio'),   'fa-crop',       p.ratios);
      inner += sel('p-upscale', t('quality'), 'fa-star',       p.upscales);
      inner += '</div><div class="settings-grid full">';
      inner += sel('p-count',   t('count'),   'fa-copy',       p.counts);

    } else if (model.id === 'anime') {
      inner += sel('p-ratio',  t('ratio'),  'fa-crop',        p.ratios);
      inner += sel('p-gender', t('gender'), 'fa-venus-mars',  p.genders);
      inner += '</div><div class="settings-grid full">';
      inner += sel('p-style',  t('style'),  'fa-palette',     p.styles.map(s => ({ v:s, l:s.replace(/_/g,' ') })));

    } else if (model.id === 'seed') {
      inner += sel('p-ratio', t('ratio'), 'fa-crop',   p.ratios);
      inner += sel('p-style', t('style'), 'fa-palette',p.styles.map(s => ({ v:s, l:s.replace(/_/g,' ') })));
      inner += `</div><div class="settings-grid full"><div class="note-warn" style="font-size:.77rem">
        <i class="fa-solid fa-triangle-exclamation" style="margin-inline-end:6px"></i>
        ${isAr ? 'يجب كتابة الوصف باللغة الإنجليزية لهذا النموذج' : 'Description must be in English for this model'}
      </div>`;

    } else if (model.id === 'pfoto') {
      const gOpts = p.genders.map(g => ({ v:g, l: g === 'male' ? (isAr ? 'ذكر':'Male') : (isAr ? 'أنثى':'Female') }));
      inner += sel('p-ratio',  t('ratio'),  'fa-crop',       p.ratios);
      inner += sel('p-gender', t('gender'), 'fa-venus-mars', gOpts);
      inner += '</div><div class="settings-grid full">';
      inner += sel('p-style',  t('style'),  'fa-palette',    p.styles.map(s => ({ v:s, l:s.replace(/_/g,' ') })));

    } else if (model.id === 'flux') {
      inner += sel('p-ratio', t('ratio'), 'fa-crop', p.ratios);

    } else if (model.id === 'nbp') {
      inner += sel('p-ratio', t('ratio'),      'fa-crop',   p.ratios);
      inner += sel('p-res',   t('resolution'), 'fa-expand', p.resolutions);
    }

    inner += '</div>';

    return `
      <div class="settings-card" id="settings-card">
        <div class="settings-toggle" id="settings-toggle">
          <span><i class="fa-solid fa-sliders" style="margin-inline-end:8px;color:var(--t4)"></i>${t('settings')}</span>
          <i class="fa-solid fa-chevron-down arrow"></i>
        </div>
        <div class="settings-body">
          <div class="settings-inner">${inner}</div>
        </div>
      </div>`;
  },

  /* ── Image Input Widget ──────────────────────────────── */
  _uploadedUrl: '',

  _buildImageInput(model) {
    const t    = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    return `
      <div class="glass glass-p" id="img-input-wrap">
        <div class="settings-label"><i class="fa-solid fa-image"></i>${isAr ? 'الصورة المدخلة':'Input Image'}</div>
        <div class="img-input-tabs">
          <button class="img-tab active" id="img-tab-file">${t('from_device')}</button>
          <button class="img-tab" id="img-tab-url">${t('from_url')}</button>
        </div>

        <div id="img-file-panel">
          <div class="upload-zone" id="img-upload-zone">
            <input type="file" id="img-file-input" accept="image/png,image/jpeg,image/webp">
            <span class="upload-zone-icon"><i class="fa-solid fa-cloud-arrow-up"></i></span>
            <div class="upload-zone-txt">${t('drag_drop')}</div>
            <div class="upload-zone-sub">${t('drag_drop_sub')}</div>
          </div>
          <div class="upload-preview" id="img-preview">
            <img src="" id="img-preview-src" alt="Preview">
            <button class="upload-preview-clear" id="img-clear"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="upload-progress" id="img-prog">
            <i class="fa-solid fa-circle-notch fa-spin" style="color:var(--neon)"></i>
            <div class="upload-prog-bar"><div class="upload-prog-fill" id="img-prog-fill" style="width:0%"></div></div>
            <span id="img-prog-txt">0%</span>
          </div>
        </div>

        <div id="img-url-panel" style="display:none">
          <input id="img-url-input" type="url" class="form-ctrl" placeholder="https://...">
        </div>
      </div>
      ${model.type !== 'both' ? `
        <div style="text-align:center;padding:4px 0">
          <button class="gen-send-btn" id="gen-btn" style="margin:0 auto">
            <i class="fa-solid fa-bolt" id="gen-icon"></i>
            <span id="gen-txt">${ILYA.t('send')}</span>
          </button>
        </div>` : ''}
    `;
  },

  _bindImageInput(model) {
    if (model.type !== 'image' && model.type !== 'both') return;
    this._uploadedUrl = '';

    const tabFile = document.getElementById('img-tab-file');
    const tabUrl  = document.getElementById('img-tab-url');
    const filePnl = document.getElementById('img-file-panel');
    const urlPnl  = document.getElementById('img-url-panel');
    const fileInp = document.getElementById('img-file-input');
    const preview = document.getElementById('img-preview');
    const prevSrc = document.getElementById('img-preview-src');
    const clear   = document.getElementById('img-clear');
    const prog    = document.getElementById('img-prog');
    const progFill= document.getElementById('img-prog-fill');
    const progTxt = document.getElementById('img-prog-txt');
    const isAr    = ILYA.state.lang === 'ar';

    tabFile?.addEventListener('click', () => {
      tabFile.classList.add('active'); tabUrl.classList.remove('active');
      filePnl.style.display = 'block'; urlPnl.style.display = 'none';
    });
    tabUrl?.addEventListener('click', () => {
      tabUrl.classList.add('active'); tabFile.classList.remove('active');
      urlPnl.style.display = 'block'; filePnl.style.display = 'none';
    });

    fileInp?.addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) { ILYA.toast(isAr ? 'الحجم يتجاوز 10MB':'File exceeds 10MB', 'error'); return; }

      const dataUrl = await IMG_UPLOADER.toDataURL(file);
      prevSrc.src   = dataUrl;
      preview.classList.add('show');
      prog.classList.add('show');

      try {
        const url = await IMG_UPLOADER.upload(file, pct => {
          if (progFill) progFill.style.width = pct + '%';
          if (progTxt)  progTxt.textContent  = pct + '%';
        });
        this._uploadedUrl = url;
        prog.classList.remove('show');
        ILYA.toast(ILYA.t('upload_done'), 'success');
      } catch {
        prog.classList.remove('show');
        this._uploadedUrl = dataUrl; // use data URL as fallback
        ILYA.toast(isAr ? 'رفع محلي — قد لا يعمل مع بعض النماذج' : 'Local upload — may not work with all models', 'warn');
      }
    });

    clear?.addEventListener('click', () => {
      preview.classList.remove('show');
      if (fileInp) fileInp.value = '';
      this._uploadedUrl = '';
    });

    // Drag drop
    const zone = document.getElementById('img-upload-zone');
    zone?.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone?.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone?.addEventListener('drop', e => {
      e.preventDefault(); zone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && fileInp) {
        const dt = new DataTransfer(); dt.items.add(file);
        fileInp.files = dt.files;
        fileInp.dispatchEvent(new Event('change'));
      }
    });
  },

  /* ── Get Image URL from Widget ───────────────────────── */
  _getImgUrl(model) {
    if (model.type === 'text') return '';
    const tabUrl = document.getElementById('img-tab-url');
    if (tabUrl?.classList.contains('active')) {
      return document.getElementById('img-url-input')?.value?.trim() || '';
    }
    return this._uploadedUrl || '';
  },

  /* ── Generate ────────────────────────────────────────── */
  async _generate(model) {
    const isAr = ILYA.state.lang === 'ar';
    const btn  = document.getElementById('gen-btn');
    const ico  = document.getElementById('gen-icon');
    const txt  = document.getElementById('gen-txt');

    // Collect inputs
    let prompt = '';
    let imgUrl = '';

    if (model.type === 'text') {
      prompt = document.getElementById('prompt-input')?.value?.trim();
      if (!prompt) { ILYA.toast(ILYA.t('err_no_prompt'), 'error'); return; }
    } else if (model.type === 'image') {
      imgUrl = this._getImgUrl(model);
      if (!imgUrl) { ILYA.toast(ILYA.t('err_no_img'), 'error'); return; }
      prompt = imgUrl;
    } else { // both
      prompt = document.getElementById('prompt-input')?.value?.trim();
      imgUrl = this._getImgUrl(model);
      if (!prompt) { ILYA.toast(ILYA.t('err_no_prompt'), 'error'); return; }
    }

    // Disable btn
    btn.disabled    = true;
    ico.className   = 'fa-solid fa-spinner fa-spin';
    txt.textContent = ILYA.t('generating');

    const resultsEl = document.getElementById('gen-results');

    // Show loading card
    const loadCard = document.createElement('div');
    loadCard.className = 'gen-loading';
    loadCard.innerHTML = `
      <div class="gen-loading-dots">
        <div class="gen-dot"></div><div class="gen-dot"></div><div class="gen-dot"></div>
      </div>
      <div class="gen-loading-txt">${ILYA.t('generating')}</div>
      <div class="gen-loading-sub">${isAr ? `نموذج: ${isAr ? model.nameAr : model.nameEn}` : `Model: ${model.nameEn}`}</div>`;
    resultsEl.prepend(loadCard);
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Call API with retry
    let attempt = 0;
    let images  = null;

    while (attempt < 3 && !images) {
      attempt++;
      if (attempt > 1) {
        loadCard.querySelector('.gen-loading-sub').innerHTML = `
          <span class="retry-badge"><i class="fa-solid fa-rotate-right"></i>${isAr ? `محاولة ${attempt}/3` : `Attempt ${attempt}/3`}</span>`;
        await new Promise(r => setTimeout(r, 1200 * (attempt - 1)));
      }
      try {
        images = await this._callModel(model, prompt, imgUrl);
      } catch (e) {
        console.warn(`Attempt ${attempt} failed:`, e.message);
      }
    }

    // Remove loading card
    loadCard.remove();

    if (images && images.length > 0) {
      this._showResults(resultsEl, model, images, prompt);
      // Save to activity log
      DB.logActivity(ILYA.state.user.id, isAr ? model.nameAr : model.nameEn, prompt, images[0]);
    } else {
      const errCard = document.createElement('div');
      errCard.className = 'gen-loading';
      errCard.style.borderColor = 'rgba(255,50,50,.3)';
      errCard.innerHTML = `
        <div style="font-size:2rem;margin-bottom:10px;opacity:.6"><i class="fa-solid fa-circle-exclamation" style="color:#ff6688"></i></div>
        <div class="gen-loading-txt" style="color:#ff8899">${ILYA.t('error_final')}</div>
        <div class="gen-loading-sub">${isAr ? 'تأكد من الوصف وحاول مرة أخرى' : 'Check your description and try again'}</div>
        <button class="btn btn-sm btn-danger" style="margin-top:14px" id="retry-btn">
          <i class="fa-solid fa-rotate-right"></i> ${ILYA.t('retry')}
        </button>`;
      resultsEl.prepend(errCard);
      errCard.querySelector('#retry-btn')?.addEventListener('click', () => {
        errCard.remove();
        this._generate(model);
      });
    }

    // Re-enable btn
    btn.disabled    = false;
    ico.className   = 'fa-solid fa-bolt';
    txt.textContent = ILYA.t('send');

    // Clear prompt
    const pi = document.getElementById('prompt-input');
    if (pi) pi.value = '';
  },

  /* ── Show Results ────────────────────────────────────── */
  _showResults(container, model, images, prompt) {
    const isAr  = ILYA.state.lang === 'ar';
    const t     = k => ILYA.t(k);
    const count = images.length;
    const name  = isAr ? model.nameAr : model.nameEn;

    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
      <div class="result-card-header">
        <i class="fa-solid fa-circle-check status-ok"></i>
        <span>${t('result_ready')}</span>
        <span style="margin-inline-start:auto;font-size:.7rem;color:var(--t4)">${name}</span>
        <button class="btn-icon" style="width:28px;height:28px;font-size:.75rem;margin-inline-start:6px" id="clear-res-${Date.now()}"
          title="${t('clear_results')}">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="result-imgs count-${Math.min(count,3)}" style="grid-template-columns:repeat(${Math.min(count,3)},1fr)">
        ${images.map((url, i) => `
          <div class="result-img-wrap">
            <img src="${ILYA.esc(url)}" class="result-img"
                 loading="lazy"
                 onclick="ILYA.openLightbox('${ILYA.esc(url)}')"
                 onerror="this.parentElement.innerHTML='<div style=padding:20px;text-align:center;color:var(--t4);font-size:.78rem>${isAr ? 'تعذّر التحميل':'Load error'}</div>'">
            <div class="result-img-actions">
              <a href="${ILYA.esc(url)}" download class="btn btn-sm btn-success" style="padding:6px 10px;font-size:.72rem">
                <i class="fa-solid fa-download"></i>
              </a>
              <button class="btn btn-sm btn-info" style="padding:6px 10px;font-size:.72rem"
                onclick="ILYA.copyToClipboard('${ILYA.esc(url)}',this)">
                <i class="fa-solid fa-copy"></i>
              </button>
              <a href="${ILYA.esc(url)}" target="_blank" rel="noopener" class="btn btn-sm btn-glass" style="padding:6px 10px;font-size:.72rem">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            </div>
          </div>`).join('')}
      </div>
      ${prompt && model.type !== 'image' ? `
        <div style="padding:10px 12px;border-top:1px solid var(--g-border);font-size:.75rem;color:var(--t3);word-break:break-word">
          <i class="fa-solid fa-quote-right" style="margin-inline-end:5px;opacity:.4"></i>
          ${ILYA.esc(prompt.slice(0, 160))}${prompt.length > 160 ? '...' : ''}
        </div>` : ''}
    `;

    const clearId = card.querySelector('[id^="clear-res-"]')?.id;
    card.querySelector(`#${clearId}`)?.addEventListener('click', () => card.remove());
    container.prepend(card);
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  /* ── API Caller — All 7 Models ───────────────────────── */
  async _callModel(model, prompt, imgUrl) {
    const v = id => { const el = document.getElementById(id); return el ? el.value : ''; };

    switch (model.id) {

      case 'v1': {
        const ratio   = v('p-ratio')   || '1:1';
        const upscale = v('p-upscale') || '4';
        const count   = v('p-count')   || '1';
        const url = `https://viscodev.x10.mx/v-gen/api.php?prompt=${encodeURIComponent(prompt)}&ratio=${ratio}&count=${count}&upscale=${upscale}`;
        const res = await fetchAPI(url, {}, 3, 45000);
        if (res.ok && res.data?.success && res.data.images?.length) return res.data.images;
        throw new Error(res.data?.error || 'API error');
      }

      case 'anime': {
        const ratio  = v('p-ratio')  || 'auto';
        const gender = v('p-gender') || 'Female';
        const style  = v('p-style')  || 'manga';
        const url = `https://viscodev.x10.mx/image-an/api.php?links=${encodeURIComponent(imgUrl)}&gender=${gender}&style=${style}&ratio=${ratio}`;
        const res = await fetchAPI(url, {}, 3, 50000);
        if (res.ok && res.data?.success && res.data.image_url) return [res.data.image_url];
        throw new Error(res.data?.error || 'API error');
      }

      case 'seed': {
        const ratio = v('p-ratio') || 'square';
        const style = v('p-style') || 'none';
        const url = `https://viscodev.x10.mx/SeedReam/api.php?action=generate&prompt=${encodeURIComponent(prompt)}&style=${style}&aspect_ratio=${ratio}`;
        const res = await fetchAPI(url, {}, 3, 50000);
        if (res.ok && res.data?.success && res.data.image_url) return [res.data.image_url];
        throw new Error(res.data?.error || 'API error');
      }

      case 'pfoto': {
        const ratio  = v('p-ratio')  || '1:1';
        const gender = v('p-gender') || 'male';
        const style  = v('p-style')  || 'linkedin_exec';
        const url = `https://viscodev.x10.mx/maker-ai/api.php?links=${encodeURIComponent(imgUrl)}&gender=${gender}&style=${style}&ratio=${ratio}`;
        const res = await fetchAPI(url, {}, 3, 50000);
        if (res.ok && res.data?.success && res.data.image_url) return [res.data.image_url];
        throw new Error(res.data?.error || 'API error');
      }

      case 'flux': {
        const ratio = v('p-ratio') || '1:1';
        const url = `https://viscodev.x10.mx/Flux-MAX/api.php?prompt=${encodeURIComponent(prompt)}&aspect_ratio=${ratio}`;
        const res = await fetchAPI(url, {}, 3, 55000);
        if (res.ok && res.data?.success && res.data.image_url) return [res.data.image_url];
        throw new Error(res.data?.error || 'API error');
      }

      case 'nb2': {
        // GET — Nano Banana 2
        const url = `http://de3.bot-hosting.net:21007/kilwa-img?text=${encodeURIComponent(prompt)}`;
        const res = await fetchAPI(url, {}, 3, 55000);
        if (res.ok && res.data?.status === 'success' && res.data.image_url) return [res.data.image_url];
        // Try HTTPS fallback
        const url2 = `https://de3.bot-hosting.net:21007/kilwa-img?text=${encodeURIComponent(prompt)}`;
        const res2 = await fetchAPI(url2, {}, 2, 45000);
        if (res2.ok && res2.data?.status === 'success' && res2.data.image_url) return [res2.data.image_url];
        throw new Error('Nano Banana 2 unavailable');
      }

      case 'nbp': {
        // POST — NanoBanana Pro
        const ratio = v('p-ratio') || '1:1';
        const res_q = v('p-res')   || '4K';
        const body  = new URLSearchParams({ text: prompt, ratio, res: res_q });
        if (imgUrl) body.append('links', imgUrl);

        const opts = {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        };
        const res = await fetchAPI('https://zecora0.serv00.net/ai/NanoBanana.php', opts, 3, 60000);
        if (res.ok && res.data?.success && res.data.url) return [res.data.url];
        throw new Error(res.data?.error || 'NanoBanana Pro error');
      }

      default:
        throw new Error('Unknown model: ' + model.id);
    }
  },
};
