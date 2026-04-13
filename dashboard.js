/* ═══════════════════════════════════════════════════════════
   ILYA AI Platform — Dashboard Module (dashboard.js)
═══════════════════════════════════════════════════════════ */
const ILYADashboard = {

  show() {
    const u   = ILYA.state.user;
    if (!u) { ILYAAuth.show(); return; }
    ILYA.registerPageRender('dashboard', () => this.show());
    if (u.role === 'vip')   { this._showVIP(); return; }
    this._showStandard();
  },

  _showStandard() {
    const u   = ILYA.state.user;
    const cfg = ILYA.state.config;
    const t   = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    const welcome = isAr ? (cfg.welcome_ar || t('welcome')) : (cfg.welcome_en || t('welcome'));
    const about   = isAr ? cfg.about_ar : cfg.about_en;

    document.getElementById('page-dashboard').innerHTML = `
      <div class="page-wrap" style="padding-top:60px">
        <!-- Welcome -->
        <div class="welcome-card">
          <img src="${u.pic || 'https://iili.io/B04MxcX.md.jpg'}" class="welcome-avatar" alt="${ILYA.esc(u.name)}"
               onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
          <div class="welcome-name">${ILYA.esc(welcome)}</div>
          <div class="welcome-sub">${ILYA.t('greeting', u.name)}</div>
          ${u.role === 'admin' ? `
            <button class="btn btn-primary" id="admin-open-btn" style="margin-top:14px;background:linear-gradient(135deg,#4a0000,#8B0000,#DC143C)">
              <i class="fa-solid fa-shield-halved"></i> ${t('admin')}
            </button>` : ''}
        </div>

        <!-- About -->
        ${about ? `
          <div class="glass glass-p" style="margin-bottom:18px">
            <p style="font-size:.84rem;color:var(--c-t2);line-height:1.85">${ILYA.esc(about)}</p>
          </div>` : ''}

        <!-- Services -->
        <div class="section-lbl"><i class="fa-solid fa-layer-group"></i> ${isAr ? 'خدمات المنصة' : 'Platform Services'}</div>
        <div class="srv-grid">
          <div class="srv-card card-3d" id="s-ai">
            <div class="srv-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
            <div class="srv-name">${t('ai_srv')}</div>
            <div class="srv-desc">${isAr ? '7 نماذج ذكاء اصطناعي' : '7 AI Models'}</div>
          </div>
          <div class="srv-card card-3d" id="s-support">
            <div class="srv-icon"><i class="fa-solid fa-headset"></i></div>
            <div class="srv-name">${t('support')}</div>
            <div class="srv-desc">${isAr ? 'نظام تذاكر الدعم' : 'Support Tickets'}</div>
          </div>
          <div class="srv-card card-3d" id="s-profile">
            <div class="srv-icon"><i class="fa-solid fa-user-pen"></i></div>
            <div class="srv-name">${t('my_acc')}</div>
            <div class="srv-desc">${isAr ? 'إدارة ملفك الشخصي' : 'Manage Profile'}</div>
          </div>
          <div class="srv-card card-3d" id="s-help">
            <div class="srv-icon"><i class="fa-solid fa-circle-question"></i></div>
            <div class="srv-name">${t('help')}</div>
            <div class="srv-desc">${isAr ? 'شروحات ومساعدة' : 'Guides & Help'}</div>
          </div>
        </div>

        ${this._footer()}
      </div>
    `;

    ILYA.showPage('dashboard');
    document.getElementById('s-ai')?.addEventListener('click',       () => ILYAAI.showList());
    document.getElementById('s-support')?.addEventListener('click',  () => this.showSupport());
    document.getElementById('s-profile')?.addEventListener('click',  () => this.showProfile());
    document.getElementById('s-help')?.addEventListener('click',     () => this.showHelp());
    document.getElementById('admin-open-btn')?.addEventListener('click', () => ILYAAdmin.show());
  },

  _showVIP() {
    const u = ILYA.state.user;
    const t = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    const feats = isAr ? [
      ['fa-crown',       'عضوية حصرية VIP وصلاحيات متقدمة'],
      ['fa-bolt',        'أولوية معالجة الطلبات'],
      ['fa-lock-open',   'وصول كامل لجميع الخدمات والنماذج'],
      ['fa-headset',     'دعم فني مباشر وفوري'],
      ['fa-star',        'ميزات حصرية غير متاحة للمستخدم العادي'],
    ] : [
      ['fa-crown',       'Exclusive VIP membership & advanced privileges'],
      ['fa-bolt',        'Priority request processing'],
      ['fa-lock-open',   'Full access to all services and models'],
      ['fa-headset',     'Direct & instant technical support'],
      ['fa-star',        'Exclusive features not available to standard users'],
    ];

    document.getElementById('page-dashboard').innerHTML = `
      <div class="page-wrap" style="padding-top:60px">
        <div class="vip-hero">
          <i class="fa-solid fa-crown vip-crown-icon"></i>
          <div class="vip-title">VIP Member</div>
          <div style="color:rgba(255,215,0,.65);font-size:.82rem;margin-bottom:12px">
            ${isAr ? 'عضو حصري — صلاحيات متقدمة' : 'Exclusive Member — Advanced Privileges'}
          </div>
          <img src="${u.pic || 'https://iili.io/B04MxcX.md.jpg'}" class="vip-avatar" alt="${ILYA.esc(u.name)}"
               onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
          <div style="font-size:1.1rem;font-weight:700;margin-bottom:4px">${ILYA.esc(u.name)}</div>
          <div style="font-size:.82rem;color:rgba(255,215,0,.6)">@${ILYA.esc(u.username)}</div>
        </div>

        <div class="glass glass-p" style="margin-bottom:18px;border-color:rgba(255,215,0,.2)">
          <div style="font-weight:700;margin-bottom:14px;color:rgba(255,215,0,.9);font-size:.92rem">
            <i class="fa-solid fa-gem" style="margin-inline-end:7px"></i>
            ${isAr ? 'مميزاتك الحصرية' : 'Your Exclusive Privileges'}
          </div>
          ${feats.map(([icon, txt]) => `
            <div class="vip-feature">
              <i class="fa-solid ${icon}"></i>
              <span>${txt}</span>
            </div>`).join('')}
        </div>

        <div class="srv-grid">
          <div class="srv-card card-3d" id="v-ai">
            <div class="srv-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
            <div class="srv-name">${t('ai_srv')}</div>
          </div>
          <div class="srv-card card-3d" id="v-profile">
            <div class="srv-icon"><i class="fa-solid fa-user-pen"></i></div>
            <div class="srv-name">${t('my_acc')}</div>
          </div>
          <div class="srv-card card-3d" id="v-support">
            <div class="srv-icon"><i class="fa-solid fa-headset"></i></div>
            <div class="srv-name">${t('support')}</div>
          </div>
          <div class="srv-card card-3d" id="v-help">
            <div class="srv-icon"><i class="fa-solid fa-circle-question"></i></div>
            <div class="srv-name">${t('help')}</div>
          </div>
        </div>
        ${this._footer()}
      </div>
    `;

    ILYA.showPage('dashboard');
    document.getElementById('v-ai')?.addEventListener('click',      () => ILYAAI.showList());
    document.getElementById('v-profile')?.addEventListener('click', () => this.showProfile());
    document.getElementById('v-support')?.addEventListener('click', () => this.showSupport());
    document.getElementById('v-help')?.addEventListener('click',    () => this.showHelp());
  },

  // ── Sidebar ─────────────────────────────────────────
  renderSidebar() {
    const u = ILYA.state.user;
    const t = k => ILYA.t(k);
    const cfg = ILYA.state.config;
    if (!u) return;
    const badgeCls = u.role === 'admin' ? 'badge-admin' : u.role === 'vip' ? 'badge-vip' : 'badge-user';
    const badgeTxt = u.role === 'admin' ? 'Admin' : u.role === 'vip' ? 'VIP' : 'User';

    document.getElementById('sidebar').innerHTML = `
      <div class="sb-banner-wrap">
        <img src="https://iili.io/B04Wttf.md.jpg" class="sb-banner" alt="Banner"
             onerror="this.style.background='linear-gradient(135deg,#3d0000,#0d0000)'">
        <div class="sb-banner-grad"></div>
        <button class="sb-close" id="sb-close"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <div class="sb-user">
        <img src="${u.pic || 'https://iili.io/B04MxcX.md.jpg'}" class="sb-avatar" alt="${ILYA.esc(u.name)}"
             onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
        <div>
          <div class="sb-name">${ILYA.esc(u.name)}</div>
          <div class="sb-uname">@${ILYA.esc(u.username)}</div>
          <span class="role-badge ${badgeCls}">${badgeTxt}</span>
        </div>
      </div>

      <div class="sb-divider"></div>
      <div class="sb-menu">
        <button class="btn btn-glass" id="sb-home">
          <i class="fa-solid fa-house"></i><span>${t('home')}</span>
        </button>
        <button class="btn btn-glass" id="sb-ai">
          <i class="fa-solid fa-wand-magic-sparkles"></i><span>${t('ai_srv')}</span>
        </button>
        <button class="btn btn-glass" id="sb-profile">
          <i class="fa-solid fa-user-pen"></i><span>${t('my_acc')}</span>
        </button>
        <button class="btn btn-glass" id="sb-help">
          <i class="fa-solid fa-circle-question"></i><span>${t('help')}</span>
        </button>
        <button class="btn btn-glass" id="sb-support">
          <i class="fa-solid fa-headset"></i><span>${t('support')}</span>
        </button>
        ${u.role === 'admin' ? `
          <button class="btn btn-glass" id="sb-admin" style="border-color:var(--c-border-r);color:var(--c-bright)">
            <i class="fa-solid fa-shield-halved"></i><span>${t('admin')}</span>
          </button>` : ''}
        <div class="sb-divider"></div>
        <!-- Dev website button -->
        <a href="${cfg.dev_site || 'https://black3web.github.io/Blackweb/'}" target="_blank" class="btn btn-glass" style="color:var(--c-bright);border-color:var(--c-border-r)">
          <i class="fa-solid fa-globe"></i><span>${t('dev_site_btn')}</span>
        </a>
        <button class="btn btn-glass" id="sb-logout" style="color:rgba(255,100,100,.85)">
          <i class="fa-solid fa-right-from-bracket"></i><span>${t('logout')}</span>
        </button>
      </div>

      <!-- Footer in sidebar -->
      <div class="page-foot" style="border-top-color:rgba(255,255,255,.05)">
        <div>ILYA AI © ${new Date().getFullYear()} — ${t('copyright')}</div>
        <div>
          <a href="${cfg.tg_link || 'https://t.me/swc_t'}" target="_blank">
            <i class="fa-brands fa-telegram"></i> Telegram
          </a>
        </div>
      </div>
    `;

    const go = fn => { ILYA.closeSidebar(); setTimeout(fn, 320); };
    document.getElementById('sb-close')?.addEventListener('click',   () => ILYA.closeSidebar());
    document.getElementById('sb-home')?.addEventListener('click',    () => go(() => this.show()));
    document.getElementById('sb-ai')?.addEventListener('click',      () => go(() => ILYAAI.showList()));
    document.getElementById('sb-profile')?.addEventListener('click', () => go(() => this.showProfile()));
    document.getElementById('sb-help')?.addEventListener('click',    () => go(() => this.showHelp()));
    document.getElementById('sb-support')?.addEventListener('click', () => go(() => this.showSupport()));
    document.getElementById('sb-admin')?.addEventListener('click',   () => go(() => ILYAAdmin.show()));
    document.getElementById('sb-logout')?.addEventListener('click',  () => ILYAAuth.logout());
  },

  // ── Profile ─────────────────────────────────────────
  showProfile() {
    ILYA.registerPageRender('profile', () => this.showProfile());
    // Refresh user data from DB
    const u = DB.userById(ILYA.state.user?.id);
    if (!u) { ILYAAuth.show(); return; }
    ILYA.saveSession(u);
    const t = k => ILYA.t(k);

    document.getElementById('page-profile').innerHTML = `
      <div class="page-wrap">
        <div class="page-hdr">
          <button class="back-btn" id="back-prof">
            <i class="fa-solid fa-arrow-right"></i><i class="fa-solid fa-arrow-left"></i>
          </button>
          <div class="page-title"><i class="fa-solid fa-user-pen" style="margin-inline-end:8px;color:var(--c-neon)"></i>${t('my_acc')}</div>
        </div>

        <div class="profile-hero">
          <img src="${u.pic || 'https://iili.io/B04MxcX.md.jpg'}" class="profile-avatar" id="prof-av"
               alt="${ILYA.esc(u.name)}" onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
        </div>

        <div class="profile-id-row">
          <i class="fa-solid fa-id-card" style="color:var(--c-neon)"></i>
          <span style="font-size:.82rem;color:var(--c-t3)">${t('my_id')}:</span>
          <span class="profile-id-num">${u.id}</span>
          <span class="profile-id-lock">
            <i class="fa-solid fa-lock"></i>
            ${ILYA.state.lang === 'ar' ? 'ثابت' : 'Fixed'}
          </span>
        </div>

        <div class="glass glass-p" style="margin-bottom:16px">
          <div class="form-grp">
            <label class="form-lbl"><i class="fa-solid fa-signature" style="margin-inline-end:6px;color:var(--c-t4)"></i>${t('name')}</label>
            <input id="p-name" type="text" class="form-ctrl" value="${ILYA.esc(u.name)}">
          </div>
          <div class="form-grp">
            <label class="form-lbl"><i class="fa-solid fa-at" style="margin-inline-end:6px;color:var(--c-t4)"></i>${t('username')}</label>
            <input id="p-user" type="text" class="form-ctrl" value="${ILYA.esc(u.username)}">
          </div>
          <div class="form-grp">
            <label class="form-lbl"><i class="fa-solid fa-lock" style="margin-inline-end:6px;color:var(--c-t4)"></i>${t('password')}</label>
            <input id="p-pw" type="password" class="form-ctrl"
              placeholder="${ILYA.state.lang === 'ar' ? 'اتركه فارغاً للإبقاء على الحالي' : 'Leave blank to keep current'}">
          </div>
          <div class="form-grp">
            <label class="form-lbl"><i class="fa-solid fa-image" style="margin-inline-end:6px;color:var(--c-t4)"></i>${t('pic_url')}</label>
            <input id="p-pic" type="url" class="form-ctrl" value="${ILYA.esc(u.pic || '')}" placeholder="https://...">
          </div>
          <div id="p-msg" style="text-align:center;font-size:.82rem;margin-bottom:10px;display:none"></div>
          <button class="btn btn-primary" id="save-prof">
            <i class="fa-solid fa-floppy-disk"></i> ${t('save')}
          </button>
        </div>

        <div style="text-align:center;font-size:.74rem;color:var(--c-t4)">
          ${t('member_since', u.created_at || '')}
        </div>

        ${this._footer()}
      </div>
    `;

    ILYA.showPage('profile');
    document.getElementById('back-prof')?.addEventListener('click', () => this.show());

    // Live avatar preview
    document.getElementById('p-pic')?.addEventListener('input', e => {
      if (e.target.value) document.getElementById('prof-av').src = e.target.value;
    });

    document.getElementById('save-prof')?.addEventListener('click', () => {
      const name = document.getElementById('p-name')?.value?.trim();
      const user = document.getElementById('p-user')?.value?.trim();
      const pw   = document.getElementById('p-pw')?.value?.trim();
      const pic  = document.getElementById('p-pic')?.value?.trim();
      const msg  = document.getElementById('p-msg');
      const btn  = document.getElementById('save-prof');

      if (!name || !user) { ILYA.toast(ILYA.t('err_fields'), 'error'); return; }
      if (user.length < 4) { ILYA.toast(ILYA.t('err_uname_short'), 'error'); return; }

      // Check username conflict
      const existing = DB.userByUsername(user);
      if (existing && String(existing.id) !== String(ILYA.state.user.id)) {
        ILYA.toast(ILYA.t('err_uname_taken'), 'error'); return;
      }

      const updates = { name, username: user };
      if (pw)  updates.ph  = md5(pw);
      if (pic) updates.pic = pic;

      btn.disabled = true;
      setTimeout(() => {
        DB.updateUser(ILYA.state.user.id, updates);
        const fresh = DB.userById(ILYA.state.user.id);
        ILYA.saveSession(fresh);
        btn.disabled = false;
        msg.textContent = ILYA.t('saved');
        msg.style.color = '#44ff88';
        msg.style.display = 'block';
        ILYA.toast(ILYA.t('saved'), 'success');
        setTimeout(() => msg.style.display = 'none', 3000);
      }, 300);
    });
  },

  // ── Help ─────────────────────────────────────────────
  showHelp() {
    ILYA.registerPageRender('help', () => this.showHelp());
    const t    = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    const faqs = isAr ? [
      ['ما هي منصة ILYA AI؟',          'ILYA AI هي منصتك المتكاملة لخدمات الذكاء الاصطناعي المتقدمة — تقدم 7 نماذج متخصصة لتوليد وتعديل الصور بأعلى جودة ممكنة.'],
      ['كيف أستخدم خدمات الصور؟',      'انتقل لقسم "خدمات AI"، اختر النموذج، أدخل الوصف أو ارفع صورتك، ثم اضغط إرسال. ستصلك النتيجة خلال ثوانٍ.'],
      ['ما الفرق بين النماذج السبعة؟', 'كل نموذج متخصص: توليد نصي، تحويل أنمي، SeedDream، صورة شخصية، Flux MAX القوي، Nano Banana 2 بدقة 2K، وNanoBanana Pro للتعديل.'],
      ['كيف أغير صورة ملفي الشخصي؟',  'اذهب لـ "حسابي"، أدخل رابط الصورة الجديدة في حقل "رابط الصورة"، واضغط حفظ. ستُحدَّث الصورة فوراً.'],
      ['هل يمكن تغيير رقم الهوية؟',    'لا. رقم الهوية (ID) ثابت ومشفر عند إنشاء الحساب ولا يمكن تعديله أبداً.'],
      ['كيف أتواصل مع الدعم الفني؟',   'اذهب لـ "الدعم"، اكتب رسالتك مع إمكانية إرفاق صورتين. سيصلك رد مباشرة داخل المنصة.'],
      ['ما الفرق بين NanoBanana 2 وPro؟', 'Nano Banana 2 للتوليد النصي البسيط بدقة 2K. أما Pro فيدعم أيضاً تعديل الصور الموجودة باستخدام وصف نصي.'],
    ] : [
      ['What is ILYA AI Platform?',      'ILYA AI is your integrated platform for advanced AI services — offering 7 specialized models for generating and editing images at the highest quality.'],
      ['How do I use the AI services?',  'Go to "AI Services", choose your model, enter a description or upload an image, then hit Send. Results arrive in seconds.'],
      ['What\'s the difference between the 7 models?', 'Each model is specialized: text-to-image, anime conversion, SeedDream, personal photos, Flux MAX, Nano Banana 2 in 2K, and NanoBanana Pro for editing.'],
      ['How do I change my profile picture?', 'Go to "My Account", enter the URL of your new picture in the "Profile Picture URL" field, and save.'],
      ['Can I change my ID number?',     'No. Your ID is permanently fixed and encrypted at account creation — it cannot be changed.'],
      ['How do I contact support?',      'Go to "Support", write your message with optional image attachments. You\'ll receive a reply directly inside the platform.'],
      ['Difference between NanoBanana 2 and Pro?', 'Nano Banana 2 is for simple text-to-image in 2K. Pro also supports editing existing images using a text description.'],
    ];

    document.getElementById('page-help').innerHTML = `
      <div class="page-wrap">
        <div class="page-hdr">
          <button class="back-btn" id="back-help">
            <i class="fa-solid fa-arrow-right"></i><i class="fa-solid fa-arrow-left"></i>
          </button>
          <div class="page-title"><i class="fa-solid fa-circle-question" style="margin-inline-end:8px;color:var(--c-neon)"></i>${t('help')}</div>
        </div>

        <div class="glass glass-p glass-red" style="margin-bottom:18px">
          <div style="font-weight:700;margin-bottom:8px;font-size:.95rem">
            <i class="fa-solid fa-robot" style="color:var(--c-neon);margin-inline-end:8px"></i>
            ${isAr ? 'كيف يمكننا مساعدتك؟' : 'How can we help you?'}
          </div>
          <p style="font-size:.83rem;color:var(--c-t2);line-height:1.8">
            ${isAr
              ? 'ستجد هنا إجابات للأسئلة الأكثر شيوعاً. لمزيد من المساعدة يمكنك إرسال تذكرة دعم فني.'
              : 'Find answers to common questions here. For more help, send a support ticket.'}
          </p>
        </div>

        <div class="section-lbl"><i class="fa-solid fa-list-ul"></i> ${isAr ? 'الأسئلة الشائعة' : 'FAQ'}</div>
        ${faqs.map((f, i) => `
          <div class="faq-item" data-faq="${i}">
            <div class="faq-q">
              <span>${f[0]}</span>
              <i class="fa-solid fa-chevron-down"></i>
            </div>
            <div class="faq-a">${f[1]}</div>
          </div>`).join('')}

        ${this._footer()}
      </div>
    `;

    ILYA.showPage('help');
    document.getElementById('back-help')?.addEventListener('click', () => this.show());
    document.querySelectorAll('.faq-item').forEach(item => {
      item.querySelector('.faq-q').addEventListener('click', () => item.classList.toggle('open'));
    });
  },

  // ── Support ──────────────────────────────────────────
  showSupport() {
    ILYA.registerPageRender('support', () => this.showSupport());
    const t    = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';

    document.getElementById('page-support').innerHTML = `
      <div class="page-wrap">
        <div class="page-hdr">
          <button class="back-btn" id="back-sup">
            <i class="fa-solid fa-arrow-right"></i><i class="fa-solid fa-arrow-left"></i>
          </button>
          <div class="page-title"><i class="fa-solid fa-headset" style="margin-inline-end:8px;color:var(--c-neon)"></i>${t('support')}</div>
        </div>

        <!-- New Ticket -->
        <div class="glass glass-p" style="margin-bottom:20px">
          <div style="font-weight:700;margin-bottom:14px;font-size:.9rem">
            <i class="fa-solid fa-paper-plane" style="color:var(--c-neon);margin-inline-end:8px"></i>
            ${isAr ? 'إرسال تذكرة دعم جديدة' : 'Send New Support Ticket'}
          </div>
          <div class="form-grp">
            <label class="form-lbl">${t('your_msg')}</label>
            <textarea id="tk-msg" class="form-ctrl" rows="4" placeholder="${t('your_msg')}" style="resize:vertical"></textarea>
          </div>
          <div class="form-grp">
            <label class="form-lbl">${t('attach')} 1</label>
            <input id="tk-a1" type="url" class="form-ctrl" placeholder="https://...">
          </div>
          <div class="form-grp">
            <label class="form-lbl">${t('attach')} 2</label>
            <input id="tk-a2" type="url" class="form-ctrl" placeholder="https://...">
          </div>
          <div id="tk-status" style="text-align:center;font-size:.82rem;margin-bottom:10px;display:none"></div>
          <button class="btn btn-primary" id="send-tk">
            <i class="fa-solid fa-paper-plane"></i> ${t('send_ticket')}
          </button>
        </div>

        <!-- Past Tickets -->
        <div class="section-lbl"><i class="fa-solid fa-clock-rotate-left"></i> ${isAr ? 'تذاكرك السابقة' : 'Your Tickets'}</div>
        <div id="tk-list"><div class="spinner"></div></div>

        ${this._footer()}
      </div>
    `;

    ILYA.showPage('support');
    document.getElementById('back-sup')?.addEventListener('click', () => this.show());
    document.getElementById('send-tk')?.addEventListener('click', () => this._sendTicket());
    this._loadTickets();
  },

  _sendTicket() {
    const msg  = document.getElementById('tk-msg')?.value?.trim();
    const att1 = document.getElementById('tk-a1')?.value?.trim() || null;
    const att2 = document.getElementById('tk-a2')?.value?.trim() || null;
    const btn  = document.getElementById('send-tk');
    const st   = document.getElementById('tk-status');
    const isAr = ILYA.state.lang === 'ar';

    if (!msg) { ILYA.toast(isAr ? 'الرسالة مطلوبة' : 'Message required', 'error'); return; }
    btn.disabled = true;
    setTimeout(() => {
      DB.addTicket(ILYA.state.user.id, msg, att1, att2);
      btn.disabled = false;
      document.getElementById('tk-msg').value = '';
      document.getElementById('tk-a1').value  = '';
      document.getElementById('tk-a2').value  = '';
      st.textContent = ILYA.t('ticket_sent');
      st.style.color = '#44ff88'; st.style.display = 'block';
      ILYA.toast(ILYA.t('ticket_sent'), 'success');
      this._loadTickets();
      setTimeout(() => st.style.display = 'none', 3000);
    }, 300);
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
          <div style="font-size:.74rem;color:var(--c-t3);flex:1">${(tk.created_at||'').slice(0,16)}</div>
          <span class="ticket-status status-${tk.status}">
            ${tk.status === 'open' ? (isAr ? 'مفتوحة':'Open') : (isAr ? 'تم الرد':'Replied')}
          </span>
        </div>
        <div class="ticket-msg">${ILYA.esc(tk.message)}</div>
        ${tk.attachment1 || tk.attachment2 ? `
          <div class="ticket-attaches">
            ${tk.attachment1 ? `<img src="${tk.attachment1}" class="ticket-attach-img" onclick="ILYA.openLightbox('${tk.attachment1}')" onerror="this.style.display='none'">` : ''}
            ${tk.attachment2 ? `<img src="${tk.attachment2}" class="ticket-attach-img" onclick="ILYA.openLightbox('${tk.attachment2}')" onerror="this.style.display='none'">` : ''}
          </div>` : ''}
        ${tk.admin_reply ? `
          <div class="ticket-reply">
            <strong><i class="fa-solid fa-reply" style="margin-inline-end:6px"></i>${ILYA.t('admin_reply')}</strong>
            ${ILYA.esc(tk.admin_reply)}
          </div>` : ''}
      </div>`).join('');
  },

  // ── Footer helper ────────────────────────────────────
  _footer() {
    const cfg  = ILYA.state.config;
    const t    = k => ILYA.t(k);
    const year = new Date().getFullYear();
    return `
      <div class="page-foot">
        <div>ILYA AI © ${year} — ${t('copyright')}</div>
        <div>
          <a href="${cfg.tg_link || 'https://t.me/swc_t'}" target="_blank">
            <i class="fa-brands fa-telegram"></i> Telegram
          </a>
          &nbsp;·&nbsp;
          <a href="${cfg.dev_site || 'https://black3web.github.io/Blackweb/'}" target="_blank">
            <i class="fa-solid fa-globe"></i> ${t('dev_site_btn')}
          </a>
        </div>
        <div style="margin-top:4px;opacity:.6">
          Powered by ILYA AI Platform · All services reserved
        </div>
      </div>`;
  },
};
