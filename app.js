// ============================================================
//   ILYA AI Platform — Core App (app.js)
//   Handles: config, state, API calls, router, translations
// ============================================================

// ── Configuration ────────────────────────────────────────────
const ILYA = {
  // ⚠️  Update API_BASE after deploying backend to wispbyte.com
  // Example: 'https://yourdomain.wispbyte.com/api'
  API_BASE: 'https://ilya.com/',

  state: {
    user:       null,
    token:      null,
    lang:       'ar',
    page:       null,
    config:     {},
    modelId:    null,
    chatHistory:[],
    sidebarOpen:false,
  },

  // ── AI Models Definition ─────────────────────────────────
  AI_MODELS: [
    {
      id: 'text_to_image',
      nameAr: 'توليد صورة من نص',
      nameEn: 'Text to Image',
      descAr: 'حوّل وصفك النصي إلى صورة فائقة الجودة — يدعم 4 نسبُ أبعاد و4 مستويات جودة',
      descEn: 'Transform your text description into a high-quality image — supports 4 aspect ratios and 4 quality levels',
      img:    'https://iili.io/BhMseEB.md.jpg',
      type:   'text',
      configKey: 'text_to_image_enabled',
      params: {
        ratios:   ['1:1','9:16','9:21','3:4','16:9','4:3'],
        upscales: [{ val:'1',lbl:'HD' },{ val:'2',lbl:'HD+' },{ val:'3',lbl:'Full HD' },{ val:'4',lbl:'2K' }],
        counts:   ['1','2','3'],
      }
    },
    {
      id: 'image_to_anime',
      nameAr: 'تحويل صورة إلى أنمي',
      nameEn: 'Image to Anime',
      descAr: 'حوّل أي صورة إلى 14 نمطاً مختلفاً من أنماط الأنمي والكاريكاتير',
      descEn: 'Convert any image into 14 different anime and cartoon styles',
      img:    'https://iili.io/BhVE2F1.md.jpg',
      type:   'image',
      configKey: 'image_to_anime_enabled',
      params: {
        ratios:  ['auto','1:1','1:2','2:1','2:3','3:2','9:16','16:9'],
        genders: ['Male','Female'],
        styles:  ['dc_comics','claymation','cyberpunk','pencil_anime','pop_art','cartoon_glamour','bw_comic','manga','bright_realistic','voxel','fantasy_anime','abstract_painting','cartoon_poster','cubist'],
      }
    },
    {
      id: 'seedream',
      nameAr: 'SeedDream 4.5',
      nameEn: 'SeedDream 4.5',
      descAr: 'نموذج توليد متقدم بـ 13 نمطاً فنياً مختلفاً — من الواقعية إلى الجيبلي',
      descEn: 'Advanced generation model with 13 artistic styles — from realistic to Ghibli',
      img:    'https://iili.io/BhVbVRI.md.jpg',
      type:   'text',
      configKey: 'seedream_enabled',
      params: {
        ratios: ['square','portrait','landscape','classic','ultrawide'],
        styles: ['none','photo','fantasy','portrait','anime','landscape','scifi','cinematic','oil','pixel','watercolor','ghibli','vintage'],
      }
    },
    {
      id: 'image_to_personal',
      nameAr: 'صورة شخصية احترافية',
      nameEn: 'Personal Photo Maker',
      descAr: 'حوّل صورتك إلى صورة شخصية احترافية بـ 15 نمطاً متنوعاً',
      descEn: 'Transform your photo into a professional portrait with 15 different styles',
      img:    'https://iili.io/BhWuQt9.md.jpg',
      type:   'image',
      configKey: 'image_to_personal_enabled',
      params: {
        ratios:  ['1:1','2:1','3:2','9:16','16:9'],
        genders: ['male','female'],
        styles:  ['apple_executive','apple_founder','linkedin_exec','modern_fashion','high_fashion','urban_trend','minimalist','lifestyle','studio_photo','social_media','street_style','luxury_fashion','natural_light','christmas','graduation'],
      }
    },
    {
      id: 'flux_max',
      nameAr: 'Flux MAX',
      nameEn: 'Flux MAX',
      descAr: 'أقوى نماذج التوليد — صور بجودة استثنائية بـ 11 نسبة أبعاد مختلفة',
      descEn: 'The most powerful generation model — exceptional quality with 11 different aspect ratios',
      img:    'https://iili.io/BhWVPja.md.jpg',
      type:   'text',
      configKey: 'flux_max_enabled',
      params: {
        ratios: ['1:1','1:2','2:1','2:3','3:2','3:4','4:3','4:5','5:4','9:16','16:9'],
      }
    },
  ],

  // ── Translations ─────────────────────────────────────────
  T: {
    ar: {
      app_name: 'ILYA AI',
      loading: 'جاري التحميل...',
      welcome_auth: 'مرحباً بك',
      have_account: 'لدي حساب',
      create_account: 'إنشاء حساب',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      name: 'الاسم الكامل',
      username: 'معرف المستخدم',
      password: 'كلمة المرور',
      confirm_password: 'تأكيد كلمة المرور',
      username_hint: '4 أحرف على الأقل',
      ai_services: 'خدمات الذكاء الاصطناعي',
      my_account: 'حسابي',
      help: 'المساعدة',
      support: 'الدعم',
      admin_panel: 'لوحة التحكم',
      logout: 'تسجيل الخروج',
      back: '→',
      send: 'إرسال',
      generating: 'جاري التوليد...',
      error_gen: 'حدث خطأ أثناء التوليد. يرجى المحاولة مجدداً.',
      write_desc: 'اكتب وصفاً تفصيلياً...',
      image_url: 'رابط الصورة (URL)',
      ratio: 'نسبة الأبعاد',
      quality: 'الجودة',
      style: 'النمط',
      gender: 'الجنس',
      count: 'عدد الصور',
      save: 'حفظ التعديلات',
      saved: 'تم الحفظ بنجاح ✓',
      my_id: 'رقم الهوية',
      profile_pic_url: 'رابط صورة الملف الشخصي',
      change_pic: 'تغيير الصورة',
      edit_profile: 'تعديل الملف الشخصي',
      send_ticket: 'إرسال التذكرة',
      your_message: 'رسالتك...',
      attach_img: 'إرفاق صورة (اختياري)',
      no_tickets: 'لا توجد تذاكر دعم',
      ticket_sent: 'تم إرسال تذكرة الدعم بنجاح',
      reply_from_admin: 'رد الإدارة',
      stats: 'الإحصائيات',
      users_mgmt: 'المستخدمون',
      banned_list: 'المحظورون',
      support_inbox: 'صندوق الدعم',
      system_config: 'إعدادات النظام',
      activity_log: 'سجل النشاط',
      total_users: 'إجمالي المستخدمين',
      total_visitors: 'الزوار',
      total_services: 'طلبات AI',
      total_tickets: 'تذاكر الدعم',
      ban_temp: 'حظر مؤقت',
      ban_perm: 'حظر نهائي',
      unban: 'رفع الحظر',
      banned: 'محظور',
      send_reply: 'إرسال الرد',
      your_reply: 'اكتب ردك...',
      copyright: 'جميع الحقوق محفوظة',
      select_model: 'اختر النموذج',
      result_ready: 'النتيجة جاهزة!',
      download: 'تحميل',
      open_link: 'فتح الرابط',
    },
    en: {
      app_name: 'ILYA AI',
      loading: 'Loading...',
      welcome_auth: 'Welcome',
      have_account: 'I have an account',
      create_account: 'Create Account',
      login: 'Login',
      register: 'Create Account',
      name: 'Full Name',
      username: 'Username',
      password: 'Password',
      confirm_password: 'Confirm Password',
      username_hint: 'At least 4 characters',
      ai_services: 'AI Services',
      my_account: 'My Account',
      help: 'Help',
      support: 'Support',
      admin_panel: 'Admin Panel',
      logout: 'Logout',
      back: '←',
      send: 'Send',
      generating: 'Generating...',
      error_gen: 'An error occurred during generation. Please try again.',
      write_desc: 'Write a detailed description...',
      image_url: 'Image URL',
      ratio: 'Aspect Ratio',
      quality: 'Quality',
      style: 'Style',
      gender: 'Gender',
      count: 'Count',
      save: 'Save Changes',
      saved: 'Saved Successfully ✓',
      my_id: 'Your ID',
      profile_pic_url: 'Profile Picture URL',
      change_pic: 'Change Picture',
      edit_profile: 'Edit Profile',
      send_ticket: 'Send Ticket',
      your_message: 'Your message...',
      attach_img: 'Attach image (optional)',
      no_tickets: 'No support tickets',
      ticket_sent: 'Support ticket sent successfully',
      reply_from_admin: 'Admin Reply',
      stats: 'Statistics',
      users_mgmt: 'Users',
      banned_list: 'Banned',
      support_inbox: 'Support',
      system_config: 'System Config',
      activity_log: 'Activity Log',
      total_users: 'Total Users',
      total_visitors: 'Visitors',
      total_services: 'AI Requests',
      total_tickets: 'Support Tickets',
      ban_temp: 'Temp Ban',
      ban_perm: 'Permanent Ban',
      unban: 'Unban',
      banned: 'Banned',
      send_reply: 'Send Reply',
      your_reply: 'Write your reply...',
      copyright: 'All Rights Reserved',
      select_model: 'Choose Model',
      result_ready: 'Result Ready!',
      download: 'Download',
      open_link: 'Open Link',
    }
  },

  // ── Translation Helper ───────────────────────────────────
  t(key) {
    return this.T[this.state.lang][key] || key;
  },

  // ── API Helper ───────────────────────────────────────────
  async api(endpoint, method = 'GET', body = null) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (this.state.token) {
      opts.headers['Authorization'] = `Bearer ${this.state.token}`;
    }
    if (body) opts.body = JSON.stringify(body);
    try {
      const res  = await fetch(this.API_BASE + endpoint, opts);
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      console.error('API Error:', err);
      return { ok: false, status: 0, data: { error: 'Network error' } };
    }
  },

  // ── Session Management ───────────────────────────────────
  saveSession(token, user) {
    this.state.token = token;
    this.state.user  = user;
    localStorage.setItem('ilya_token', token);
    localStorage.setItem('ilya_user',  JSON.stringify(user));
  },

  clearSession() {
    this.state.token = null;
    this.state.user  = null;
    localStorage.removeItem('ilya_token');
    localStorage.removeItem('ilya_user');
  },

  getSavedToken() {
    return localStorage.getItem('ilya_token');
  },

  getSavedUser() {
    const u = localStorage.getItem('ilya_user');
    return u ? JSON.parse(u) : null;
  },

  // ── Toast Notifications ──────────────────────────────────
  toast(msg, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), duration);
  },

  // ── Lightbox ─────────────────────────────────────────────
  openLightbox(src) {
    const lb = document.getElementById('lightbox');
    lb.querySelector('img').src = src;
    lb.classList.add('open');
  },

  closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
  },

  // ── Language Toggle ──────────────────────────────────────
  toggleLang() {
    this.state.lang = this.state.lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('ilya_lang', this.state.lang);
    document.documentElement.lang = this.state.lang;
    document.documentElement.dir  = this.state.lang === 'ar' ? 'rtl' : 'ltr';
    const btn = document.getElementById('lang-btn');
    if (btn) btn.textContent = this.state.lang === 'ar' ? '🌐 EN' : '🌐 AR';
    // Re-render current page
    if (this.state.page) this.showPage(this.state.page, true);
  },

  // ── Router ───────────────────────────────────────────────
  showPage(pageId, force = false) {
    if (this.state.page === pageId && !force) return;
    document.querySelectorAll('.page').forEach(p => {
      p.classList.remove('active');
      p.classList.add('hidden');
    });
    const page = document.getElementById('page-' + pageId);
    if (!page) return;
    page.classList.remove('hidden');
    setTimeout(() => page.classList.add('active'), 10);
    this.state.page = pageId;
    page.scrollTop = 0;

    // Show/hide nav
    const nav  = document.getElementById('main-nav');
    const noNav = ['auth'];
    if (noNav.includes(pageId)) {
      nav.classList.add('hidden');
    } else {
      nav.classList.remove('hidden');
    }
  },

  // ── Sidebar ──────────────────────────────────────────────
  openSidebar() {
    this.state.sidebarOpen = true;
    document.getElementById('sidebar-overlay').classList.add('open');
    ILYADashboard.renderSidebar();
  },

  closeSidebar() {
    this.state.sidebarOpen = false;
    document.getElementById('sidebar-overlay').classList.remove('open');
  },

  // ── Log Activity ─────────────────────────────────────────
  async logActivity(service, details, resultUrl) {
    if (!this.state.token) return;
    await this.api('/activity/log', 'POST', { service, details, result_url: resultUrl });
  },

  // ── Bootstrap ────────────────────────────────────────────
  async init() {
    // Restore language
    const savedLang = localStorage.getItem('ilya_lang') || 'ar';
    this.state.lang = savedLang;
    document.documentElement.lang = savedLang;
    document.documentElement.dir  = savedLang === 'ar' ? 'rtl' : 'ltr';
    const lbtn = document.getElementById('lang-btn');
    if (lbtn) lbtn.textContent = savedLang === 'ar' ? '🌐 EN' : '🌐 AR';

    // Load platform config
    const cfgRes = await this.api('/config');
    if (cfgRes.ok) this.state.config = cfgRes.data;

    // Restore session
    const token = this.getSavedToken();
    if (token) {
      const res = await this.api('/auth/validate');
      if (res.ok && res.data.valid) {
        this.state.token = token;
        this.state.user  = { ...res.data.user, ...this.getSavedUser() };
        // Sync fresh user data
        localStorage.setItem('ilya_user', JSON.stringify(this.state.user));
        ILYADashboard.show();
        return;
      } else {
        this.clearSession();
      }
    }
    // No valid session → auth
    ILYAAuth.show();
  },
};

// ── Preloader + App Start ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  const fill      = document.getElementById('lightning-fill');
  const bolt      = document.getElementById('lightning-bolt');
  const app       = document.getElementById('app');
  let   progress  = 0;

  // Smoke effect on bolt
  function spawnSmoke() {
    if (!fill) return;
    const rect = fill.getBoundingClientRect();
    const smoke = document.createElement('div');
    smoke.className = 'smoke-particle';
    smoke.style.cssText = `
      width:  ${6 + Math.random() * 10}px;
      height: ${6 + Math.random() * 10}px;
      left:   ${fill.offsetWidth - 5}px;
    `;
    fill.parentElement.appendChild(smoke);
    setTimeout(() => smoke.remove(), 1000);
  }

  const interval = setInterval(() => {
    progress += Math.random() * 3.5 + 1;
    if (progress >= 100) { progress = 100; clearInterval(interval); }
    if (fill) fill.style.width = progress + '%';
    if (bolt) bolt.style.left  = `calc(${progress}% - 12px)`;
    if (progress < 100) spawnSmoke();
  }, 50);

  // Show app after 5 seconds
  setTimeout(() => {
    clearInterval(interval);
    if (fill) fill.style.width = '100%';
    preloader.style.transition = 'opacity .6s ease';
    preloader.style.opacity    = '0';
    setTimeout(() => {
      preloader.style.display = 'none';
      app.style.display       = 'block';
      app.style.opacity       = '0';
      app.style.transition    = 'opacity .5s ease';
      setTimeout(() => { app.style.opacity = '1'; }, 10);
      ILYA.init();
    }, 600);
  }, 5000);

  // Lightbox close
  document.getElementById('lightbox').addEventListener('click', () => ILYA.closeLightbox());

  // Sidebar overlay click
  document.getElementById('sidebar-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('sidebar-overlay')) ILYA.closeSidebar();
  });

  // Lang button
  document.getElementById('lang-btn').addEventListener('click', () => ILYA.toggleLang());

  // Nav items
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => {
      const target = el.dataset.nav;
      if (target === 'home')    ILYADashboard.show();
      if (target === 'ai')      ILYAAI.showList();
      if (target === 'profile') ILYADashboard.showProfile();
      if (target === 'sidebar') ILYA.openSidebar();
    });
  });
});
