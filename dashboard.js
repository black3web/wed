// ============================================================
//   ILYA AI Platform — Dashboard Module (dashboard.js)
//   Handles: main dashboard, sidebar, profile, help, support
// ============================================================

const ILYADashboard = {

  // ── Main Dashboard ──────────────────────────────────────
  show() {
    const u   = ILYA.state.user;
    const cfg = ILYA.state.config;
    const t   = (k) => ILYA.t(k);
    const isVip   = u && u.role === 'vip';
    const isAdmin = u && u.role === 'admin';

    // VIP gets special page
    if (isVip) { this.showVIP(); return; }

    const welcome = ILYA.state.lang === 'ar'
      ? (cfg.welcome_text_ar || 'أهلاً بك في موقع خدمات ILYA')
      : (cfg.welcome_text_en || 'Welcome to ILYA AI Services');

    const aboutTxt = ILYA.state.lang === 'ar'
      ? (cfg.about_text_ar || '')
      : (cfg.about_text_en || '');

    const page = document.getElementById('page-dashboard');
    page.innerHTML = `
      <div class="page-inner">
        <!-- Welcome Card -->
        <div class="welcome-card">
          <img src="${u?.profile_pic || 'https://iili.io/B04MxcX.md.jpg'}"
               alt="Avatar" class="welcome-avatar"
               onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
          <div class="welcome-text">${welcome}</div>
          <div class="welcome-sub">
            ${ILYA.state.lang === 'ar' ? `مرحباً، ${u?.name || ''}` : `Hello, ${u?.name || ''}`}
          </div>
          ${isAdmin ? `
            <button class="btn-primary" id="admin-open-btn" style="margin-top:16px;background:linear-gradient(135deg,#4a0000,#8B0000,#DC143C)">
              ⚙️ ${t('admin_panel')}
            </button>` : ''}
        </div>

        <!-- About -->
        ${aboutTxt ? `
          <div class="glass-card" style="margin-bottom:24px">
            <p style="font-size:.88rem;color:var(--text-2);line-height:1.8">${aboutTxt}</p>
          </div>` : ''}

        <!-- Services -->
        <div style="font-size:.8rem;color:var(--text-3);margin-bottom:14px;letter-spacing:.05em">
          ${ILYA.state.lang === 'ar' ? '— خدمات المنصة —' : '— Platform Services —'}
        </div>
        <div class="services-grid">
          <div class="service-card" id="srv-ai">
            <div class="service-icon">🎨</div>
            <div class="service-name">${t('ai_services')}</div>
            <div class="service-desc">${ILYA.state.lang === 'ar' ? '5 نماذج ذكاء اصطناعي' : '5 AI Models'}</div>
          </div>
          <div class="service-card" id="srv-support">
            <div class="service-icon">🎫</div>
            <div class="service-name">${t('support')}</div>
            <div class="service-desc">${ILYA.state.lang === 'ar' ? 'نظام تذاكر الدعم' : 'Support Ticket System'}</div>
          </div>
          <div class="service-card" id="srv-profile">
            <div class="service-icon">👤</div>
            <div class="service-name">${t('my_account')}</div>
            <div class="service-desc">${ILYA.state.lang === 'ar' ? 'إدارة ملفك الشخصي' : 'Manage your profile'}</div>
          </div>
          <div class="service-card" id="srv-help">
            <div class="service-icon">❓</div>
            <div class="service-name">${t('help')}</div>
            <div class="service-desc">${ILYA.state.lang === 'ar' ? 'شروحات ومساعدة' : 'Guides & Assistance'}</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="page-footer">
          <div>ILYA AI © ${new Date().getFullYear()} — ${cfg.copyright_text_ar || t('copyright')}</div>
          <div><a href="${cfg.telegram_link || 'https://t.me/swc_t'}" target="_blank">
            ${ILYA.state.lang === 'ar' ? '📢 قناة المبرمج على تيليجرام' : '📢 Developer Telegram Channel'}
          </a></div>
        </div>
      </div>
    `;

    ILYA.showPage('dashboard');

    // Bindings
    document.getElementById('srv-ai')?.addEventListener('click',      () => ILYAAI.showList());
    document.getElementById('srv-support')?.addEventListener('click', () => this.showSupport());
    document.getElementById('srv-profile')?.addEventListener('click', () => this.showProfile());
    document.getElementById('srv-help')?.addEventListener('click',    () => this.showHelp());
    document.getElementById('admin-open-btn')?.addEventListener('click', () => ILYAAdmin.show());
  },

  // ── VIP Interface ─────────────────────────────────────────
  showVIP() {
    const u   = ILYA.state.user;
    const t   = (k) => ILYA.t(k);
    const page = document.getElementById('page-dashboard');
    page.innerHTML = `
      <div class="page-inner">
        <div class="vip-hero">
          <div class="vip-crown">👑</div>
          <div class="vip-title">VIP Member</div>
          <div style="color:rgba(255,215,0,.7);font-size:.85rem;margin-bottom:16px">
            ${ILYA.state.lang === 'ar' ? 'عضو حصري — صلاحيات متقدمة' : 'Exclusive Member — Advanced Privileges'}
          </div>
          <img src="${u?.profile_pic || 'https://iili.io/B04MxcX.md.jpg'}"
               alt="VIP" class="vip-avatar"
               onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
          <div style="font-size:1.2rem;font-weight:700;margin-bottom:6px">${u?.name || ''}</div>
          <div style="font-size:.85rem;color:rgba(255,215,0,.6)">@${u?.username || ''}</div>
        </div>

        <div class="glass-card" style="border-color:rgba(255,215,0,.2);margin-bottom:16px">
          <div style="color:rgba(255,215,0,.9);font-weight:700;margin-bottom:12px;font-size:.95rem">
            ✨ ${ILYA.state.lang === 'ar' ? 'مميزات حسابك الحصري' : 'Your Exclusive Privileges'}
          </div>
          ${['🎨 الوصول الكامل لجميع نماذج الذكاء الاصطناعي',
             '⚡ أولوية في معالجة الطلبات',
             '🔓 ميزات حصرية غير متاحة لعموم المستخدمين',
             '💎 دعم فني مباشر وفوري',
             '🌟 صلاحيات مميزة في النظام'].map(f =>
            `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,215,0,.1);font-size:.85rem;color:var(--text-2)">${f}</div>`
          ).join('')}
        </div>

        <div class="services-grid">
          <div class="service-card" id="vip-ai">
            <div class="service-icon">🎨</div>
            <div class="service-name">${t('ai_services')}</div>
          </div>
          <div class="service-card" id="vip-profile">
            <div class="service-icon">👤</div>
            <div class="service-name">${t('my_account')}</div>
          </div>
          <div class="service-card" id="vip-support">
            <div class="service-icon">🎫</div>
            <div class="service-name">${t('support')}</div>
          </div>
          <div class="service-card" id="vip-help">
            <div class="service-icon">❓</div>
            <div class="service-name">${t('help')}</div>
          </div>
        </div>

        <div class="page-footer">
          <div>ILYA AI © ${new Date().getFullYear()} — جميع الحقوق محفوظة</div>
          <div><a href="${ILYA.state.config.telegram_link || 'https://t.me/swc_t'}" target="_blank">📢 قناة المبرمج</a></div>
        </div>
      </div>
    `;

    ILYA.showPage('dashboard');

    document.getElementById('vip-ai')?.addEventListener('click',      () => ILYAAI.showList());
    document.getElementById('vip-profile')?.addEventListener('click', () => this.showProfile());
    document.getElementById('vip-support')?.addEventListener('click', () => this.showSupport());
    document.getElementById('vip-help')?.addEventListener('click',    () => this.showHelp());
  },

  // ── Sidebar ───────────────────────────────────────────────
  renderSidebar() {
    const u    = ILYA.state.user;
    const t    = (k) => ILYA.t(k);
    const role = u?.role || 'user';
    const badgeCls  = role === 'admin' ? 'badge-admin' : role === 'vip' ? 'badge-vip' : 'badge-user';
    const badgeText = role === 'admin' ? 'Admin' : role === 'vip' ? 'VIP' : 'User';

    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = `
      <button class="sidebar-close" id="sidebar-close-btn">✕</button>

      <div class="sidebar-banner-frame">
        <img src="https://iili.io/B04Wttf.md.jpg" alt="Banner" class="sidebar-banner"
             onerror="this.style.background='linear-gradient(135deg,#3d0000,#0d0000)'"
             loading="lazy">
      </div>

      <div class="sidebar-user-info">
        <img src="${u?.profile_pic || 'https://iili.io/B04MxcX.md.jpg'}"
             alt="Avatar" class="sidebar-avatar"
             onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
        <div>
          <div class="sidebar-name">${u?.name || ''}</div>
          <div class="sidebar-username">@${u?.username || ''}</div>
          <span class="sidebar-role-badge ${badgeCls}">${badgeText}</span>
        </div>
      </div>

      <div class="sidebar-divider"></div>

      <div class="sidebar-menu">
        <button class="btn-glass" id="sb-profile">
          <span class="btn-glass-icon">👤</span>
          <span>${t('my_account')}</span>
        </button>
        <button class="btn-glass" id="sb-ai">
          <span class="btn-glass-icon">🎨</span>
          <span>${t('ai_services')}</span>
        </button>
        <button class="btn-glass" id="sb-help">
          <span class="btn-glass-icon">❓</span>
          <span>${t('help')}</span>
        </button>
        <button class="btn-glass" id="sb-support">
          <span class="btn-glass-icon">🎫</span>
          <span>${t('support')}</span>
        </button>
        ${role === 'admin' ? `
        <button class="btn-glass" id="sb-admin" style="border-color:rgba(220,20,60,.3);color:var(--red-bright)">
          <span class="btn-glass-icon">⚙️</span>
          <span>${t('admin_panel')}</span>
        </button>` : ''}
        <div class="sidebar-divider"></div>
        <button class="btn-glass" id="sb-logout" style="color:rgba(255,100,100,.8)">
          <span class="btn-glass-icon">🚪</span>
          <span>${t('logout')}</span>
        </button>
      </div>
    `;

    document.getElementById('sidebar-close-btn')?.addEventListener('click', () => ILYA.closeSidebar());

    const go = (fn) => { ILYA.closeSidebar(); setTimeout(fn, 350); };

    document.getElementById('sb-profile')?.addEventListener('click', () => go(() => this.showProfile()));
    document.getElementById('sb-ai')?.addEventListener('click',      () => go(() => ILYAAI.showList()));
    document.getElementById('sb-help')?.addEventListener('click',    () => go(() => this.showHelp()));
    document.getElementById('sb-support')?.addEventListener('click', () => go(() => this.showSupport()));
    document.getElementById('sb-admin')?.addEventListener('click',   () => go(() => ILYAAdmin.show()));
    document.getElementById('sb-logout')?.addEventListener('click',  () => ILYAAuth.logout());
  },

  // ── Profile Page ──────────────────────────────────────────
  async showProfile() {
    const u = ILYA.state.user;
    const t = (k) => ILYA.t(k);

    // Fetch fresh profile
    const res = await ILYA.api('/user/profile');
    const profile = res.ok ? res.data : u;

    const page = document.getElementById('page-profile');
    page.innerHTML = `
      <div class="page-inner">
        <div class="page-header">
          <button class="page-header-back" id="back-from-profile">←</button>
          <div class="page-title">${t('my_account')}</div>
        </div>

        <div style="text-align:center;margin-bottom:24px">
          <div class="profile-avatar-wrap">
            <img src="${profile.profile_pic || 'https://iili.io/B04MxcX.md.jpg'}"
                 alt="Avatar" class="profile-avatar" id="profile-avatar-img"
                 onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
          </div>
        </div>

        <div class="profile-id-badge">
          <span>🔑 ${t('my_id')}:</span>
          <span class="profile-id-num">${profile.id}</span>
          <span style="font-size:.7rem;color:var(--text-3);margin-right:auto">
            ${ILYA.state.lang === 'ar' ? '(غير قابل للتعديل)' : '(Cannot be changed)'}
          </span>
        </div>

        <div class="glass-card">
          <div class="form-group">
            <label class="form-label">${t('name')}</label>
            <input type="text" id="prof-name" class="form-input" value="${this._esc(profile.name)}">
          </div>
          <div class="form-group">
            <label class="form-label">${t('username')}</label>
            <input type="text" id="prof-username" class="form-input" value="${this._esc(profile.username)}">
          </div>
          <div class="form-group">
            <label class="form-label">${t('password')}</label>
            <input type="password" id="prof-password" class="form-input"
              placeholder="${ILYA.state.lang === 'ar' ? 'اتركه فارغاً لعدم التغيير' : 'Leave blank to keep current'}">
          </div>
          <div class="form-group">
            <label class="form-label">${t('profile_pic_url')}</label>
            <input type="url" id="prof-pic" class="form-input"
              value="${this._esc(profile.profile_pic)}"
              placeholder="https://...">
          </div>
          <div id="prof-msg" style="text-align:center;font-size:.85rem;margin-bottom:12px;display:none"></div>
          <button class="btn-primary" id="save-profile-btn">${t('save')}</button>
        </div>

        <div style="margin-top:20px;text-align:center;font-size:.75rem;color:var(--text-3)">
          ${ILYA.state.lang === 'ar' ? `عضو منذ: ${profile.created_at?.slice(0,10) || ''}` : `Member since: ${profile.created_at?.slice(0,10) || ''}`}
        </div>
      </div>
    `;

    ILYA.showPage('profile');

    // Update avatar preview
    document.getElementById('prof-pic').addEventListener('input', (e) => {
      const img = document.getElementById('profile-avatar-img');
      if (e.target.value) img.src = e.target.value;
    });

    document.getElementById('back-from-profile').addEventListener('click', () => this.show());

    document.getElementById('save-profile-btn').addEventListener('click', async () => {
      const btn  = document.getElementById('save-profile-btn');
      const msg  = document.getElementById('prof-msg');
      const data = {
        name:        document.getElementById('prof-name').value.trim(),
        username:    document.getElementById('prof-username').value.trim(),
        profile_pic: document.getElementById('prof-pic').value.trim(),
      };
      const pw = document.getElementById('prof-password').value.trim();
      if (pw) data.password = pw;

      btn.disabled = true;
      btn.textContent = ILYA.state.lang === 'ar' ? 'جاري الحفظ...' : 'Saving...';

      const res = await ILYA.api('/user/profile', 'PUT', data);
      btn.disabled = false;
      btn.textContent = t('save');

      if (res.ok) {
        // Update local state
        ILYA.state.user = { ...ILYA.state.user, ...data };
        localStorage.setItem('ilya_user', JSON.stringify(ILYA.state.user));
        msg.textContent = t('saved');
        msg.style.color = '#44ff88';
        msg.style.display = 'block';
        ILYA.toast(t('saved'), 'success');
        setTimeout(() => { msg.style.display = 'none'; }, 3000);
      } else {
        msg.textContent = res.data.error || (ILYA.state.lang === 'ar' ? 'فشل الحفظ' : 'Save failed');
        msg.style.color = '#ff6688';
        msg.style.display = 'block';
      }
    });
  },

  // ── Help Page ─────────────────────────────────────────────
  showHelp() {
    const t    = (k) => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    const faqs = isAr ? [
      { q: 'ما هي منصة ILYA AI؟', a: 'منصة ILYA AI هي وجهتك المتكاملة لخدمات الذكاء الاصطناعي المتقدمة، تقدم 5 نماذج متخصصة لتوليد الصور.' },
      { q: 'كيف أستخدم خدمات توليد الصور؟', a: 'انتقل إلى قسم "خدمات AI"، اختر النموذج المناسب، أدخل الوصف أو ارفع صورتك، ثم اضغط إرسال.' },
      { q: 'هل يمكنني تغيير صورة ملفي الشخصي؟', a: 'نعم، انتقل إلى "حسابي"، أدخل رابط الصورة الجديدة في حقل صورة الملف الشخصي، ثم احفظ التغييرات.' },
      { q: 'كيف أتواصل مع الدعم الفني؟', a: 'انتقل إلى قسم "الدعم"، أرسل رسالتك مع إمكانية إرفاق صورتين كحد أقصى. سيرد عليك الفريق في أقرب وقت.' },
      { q: 'هل رقم هويتي يمكن تغييره؟', a: 'لا، رقم الهوية (ID) ثابت ومشفر عند إنشاء الحساب ولا يمكن تغييره.' },
      { q: 'ما الفرق بين النماذج الخمسة؟', a: 'كل نموذج متخصص: التوليد النصي، تحويل الصور لأنمي، SeedDream المتطور، الصور الشخصية الاحترافية، وFlux MAX الأقوى.' },
    ] : [
      { q: 'What is ILYA AI Platform?', a: 'ILYA AI is your integrated destination for advanced AI services, offering 5 specialized image generation models.' },
      { q: 'How do I use the AI services?', a: 'Go to "AI Services", choose your model, enter a description or upload an image, then hit send.' },
      { q: 'Can I change my profile picture?', a: 'Yes! Go to "My Account", enter the URL of your new picture in the profile picture field, and save.' },
      { q: 'How do I contact support?', a: 'Go to the "Support" section and send your message with up to 2 image attachments. The team will reply soon.' },
      { q: 'Can my ID number be changed?', a: 'No. Your ID is fixed and unique — generated at registration and cannot be modified.' },
      { q: 'What is the difference between the 5 models?', a: 'Each model is specialized: text-to-image, image-to-anime, SeedDream, personal photo maker, and the powerful Flux MAX.' },
    ];

    const page = document.getElementById('page-help');
    page.innerHTML = `
      <div class="page-inner">
        <div class="page-header">
          <button class="page-header-back" id="back-from-help">←</button>
          <div class="page-title">${t('help')}</div>
        </div>
        <div class="glass-card" style="margin-bottom:20px;border-color:var(--glass-red)">
          <div style="font-size:1rem;font-weight:700;margin-bottom:8px">
            ${isAr ? '🤖 كيف يمكننا مساعدتك؟' : '🤖 How can we help you?'}
          </div>
          <div style="font-size:.85rem;color:var(--text-2);line-height:1.7">
            ${isAr
              ? 'هذه صفحة المساعدة الخاصة بمنصة ILYA AI. ستجد هنا إجابات لأكثر الأسئلة شيوعاً. لمزيد من المساعدة، يمكنك التواصل مع الدعم الفني.'
              : 'This is the ILYA AI help page. Find answers to common questions here. For more help, contact our support team.'}
          </div>
        </div>
        <div style="font-size:.8rem;color:var(--text-3);margin-bottom:14px;letter-spacing:.05em">
          ${isAr ? '— الأسئلة الشائعة —' : '— Frequently Asked Questions —'}
        </div>
        ${faqs.map((faq, i) => `
          <div class="faq-item" data-faq="${i}">
            <div class="faq-q">
              <span>${faq.q}</span>
              <span class="faq-arrow">⌄</span>
            </div>
            <div class="faq-a">${faq.a}</div>
          </div>
        `).join('')}
      </div>
    `;

    ILYA.showPage('help');

    document.getElementById('back-from-help').addEventListener('click', () => this.show());

    document.querySelectorAll('.faq-item').forEach(item => {
      item.querySelector('.faq-q').addEventListener('click', () => {
        item.classList.toggle('open');
      });
    });
  },

  // ── Support Page ──────────────────────────────────────────
  async showSupport() {
    const t    = (k) => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';

    const page = document.getElementById('page-support');
    page.innerHTML = `
      <div class="page-inner">
        <div class="page-header">
          <button class="page-header-back" id="back-from-support">←</button>
          <div class="page-title">${t('support')}</div>
        </div>

        <!-- Send Ticket -->
        <div class="glass-card" style="margin-bottom:24px">
          <div style="font-weight:700;margin-bottom:16px;font-size:.95rem">
            ${isAr ? '📩 إرسال تذكرة دعم جديدة' : '📩 Send New Support Ticket'}
          </div>
          <div class="form-group">
            <label class="form-label">${t('your_message')}</label>
            <textarea id="ticket-msg" class="form-input" rows="4"
              placeholder="${t('your_message')}" style="resize:vertical"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">${t('attach_img')} 1</label>
            <input type="url" id="ticket-att1" class="form-input"
              placeholder="https://... (${isAr ? 'اختياري' : 'optional'})">
          </div>
          <div class="form-group">
            <label class="form-label">${t('attach_img')} 2</label>
            <input type="url" id="ticket-att2" class="form-input"
              placeholder="https://... (${isAr ? 'اختياري' : 'optional'})">
          </div>
          <div id="ticket-status" style="text-align:center;font-size:.85rem;margin-bottom:12px;display:none"></div>
          <button class="btn-primary" id="send-ticket-btn">${t('send_ticket')}</button>
        </div>

        <!-- Previous Tickets -->
        <div style="font-size:.8rem;color:var(--text-3);margin-bottom:14px;letter-spacing:.05em">
          ${isAr ? '— تذاكرك السابقة —' : '— Your Tickets —'}
        </div>
        <div id="tickets-list">
          <div class="spinner"></div>
        </div>
      </div>
    `;

    ILYA.showPage('support');

    document.getElementById('back-from-support').addEventListener('click', () => this.show());

    document.getElementById('send-ticket-btn').addEventListener('click', async () => {
      const msg  = document.getElementById('ticket-msg').value.trim();
      const att1 = document.getElementById('ticket-att1').value.trim() || null;
      const att2 = document.getElementById('ticket-att2').value.trim() || null;
      const btn  = document.getElementById('send-ticket-btn');
      const st   = document.getElementById('ticket-status');

      if (!msg) {
        st.textContent = isAr ? 'الرسالة مطلوبة' : 'Message is required';
        st.style.color = '#ff6688'; st.style.display = 'block'; return;
      }

      btn.disabled = true;
      btn.textContent = isAr ? 'جاري الإرسال...' : 'Sending...';

      const res = await ILYA.api('/support/ticket', 'POST',
        { message: msg, attachment1: att1, attachment2: att2 });

      btn.disabled = false;
      btn.textContent = t('send_ticket');

      if (res.ok) {
        st.textContent = t('ticket_sent');
        st.style.color = '#44ff88'; st.style.display = 'block';
        document.getElementById('ticket-msg').value  = '';
        document.getElementById('ticket-att1').value = '';
        document.getElementById('ticket-att2').value = '';
        ILYA.toast(t('ticket_sent'), 'success');
        this._loadTickets();
      } else {
        st.textContent = res.data.error || (isAr ? 'فشل الإرسال' : 'Send failed');
        st.style.color = '#ff6688'; st.style.display = 'block';
      }
    });

    this._loadTickets();
  },

  async _loadTickets() {
    const list = document.getElementById('tickets-list');
    if (!list) return;
    const isAr = ILYA.state.lang === 'ar';

    const res = await ILYA.api('/support/tickets');
    if (!res.ok || !res.data.length) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🎫</div>
          <div class="empty-text">${ILYA.t('no_tickets')}</div>
        </div>`;
      return;
    }

    list.innerHTML = res.data.map(ticket => `
      <div class="ticket-card">
        <div class="ticket-header">
          <div>
            <div style="font-size:.75rem;color:var(--text-3)">${ticket.created_at?.slice(0,16) || ''}</div>
          </div>
          <span class="ticket-status status-${ticket.status}">
            ${ticket.status === 'open' ? (isAr ? 'مفتوحة' : 'Open') : (isAr ? 'تم الرد' : 'Replied')}
          </span>
        </div>
        <div class="ticket-msg">${this._esc(ticket.message)}</div>
        ${ticket.attachment1 || ticket.attachment2 ? `
          <div class="ticket-attach">
            ${ticket.attachment1 ? `<img src="${ticket.attachment1}" alt="Attachment" onclick="ILYA.openLightbox('${ticket.attachment1}')">` : ''}
            ${ticket.attachment2 ? `<img src="${ticket.attachment2}" alt="Attachment" onclick="ILYA.openLightbox('${ticket.attachment2}')">` : ''}
          </div>` : ''}
        ${ticket.admin_reply ? `
          <div class="ticket-reply">
            <strong>${ILYA.t('reply_from_admin')}:</strong><br>
            ${this._esc(ticket.admin_reply)}
          </div>` : ''}
      </div>
    `).join('');
  },

  _esc(str) {
    return String(str || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
};
