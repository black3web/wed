/* ═══════════════════════════════════════
   ILYA — Video Generation Service
   Sora 2 — Text/Image to Video
   ═══════════════════════════════════════ */

const VideoSvc = {
  activeModel: null,
  activeMode: 'text',
  isSending: false,
  uploadedFile: null,

  selectModel(model) {
    VideoSvc.activeModel = model;
    document.getElementById('video-model-select').classList.add('hidden');
    document.getElementById('video-mode-select').classList.remove('hidden');
  },

  selectMode(mode) {
    VideoSvc.activeMode = mode;
    document.getElementById('video-mode-select').classList.add('hidden');
    VideoSvc.openInterface();
  },

  openInterface() {
    document.getElementById('video-interface').classList.remove('hidden');
    document.getElementById('vid-active-model').textContent =
      'Sora 2 — ' + (VideoSvc.activeMode === 'text' ? 'نص إلى فيديو' : 'صورة إلى فيديو');

    const uploadArea = document.getElementById('vid-upload-area');
    if (VideoSvc.activeMode === 'image') {
      uploadArea.classList.remove('hidden');
    } else {
      uploadArea.classList.add('hidden');
    }

    document.getElementById('video-messages').innerHTML = `
      <div class="chat-welcome">
        <div class="chat-welcome-icon">🎬</div>
        <div>${VideoSvc.activeMode === 'text' ? 'صف الفيديو الذي تريد إنشاءه' : 'ارفع صورة واكتب كيف تريد تحريكها'}</div>
        <div style="font-size:0.7rem;margin-top:0.5rem;color:rgba(255,255,255,0.3)">مدة الفيديو: 4 ثواني</div>
      </div>
    `;
    VideoSvc.uploadedFile = null;
    document.getElementById('vid-preview').innerHTML = '';
    document.getElementById('video-input').focus();
  },

  backToModels() {
    document.getElementById('video-interface').classList.add('hidden');
    document.getElementById('video-mode-select').classList.add('hidden');
    document.getElementById('video-model-select').classList.remove('hidden');
    VideoSvc.activeModel = null;
    VideoSvc.uploadedFile = null;
  },

  handleImgFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    VideoSvc.uploadedFile = file;
    const prev = document.getElementById('vid-preview');
    prev.innerHTML = '';
    const img = document.createElement('img');
    img.className = 'attach-preview';
    img.src = URL.createObjectURL(file);
    prev.appendChild(img);
  },

  onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); VideoSvc.send(); }
  },

  async send() {
    if (VideoSvc.isSending) return;
    const input = document.getElementById('video-input');
    const text  = input.value.trim();
    if (!text) return;

    if (VideoSvc.activeMode === 'image' && !VideoSvc.uploadedFile) {
      UI.toast('يرجى رفع صورة', 'error');
      return;
    }

    VideoSvc.isSending = true;
    input.value = '';

    const user = App.currentUser;
    const container = document.getElementById('video-messages');
    const welcome = container.querySelector('.chat-welcome');
    if (welcome) welcome.remove();

    const aspect = document.getElementById('vid-aspect').value;

    // User bubble
    const userRow = document.createElement('div');
    userRow.className = 'msg-row user';
    userRow.innerHTML = `
      <div>
        <div class="msg-bubble">${escapeHtml(text)}</div>
      </div>
      <div class="msg-avatar"><img src="${user?.avatar || 'https://iili.io/B04MxcX.md.jpg'}" alt="u"></div>
    `;
    container.appendChild(userRow);

    // Progress
    const progRow = document.createElement('div');
    progRow.className = 'msg-row ai';
    const startTime = Date.now();
    let timerInterval;

    progRow.innerHTML = `
      <div class="msg-avatar-ai">🎬</div>
      <div class="progress-card">
        <div class="progress-spinner"></div>
        <div class="progress-label">جاري توليد الفيديو... قد يستغرق دقيقة</div>
        <div class="progress-time" id="vid-prog-time">0:00</div>
      </div>
    `;
    container.appendChild(progRow);
    container.scrollTop = container.scrollHeight;

    timerInterval = setInterval(() => {
      const secs = Math.floor((Date.now() - startTime) / 1000);
      const el = document.getElementById('vid-prog-time');
      if (el) el.textContent = `${Math.floor(secs/60)}:${(secs%60).toString().padStart(2,'0')}`;
    }, 1000);

    try {
      const body = { prompt: text, aspect };

      // If image-to-video, upload image first
      if (VideoSvc.activeMode === 'image' && VideoSvc.uploadedFile) {
        const dataUrl = await fileToDataURL(VideoSvc.uploadedFile);
        // Some APIs accept direct URLs; for now send as URL if possible
        // We'll use the API's image_url parameter
        body.image_url = dataUrl;
      }

      const res = await fetch('https://zecora0.serv00.net/ai/Sora2_s4.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const json = await res.json();
      clearInterval(timerInterval);
      progRow.remove();

      if (!json.success || !json.UrlVideo) {
        throw new Error(json.error || 'فشل توليد الفيديو');
      }

      const videoUrl = json.UrlVideo;

      const vidRow = document.createElement('div');
      vidRow.className = 'msg-row ai';
      vidRow.innerHTML = `
        <div class="msg-avatar-ai">🎬</div>
        <div>
          <div class="msg-video-result">
            <video controls autoplay muted loop playsinline>
              <source src="${videoUrl}" type="video/mp4">
            </video>
          </div>
          <div class="msg-actions" style="margin-top:0.4rem">
            <a href="${videoUrl}" download="ilya-video.mp4" class="glass-btn secondary-btn" style="font-size:0.75rem;padding:0.3rem 0.7rem;text-decoration:none">⬇ تحميل الفيديو</a>
            <button class="copy-btn" onclick="navigator.clipboard.writeText('${videoUrl}').then(()=>UI.toast('تم النسخ','success'))">نسخ الرابط</button>
          </div>
        </div>
      `;
      container.appendChild(vidRow);
      container.scrollTop = container.scrollHeight;

      if (user) Auth.recordServiceUse(user.id, 'video');

    } catch (err) {
      clearInterval(timerInterval);
      progRow.remove();
      const errRow = document.createElement('div');
      errRow.className = 'msg-row ai';
      errRow.innerHTML = `
        <div class="msg-avatar-ai">🎬</div>
        <div class="msg-bubble">عذراً، فشل توليد الفيديو. يرجى المحاولة مجدداً.</div>
      `;
      container.appendChild(errRow);
      container.scrollTop = container.scrollHeight;
      console.error('Video error:', err);
    }

    VideoSvc.isSending = false;
  }
};
