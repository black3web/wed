/* ═══════════════════════════════════════════════════════════
   ILYA AI Platform v3 — Dashboard (dashboard.js)
   Home · VIP · Sidebar · Profile · Help · Support · Gallery
═══════════════════════════════════════════════════════════ */
const ILYADashboard = {

  /* ── Home ───────────────────────────────────────────── */
  show() {
    const u   = ILYA.state.user;
    if (!u) { ILYAAuth.show(); return; }
    if (u.role === 'vip') { this._vip(); return; }
    this._home();
  },

  _home() {
    const u   = ILYA.state.user;
    const cfg = ILYA.state.config;
    const t   = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    ILYA.reg('dashboard', () => this._home());

    const welcome = isAr ? (cfg.welcome_ar || t('welcome')) : (cfg.welcome_en || t('welcome'));
    const about   = isAr ? cfg.about_ar : cfg.about_en;
    const act     = DB.activityFor(u.id);

    document.getElementById('page-dashboard').innerHTML = `
      <div class="pg">
        <!-- Welcome card -->
        <div class="welcome-card">
          <img src="${u.pic||'https://iili.io/B04MxcX.md.jpg'}" class="welcome-avatar" alt="${ILYA.esc(u.name)}"
               onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
          <div class="welcome-greeting">${ILYA.esc(welcome)}</div>
          <div class="welcome-sub">${ILYA.t('greeting', u.name)}</div>
          ${u.role === 'admin' ? `
            <button class="btn btn-sm" id="admin-btn"
              style="margin-top:13px;background:linear-gradient(135deg,#4a0000,#8B0000,#DC143C);color:#fff;padding:9px 20px;border-radius:20px;box-shadow:var(--glow-s)">
              <i class="fa-solid fa-shield-halved"></i> ${t('admin')}
            </button>` : ''}
        </div>

        ${about ? `<div class="glass glass-p" style="margin-bottom:16px"><p style="font-size:.83rem;color:var(--t2);line-height:1.85">${ILYA.esc(about)}</p></div>` : ''}

        <div class="sec-lbl"><i class="fa-solid fa-layer-group"></i> ${isAr ? 'خدمات المنصة' : 'Platform Services'}</div>
        <div class="srv-grid">
          ${[
            ['s-ai',      'fa-wand-magic-sparkles', t('ai_srv'),  isAr ? '7 نماذج AI':'7 AI Models'],
            ['s-gallery', 'fa-images',               t('gallery'), isAr ? `${act.length} صورة مولّدة`:`${act.length} generated`],
            ['s-profile', 'fa-user-pen',             t('my_acc'), isAr ? 'إدارة ملفك':'Manage profile'],
            ['s-help',    'fa-circle-question',      t('help'),   isAr ? 'أسئلة وشروحات':'FAQ & guides'],
            ['s-support', 'fa-headset',              t('support'), isAr ? 'تواصل معنا':'Contact us'],
          ].map(([id,icon,name,desc]) => `
            <div class="srv-card tilt-3d" id="${id}">
              <div class="srv-icon-wrap"><i class="fa-solid ${icon}"></i></div>
              <div class="srv-name">${name}</div>
              <div class="srv-desc">${desc}</div>
            </div>`).join('')}
        </div>

        ${ILYA.footer()}
      </div>`;

    ILYA.go('dashboard');
    document.getElementById('s-ai')?.addEventListener('click',      () => ILYAAI.showList());
    document.getElementById('s-gallery')?.addEventListener('click', () => this.showGallery());
    document.getElementById('s-profile')?.addEventListener('click', () => this.showProfile());
    document.getElementById('s-help')?.addEventListener('click',    () => this.showHelp());
    document.getElementById('s-support')?.addEventListener('click', () => this.showSupport());
    document.getElementById('admin-btn')?.addEventListener('click', () => ILYAAdmin.show());
  },

  /* ── VIP ────────────────────────────────────────────── */
  _vip() {
    const u = ILYA.state.user;
    const t = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    ILYA.reg('dashboard', () => this._vip());

    const feats = isAr ? [
      ['fa-crown',     'عضوية حصرية VIP وصلاحيات متقدمة'],
      ['fa-bolt',      'أولوية معالجة الطلبات السريعة'],
      ['fa-lock-open', 'وصول كامل لجميع الخدمات والنماذج'],
      ['fa-headset',   'دعم فني مباشر وفوري على مدار الساعة'],
      ['fa-star',      'ميزات حصرية غير متاحة للمستخدم العادي'],
      ['fa-images',    'معرض صور شخصي غير محدود'],
    ] : [
      ['fa-crown',     'Exclusive VIP membership & advanced privileges'],
      ['fa-bolt',      'Priority request processing'],
      ['fa-lock-open', 'Full access to all services and models'],
      ['fa-headset',   '24/7 direct & instant technical support'],
      ['fa-star',      'Exclusive features unavailable to standard users'],
      ['fa-images',    'Unlimited personal image gallery'],
    ];

    document.getElementById('page-dashboard').innerHTML = `
      <div class="pg">
        <div class="vip-hero">
          <i class="fa-solid fa-crown vip-crown"></i>
          <div class="vip-title">VIP Member</div>
          <div style="color:rgba(255,215,0,.65);font-size:.8rem;margin-bottom:12px">
            ${isAr ? 'عضو حصري — صلاحيات متقدمة' : 'Exclusive Member — Advanced Privileges'}
          </div>
          <img src="${u.pic||'https://iili.io/B04MxcX.md.jpg'}" class="vip-avatar" alt="${ILYA.esc(u.name)}"
               onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
          <div style="font-size:1.05rem;font-weight:700;margin-bottom:4px">${ILYA.esc(u.name)}</div>
          <div style="font-size:.8rem;color:rgba(255,215,0,.6)">@${ILYA.esc(u.username)}</div>
        </div>

        <div class="glass glass-p" style="margin-bottom:16px;border-color:rgba(255,215,0,.2)">
          <div style="font-weight:700;margin-bottom:13px;color:rgba(255,215,0,.9);font-size:.9rem">
            <i class="fa-solid fa-gem" style="margin-inline-end:7px"></i>
            ${isAr ? 'مميزاتك الحصرية' : 'Your Exclusive Privileges'}
          </div>
          ${feats.map(([icon, txt]) => `<div class="vip-feature"><i class="fa-solid ${icon}"></i><span>${txt}</span></div>`).join('')}
        </div>

        <div class="srv-grid">
          ${[
            ['v-ai','fa-wand-magic-sparkles',t('ai_srv')],
            ['v-gallery','fa-images',t('gallery')],
            ['v-profile','fa-user-pen',t('my_acc')],
            ['v-support','fa-headset',t('support')],
          ].map(([id,icon,name]) => `
            <div class="srv-card tilt-3d" id="${id}">
              <div class="srv-icon-wrap"><i class="fa-solid ${icon}"></i></div>
              <div class="srv-name">${name}</div>
            </div>`).join('')}
        </div>
        ${ILYA.footer()}
      </div>`;

    ILYA.go('dashboard');
    document.getElementById('v-ai')?.addEventListener('click',      () => ILYAAI.showList());
    document.getElementById('v-gallery')?.addEventListener('click', () => this.showGallery());
    document.getElementById('v-profile')?.addEventListener('click', () => this.showProfile());
    document.getElementById('v-support')?.addEventListener('click', () => this.showSupport());
  },

  /* ── Sidebar ────────────────────────────────────────── */
  renderSidebar() {
    const u   = ILYA.state.user;
    const cfg = ILYA.state.config;
    const t   = k => ILYA.t(k);
    const isAr= ILYA.state.lang === 'ar';
    if (!u) return;

    const roleBadge = u.role === 'admin'
      ? `<span class="sb-badge badge-admin">Admin</span>`
      : u.role === 'vip'
      ? `<span class="sb-badge badge-vip">VIP</span>`
      : `<span class="sb-badge badge-user">User</span>`;

    const items = [
      { id:'sb-home',    icon:'fa-house',              lbl: t('home') },
      { id:'sb-ai',      icon:'fa-wand-magic-sparkles',lbl: t('ai_srv'), isNew: true },
      { id:'sb-gallery', icon:'fa-images',             lbl: t('gallery') },
      { id:'sb-profile', icon:'fa-user-pen',           lbl: t('my_acc') },
      { id:'sb-help',    icon:'fa-circle-question',    lbl: t('help') },
      { id:'sb-support', icon:'fa-headset',            lbl: t('support') },
      ...(u.role === 'admin' ? [{ id:'sb-admin', icon:'fa-shield-halved', lbl: t('admin'), extra:'color:var(--neon)' }] : []),
    ];

    document.getElementById('sidebar').innerHTML = `
      <div class="sb-header">
        <img src="https://iili.io/B04Wttf.md.jpg" class="sb-banner" alt="Banner"
             onerror="this.style.background='linear-gradient(135deg,#3d0000,#0d0000)'">
        <div class="sb-banner-overlay"></div>
        <button class="sb-close-btn" id="sb-close"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <div class="sb-user">
        <img src="${u.pic||'https://iili.io/B04MxcX.md.jpg'}" class="sb-avatar" alt="${ILYA.esc(u.name)}"
             onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
        <div class="sb-info">
          <div class="sb-name">${ILYA.esc(u.name)}</div>
          <div class="sb-uname">@${ILYA.esc(u.username)}</div>
          ${roleBadge}
        </div>
      </div>

      <div class="sb-divider"></div>

      <nav class="sb-nav">
        ${items.map(item => `
          <button class="sb-item${item.extra ? '" style="' + item.extra + '"' : '"'} id="${item.id}">
            <i class="fa-solid ${item.icon} sb-item-icon"></i>
            <span>${item.lbl}</span>
            ${item.isNew ? `<span class="sb-item-new">NEW</span>` : ''}
          </button>`).join('')}

        <div class="sb-divider" style="margin:8px 0"></div>

        <a href="${cfg.dev_site || 'https://black3web.github.io/Blackweb/'}" target="_blank" rel="noopener" class="sb-item">
          <i class="fa-solid fa-globe sb-item-icon"></i>
          <span>${t('dev_site_btn')}</span>
          <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:.7rem;margin-inline-start:auto;color:var(--t4)"></i>
        </a>

        <button class="sb-item sb-item-logout" id="sb-logout">
          <i class="fa-solid fa-right-from-bracket sb-item-icon"></i>
          <span>${t('logout')}</span>
        </button>
      </nav>

      <div class="sb-footer">
        <div>ILYA AI © ${new Date().getFullYear()} — ${t('copyright')}</div>
        <div>
          <a href="${cfg.tg_link || 'https://t.me/swc_t'}" target="_blank" rel="noopener">
            <i class="fa-brands fa-telegram"></i> Telegram
          </a>
        </div>
      </div>
    `;

    const go = fn => { ILYA.closeSidebar(); setTimeout(fn, 280); };
    document.getElementById('sb-close')?.addEventListener('click',   () => ILYA.closeSidebar());
    document.getElementById('sb-home')?.addEventListener('click',    () => go(() => this.show()));
    document.getElementById('sb-ai')?.addEventListener('click',      () => go(() => ILYAAI.showList()));
    document.getElementById('sb-gallery')?.addEventListener('click', () => go(() => this.showGallery()));
    document.getElementById('sb-profile')?.addEventListener('click', () => go(() => this.showProfile()));
    document.getElementById('sb-help')?.addEventListener('click',    () => go(() => this.showHelp()));
    document.getElementById('sb-support')?.addEventListener('click', () => go(() => this.showSupport()));
    document.getElementById('sb-admin')?.addEventListener('click',   () => go(() => ILYAAdmin.show()));
    document.getElementById('sb-logout')?.addEventListener('click',  () => ILYAAuth.logout());
  },

  /* ── Profile ────────────────────────────────────────── */
  showProfile() {
    ILYA.reg('profile', () => this.showProfile());
    // Always get fresh user from DB
    const u = DB.userById(ILYA.state.user?.id);
    if (!u) { ILYAAuth.show(); return; }
    ILYA.saveSession(u);

    const t    = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';

    document.getElementById('page-profile').innerHTML = `
      <div class="pg">
        <div class="pg-hdr">
          <button class="back-btn" id="back-prof"><i class="fa-solid fa-arrow-right"></i><i class="fa-solid fa-arrow-left"></i></button>
          <div class="pg-title"><i class="fa-solid fa-user-pen" style="margin-inline-end:8px;color:var(--neon)"></i>${t('my_acc')}</div>
        </div>

        <div class="profile-hero">
          <img src="${u.pic||'https://iili.io/B04MxcX.md.jpg'}" class="profile-avatar" id="prof-av" alt="${ILYA.esc(u.name)}"
               onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
        </div>

        <div class="profile-id-row">
          <i class="fa-solid fa-id-card" style="color:var(--neon);flex-shrink:0"></i>
          <span style="font-size:.79rem;color:var(--t3)">${t('my_id')}:</span>
          <span class="profile-id-val">${u.id}</span>
          <span class="profile-id-lock"><i class="fa-solid fa-lock"></i>${isAr ? 'ثابت':'Fixed'}</span>
        </div>

        <div class="glass glass-p" style="margin-bottom:14px">
          <div class="sec-lbl"><i class="fa-solid fa-user"></i>${isAr ? 'المعلومات الشخصية':'Personal Info'}</div>

          <div class="form-grp">
            <label class="form-lbl"><i class="fa-solid fa-signature"></i> ${t('name')}</label>
            <input id="p-name" type="text" class="form-ctrl" value="${ILYA.esc(u.name)}">
          </div>
          <div class="form-grp">
            <label class="form-lbl"><i class="fa-solid fa-at"></i> ${t('username')}</label>
            <input id="p-user" type="text" class="form-ctrl" value="${ILYA.esc(u.username)}">
          </div>
          <div class="form-grp">
            <label class="form-lbl"><i class="fa-solid fa-lock"></i> ${t('password')}</label>
            <input id="p-pw" type="password" class="form-ctrl"
              placeholder="${isAr ? 'اتركه فارغاً للإبقاء على الحالي':'Leave blank to keep current'}">
          </div>
        </div>

        <!-- Avatar -->
        <div class="glass glass-p" style="margin-bottom:14px">
          <div class="sec-lbl"><i class="fa-solid fa-image"></i>${isAr ? 'الصورة الشخصية':'Profile Picture'}</div>

          <div class="img-input-tabs">
            <button class="img-tab active" id="av-tab-url">${isAr ? 'رابط URL':'URL Link'}</button>
            <button class="img-tab" id="av-tab-file">${isAr ? 'من الجهاز':'From Device'}</button>
          </div>

          <div id="av-url-panel">
            <input id="p-pic" type="url" class="form-ctrl" value="${ILYA.esc(u.pic||'')}" placeholder="https://...">
          </div>

          <div id="av-file-panel" style="display:none">
            <div class="upload-zone" id="av-upload-zone">
              <input type="file" id="av-file-input" accept="image/png,image/jpeg,image/webp,image/gif">
              <span class="upload-zone-icon"><i class="fa-solid fa-cloud-arrow-up"></i></span>
              <div class="upload-zone-txt">${t('drag_drop')}</div>
              <div class="upload-zone-sub">${t('drag_drop_sub')}</div>
            </div>
            <div class="upload-preview" id="av-preview">
              <img src="" alt="Preview" id="av-preview-img">
              <button class="upload-preview-clear" id="av-clear"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="upload-progress" id="av-prog">
              <i class="fa-solid fa-circle-notch fa-spin" style="color:var(--neon)"></i>
              <div class="upload-prog-bar"><div class="upload-prog-fill" id="av-prog-fill" style="width:0%"></div></div>
              <span id="av-prog-txt">0%</span>
            </div>
          </div>
        </div>

        <div id="p-msg" style="text-align:center;font-size:.82rem;margin-bottom:10px;display:none"></div>
        <button class="btn btn-primary btn-full" id="save-prof">
          <i class="fa-solid fa-floppy-disk"></i> ${t('save')}
        </button>

        <div style="text-align:center;font-size:.73rem;color:var(--t4);margin-top:12px">
          ${t('member_since', u.created_at?.slice(0,10) || '—')}
        </div>

        ${ILYA.footer()}
      </div>`;

    ILYA.go('profile');
    document.getElementById('back-prof')?.addEventListener('click', () => this.show());

    // Tab switching for avatar input
    let uploadedAvatarUrl = '';
    const avTabUrl  = document.getElementById('av-tab-url');
    const avTabFile = document.getElementById('av-tab-file');
    const avUrlPanel  = document.getElementById('av-url-panel');
    const avFilePanel = document.getElementById('av-file-panel');
    const avFileInput = document.getElementById('av-file-input');
    const avPreview   = document.getElementById('av-preview');
    const avPreviewImg= document.getElementById('av-preview-img');
    const avClear     = document.getElementById('av-clear');
    const avProg      = document.getElementById('av-prog');
    const avProgFill  = document.getElementById('av-prog-fill');
    const avProgTxt   = document.getElementById('av-prog-txt');

    avTabUrl.addEventListener('click', () => {
      avTabUrl.classList.add('active'); avTabFile.classList.remove('active');
      avUrlPanel.style.display = 'block'; avFilePanel.style.display = 'none';
    });
    avTabFile.addEventListener('click', () => {
      avTabFile.classList.add('active'); avTabUrl.classList.remove('active');
      avFilePanel.style.display = 'block'; avUrlPanel.style.display = 'none';
    });

    // URL live preview
    document.getElementById('p-pic')?.addEventListener('input', e => {
      if (e.target.value) document.getElementById('prof-av').src = e.target.value;
    });

    // File upload
    avFileInput?.addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) { ILYA.toast(isAr ? 'الحجم يتجاوز 10MB':'File exceeds 10MB', 'error'); return; }

      // Preview
      const dataUrl = await IMG_UPLOADER.toDataURL(file);
      avPreviewImg.src = dataUrl;
      avPreview.classList.add('show');
      document.getElementById('prof-av').src = dataUrl;

      // Upload
      avProg.classList.add('show');
      try {
        const url = await IMG_UPLOADER.upload(file, pct => {
          avProgFill.style.width = pct + '%';
          avProgTxt.textContent  = pct + '%';
        });
        uploadedAvatarUrl = url;
        avProg.classList.remove('show');
        ILYA.toast(t('upload_done'), 'success');
      } catch {
        avProg.classList.remove('show');
        ILYA.toast(t('upload_fail'), 'warn');
        // Keep the data URL as fallback (won't work as profile pic for others but ok for display)
        uploadedAvatarUrl = dataUrl;
      }
    });

    avClear?.addEventListener('click', () => {
      avPreview.classList.remove('show');
      avFileInput.value = '';
      uploadedAvatarUrl = '';
      document.getElementById('prof-av').src = u.pic || 'https://iili.io/B04MxcX.md.jpg';
    });

    // Drag-drop support
    const zone = document.getElementById('av-upload-zone');
    zone?.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone?.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone?.addEventListener('drop', e => {
      e.preventDefault(); zone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) { const dt = new DataTransfer(); dt.items.add(file); avFileInput.files = dt.files; avFileInput.dispatchEvent(new Event('change')); }
    });

    // Save
    document.getElementById('save-prof')?.addEventListener('click', async () => {
      const btn     = document.getElementById('save-prof');
      const msgEl   = document.getElementById('p-msg');
      const name    = document.getElementById('p-name')?.value?.trim();
      const uname   = document.getElementById('p-user')?.value?.trim();
      const pw      = document.getElementById('p-pw')?.value?.trim();
      const picUrl  = avTabUrl.classList.contains('active')
        ? (document.getElementById('p-pic')?.value?.trim() || '')
        : uploadedAvatarUrl;

      if (!name || !uname) { ILYA.toast(t('err_fields'), 'error'); return; }
      if (uname.length < 4) { ILYA.toast(t('err_uname_short'), 'error'); return; }

      const conflict = DB.userByUsername(uname);
      if (conflict && String(conflict.id) !== String(u.id)) { ILYA.toast(t('err_uname_taken'), 'error'); return; }

      const updates = { name, username: uname };
      if (pw) updates.ph = md5(pw);
      if (picUrl) updates.pic = picUrl;

      btn.disabled = true; btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
      setTimeout(() => {
        DB.updateUser(u.id, updates);
        const fresh = DB.userById(u.id);
        ILYA.saveSession(fresh);
        btn.disabled = false; btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${t('save')}`;
        msgEl.textContent = t('saved'); msgEl.style.color = '#44ff88'; msgEl.style.display = 'block';
        ILYA.toast(t('saved'), 'success');
        setTimeout(() => msgEl.style.display = 'none', 3000);
      }, 300);
    });
  },

  /* ── Gallery ────────────────────────────────────────── */
  showGallery() {
    ILYA.reg('gallery', () => this.showGallery());
    const t    = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    const u    = ILYA.state.user;
    const acts = DB.activityFor(u?.id).filter(a => a.url);

    document.getElementById('page-gallery').innerHTML = `
      <div class="pg">
        <div class="pg-hdr">
          <button class="back-btn" id="back-gal"><i class="fa-solid fa-arrow-right"></i><i class="fa-solid fa-arrow-left"></i></button>
          <div class="pg-title"><i class="fa-solid fa-images" style="margin-inline-end:8px;color:var(--neon)"></i>${t('gallery')}</div>
        </div>

        ${acts.length ? `
          <div style="font-size:.79rem;color:var(--t3);margin-bottom:14px">
            ${isAr ? `${acts.length} صورة مولّدة` : `${acts.length} generated images`}
          </div>
          <div class="gallery-grid" id="gallery-grid">
            ${acts.map(a => `
              <div class="gallery-item" onclick="ILYA.openLightbox('${ILYA.esc(a.url)}')">
                <img src="${ILYA.esc(a.url)}" alt="${ILYA.esc(a.service)}"
                     loading="lazy" onerror="this.parentElement.style.display='none'">
                <div class="gallery-item-overlay">
                  <span class="gallery-item-service">${ILYA.esc(a.service)}</span>
                  <a href="${ILYA.esc(a.url)}" download onclick="event.stopPropagation()"
                     class="btn-icon" style="width:28px;height:28px;font-size:.75rem">
                    <i class="fa-solid fa-download"></i>
                  </a>
                </div>
              </div>`).join('')}
          </div>` :
          `<div class="empty-state">
            <div class="empty-icon"><i class="fa-solid fa-images"></i></div>
            <div class="empty-txt">${isAr ? 'لا توجد صور مولّدة بعد — جرّب أحد نماذج AI!' : 'No generated images yet — try an AI model!'}</div>
          </div>`}

        ${ILYA.footer()}
      </div>`;

    ILYA.go('gallery');
    document.getElementById('back-gal')?.addEventListener('click', () => this.show());
  },

  /* ── Help ───────────────────────────────────────────── */
  showHelp() {
    ILYA.reg('help', () => this.showHelp());
    const t    = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';

    const faqs = isAr ? [
      ['ما هي منصة ILYA AI؟', 'منصة ILYA AI هي وجهتك المتكاملة لخدمات الذكاء الاصطناعي — تقدم 7 نماذج متخصصة لتوليد الصور وتعديلها.'],
      ['كيف أستخدم خدمات توليد الصور؟', 'انتقل لـ "خدمات AI"، اختر النموذج، أدخل الوصف أو ارفع صورتك، ثم اضغط إرسال. ستصل النتيجة خلال ثوانٍ.'],
      ['ما الفرق بين النماذج السبعة؟', 'كل نموذج متخصص: نص→صورة (V-Gen)، تحويل أنمي (14 نمط)، SeedDream (13 نمط فني)، صورة شخصية احترافية (15 نمط)، Flux MAX، Nano Banana 2 (2K)، وNanoBanana Pro (إنشاء وتعديل حتى 4K).'],
      ['كيف أرفع صورة؟', 'في نماذج الصور، اختر "من الجهاز" لرفع صورة مباشرة، أو "رابط URL" لإدخال رابط. يتم رفع الصورة تلقائياً وتُستخدم مع النموذج.'],
      ['كيف أغير صورة ملفي الشخصي؟', 'اذهب لـ "حسابي"، حدد "من الجهاز" أو "رابط URL"، ثم احفظ التغييرات.'],
      ['هل يمكن تغيير رقم الهوية؟', 'لا، رقم الهوية (ID) ثابت عند إنشاء الحساب. لكن يمكن للمبرمج تغييره من لوحة التحكم.'],
      ['ما هو معرض الصور؟', 'معرضي يحفظ جميع الصور التي ولّدتها بالمنصة في مكان واحد. يمكنك تكبيرها وتحميلها.'],
      ['كيف أتواصل مع الدعم؟', 'اذهب لـ "الدعم"، اكتب رسالتك مع إمكانية إرفاق صورتين. سيرد فريق الدعم داخل المنصة.'],
    ] : [
      ['What is ILYA AI Platform?', 'ILYA AI is your integrated destination for AI services — offering 7 specialized models for generating and editing images.'],
      ['How do I use the AI services?', 'Go to "AI Services", choose your model, enter a description or upload an image, and press send. Results arrive in seconds.'],
      ['What is the difference between the 7 models?', 'Each model is specialized: text→image (V-Gen), anime conversion (14 styles), SeedDream (13 artistic styles), professional photos (15 styles), Flux MAX, Nano Banana 2 (2K), and NanoBanana Pro (create & edit up to 4K).'],
      ['How do I upload an image?', 'In image-based models, choose "From Device" to upload directly, or "URL Link" to paste a URL. The image is automatically uploaded and used with the model.'],
      ['How do I change my profile picture?', 'Go to "My Account", select "From Device" or "URL Link", then save changes.'],
      ['Can I change my ID number?', 'No, the ID is fixed at account creation. However, the admin can change it from the control panel.'],
      ['What is My Gallery?', 'My Gallery saves all images you\'ve generated on the platform in one place. You can enlarge and download them.'],
      ['How do I contact support?', 'Go to "Support", write your message with optional image attachments. The support team will reply inside the platform.'],
    ];

    document.getElementById('page-help').innerHTML = `
      <div class="pg">
        <div class="pg-hdr">
          <button class="back-btn" id="back-help"><i class="fa-solid fa-arrow-right"></i><i class="fa-solid fa-arrow-left"></i></button>
          <div class="pg-title"><i class="fa-solid fa-circle-question" style="margin-inline-end:8px;color:var(--neon)"></i>${t('help')}</div>
        </div>

        <div class="glass glass-p glass-r" style="margin-bottom:18px">
          <div style="font-weight:700;margin-bottom:8px;font-size:.92rem">
            <i class="fa-solid fa-robot" style="color:var(--neon);margin-inline-end:8px"></i>
            ${isAr ? 'كيف يمكننا مساعدتك؟' : 'How can we help you?'}
          </div>
          <p style="font-size:.82rem;color:var(--t2);line-height:1.8">
            ${isAr ? 'ستجد هنا إجابات لأكثر الأسئلة شيوعاً. لمزيد من المساعدة يمكنك إرسال تذكرة دعم فني.' : 'Find answers to common questions here. For more help, send a support ticket.'}
          </p>
        </div>

        <div class="sec-lbl"><i class="fa-solid fa-list-ul"></i> ${isAr ? 'الأسئلة الشائعة' : 'FAQ'}</div>
        ${faqs.map((f, i) => `
          <div class="faq-item" data-i="${i}">
            <div class="faq-q"><span>${f[0]}</span><i class="fa-solid fa-chevron-down"></i></div>
            <div class="faq-a">${f[1]}</div>
          </div>`).join('')}

        ${ILYA.footer()}
      </div>`;

    ILYA.go('help');
    document.getElementById('back-help')?.addEventListener('click', () => this.show());
    document.querySelectorAll('.faq-item').forEach(item => {
      item.querySelector('.faq-q').addEventListener('click', () => item.classList.toggle('open'));
    });
  },

  /* ── Support ────────────────────────────────────────── */
  showSupport() {
    ILYA.reg('support', () => this.showSupport());
    const t    = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';

    document.getElementById('page-support').innerHTML = `
      <div class="pg">
        <div class="pg-hdr">
          <button class="back-btn" id="back-sup"><i class="fa-solid fa-arrow-right"></i><i class="fa-solid fa-arrow-left"></i></button>
          <div class="pg-title"><i class="fa-solid fa-headset" style="margin-inline-end:8px;color:var(--neon)"></i>${t('support')}</div>
        </div>

        <!-- New ticket -->
        <div class="glass glass-p" style="margin-bottom:20px">
          <div style="font-weight:700;margin-bottom:14px;font-size:.9rem">
            <i class="fa-solid fa-paper-plane" style="color:var(--neon);margin-inline-end:8px"></i>
            ${isAr ? 'إرسال تذكرة دعم جديدة' : 'Send New Support Ticket'}
          </div>
          <div class="form-grp">
            <label class="form-lbl">${t('your_msg')}</label>
            <textarea id="tk-msg" class="form-ctrl" rows="4" placeholder="${t('your_msg')}" style="resize:vertical"></textarea>
          </div>
          <div class="form-grp">
            <label class="form-lbl">${t('attach')} 1</label>
            <input id="tk-a1" type="url" class="form-ctrl" placeholder="https://... (${isAr ? 'اختياري':'optional'})">
          </div>
          <div class="form-grp">
            <label class="form-lbl">${t('attach')} 2</label>
            <input id="tk-a2" type="url" class="form-ctrl" placeholder="https://... (${isAr ? 'اختياري':'optional'})">
          </div>
          <div id="tk-st" style="text-align:center;font-size:.82rem;margin-bottom:10px;display:none"></div>
          <button class="btn btn-primary btn-full" id="tk-send">
            <i class="fa-solid fa-paper-plane"></i> ${t('send_ticket')}
          </button>
        </div>

        <div class="sec-lbl"><i class="fa-solid fa-clock-rotate-left"></i>${isAr ? 'تذاكرك السابقة':'Your Tickets'}</div>
        <div id="tk-list"><div class="spinner"></div></div>

        ${ILYA.footer()}
      </div>`;

    ILYA.go('support');
    document.getElementById('back-sup')?.addEventListener('click', () => this.show());
    document.getElementById('tk-send')?.addEventListener('click', () => this._sendTicket());
    this._loadTickets();
  },

  _sendTicket() {
    const msg  = document.getElementById('tk-msg')?.value?.trim();
    const a1   = document.getElementById('tk-a1')?.value?.trim() || null;
    const a2   = document.getElementById('tk-a2')?.value?.trim() || null;
    const btn  = document.getElementById('tk-send');
    const st   = document.getElementById('tk-st');
    const isAr = ILYA.state.lang === 'ar';

    if (!msg) { ILYA.toast(isAr ? 'الرسالة مطلوبة' : 'Message required', 'error'); return; }
    btn.disabled = true;
    setTimeout(() => {
      DB.addTicket(ILYA.state.user.id, msg, a1, a2);
      btn.disabled = false;
      document.getElementById('tk-msg').value = '';
      document.getElementById('tk-a1').value  = '';
      document.getElementById('tk-a2').value  = '';
      st.textContent = ILYA.t('ticket_sent'); st.style.color = '#44ff88'; st.style.display = 'block';
      ILYA.toast(ILYA.t('ticket_sent'), 'success');
      this._loadTickets();
      setTimeout(() => st.style.display = 'none', 3000);
    }, 280);
  },

  _loadTickets() {
    const list = document.getElementById('tk-list');
    if (!list) return;
    const tickets = DB.tickets(ILYA.state.user?.id);
    const isAr    = ILYA.state.lang === 'ar';

    if (!tickets.length) {
      list.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class="fa-solid fa-ticket"></i></div><div class="empty-txt">${ILYA.t('no_tickets')}</div></div>`;
      return;
    }
    list.innerHTML = tickets.map(tk => `
      <div class="ticket-card">
        <div class="ticket-hdr">
          <div class="ticket-meta">
            <div class="ticket-meta-date">${(tk.created_at||'').slice(0,16)}</div>
          </div>
          <span class="ticket-status-badge ${tk.status === 'replied' ? 's-replied':'s-open'}">
            ${tk.status === 'replied' ? (isAr ? 'تم الرد':'Replied') : (isAr ? 'مفتوحة':'Open')}
          </span>
        </div>
        <div class="ticket-msg">${ILYA.esc(tk.message)}</div>
        ${tk.att1 || tk.att2 ? `
          <div class="ticket-attaches">
            ${tk.att1 ? `<img src="${ILYA.esc(tk.att1)}" class="ticket-att" onclick="ILYA.openLightbox('${ILYA.esc(tk.att1)}')" onerror="this.style.display='none'">` : ''}
            ${tk.att2 ? `<img src="${ILYA.esc(tk.att2)}" class="ticket-att" onclick="ILYA.openLightbox('${ILYA.esc(tk.att2)}')" onerror="this.style.display='none'">` : ''}
          </div>` : ''}
        ${tk.reply ? `
          <div class="ticket-reply-box">
            <strong><i class="fa-solid fa-reply" style="margin-inline-end:6px"></i>${ILYA.t('admin_reply')}</strong>
            ${ILYA.esc(tk.reply)}
          </div>` : ''}
      </div>`).join('');
  },
};
