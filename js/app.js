/* ═══════════════════════════════════════
   ILYA — Main App Controller
   ═══════════════════════════════════════ */

// ─── GLOBAL CONFIG ───
window.ILYA_CONFIG = {
  backend: 'https://ilya-api.wispbyte.com',
  version: '1.0.0'
};

// ─── CUSTOMIZATION ───
const CUSTOM_KEY = 'ilya_custom';
function getCustom() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_KEY)) || {}; }
  catch { return {}; }
}
function saveCustom(obj) { localStorage.setItem(CUSTOM_KEY, JSON.stringify(obj)); }

// ─── SERVICE TOGGLE ───
const SERVICES_KEY = 'ilya_services';
function getServices() {
  try {
    return JSON.parse(localStorage.getItem(SERVICES_KEY)) || { chat:true, image:true, video:true };
  } catch { return { chat:true, image:true, video:true }; }
}

// ─── UI HELPERS ───
const UI = {
  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + id);
    if (el) el.classList.add('active');
  },

  toast(msg, type = '') {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  },

  showModal(title, bodyHTML, actions = []) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    const acts = document.getElementById('modal-actions');
    acts.innerHTML = '';
    for (const a of actions) {
      const btn = document.createElement('button');
      btn.className = 'glass-btn ' + (a.cls || 'ghost-btn');
      btn.textContent = a.label;
      btn.onclick = () => { a.fn(); UI.closeModal(); };
      acts.appendChild(btn);
    }
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('hidden');
    // stop propagation on box
    overlay.querySelector('.modal-box').onclick = e => e.stopPropagation();
  },

  closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
  },

  editField(field) {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const labels = { name:'الاسم', username:'اسم المستخدم', password:'كلمة المرور الجديدة' };
    const currentVal = field === 'password' ? '' : user[field] || '';

    UI.showModal('تعديل ' + labels[field], `
      <div class="input-group">
        <input type="${field === 'password' ? 'password' : 'text'}" 
               id="edit-field-input" 
               class="glass-input" 
               value="${currentVal}"
               placeholder="${labels[field]}"
               dir="${field === 'username' ? 'ltr' : 'rtl'}">
        <div class="input-line"></div>
      </div>
      <div id="edit-field-error" class="auth-error"></div>
    `, [
      {
        label: 'حفظ', cls: 'primary-btn', fn: () => {
          const val = document.getElementById('edit-field-input').value.trim();
          const err = document.getElementById('edit-field-error');
          if (!val) { err.textContent = 'لا يمكن الترك فارغاً'; return; }
          if (field === 'username' && val.length < 4) { err.textContent = '4 أحرف على الأقل'; return; }
          if (field === 'username' && !/^[a-zA-Z0-9_]+$/.test(val)) { err.textContent = 'أحرف وأرقام فقط'; return; }
          if (field === 'password' && val.length < 6) { err.textContent = '6 أحرف على الأقل'; return; }

          // Check username uniqueness
          if (field === 'username') {
            const users = Auth.getUsers();
            if (users.find(u => u.username.toLowerCase() === val.toLowerCase() && u.id !== user.id)) {
              err.textContent = 'اسم المستخدم مستخدم'; return;
            }
          }

          const changes = {};
          if (field === 'password') {
            changes.password = Auth.md5(val);
          } else {
            changes[field] = val;
          }
          Auth.updateUser(user.id, changes);
          App.refreshAccountPage();
          UI.toast('تم الحفظ بنجاح', 'success');
        }
      },
      { label: 'إلغاء', cls: 'ghost-btn', fn: () => {} }
    ]);
  },

  saveAccount() {
    UI.toast('استخدم النقر على الحقل للتعديل', '');
  },

  handleSupportAttach(e) {
    const files = Array.from(e.target.files).slice(0, 2);
    const previews = document.getElementById('support-previews');
    const count = document.getElementById('attach-count');
    previews.innerHTML = '';
    for (const f of files) {
      const img = document.createElement('img');
      img.className = 'attach-preview';
      img.src = URL.createObjectURL(f);
      previews.appendChild(img);
    }
    count.textContent = `${files.length} صورة مرفقة`;
    UI._supportAttachFiles = files;
  },

  async sendSupport() {
    const msg = document.getElementById('support-msg').value.trim();
    if (!msg) { UI.toast('الرسالة فارغة', 'error'); return; }

    const user = Auth.getCurrentUser();
    const MSGS_KEY = 'ilya_support_msgs';
    let msgs = [];
    try { msgs = JSON.parse(localStorage.getItem(MSGS_KEY)) || []; } catch {}

    const attachments = [];
    if (UI._supportAttachFiles) {
      for (const f of UI._supportAttachFiles) {
        const dataUrl = await fileToDataURL(f);
        attachments.push(dataUrl);
      }
    }

    const newMsg = {
      id: Date.now(),
      userId: user?.id,
      userName: user?.name || 'مجهول',
      userUsername: user?.username || '—',
      body: msg,
      attachments,
      sentAt: new Date().toISOString(),
      read: false,
      replies: []
    };
    msgs.push(newMsg);
    localStorage.setItem(MSGS_KEY, JSON.stringify(msgs));
    Auth.incrementStat('supportMsgs');

    document.getElementById('support-msg').value = '';
    document.getElementById('support-previews').innerHTML = '';
    document.getElementById('attach-count').textContent = 'إرفاق صور (حد أقصى 2)';
    UI._supportAttachFiles = null;

    UI.toast('تم إرسال رسالتك بنجاح', 'success');
    App.loadInbox();
  }
};

function fileToDataURL(file) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.readAsDataURL(file);
  });
}

// ─── MAIN APP ───
const App = {
  currentUser: null,
  currentPage: 'home',
  sidebarOpen: false,

  async init() {
    // ─── LOADING SCREEN ───
    const statuses = [
      'جاري التهيئة...',
      'تحميل النظام...',
      'ربط الخدمات...',
      'تحميل الواجهة...',
      'جاهز!'
    ];
    let pct = 0;
    const bar = document.getElementById('loading-bar');
    const pctEl = document.getElementById('loading-percent');
    const statusEl = document.getElementById('loading-status');

    const loadInterval = setInterval(() => {
      pct += Math.random() * 18 + 5;
      if (pct > 100) pct = 100;
      bar.style.width = pct + '%';
      pctEl.textContent = Math.floor(pct) + '%';
      statusEl.textContent = statuses[Math.floor(pct / 25)] || statuses[statuses.length - 1];
    }, 400);

    // Apply customization
    const custom = getCustom();
    if (custom.welcomeMsg) {
      const el = document.getElementById('home-welcome');
      if (el) el.textContent = custom.welcomeMsg;
    }

    // Wait 6 seconds
    await new Promise(r => setTimeout(r, 6000));
    clearInterval(loadInterval);
    bar.style.width = '100%';
    pctEl.textContent = '100%';

    await new Promise(r => setTimeout(r, 300));

    // ─── AUTO LOGIN ───
    const user = Auth.autoLogin();
    if (user) {
      App.currentUser = user;
      App.enterApp(user);
    } else {
      UI.showScreen('auth');
      App.showChoice();
    }
  },

  // ─── AUTH PANELS ───
  showChoice() {
    ['auth-choice','auth-register','auth-login'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });
    document.getElementById('auth-choice').classList.add('active');
  },
  showRegister() {
    ['auth-choice','auth-register','auth-login'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });
    document.getElementById('auth-register').classList.add('active');
  },
  showLogin() {
    ['auth-choice','auth-register','auth-login'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });
    document.getElementById('auth-login').classList.add('active');
  },

  doRegister() {
    const name    = document.getElementById('reg-name').value;
    const user    = document.getElementById('reg-user').value;
    const pass    = document.getElementById('reg-pass').value;
    const confirm = document.getElementById('reg-confirm').value;
    const err = document.getElementById('reg-error');
    err.textContent = '';

    const result = Auth.register(name, user, pass, confirm);
    if (!result.ok) { err.textContent = result.msg; return; }
    App.currentUser = result.user;
    App.enterApp(result.user);
    UI.toast('مرحباً بك ' + result.user.name + '!', 'success');
  },

  doLogin() {
    const user = document.getElementById('log-user').value;
    const pass = document.getElementById('log-pass').value;
    const err = document.getElementById('log-error');
    err.textContent = '';

    const result = Auth.login(user, pass);
    if (!result.ok) { err.textContent = result.msg; return; }
    App.currentUser = result.user;
    App.enterApp(result.user);
    UI.toast('أهلاً ' + result.user.name, 'success');
  },

  logout() {
    UI.showModal('تسجيل الخروج', 'هل تريد تسجيل الخروج؟', [
      {
        label: 'نعم', cls: 'danger-btn', fn: () => {
          Auth.logout();
          App.currentUser = null;
          UI.showScreen('auth');
          App.showChoice();
        }
      },
      { label: 'إلغاء', cls: 'ghost-btn', fn: () => {} }
    ]);
  },

  // ─── ENTER APP ───
  enterApp(user) {
    App.currentUser = user;
    UI.showScreen('app');

    // Set user info in sidebar
    document.getElementById('sidebar-name').textContent = user.name;
    document.getElementById('sidebar-uid').textContent = 'ID: ' + user.id;

    // Admin button
    if (user.role === 'admin') {
      document.getElementById('admin-btn').classList.remove('hidden');
    }

    // Special wife welcome
    if (user.id === 2) {
      App.showWifeBanner();
    }

    App.navigate('home');
    App.refreshAccountPage();
  },

  showWifeBanner() {
    const home = document.getElementById('page-home');
    if (!home) return;
    const banner = document.createElement('div');
    banner.className = 'wife-banner';
    banner.innerHTML = `
      <div class="wife-banner-msg">✨ أهلاً وسهلاً بك حبيبتي ✨</div>
      <div class="wife-banner-sub">الموقع أُعِدَّ خصيصاً لكِ — استمتعي بكل الخدمات 💝</div>
    `;
    home.insertBefore(banner, home.querySelector('.home-hero'));
  },

  // ─── NAVIGATION ───
  navigate(page) {
    // Check service availability
    const services = getServices();
    const restricted = ['chat','image','video'];
    if (restricted.includes(page) && !services[page]) {
      UI.toast('هذه الخدمة متوقفة مؤقتاً', 'error');
      return;
    }

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    const el = document.getElementById('page-' + page);
    if (!el) { page = 'home'; }
    document.getElementById('page-' + page)?.classList.add('active');

    App.currentPage = page;
    App.closeSidebar();

    // Update topbar title
    const titles = {
      home: 'ILYA SERVICES',
      account: 'حسابي',
      help: 'المساعدة',
      support: 'الدعم',
      chat: 'الدردشة الذكية',
      image: 'توليد الصور',
      video: 'توليد الفيديو',
      admin: 'لوحة التحكم'
    };
    document.getElementById('topbar-title').textContent = titles[page] || 'ILYA';

    // Update bottom nav
    document.querySelectorAll('.bnav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.page === page);
    });

    // Admin topbar
    const adminTopbar = document.getElementById('admin-topbar');
    const contentArea = document.querySelector('.content-area');
    if (page === 'admin') {
      adminTopbar.classList.remove('hidden');
      contentArea.classList.add('admin-mode');
      App.adminTab('stats');
      Admin.loadStats();
    } else {
      adminTopbar.classList.add('hidden');
      contentArea.classList.remove('admin-mode');
    }

    // Support: load inbox
    if (page === 'support') App.loadInbox();
    if (page === 'account') App.refreshAccountPage();
  },

  adminTab(tab) {
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('admin-' + tab)?.classList.add('active');
    document.querySelectorAll('.admin-tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });

    if (tab === 'stats') Admin.loadStats();
    else if (tab === 'users') Admin.loadUsers();
    else if (tab === 'blocked') Admin.loadBlocked();
    else if (tab === 'messages') Admin.loadMessages();
  },

  // ─── SIDEBAR ───
  toggleSidebar() {
    App.sidebarOpen ? App.closeSidebar() : App.openSidebar();
  },
  openSidebar() {
    App.sidebarOpen = true;
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebar-overlay').classList.add('visible');
    document.getElementById('hamburger-btn').classList.add('open');
  },
  closeSidebar() {
    App.sidebarOpen = false;
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('visible');
    document.getElementById('hamburger-btn').classList.remove('open');
  },

  // ─── ACCOUNT PAGE ───
  refreshAccountPage() {
    const user = Auth.getCurrentUser();
    if (!user) return;
    const el = id => document.getElementById(id);
    if (el('acc-name')) el('acc-name').textContent = user.name;
    if (el('acc-user')) el('acc-user').textContent = user.username;
    if (el('acc-id'))   el('acc-id').textContent   = user.id;
    if (el('acc-pass')) el('acc-pass').textContent  = '••••••••';
    if (el('sidebar-name')) el('sidebar-name').textContent = user.name;
  },

  // ─── INBOX ───
  loadInbox() {
    const user = Auth.getCurrentUser();
    if (!user) return;
    const MSGS_KEY = 'ilya_support_msgs';
    let msgs = [];
    try { msgs = JSON.parse(localStorage.getItem(MSGS_KEY)) || []; } catch {}

    const userMsgs = msgs.filter(m => m.userId === user.id);
    const inbox = document.getElementById('inbox-messages');
    if (!inbox) return;

    if (userMsgs.length === 0) {
      inbox.innerHTML = '<div class="inbox-empty">لا توجد رسائل</div>';
      return;
    }

    inbox.innerHTML = '';
    for (const m of userMsgs.reverse()) {
      const div = document.createElement('div');
      div.className = 'inbox-msg';
      div.innerHTML = `
        <div class="inbox-msg-from">أنت — ${new Date(m.sentAt).toLocaleString('ar')}</div>
        <div class="inbox-msg-body">${escapeHtml(m.body)}</div>
        ${m.replies?.length ? m.replies.map(r => `
          <div style="margin-top:0.5rem; padding:0.5rem; background:rgba(255,0,64,0.05); border-radius:6px; border-right:2px solid rgba(255,0,64,0.3)">
            <div class="inbox-msg-from" style="color:var(--neon2)">رد الإدارة</div>
            <div class="inbox-msg-body">${escapeHtml(r.body)}</div>
          </div>
        `).join('') : ''}
      `;
      inbox.appendChild(div);
    }
  }
};

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

// ─── INIT ───
window.addEventListener('DOMContentLoaded', () => App.init());
