/* ═══════════════════════════════════════
   ILYA — Image Generation Service
   NanoBanana Pro, NanoBanana PRO+, Nano2
   ═══════════════════════════════════════ */

const ImageSvc = {
  activeModel: null,
  activeMode: 'create',  // 'create' | 'edit'
  isSending: false,
  uploadedFiles: [],

  MODELS: {
    nano1: {
      name: 'NanoBanana Pro',
      supportsEdit: true,
      supportsRatio: true,
      supportsRes: true,
      maxImages: 5,
      create: async (text, ratio, res) => {
        const fd = new FormData();
        fd.append('text', text);
        if (ratio) fd.append('ratio', ratio);
        if (res)   fd.append('res', res);
        const r = await fetch('https://zecora0.serv00.net/ai/NanoBanana.php', { method:'POST', body: fd });
        const j = await r.json();
        if (!j.success) throw new Error(j.error || 'فشل التوليد');
        return j.url;
      },
      edit: async (text, links, ratio, res) => {
        const fd = new FormData();
        fd.append('text', text);
        fd.append('links', JSON.stringify(links));
        if (ratio) fd.append('ratio', ratio);
        if (res)   fd.append('res', res);
        const r = await fetch('https://zecora0.serv00.net/ai/NanoBanana.php', { method:'POST', body: fd });
        const j = await r.json();
        if (!j.success) throw new Error(j.error || 'فشل التوليد');
        return j.url;
      }
    },
    nano2: {
      name: 'NanoBanana PRO+',
      supportsEdit: true,
      supportsRatio: true,
      supportsRes: false,
      maxImages: 5,
      create: async (text, ratio) => {
        const body = { prompt: text };
        if (ratio) body.aspect_ratio = ratio;
        const r = await fetch('https://nanobananapro-api.up.railway.app/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const j = await r.json();
        return j.url || j.image_url || j.result;
      },
      edit: async (text, imageUrls) => {
        const body = { prompt: text, image_urls: imageUrls };
        const r = await fetch('https://nanobananapro-api.up.railway.app/edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const j = await r.json();
        return j.url || j.image_url || j.result;
      }
    },
    nano3: {
      name: 'Nano Banana 2',
      supportsEdit: false,
      supportsRatio: false,
      supportsRes: false,
      maxImages: 1,
      create: async (text) => {
        const r = await fetch(`http://de3.bot-hosting.net:21007/kilwa-img?text=${encodeURIComponent(text)}`);
        const j = await r.json();
        if (j.status !== 'success') throw new Error('فشل التوليد');
        return j.image_url;
      }
    }
  },

  selectModel(model) {
    // Check availability
    let models = {};
    try { models = JSON.parse(localStorage.getItem('ilya_models')) || {}; } catch {}
    if (models[model] === false) { UI.toast('هذا النموذج غير متاح', 'error'); return; }

    ImageSvc.activeModel = model;
    const m = ImageSvc.MODELS[model];

    if (m.supportsEdit) {
      // Show mode selection
      document.getElementById('image-model-select').classList.add('hidden');
      document.getElementById('image-mode-select').classList.remove('hidden');
    } else {
      // Go directly to create
      ImageSvc.activeMode = 'create';
      ImageSvc.openInterface();
    }
  },

  selectMode(mode) {
    ImageSvc.activeMode = mode;
    document.getElementById('image-mode-select').classList.add('hidden');
    ImageSvc.openInterface();
  },

  openInterface() {
    document.getElementById('image-model-select').classList.add('hidden');
    document.getElementById('image-mode-select').classList.add('hidden');
    document.getElementById('image-interface').classList.remove('hidden');

    const m = ImageSvc.MODELS[ImageSvc.activeModel];
    document.getElementById('img-active-model').textContent = m.name + (ImageSvc.activeMode === 'edit' ? ' — تعديل' : ' — إنشاء');

    // Show/hide options
    const ratioEl = document.getElementById('img-ratio');
    const resEl   = document.getElementById('img-res');
    const uploadArea = document.getElementById('img-upload-area');

    ratioEl.style.display = m.supportsRatio ? 'block' : 'none';
    resEl.style.display   = m.supportsRes   ? 'block' : 'none';

    if (ImageSvc.activeMode === 'edit') {
      uploadArea.classList.remove('hidden');
      document.getElementById('img-upload-text').textContent =
        `رفع صور للتعديل (حد أقصى ${m.maxImages})`;
    } else {
      uploadArea.classList.add('hidden');
    }

    // Clear
    document.getElementById('image-messages').innerHTML = `
      <div class="chat-welcome">
        <div class="chat-welcome-icon">⬡</div>
        <div>${ImageSvc.activeMode === 'create' ? 'صف الصورة التي تريد إنشاءها' : 'ارفع صورة واكتب ماذا تريد تعديله'}</div>
      </div>
    `;
    ImageSvc.uploadedFiles = [];
    document.getElementById('img-previews').innerHTML = '';
    document.getElementById('image-input').focus();
  },

  backToModels() {
    document.getElementById('image-interface').classList.add('hidden');
    document.getElementById('image-mode-select').classList.add('hidden');
    document.getElementById('image-model-select').classList.remove('hidden');
    ImageSvc.activeModel = null;
    ImageSvc.uploadedFiles = [];
  },

  handleImgFiles(e) {
    const m = ImageSvc.MODELS[ImageSvc.activeModel];
    const max = m ? m.maxImages : 5;
    const files = Array.from(e.target.files).slice(0, max);
    ImageSvc.uploadedFiles = files;

    const prev = document.getElementById('img-previews');
    prev.innerHTML = '';
    for (const f of files) {
      const img = document.createElement('img');
      img.className = 'attach-preview';
      img.src = URL.createObjectURL(f);
      prev.appendChild(img);
    }
    document.getElementById('img-upload-text').textContent = `${files.length} صورة مرفقة`;
  },

  onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ImageSvc.send(); }
  },

  async send() {
    if (ImageSvc.isSending) return;
    const input = document.getElementById('image-input');
    const text  = input.value.trim();
    if (!text) return;

    if (ImageSvc.activeMode === 'edit' && !ImageSvc.uploadedFiles.length) {
      UI.toast('يرجى رفع صورة للتعديل', 'error');
      return;
    }

    ImageSvc.isSending = true;
    input.value = '';

    const user = App.currentUser;
    const container = document.getElementById('image-messages');
    const welcome = container.querySelector('.chat-welcome');
    if (welcome) welcome.remove();

    // User bubble
    const userRow = document.createElement('div');
    userRow.className = 'msg-row user';
    userRow.innerHTML = `
      <div>
        <div class="msg-bubble">${escapeHtml(text)}</div>
        <div class="msg-actions"><button class="copy-btn" onclick="Chat.copyText('ub-${Date.now()}')">نسخ</button></div>
      </div>
      <div class="msg-avatar"><img src="${user?.avatar || 'https://iili.io/B04MxcX.md.jpg'}" alt="u"></div>
    `;
    container.appendChild(userRow);

    // Progress card
    const progRow = document.createElement('div');
    progRow.className = 'msg-row ai';
    const startTime = Date.now();
    let timerInterval;

    progRow.innerHTML = `
      <div class="msg-avatar-ai">⬡</div>
      <div class="progress-card">
        <div class="progress-spinner"></div>
        <div class="progress-label">جاري إنشاء الصورة...</div>
        <div class="progress-time" id="prog-time">0:00</div>
      </div>
    `;
    container.appendChild(progRow);
    container.scrollTop = container.scrollHeight;

    timerInterval = setInterval(() => {
      const secs = Math.floor((Date.now() - startTime) / 1000);
      const el = document.getElementById('prog-time');
      if (el) el.textContent = `${Math.floor(secs/60)}:${(secs%60).toString().padStart(2,'0')}`;
    }, 1000);

    try {
      const m = ImageSvc.MODELS[ImageSvc.activeModel];
      const ratio = document.getElementById('img-ratio').value;
      const res   = document.getElementById('img-res').value;

      let imageUrl;

      if (ImageSvc.activeMode === 'create') {
        imageUrl = await m.create(text, ratio, res);
      } else {
        // Upload files and get URLs (convert to base64 for APIs that accept links)
        const links = ImageSvc.uploadedFiles.map(f => URL.createObjectURL(f));
        imageUrl = await m.edit(text, links, ratio, res);
      }

      clearInterval(timerInterval);
      progRow.remove();

      // Image result
      const imgRow = document.createElement('div');
      imgRow.className = 'msg-row ai';
      imgRow.innerHTML = `
        <div class="msg-avatar-ai">⬡</div>
        <div>
          <div class="msg-image-result">
            <img src="${imageUrl}" alt="نتيجة" loading="lazy" onerror="this.src='';this.alt='فشل تحميل الصورة'">
            <a href="${imageUrl}" download="ilya-image.png" class="download-btn">⬇ تحميل الصورة</a>
          </div>
          <div class="msg-actions" style="margin-top:0.3rem">
            <button class="copy-btn" onclick="navigator.clipboard.writeText('${imageUrl}').then(()=>UI.toast('تم نسخ الرابط','success'))">نسخ الرابط</button>
          </div>
        </div>
      `;
      container.appendChild(imgRow);
      container.scrollTop = container.scrollHeight;

      if (user) Auth.recordServiceUse(user.id, 'image');

    } catch (err) {
      clearInterval(timerInterval);
      progRow.remove();
      const errRow = document.createElement('div');
      errRow.className = 'msg-row ai';
      errRow.innerHTML = `
        <div class="msg-avatar-ai">⬡</div>
        <div class="msg-bubble">عذراً، فشل إنشاء الصورة. يرجى المحاولة مرة أخرى.</div>
      `;
      container.appendChild(errRow);
      container.scrollTop = container.scrollHeight;
      console.error('Image error:', err);
    }

    ImageSvc.isSending = false;
  }
};
