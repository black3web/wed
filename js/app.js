/* ══════════════════════════════════════
   ILYA SERVICES - COMPLETE APP LOGIC
   ══════════════════════════════════════ */

'use strict';

const API_BASE = 'https://your-backend.wispbyte.com';

const DEFAULT_ACCOUNTS = [
  {
    id: '1',
    name: 'المبرمج',
    username: 'A1',
    password: '5cd9e55dcaf491d32289b848adeb216e',
    avatar: 'https://iili.io/B04MxcX.md.jpg',
    isAdmin: true,
    isBanned: false,
    bannedUntil: null,
    createdAt: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    stats: { chatUses: 0, imageUses: 0, videoUses: 0 }
  },
  {
    id: '2',
    name: 'زوجة المبرمج',
    username: 'M1',
    password: '5cd9e55dcaf491d32289b848adeb216e',
    avatar: 'https://iili.io/B04MxcX.md.jpg',
    isAdmin: false,
    isWife: true,
    isBanned: false,
    bannedUntil: null,
    createdAt: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    stats: { chatUses: 0, imageUses: 0, videoUses: 0 }
  }
];

const DEFAULT_SETTINGS = {
  siteName: 'ILYA Services',
  welcomeText: 'أهلاً بك في موقع خدمات ILYA',
  copyright: 'جميع الحقوق محفوظة © 2025 ILYA Services',
  telegramLink: 'https://t.me/swc_t',
  services: {
    chat: { enabled: true, name: 'خدمة الدردشة' },
    images: { enabled: true, name: 'إنشاء الصور' },
    video: { enabled: true, name: 'إنشاء الفيديوهات' }
  },
  models: {
    gpt: { enabled: true },
    gemini: { enabled: true },
    deepseek: { enabled: true },
    nanobanana: { enabled: true },
    flux: { enabled: true },
    seedream: { enabled: true },
    portrait: { enabled: true },
    veo2: { enabled: true }
  }
};

let state = {
  currentUser: null,
  currentPage: 'home',
  sidebarOpen: false,
  chatModel: null,
  deepseekModel: 1,
  chatHistory: [],
  deepseekConvId: null,
  imgModel: null,
  imgMode: 'create',
  imgUploadedFiles: [],
  videoModel: null,
  videoMode: 'text',
  videoUploadedImg: null,
  portraitFile: null,
  supportImgs: [null, null]
};

/* ═══════════════════════ DATABASE ═══════════════════════ */
const DB = {
  init() {
    if (!localStorage.getItem('ilya_accounts')) {
      localStorage.setItem('ilya_accounts', JSON.stringify(DEFAULT_ACCOUNTS));
    }
    if (!localStorage.getItem('ilya_settings')) {
      localStorage.setItem('ilya_settings', JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem('ilya_tickets')) {
      localStorage.setItem('ilya_tickets', JSON.stringify([]));
    }
    if (!localStorage.getItem('ilya_stats')) {
      localStorage.setItem('ilya_stats', JSON.stringify({ visits: 0, chatUses: 0, imageUses: 0, videoUses: 0 }));
    }
    const s = this.getStats();
    s.visits = (s.visits || 0) + 1;
    localStorage.setItem('ilya_stats', JSON.stringify(s));
  },
  getAccounts() { return JSON.parse(localStorage.getItem('ilya_accounts') || '[]'); },
  saveAccounts(a) { localStorage.setItem('ilya_accounts', JSON.stringify(a)); },
  getAccount(username) { return this.getAccounts().find(a => a.username === username); },
  getAccountById(id) { return this.getAccounts().find(a => a.id === id); },
  updateAccount(id, updates) {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex(a => a.id === id);
    if (idx !== -1) { accounts[idx] = { ...accounts[idx], ...updates }; this.saveAccounts(accounts); return accounts[idx]; }
  },
  createAccount(data) {
    const accounts = this.getAccounts();
    const id = String(Math.floor(100000000000000 + Math.random() * 900000000000000));
    const acc = {
      id, name: data.name, username: data.username,
      password: simpleHash(data.password),
      avatar: 'https://iili.io/B04MxcX.md.jpg',
      isAdmin: false, isBanned: false, bannedUntil: null,
      createdAt: new Date().toISOString(), lastSeen: new Date().toISOString(),
      stats: { chatUses: 0, imageUses: 0, videoUses: 0 }
    };
    accounts.push(acc); this.saveAccounts(accounts); return acc;
  },
  getSettings() { return JSON.parse(localStorage.getItem('ilya_settings') || JSON.stringify(DEFAULT_SETTINGS)); },
  saveSettings(s) { localStorage.setItem('ilya_settings', JSON.stringify(s)); },
  getTickets() { return JSON.parse(localStorage.getItem('ilya_tickets') || '[]'); },
  saveTickets(t) { localStorage.setItem('ilya_tickets', JSON.stringify(t)); },
  addTicket(ticket) { const t = this.getTickets(); t.unshift(ticket); this.saveTickets(t); },
  addReply(ticketId, reply) {
    const t = this.getTickets();
    const ticket = t.find(x => x.id === ticketId);
    if (ticket) { if (!ticket.replies) ticket.replies = []; ticket.replies.push(reply); this.saveTickets(t); }
  },
  getStats() { return JSON.parse(localStorage.getItem('ilya_stats') || '{}'); },
  incStat(key) { const s = this.getStats(); s[key] = (s[key] || 0) + 1; localStorage.setItem('ilya_stats', JSON.stringify(s)); }
};

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h = h & h; }
  return Math.abs(h).toString(16).padStart(32, '0');
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.classList.add('hidden'), 300); }, duration);
}

function copyText(btn, text) {
  navigator.clipboard.writeText(text).then(() => { showToast('تم النسخ'); if (btn) { btn.style.color = 'rgba(0,200,100,0.8)'; setTimeout(() => { btn.style.color = ''; }, 1500); } });
}

function closeModal() { document.getElementById('modalOverlay').classList.add('hidden'); }
function showModal(html) {
  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('modalOverlay').classList.remove('hidden');
}

async function fileToBase64(file) {
  return new Promise(resolve => {
    const r = new FileReader();
    r.onload = e => resolve(e.target.result.split(',')[1]);
    r.readAsDataURL(file);
  });
}

async function uploadImgToTemp(file) {
  // Return object URL as fallback — real upload would go to backend
  return URL.createObjectURL(file);
}

/* ═══════════════════════ LOADING ═══════════════════════ */
function startLoading() {
  DB.init();
  initBackground();

  const steps = [
    { pct: 15, msg: 'تهيئة النظام...' },
    { pct: 30, msg: 'تحميل الموارد...' },
    { pct: 50, msg: 'الاتصال بالخوادم...' },
    { pct: 70, msg: 'تحميل الخدمات...' },
    { pct: 88, msg: 'جاري الإنهاء...' },
    { pct: 100, msg: 'مكتمل!' }
  ];

  const bar = document.getElementById('loadBar');
  const pctEl = document.getElementById('loadPercent');
  const statusEl = document.getElementById('barStatus');
  let stepIdx = 0;

  function nextStep() {
    if (stepIdx >= steps.length) return;
    const step = steps[stepIdx++];
    bar.style.width = step.pct + '%';
    pctEl.textContent = step.pct;
    statusEl.textContent = step.msg;
    generateLoadParticles();
    if (stepIdx < steps.length) setTimeout(nextStep, 500 + Math.random() * 400);
  }
  setTimeout(nextStep, 300);

  setTimeout(() => {
    const ls = document.getElementById('loadingScreen');
    ls.classList.add('fade-out');
    setTimeout(() => { ls.style.display = 'none'; checkAuth(); }, 600);
  }, 5500);
}

function generateLoadParticles() {
  const c = document.getElementById('loadParticles');
  for (let i = 0; i < 3; i++) {
    const p = document.createElement('div');
    p.style.cssText = `position:absolute;width:${2+Math.random()*4}px;height:${2+Math.random()*4}px;background:rgba(255,7,58,${0.3+Math.random()*0.5});border-radius:50%;left:${Math.random()*100}%;top:${60+Math.random()*30}%;pointer-events:none;`;
    c.appendChild(p);
    let op = 1, y = parseFloat(p.style.top), x = parseFloat(p.style.left);
    const vx = (Math.random()-0.5)*2, vy = -(0.5+Math.random()*1.5);
    function anim() { y+=vy*0.4; x+=vx*0.3; op-=0.025; p.style.top=y+'%'; p.style.left=x+'%'; p.style.opacity=op; if(op>0) requestAnimationFrame(anim); else p.remove(); }
    requestAnimationFrame(anim);
  }
}

/* ═══════════════════════ BACKGROUND ═══════════════════════ */
function initBackground() {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const shapes = [];
  const types = ['hex','tri','dia','oct','cross'];
  for (let i = 0; i < 28; i++) {
    shapes.push({
      x: Math.random()*window.innerWidth, y: Math.random()*window.innerHeight,
      size: 12+Math.random()*90, type: types[Math.floor(Math.random()*types.length)],
      rot: Math.random()*Math.PI*2, rotSpd: (Math.random()-0.5)*0.006,
      op: 0.02+Math.random()*0.07, vx: (Math.random()-0.5)*0.18, vy: (Math.random()-0.5)*0.18,
      clr: Math.random()>0.5 ? 'rgba(255,7,58,' : 'rgba(120,0,0,'
    });
  }

  const stars = Array.from({length:100}, () => ({
    x: Math.random()*window.innerWidth, y: Math.random()*window.innerHeight,
    sz: 0.4+Math.random()*1.8, op: 0.2+Math.random()*0.7,
    pulse: Math.random()*Math.PI*2, pSpd: 0.008+Math.random()*0.015,
    rot: Math.random()*Math.PI
  }));

  function path(ctx, type, r) {
    ctx.beginPath();
    switch(type) {
      case 'hex': for(let i=0;i<6;i++){const a=i*Math.PI/3;i===0?ctx.moveTo(r*Math.cos(a),r*Math.sin(a)):ctx.lineTo(r*Math.cos(a),r*Math.sin(a));} break;
      case 'tri': for(let i=0;i<3;i++){const a=i*2*Math.PI/3-Math.PI/2;i===0?ctx.moveTo(r*Math.cos(a),r*Math.sin(a)):ctx.lineTo(r*Math.cos(a),r*Math.sin(a));} break;
      case 'dia': ctx.moveTo(0,-r);ctx.lineTo(r*0.55,0);ctx.lineTo(0,r);ctx.lineTo(-r*0.55,0); break;
      case 'oct': for(let i=0;i<8;i++){const a=i*Math.PI/4;i===0?ctx.moveTo(r*Math.cos(a),r*Math.sin(a)):ctx.lineTo(r*Math.cos(a),r*Math.sin(a));} break;
      case 'cross': { const t=r*0.28; ctx.rect(-t,-r,t*2,r*2); ctx.rect(-r,-t,r*2,t*2); break; }
    }
    ctx.closePath();
  }

  function drawStar(ctx, x, y, r, rot) {
    ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.beginPath();
    ctx.moveTo(0,-r); ctx.lineTo(r*0.22,-r*0.22); ctx.lineTo(r,0); ctx.lineTo(r*0.22,r*0.22);
    ctx.lineTo(0,r); ctx.lineTo(-r*0.22,r*0.22); ctx.lineTo(-r,0); ctx.lineTo(-r*0.22,-r*0.22);
    ctx.closePath(); ctx.restore();
  }

  function render() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    stars.forEach(s => {
      s.pulse += s.pSpd;
      const op = s.op*(0.4+0.6*Math.sin(s.pulse));
      ctx.save(); ctx.globalAlpha=op; ctx.strokeStyle='rgba(255,200,200,1)'; ctx.lineWidth=0.5;
      drawStar(ctx,s.x,s.y,s.sz,s.rot); ctx.stroke(); ctx.restore();
    });
    shapes.forEach(s => {
      s.x+=s.vx; s.y+=s.vy; s.rot+=s.rotSpd;
      if(s.x<-s.size) s.x=canvas.width+s.size;
      if(s.x>canvas.width+s.size) s.x=-s.size;
      if(s.y<-s.size) s.y=canvas.height+s.size;
      if(s.y>canvas.height+s.size) s.y=-s.size;
      ctx.save(); ctx.translate(s.x,s.y); ctx.rotate(s.rot);
      ctx.globalAlpha=s.op; ctx.strokeStyle=s.clr+s.op+')'; ctx.lineWidth=0.8;
      path(ctx,s.type,s.size); ctx.stroke();
      if(s.size>35) { ctx.globalAlpha=s.op*0.45; path(ctx,s.type,s.size*0.55); ctx.stroke(); }
      ctx.restore();
    });
    requestAnimationFrame(render);
  }
  render();
}

/* ═══════════════════════ AUTH ═══════════════════════ */
function checkAuth() {
  const saved = localStorage.getItem('ilya_session');
  if (saved) {
    const acc = DB.getAccountById(saved);
    if (acc && !checkBanned(acc)) { loginUser(acc); return; }
    localStorage.removeItem('ilya_session');
  }
  document.getElementById('authScreen').classList.remove('hidden');
}

function checkBanned(acc) {
  if (!acc.isBanned) return false;
  if (acc.bannedUntil && new Date() >= new Date(acc.bannedUntil)) {
    DB.updateAccount(acc.id, { isBanned: false, bannedUntil: null });
    return false;
  }
  return true;
}

function showAuthMain() {
  document.getElementById('authMain').classList.remove('hidden');
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('loginForm').classList.add('hidden');
}
function showRegister() {
  document.getElementById('authMain').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');
  document.getElementById('loginForm').classList.add('hidden');
  clearErrors();
}
function showLogin() {
  document.getElementById('authMain').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('registerForm').classList.add('hidden');
  clearErrors();
}
function clearErrors() {
  ['regError','loginError'].forEach(id => { const el=document.getElementById(id); if(el){el.classList.add('hidden');el.textContent='';} });
}
function showError(id, msg) {
  const el=document.getElementById(id); if(el){el.textContent=msg;el.classList.remove('hidden');}
}

function doRegister() {
  const name = document.getElementById('regName').value.trim();
  const username = document.getElementById('regUser').value.trim();
  const pass = document.getElementById('regPass').value;
  const pass2 = document.getElementById('regPass2').value;
  if (!name) return showError('regError','يرجى إدخال الاسم');
  if (username.length < 4) return showError('regError','اسم المستخدم يجب أن يكون 4 أحرف على الأقل');
  if (!pass || pass.length < 6) return showError('regError','كلمة المرور يجب أن تكون 6 أحرف على الأقل');
  if (pass !== pass2) return showError('regError','كلمتا المرور غير متطابقتين');
  if (DB.getAccount(username)) return showError('regError','اسم المستخدم موجود مسبقاً');
  loginUser(DB.createAccount({ name, username, password: pass }));
}

function doLogin() {
  const username = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  if (!username) return showError('loginError','يرجى إدخال اسم المستخدم');
  if (!pass) return showError('loginError','يرجى إدخال كلمة المرور');
  const acc = DB.getAccount(username);
  if (!acc) return showError('loginError','اسم المستخدم غير موجود');
  const match = acc.password === pass || acc.password === simpleHash(pass) ||
    (pass === '5cd9e55dcaf491d32289b848adeb216e' && acc.password === '5cd9e55dcaf491d32289b848adeb216e');
  if (!match) return showError('loginError','كلمة المرور غير صحيحة');
  if (checkBanned(acc)) {
    const until = acc.bannedUntil ? ` حتى ${new Date(acc.bannedUntil).toLocaleDateString('ar')}` : ' بشكل دائم';
    return showError('loginError',`هذا الحساب محظور${until}`);
  }
  loginUser(acc);
}

function loginUser(acc) {
  DB.updateAccount(acc.id, { lastSeen: new Date().toISOString() });
  state.currentUser = acc;
  localStorage.setItem('ilya_session', acc.id);
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');
  if (acc.isAdmin) {
    document.getElementById('adminSideBtn').classList.remove('hidden');
    document.getElementById('adminDivider').classList.remove('hidden');
  }
  setupHomePage();
  navigateTo('home');
}

function doLogout() {
  localStorage.removeItem('ilya_session');
  state.currentUser = null;
  location.reload();
}

/* ═══════════════════════ NAVIGATION ═══════════════════════ */
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); });
  const target = document.getElementById('page-'+page);
  if (target) { target.classList.remove('hidden'); target.classList.add('active'); target.scrollTop = 0; }
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  state.currentPage = page;
  closeSidebar();
  if (page === 'account') setupAccountPage();
  if (page === 'admin' && state.currentUser?.isAdmin) setupAdminPage();
  if (page === 'support') setupSupportPage();
  if (page === 'home') setupHomePage();
}

function goHome() {
  resetChatState(); resetImgState(); resetVideoState();
  navigateTo('home');
}

function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen;
  document.getElementById('sidebar').classList.toggle('open', state.sidebarOpen);
  document.getElementById('hamburgerBtn').classList.toggle('open', state.sidebarOpen);
}
function closeSidebar() {
  state.sidebarOpen = false;
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('hamburgerBtn').classList.remove('open');
}

/* ═══════════════════════ HOME ═══════════════════════ */
function setupHomePage() {
  const user = state.currentUser; if (!user) return;
  const settings = DB.getSettings();
  const wt = document.getElementById('welcomeText');
  if (user.isWife) {
    document.getElementById('wifeWelcome').classList.remove('hidden');
    wt.querySelector('h2').textContent = `مرحباً ${user.name}`;
  } else {
    document.getElementById('wifeWelcome').classList.add('hidden');
    wt.querySelector('h2').textContent = `أهلاً، ${user.name}`;
  }
  wt.querySelector('p').textContent = settings.welcomeText || 'في موقع خدمات ILYA';
  const cr = document.querySelector('.copyright-bar span');
  if (cr) cr.textContent = settings.copyright;
  const tg = document.querySelector('.tg-link');
  if (tg) tg.href = settings.telegramLink;
}

/* ═══════════════════════ ACCOUNT ═══════════════════════ */
function setupAccountPage() {
  const u = state.currentUser; if (!u) return;
  document.getElementById('accName').value = u.name;
  document.getElementById('accUser').value = u.username;
  document.getElementById('accId').value = u.id;
  document.getElementById('accPass').value = '';
}

function saveAccountField(field) {
  const u = state.currentUser;
  let updates = {};
  if (field === 'name') {
    const v = document.getElementById('accName').value.trim();
    if (!v) return showToast('الاسم لا يمكن أن يكون فارغاً');
    updates.name = v;
  } else if (field === 'user') {
    const v = document.getElementById('accUser').value.trim();
    if (v.length < 4) return showToast('اسم المستخدم يجب أن يكون 4 أحرف على الأقل');
    const ex = DB.getAccount(v);
    if (ex && ex.id !== u.id) return showToast('اسم المستخدم مستخدم مسبقاً');
    updates.username = v;
  } else if (field === 'pass') {
    const v = document.getElementById('accPass').value;
    if (v.length < 6) return showToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    updates.password = simpleHash(v);
  }
  const updated = DB.updateAccount(u.id, updates);
  state.currentUser = updated;
  const m = document.getElementById('accSaveMsg');
  m.textContent = 'تم الحفظ بنجاح!'; m.classList.remove('hidden');
  setTimeout(() => m.classList.add('hidden'), 2500);
  showToast('تم الحفظ');
}

/* ═══════════════════════ SUPPORT ═══════════════════════ */
function setupSupportPage() {
  const u = state.currentUser;
  const inbox = document.getElementById('userInbox');
  const tickets = DB.getTickets().filter(t => t.userId === u.id);
  if (!tickets.length) { inbox.innerHTML = ''; return; }
  let html = '<h4 style="font-size:12px;color:rgba(255,7,58,0.5);font-family:var(--font-tech);letter-spacing:1px;margin-bottom:10px;">صندوق الوارد</h4>';
  tickets.forEach(t => {
    if (t.replies && t.replies.length) {
      t.replies.forEach(r => {
        html += `<div class="inbox-msg"><div class="inbox-msg-from">رد المبرمج - ${formatDate(r.date)}</div><div class="inbox-msg-text">${escHtml(r.text)}</div></div>`;
      });
    }
  });
  inbox.innerHTML = html;
}

function triggerImgUpload(n) { document.getElementById('imgFile'+n).click(); }

function handleImgUpload(n, event) {
  const file = event.target.files[0]; if (!file) return;
  state.supportImgs[n-1] = file;
  const zone = document.getElementById('imgUpload'+n);
  const reader = new FileReader();
  reader.onload = e => {
    let prev = zone.querySelector('.upload-preview');
    if (!prev) { prev=document.createElement('img'); prev.className='upload-preview'; zone.appendChild(prev); }
    prev.src=e.target.result; zone.classList.add('has-image');
  };
  reader.readAsDataURL(file);
}

async function sendSupport() {
  const msg = document.getElementById('supportMsg').value.trim();
  if (!msg) return showToast('يرجى كتابة رسالة');
  const ticket = {
    id: Date.now().toString(),
    userId: state.currentUser.id,
    userName: state.currentUser.name,
    userUsername: state.currentUser.username,
    message: msg, images: [],
    date: new Date().toISOString(), replies: []
  };
  const proms = state.supportImgs.filter(Boolean).map(f => new Promise(res => {
    const r = new FileReader(); r.onload=e=>res(e.target.result); r.readAsDataURL(f);
  }));
  ticket.images = await Promise.all(proms);
  DB.addTicket(ticket);
  const el = document.getElementById('supportResult');
  el.textContent='تم إرسال رسالتك بنجاح! سيتم الرد عليك قريباً.';
  el.style.cssText='background:rgba(0,180,0,0.1);border:1px solid rgba(0,200,0,0.3);color:#7fff7f;padding:10px;border-radius:10px;font-size:13px;text-align:center;margin-top:12px;';
  el.classList.remove('hidden');
  document.getElementById('supportMsg').value='';
  state.supportImgs=[null,null];
  [1,2].forEach(n => {
    const z=document.getElementById('imgUpload'+n);
    const p=z.querySelector('.upload-preview'); if(p) p.remove();
    z.classList.remove('has-image');
  });
  setTimeout(()=>el.classList.add('hidden'),4000);
  showToast('تم إرسال الرسالة');
}

/* ═══════════════════════ CHAT ═══════════════════════ */
function resetChatState() {
  state.chatModel=null; state.chatHistory=[]; state.deepseekConvId=null;
  const sel=document.getElementById('chatModelSelect');
  const iface=document.getElementById('chatInterface');
  const dsub=document.getElementById('deepseekSubSelect');
  if(sel) sel.classList.remove('hidden');
  if(iface) iface.classList.add('hidden');
  if(dsub) dsub.classList.add('hidden');
}

function selectChatModel(model) {
  const settings=DB.getSettings();
  if(settings.models[model]&&!settings.models[model].enabled) return showToast('هذا النموذج متوقف حالياً');
  if(model==='deepseek'){
    document.getElementById('chatModelSelect').classList.add('hidden');
    document.getElementById('deepseekSubSelect').classList.remove('hidden');
    return;
  }
  state.chatModel=model; state.chatHistory=[]; state.deepseekConvId=null;
  const names={gpt:'GPT 5.2 Pro',gemini:'Gemini 3 PRO'};
  document.getElementById('chatModelName').textContent=names[model]||model;
  document.getElementById('chatModelSelect').classList.add('hidden');
  document.getElementById('chatInterface').classList.remove('hidden');
  document.getElementById('chatMessages').innerHTML=`<div class="chat-welcome"><div class="chat-welcome-icon"></div><p>مرحباً! كيف يمكنني مساعدتك اليوم؟</p></div>`;
}

function selectDeepSeekModel(num) {
  state.deepseekModel=num; state.chatModel='deepseek'; state.chatHistory=[]; state.deepseekConvId=null;
  const names={1:'DeepSeek V3.2',2:'DeepSeek R1',3:'DeepSeek Coder'};
  document.getElementById('chatModelName').textContent=names[num];
  document.getElementById('deepseekSubSelect').classList.add('hidden');
  document.getElementById('chatInterface').classList.remove('hidden');
  document.getElementById('chatMessages').innerHTML=`<div class="chat-welcome"><div class="chat-welcome-icon"></div><p>مرحباً! كيف يمكنني مساعدتك؟</p></div>`;
}

function backToChatModels() {
  document.getElementById('chatInterface').classList.add('hidden');
  document.getElementById('deepseekSubSelect').classList.add('hidden');
  document.getElementById('chatModelSelect').classList.remove('hidden');
  state.chatModel=null; state.chatHistory=[]; state.deepseekConvId=null;
}

async function sendChatMessage() {
  const input=document.getElementById('chatInput');
  const msg=input.value.trim(); if(!msg) return;
  input.value=''; input.style.height='auto';
  appendUserMsg(msg,'chatMessages');
  const tid=appendTyping('chatMessages');
  DB.incStat('chatUses');
  bumpUserStat('chatUses');
  try {
    let res='';
    if(state.chatModel==='gpt') res=await callGPT(msg);
    else if(state.chatModel==='gemini') res=await callGemini(msg);
    else if(state.chatModel==='deepseek') res=await callDeepSeek(msg);
    removeTyping(tid);
    appendAIMsg(res||'عذراً، لم أتمكن من الاستجابة.','chatMessages');
  } catch {
    removeTyping(tid);
    appendAIMsg('عذراً، حدث خطأ في الاتصال. يرجى المحاولة مجدداً.','chatMessages');
  }
}

async function callGPT(msg) {
  const q=encodeURIComponent(msg.replace(/\s+/g,'.'));
  const r=await fetch(`http://tan1s0.x10.network/openai/index.php?text=${q}`);
  const d=await r.json(); return d.response||d.message||JSON.stringify(d);
}

async function callGemini(msg) {
  const q=encodeURIComponent(msg.replace(/\s+/g,'.'));
  const r=await fetch(`http://tan1s0.x10.network/google/index.php?text=${q}`);
  const d=await r.json(); return d.response||d.message||JSON.stringify(d);
}

async function callDeepSeek(msg) {
  const body={model:String(state.deepseekModel),message:msg};
  if(state.deepseekConvId) body.conversation_id=state.deepseekConvId;
  const r=await fetch('https://zecora0.serv00.net/deepseek.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const d=await r.json();
  if(d.conversation_id) state.deepseekConvId=d.conversation_id;
  return d.response||d.message||JSON.stringify(d);
}

function bumpUserStat(key) {
  const accounts=DB.getAccounts();
  const acc=accounts.find(a=>a.id===state.currentUser.id);
  if(acc){acc.stats=acc.stats||{};acc.stats[key]=(acc.stats[key]||0)+1;DB.saveAccounts(accounts);}
}

function appendUserMsg(text, areaId) {
  const u=state.currentUser;
  const area=document.getElementById(areaId);
  const w=area.querySelector('.chat-welcome'); if(w) w.remove();
  const row=document.createElement('div'); row.className='msg-row user';
  row.innerHTML=`
    <div class="msg-avatar"><img src="${u.avatar||'https://iili.io/B04MxcX.md.jpg'}" alt="u"></div>
    <div class="msg-bubble-wrap">
      <div class="msg-bubble">${escHtml(text)}</div>
      <button class="msg-copy-btn" onclick="copyText(this,${JSON.stringify(text)})"><div class="copy-icon"></div>نسخ</button>
    </div>`;
  area.appendChild(row); area.scrollTop=area.scrollHeight;
}

function appendAIMsg(text, areaId) {
  const area=document.getElementById(areaId);
  const row=document.createElement('div'); row.className='msg-row ai';
  row.innerHTML=`
    <div class="msg-avatar ai-avatar"><div class="ai-avatar-icon"></div></div>
    <div class="msg-bubble-wrap">
      <div class="msg-bubble">${formatAIText(text)}</div>
      <button class="msg-copy-btn" onclick="copyText(this,${JSON.stringify(text)})"><div class="copy-icon"></div>نسخ</button>
    </div>`;
  area.appendChild(row); area.scrollTop=area.scrollHeight;
}

function appendTyping(areaId) {
  const area=document.getElementById(areaId);
  const id='typing-'+Date.now();
  const row=document.createElement('div'); row.className='msg-row ai'; row.id=id;
  row.innerHTML=`
    <div class="msg-avatar ai-avatar"><div class="ai-avatar-icon"></div></div>
    <div class="typing-indicator">
      <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
    </div>`;
  area.appendChild(row); area.scrollTop=area.scrollHeight; return id;
}

function removeTyping(id) { const el=document.getElementById(id); if(el) el.remove(); }

function formatAIText(t) {
  return escHtml(t)
    .replace(/\n\n/g,'</p><p style="margin-top:8px">')
    .replace(/\n/g,'<br>')
    .replace(/\*\*(.*?)\*\*/g,'<strong style="color:rgba(255,7,58,0.9)">$1</strong>')
    .replace(/`(.*?)`/g,'<code style="background:rgba(255,7,58,0.1);padding:2px 6px;border-radius:4px;font-size:12px;font-family:monospace">$1</code>');
}

function autoResize(el) {
  el.style.height='auto';
  el.style.height=Math.min(el.scrollHeight,120)+'px';
}

document.addEventListener('keydown', e => {
  if(document.activeElement===document.getElementById('chatInput')&&e.key==='Enter'&&!e.shiftKey){
    e.preventDefault(); sendChatMessage();
  }
});

/* ═══════════════════════ IMAGES ═══════════════════════ */
const IMG_MODELS = {
  nanobanana:     { name:'NanoBanana Pro',    canEdit:true },
  nanobanana2:    { name:'NanoBanana Pro 2',  canEdit:false },
  nanobanana_api2:{ name:'NanoBanana PRO API',canEdit:true },
  flux:           { name:'FLUX MAX',          canEdit:false },
  seedream:       { name:'SeedDream 4.5',     canEdit:false },
  portrait:       { name:'AI Portrait',       isPortrait:true }
};

function resetImgState() {
  state.imgModel=null; state.imgMode='create'; state.imgUploadedFiles=[];
  document.getElementById('imgModelSelect').classList.remove('hidden');
  ['imgModeSelect','imgInterface','portraitInterface'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.classList.add('hidden');
  });
}

function backToImgModels() { resetImgState(); }

function selectImgModel(model) {
  const settings=DB.getSettings();
  const key=model.startsWith('nanobanana')?'nanobanana':model;
  if(settings.models[key]&&!settings.models[key].enabled) return showToast('هذا النموذج متوقف حالياً');
  state.imgModel=model;
  const info=IMG_MODELS[model];
  if(info.isPortrait){
    document.getElementById('imgModelSelect').classList.add('hidden');
    document.getElementById('portraitInterface').classList.remove('hidden');
    document.getElementById('portraitMessages').innerHTML=`<div class="chat-welcome"><div class="chat-welcome-icon"></div><p>ارفع صورتك واختر النمط المطلوب</p></div>`;
    return;
  }
  if(info.canEdit){
    document.getElementById('imgModelSelect').classList.add('hidden');
    document.getElementById('imgModeModelName').textContent=info.name;
    document.getElementById('imgModeSelect').classList.remove('hidden');
  } else {
    document.getElementById('imgModelSelect').classList.add('hidden');
    openImgInterface('create');
  }
}

function selectImgMode(mode) {
  state.imgMode=mode;
  document.getElementById('imgModeSelect').classList.add('hidden');
  openImgInterface(mode);
}

function openImgInterface(mode) {
  state.imgMode=mode;
  const info=IMG_MODELS[state.imgModel];
  document.getElementById('imgInterface').classList.remove('hidden');
  document.getElementById('imgModelName').textContent=info.name;
  document.getElementById('imgModeTag').textContent=mode==='create'?'إنشاء':'تعديل';
  document.getElementById('imgWelcomeMsg').textContent=mode==='create'?'صف الصورة التي تريدها بالتفصيل':'ارفع الصورة واكتب التعديل المطلوب';
  setupImgOptions();
  const ua=document.getElementById('imgUploadArea');
  if(mode==='edit'){ ua.classList.remove('hidden'); setupMultiUpload(); }
  else { ua.classList.add('hidden'); state.imgUploadedFiles=[]; }
  document.getElementById('imgMessages').innerHTML=`<div class="chat-welcome"><div class="chat-welcome-icon img-welcome-icon"></div><p>${mode==='create'?'صف الصورة التي تريدها بالتفصيل':'ارفع الصورة واكتب التعديل المطلوب'}</p></div>`;
}

function setupImgOptions() {
  const m=state.imgModel;
  const ratios={
    nanobanana:['1:1','16:9','9:16','4:3','3:4'],
    nanobanana2:[],
    nanobanana_api2:['1:1','16:9','9:16'],
    flux:['1:1','1:2','2:1','2:3','3:2','3:4','4:3','4:5','5:4','9:16','16:9'],
    seedream:['square','portrait','landscape','classic','ultrawide']
  };
  const qualities={ nanobanana:['1K','2K','4K'] };
  const styles={ seedream:['none','photo','fantasy','portrait','anime','landscape','scifi','cinematic','oil','pixel','watercolor','ghibli','vintage'] };
  const rEl=document.getElementById('imgRatio');
  const qEl=document.getElementById('imgQuality');
  const sEl=document.getElementById('imgStyle');
  const r=ratios[m]||[], q=qualities[m]||[], s=styles[m]||[];
  rEl.innerHTML='<option value="">النسبة</option>'+r.map(x=>`<option value="${x}">${x}</option>`).join('');
  qEl.innerHTML='<option value="">الجودة</option>'+q.map(x=>`<option value="${x}">${x}</option>`).join('');
  sEl.innerHTML='<option value="">النمط</option>'+s.map(x=>`<option value="${x}">${x}</option>`).join('');
  rEl.style.display=r.length?'':'none';
  qEl.style.display=q.length?'':'none';
  sEl.style.display=s.length?'':'none';
}

function setupMultiUpload() {
  const wrap=document.getElementById('multiUploadWrap');
  const max={nanobanana:1,nanobanana_api2:5,nanobanana2:1}[state.imgModel]||1;
  wrap.innerHTML=''; state.imgUploadedFiles=[];
  for(let i=0;i<max;i++){
    const z=document.createElement('div');
    z.className='img-upload-zone'; z.style='flex:1;min-width:65px;height:65px;position:relative;'; z.dataset.idx=i;
    z.innerHTML=`<div class="upload-icon"></div><span style="font-size:10px">صورة ${i+1}</span><input type="file" accept="image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%">`;
    const input=z.querySelector('input');
    input.addEventListener('change',e=>handleMultiUpload(i,e,z));
    wrap.appendChild(z); state.imgUploadedFiles.push(null);
  }
}

function handleMultiUpload(idx,event,zone) {
  const f=event.target.files[0]; if(!f) return;
  state.imgUploadedFiles[idx]=f;
  const reader=new FileReader();
  reader.onload=e=>{
    let p=zone.querySelector('.upload-preview');
    if(!p){p=document.createElement('img');p.className='upload-preview';zone.appendChild(p);}
    p.src=e.target.result; zone.classList.add('has-image');
  };
  reader.readAsDataURL(f);
}

async function sendImgMessage() {
  const input=document.getElementById('imgInput');
  const msg=input.value.trim(); if(!msg) return showToast('يرجى كتابة وصف الصورة');
  const ratio=document.getElementById('imgRatio').value;
  const quality=document.getElementById('imgQuality').value;
  const style=document.getElementById('imgStyle').value;
  input.value=''; input.style.height='auto';
  appendUserMsg(msg,'imgMessages');
  const progId=appendImgProgress();
  DB.incStat('imageUses'); bumpUserStat('imageUses');
  try {
    const url=await generateImage(msg,ratio,quality,style);
    removeProgress(progId);
    if(url) appendImgResult(url,'imgMessages');
    else appendMsgError('imgMessages');
  } catch {
    removeProgress(progId); appendMsgError('imgMessages');
  }
}

async function generateImage(prompt,ratio,quality,style) {
  const m=state.imgModel, mode=state.imgMode;
  if(m==='nanobanana'){
    const fd=new FormData();
    fd.append('text',prompt);
    if(ratio) fd.append('ratio',ratio);
    if(quality) fd.append('res',quality);
    if(mode==='edit'){
      const files=state.imgUploadedFiles.filter(Boolean);
      if(files.length===1){ const b64=await fileToBase64(files[0]); fd.append('links',b64); }
      else if(files.length>1){ const b64s=await Promise.all(files.map(fileToBase64)); b64s.forEach(b=>fd.append('links[]',b)); }
    }
    const r=await fetch('https://zecora0.serv00.net/ai/NanoBanana.php',{method:'POST',body:fd});
    const d=await r.json(); return d.url||d.image_url;
  }
  if(m==='nanobanana_api2'){
    if(mode==='edit'){
      const files=state.imgUploadedFiles.filter(Boolean);
      const urls=[];
      for(const f of files){ const b=await fileToBase64(f); urls.push('data:image/jpeg;base64,'+b); }
      const r=await fetch('https://nanobananapro-api.up.railway.app/edit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,image_urls:urls.slice(0,5)})});
      const d=await r.json(); return d.url||d.image_url;
    } else {
      const r=await fetch('https://nanobananapro-api.up.railway.app/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,aspect_ratio:ratio||'1:1'})});
      const d=await r.json(); return d.url||d.image_url;
    }
  }
  if(m==='nanobanana2'){
    const r=await fetch(`http://de3.bot-hosting.net:21007/kilwa-img?text=${encodeURIComponent(prompt)}`);
    const d=await r.json(); return d.image_url;
  }
  if(m==='flux'){
    const r=await fetch(`https://viscodev.x10.mx/Flux-MAX/api.php?prompt=${encodeURIComponent(prompt)}&aspect_ratio=${ratio||'1:1'}`);
    const d=await r.json(); return d.image_url;
  }
  if(m==='seedream'){
    const r=await fetch(`https://viscodev.x10.mx/SeedReam/api.php?action=generate&prompt=${encodeURIComponent(prompt)}&style=${style||'none'}&aspect_ratio=${ratio||'square'}`);
    const d=await r.json(); return d.image_url;
  }
  return null;
}

function appendImgProgress() {
  const area=document.getElementById('imgMessages');
  const id='prog-'+Date.now();
  const row=document.createElement('div'); row.className='msg-row ai'; row.id=id;
  let secs=0;
  const iv=setInterval(()=>{ secs++; const t=row.querySelector('.progress-time'); if(t) t.textContent=secs+'s'; },1000);
  row._iv=iv;
  row.innerHTML=`
    <div class="msg-avatar ai-avatar"><div class="ai-avatar-icon"></div></div>
    <div class="gen-progress">
      <div class="progress-spinner"></div>
      <div class="progress-label">جاري إنشاء الصورة...</div>
      <div class="progress-time">0s</div>
    </div>`;
  area.appendChild(row); area.scrollTop=area.scrollHeight; return id;
}

function removeProgress(id) { const el=document.getElementById(id); if(el){clearInterval(el._iv);el.remove();} }

function appendImgResult(url, areaId) {
  const area=document.getElementById(areaId);
  const row=document.createElement('div'); row.className='msg-row ai';
  row.innerHTML=`
    <div class="msg-avatar ai-avatar"><div class="ai-avatar-icon"></div></div>
    <div class="msg-bubble-wrap" style="max-width:88%">
      <div class="msg-bubble" style="padding:8px">
        <img src="${escHtml(url)}" alt="img" class="msg-image" onerror="this.style.display='none'">
      </div>
      <a href="${escHtml(url)}" download="ilya_image.jpg" target="_blank" class="msg-download-btn">
        <div class="copy-icon"></div>تحميل الصورة
      </a>
    </div>`;
  area.appendChild(row); area.scrollTop=area.scrollHeight;
}

function appendMsgError(areaId) {
  const area=document.getElementById(areaId);
  const row=document.createElement('div'); row.className='msg-row ai';
  row.innerHTML=`
    <div class="msg-avatar ai-avatar"><div class="ai-avatar-icon"></div></div>
    <div class="msg-bubble-wrap"><div class="msg-bubble" style="color:rgba(255,120,120,0.9)">عذراً، فشلت العملية. يرجى المحاولة مجدداً.</div></div>`;
  area.appendChild(row); area.scrollTop=area.scrollHeight;
}

/* Portrait */
function triggerPortraitUpload() { document.getElementById('portraitFile').click(); }
function handlePortraitUpload(event) {
  const f=event.target.files[0]; if(!f) return;
  state.portraitFile=f;
  const z=document.getElementById('portraitUploadZone');
  const reader=new FileReader();
  reader.onload=e=>{
    let p=z.querySelector('.upload-preview');
    if(!p){p=document.createElement('img');p.className='upload-preview';z.appendChild(p);}
    p.src=e.target.result;
  };
  reader.readAsDataURL(f);
}

async function sendPortrait() {
  if(!state.portraitFile) return showToast('يرجى رفع صورتك أولاً');
  const gender=document.getElementById('portraitGender').value;
  const pstyle=document.getElementById('portraitStyle').value;
  const ratio=document.getElementById('portraitRatio').value;
  const area=document.getElementById('portraitMessages');
  area.innerHTML='';
  const progId=appendPortraitProgress(area);
  DB.incStat('imageUses'); bumpUserStat('imageUses');
  try {
    const b64=await fileToBase64(state.portraitFile);
    const dataUrl='data:image/jpeg;base64,'+b64;
    const apiUrl=`https://viscodev.x10.mx/maker-ai/api.php?links=${encodeURIComponent(dataUrl)}&gender=${gender}&style=${pstyle}&ratio=${ratio}`;
    const r=await fetch(apiUrl);
    const d=await r.json();
    removeProgress(progId);
    if(d.image_url||d.success){ appendImgResult(d.image_url,'portraitMessages'); }
    else appendMsgError('portraitMessages');
  } catch {
    removeProgress(progId); appendMsgError('portraitMessages');
  }
}

function appendPortraitProgress(area) {
  const id='pport-'+Date.now();
  const row=document.createElement('div'); row.className='msg-row ai'; row.id=id;
  let secs=0;
  const iv=setInterval(()=>{ secs++; const t=row.querySelector('.progress-time'); if(t) t.textContent=secs+'s'; },1000);
  row._iv=iv;
  row.innerHTML=`
    <div class="msg-avatar ai-avatar"><div class="ai-avatar-icon"></div></div>
    <div class="gen-progress">
      <div class="progress-spinner"></div>
      <div class="progress-label">جاري تحويل الصورة...</div>
      <div class="progress-time">0s</div>
    </div>`;
  area.appendChild(row); area.scrollTop=area.scrollHeight; return id;
}

/* ═══════════════════════ VIDEO ═══════════════════════ */
function resetVideoState() {
  state.videoModel=null; state.videoMode='text'; state.videoUploadedImg=null;
  document.getElementById('videoModelSelect').classList.remove('hidden');
  ['videoModeSelect','videoInterface'].forEach(id=>{ const el=document.getElementById(id); if(el) el.classList.add('hidden'); });
}

function selectVideoModel(model) {
  state.videoModel=model;
  document.getElementById('videoModelSelect').classList.add('hidden');
  document.getElementById('videoModeSelect').classList.remove('hidden');
}

function selectVideoMode(mode) {
  state.videoMode=mode;
  document.getElementById('videoModeSelect').classList.add('hidden');
  document.getElementById('videoInterface').classList.remove('hidden');
  document.getElementById('videoModeTag').textContent=mode==='text'?'نص':'صورة';
  document.getElementById('videoImgUpload').classList.toggle('hidden',mode==='text');
  document.getElementById('videoMessages').innerHTML=`<div class="chat-welcome"><div class="chat-welcome-icon vid-icon"></div><p>${mode==='text'?'صف الفيديو الذي تريده بالتفصيل':'ارفع صورة وصف كيف تريد تحريكها'}</p></div>`;
}

function backToVideoModels() {
  document.getElementById('videoInterface').classList.add('hidden');
  document.getElementById('videoModeSelect').classList.add('hidden');
  document.getElementById('videoModelSelect').classList.remove('hidden');
  state.videoMode='text'; state.videoUploadedImg=null;
}

function backToVideoModes() {
  document.getElementById('videoInterface').classList.add('hidden');
  document.getElementById('videoModeSelect').classList.remove('hidden');
}

function triggerVideoUpload() { document.getElementById('videoImgFile').click(); }
function handleVideoImg(event) {
  const f=event.target.files[0]; if(!f) return;
  state.videoUploadedImg=f;
  const z=document.getElementById('videoUploadZone');
  const reader=new FileReader();
  reader.onload=e=>{
    let p=z.querySelector('.upload-preview');
    if(!p){p=document.createElement('img');p.className='upload-preview';z.appendChild(p);}
    p.src=e.target.result; z.classList.add('has-image');
  };
  reader.readAsDataURL(f);
}

async function sendVideoMessage() {
  const input=document.getElementById('videoInput');
  const msg=input.value.trim(); if(!msg) return showToast('يرجى كتابة وصف الفيديو');
  if(state.videoMode==='image'&&!state.videoUploadedImg) return showToast('يرجى رفع صورة');
  const duration=document.getElementById('videoDuration').value;
  const res=document.getElementById('videoRes').value;
  const ratio=document.getElementById('videoRatio').value;
  input.value=''; input.style.height='auto';
  const area=document.getElementById('videoMessages');
  const w=area.querySelector('.chat-welcome'); if(w) w.remove();
  appendUserMsg(msg,'videoMessages');
  const progId=appendVideoProgress(area);
  DB.incStat('videoUses'); bumpUserStat('videoUses');
  try {
    const url=await generateVideo(msg,duration,res,ratio);
    removeProgress(progId);
    if(url) appendVideoResult(url,area);
    else appendMsgError('videoMessages');
  } catch {
    removeProgress(progId); appendMsgError('videoMessages');
  }
}

async function generateVideo(prompt,duration,resolution,aspect_ratio) {
  const body={prompt,duration:parseInt(duration),resolution,aspect_ratio};
  if(state.videoMode==='image'&&state.videoUploadedImg){
    const b64=await fileToBase64(state.videoUploadedImg);
    body.image_url='data:image/jpeg;base64,'+b64;
  }
  const r=await fetch('https://zecora0.serv00.net/ai/Veo2.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const d=await r.json(); return d.UrlVideo||d.url;
}

function appendVideoProgress(area) {
  const id='vprog-'+Date.now();
  const row=document.createElement('div'); row.className='msg-row ai'; row.id=id;
  let secs=0;
  const iv=setInterval(()=>{ secs++; const t=row.querySelector('.progress-time'); if(t) t.textContent=secs+'s'; },1000);
  row._iv=iv;
  row.innerHTML=`
    <div class="msg-avatar ai-avatar"><div class="ai-avatar-icon"></div></div>
    <div class="gen-progress">
      <div class="progress-spinner"></div>
      <div class="progress-label">جاري توليد الفيديو... (قد يستغرق 1-2 دقيقة)</div>
      <div class="progress-time">0s</div>
    </div>`;
  area.appendChild(row); area.scrollTop=area.scrollHeight; return id;
}

function appendVideoResult(url,area) {
  const row=document.createElement('div'); row.className='msg-row ai';
  row.innerHTML=`
    <div class="msg-avatar ai-avatar"><div class="ai-avatar-icon"></div></div>
    <div class="msg-bubble-wrap" style="max-width:92%">
      <div class="msg-bubble" style="padding:8px">
        <video controls style="max-width:100%;border-radius:8px;max-height:280px;display:block" src="${escHtml(url)}">
          المتصفح لا يدعم الفيديو
        </video>
        <p style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:4px;text-align:center">ملاحظة: الفيديو لا يحتوي على صوت</p>
      </div>
      <a href="${escHtml(url)}" download="ilya_video.mp4" target="_blank" class="msg-download-btn">
        <div class="copy-icon"></div>تحميل الفيديو
      </a>
    </div>`;
  area.appendChild(row); area.scrollTop=area.scrollHeight;
}

/* ═══════════════════════ ADMIN ═══════════════════════ */
function setupAdminPage() { showAdminSection('stats'); }

function showAdminSection(section) {
  document.querySelectorAll('.admin-section').forEach(s=>s.classList.add('hidden'));
  document.querySelectorAll('.admin-nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('admin-'+section).classList.remove('hidden');
  const order=['stats','users','banned','tickets','settings'];
  const idx=order.indexOf(section);
  const btns=document.querySelectorAll('.admin-nav-btn');
  if(btns[idx]) btns[idx].classList.add('active');
  const fns={stats:renderStats,users:renderUsers,banned:renderBanned,tickets:renderTickets,settings:renderSettings};
  if(fns[section]) fns[section]();
}

function renderStats() {
  const gs=DB.getStats();
  const accounts=DB.getAccounts();
  const tickets=DB.getTickets();
  const serviceStats=accounts.reduce((acc,a)=>({ chat:acc.chat+(a.stats?.chatUses||0), img:acc.img+(a.stats?.imageUses||0), vid:acc.vid+(a.stats?.videoUses||0) }),{chat:0,img:0,vid:0});
  const data=[
    {label:'إجمالي الزيارات',value:gs.visits||0},
    {label:'عدد الحسابات',value:accounts.length},
    {label:'رسائل الدعم',value:tickets.length},
    {label:'استخدام الدردشة',value:gs.chatUses||0},
    {label:'استخدام الصور',value:gs.imageUses||0},
    {label:'استخدام الفيديو',value:gs.videoUses||0},
  ];
  document.getElementById('statsGrid').innerHTML=data.map(s=>`
    <div class="stat-card">
      <div class="stat-number">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>`).join('');
}

function renderUsers() {
  const accounts=DB.getAccounts().filter(a=>!a.isBanned).sort((a,b)=>new Date(b.lastSeen)-new Date(a.lastSeen));
  const list=document.getElementById('usersList');
  if(!accounts.length){ list.innerHTML='<p style="text-align:center;color:rgba(255,255,255,0.3);font-size:13px;padding:20px">لا يوجد مستخدمون</p>'; return; }
  list.innerHTML=accounts.map(acc=>`
    <div class="user-item" onclick="toggleUserDetail('${acc.id}','users')">
      <div class="user-item-header">
        <div class="user-item-avatar"><img src="${acc.avatar}" alt="u"></div>
        <div style="flex:1">
          <div class="user-item-name">${escHtml(acc.name)}</div>
          <div class="user-item-id">@${escHtml(acc.username)} · ID:${acc.id.substring(0,8)}...</div>
        </div>
        ${acc.isAdmin?'<span class="banned-badge" style="background:rgba(255,7,58,0.1);color:rgba(255,7,58,0.7);border-color:rgba(255,7,58,0.3)">مبرمج</span>':''}
        ${acc.isWife?'<span class="banned-badge" style="background:rgba(255,100,150,0.1);color:rgba(255,150,200,0.7);border-color:rgba(255,100,150,0.3)">زوجة</span>':''}
      </div>
      <div style="font-size:11px;color:rgba(255,255,255,0.25);margin-top:4px">آخر دخول: ${formatDate(acc.lastSeen)}</div>
    </div>
    <div id="detail-users-${acc.id}" class="hidden"></div>`).join('');
}

function renderBanned() {
  const accounts=DB.getAccounts().filter(a=>a.isBanned);
  const list=document.getElementById('bannedList');
  if(!accounts.length){ list.innerHTML='<p style="text-align:center;color:rgba(255,255,255,0.3);font-size:13px;padding:20px">لا يوجد محظورون</p>'; return; }
  list.innerHTML=accounts.map(acc=>`
    <div class="user-item" onclick="toggleUserDetail('${acc.id}','banned')">
      <div class="user-item-header">
        <div class="user-item-avatar"><img src="${acc.avatar}" alt="u"></div>
        <div style="flex:1">
          <div class="user-item-name">${escHtml(acc.name)}</div>
          <div class="user-item-id">@${escHtml(acc.username)}</div>
        </div>
        <span class="banned-badge">محظور${acc.bannedUntil?' مؤقت':' دائم'}</span>
      </div>
    </div>
    <div id="detail-banned-${acc.id}" class="hidden"></div>`).join('');
}

function toggleUserDetail(id, section) {
  const detailId=`detail-${section}-${id}`;
  const detailEl=document.getElementById(detailId);
  if(!detailEl) return;
  if(!detailEl.classList.contains('hidden')){ detailEl.classList.add('hidden'); detailEl.innerHTML=''; return; }
  const acc=DB.getAccountById(id); if(!acc) return;
  const isBan=acc.isBanned;
  detailEl.innerHTML=`
    <div class="user-detail-card">
      <div class="user-detail-field"><span class="user-detail-label">الاسم</span><span class="user-detail-val">${escHtml(acc.name)}</span></div>
      <div class="user-detail-field"><span class="user-detail-label">اليوزر</span><span class="user-detail-val">@${escHtml(acc.username)}</span></div>
      <div class="user-detail-field"><span class="user-detail-label">الـ ID</span><span class="user-detail-val">${acc.id}</span></div>
      <div class="user-detail-field"><span class="user-detail-label">كلمة المرور (hash)</span><span class="user-detail-val" style="font-family:monospace;font-size:10px">${acc.password}</span></div>
      <div class="user-detail-field"><span class="user-detail-label">تاريخ الإنشاء</span><span class="user-detail-val">${formatDate(acc.createdAt)}</span></div>
      <div class="user-detail-field"><span class="user-detail-label">آخر دخول</span><span class="user-detail-val">${formatDate(acc.lastSeen)}</span></div>
      <div class="user-detail-field"><span class="user-detail-label">دردشة</span><span class="user-detail-val">${acc.stats?.chatUses||0} مرة</span></div>
      <div class="user-detail-field"><span class="user-detail-label">صور</span><span class="user-detail-val">${acc.stats?.imageUses||0} مرة</span></div>
      <div class="user-detail-field"><span class="user-detail-label">فيديو</span><span class="user-detail-val">${acc.stats?.videoUses||0} مرة</span></div>
      <div class="user-actions">
        ${isBan
          ? `<button class="btn-unban" onclick="unbanUser('${id}','${section}')">رفع الحظر</button>`
          : `<button class="btn-ban" onclick="banUser('${id}','${section}',false)">حظر دائم</button>
             <button class="btn-temp-ban" onclick="banUser('${id}','${section}',true)">حظر مؤقت (24ساعة)</button>`
        }
      </div>
    </div>`;
  detailEl.classList.remove('hidden');
}

function banUser(id, section, temp) {
  if(id==='1') return showToast('لا يمكن حظر المبرمج');
  const until=temp?new Date(Date.now()+86400000).toISOString():null;
  DB.updateAccount(id,{isBanned:true,bannedUntil:until});
  showToast(temp?'تم الحظر المؤقت (24 ساعة)':'تم الحظر الدائم');
  // Force logout if online
  if(localStorage.getItem('ilya_session')===id){ localStorage.removeItem('ilya_session'); }
  section==='users'?renderUsers():renderBanned();
}

function unbanUser(id, section) {
  DB.updateAccount(id,{isBanned:false,bannedUntil:null});
  showToast('تم رفع الحظر');
  section==='banned'?renderBanned():renderUsers();
}

function renderTickets() {
  const tickets=DB.getTickets();
  const list=document.getElementById('ticketsList');
  if(!tickets.length){ list.innerHTML='<p style="text-align:center;color:rgba(255,255,255,0.3);font-size:13px;padding:20px">لا توجد رسائل</p>'; return; }
  list.innerHTML=tickets.map(t=>`
    <div class="ticket-item">
      <div class="ticket-header">
        <span class="ticket-user">@${escHtml(t.userUsername)} · ${escHtml(t.userName)}</span>
        <span class="ticket-time">${formatDate(t.date)}</span>
      </div>
      <div class="ticket-msg">${escHtml(t.message)}</div>
      ${t.images&&t.images.length?`<div style="display:flex;gap:6px;margin-bottom:8px">${t.images.map(img=>`<img src="${img}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;border:1px solid rgba(255,7,58,0.2)">`).join('')}</div>`:''}
      ${t.replies&&t.replies.length?t.replies.map(r=>`<div style="background:rgba(255,7,58,0.05);border:1px solid rgba(255,7,58,0.15);border-radius:8px;padding:8px;margin-bottom:4px;font-size:12px;color:rgba(255,255,255,0.6)"><span style="font-size:10px;color:rgba(255,7,58,0.5)">ردك · ${formatDate(r.date)}</span><br>${escHtml(r.text)}</div>`).join(''):''}
      <div class="ticket-reply-area">
        <textarea class="ticket-reply-input" id="reply-${t.id}" placeholder="اكتب رداً..." rows="2"></textarea>
        <button class="btn-reply" onclick="sendReply('${t.id}')">إرسال الرد</button>
      </div>
    </div>`).join('');
}

function sendReply(ticketId) {
  const input=document.getElementById('reply-'+ticketId);
  const text=input?.value?.trim(); if(!text) return showToast('يرجى كتابة رد');
  DB.addReply(ticketId,{text,date:new Date().toISOString(),from:'admin'});
  showToast('تم إرسال الرد');
  renderTickets();
}

function renderSettings() {
  const settings=DB.getSettings();
  const sc=document.getElementById('settingsContent');
  sc.innerHTML=`
    <div class="setting-group">
      <h4>نصوص الموقع</h4>
      <label style="font-size:11px;color:rgba(255,255,255,0.4)">نص الترحيب</label>
      <input class="setting-input" id="st-welcome" value="${escHtml(settings.welcomeText)}">
      <label style="font-size:11px;color:rgba(255,255,255,0.4)">نص الحقوق</label>
      <input class="setting-input" id="st-copy" value="${escHtml(settings.copyright)}">
      <label style="font-size:11px;color:rgba(255,255,255,0.4)">رابط تيليغرام</label>
      <input class="setting-input" id="st-tg" value="${escHtml(settings.telegramLink)}">
      <button class="setting-save" onclick="saveTextSettings()">حفظ النصوص</button>
    </div>
    <div class="setting-group">
      <h4>تفعيل/إيقاف الخدمات</h4>
      ${Object.entries(settings.services).map(([k,v])=>`
        <div class="toggle-row">
          <span class="toggle-label">${escHtml(v.name||k)}</span>
          <div class="toggle-switch ${v.enabled?'on':''}" onclick="toggleService('${k}',this)"></div>
        </div>`).join('')}
    </div>
    <div class="setting-group">
      <h4>تفعيل/إيقاف النماذج</h4>
      ${Object.entries(settings.models).map(([k,v])=>`
        <div class="toggle-row">
          <span class="toggle-label">${k}</span>
          <div class="toggle-switch ${v.enabled?'on':''}" onclick="toggleModel('${k}',this)"></div>
        </div>`).join('')}
    </div>`;
}

function saveTextSettings() {
  const s=DB.getSettings();
  s.welcomeText=document.getElementById('st-welcome').value;
  s.copyright=document.getElementById('st-copy').value;
  s.telegramLink=document.getElementById('st-tg').value;
  DB.saveSettings(s); showToast('تم حفظ الإعدادات');
}

function toggleService(key, el) {
  const s=DB.getSettings();
  s.services[key].enabled=!s.services[key].enabled;
  el.classList.toggle('on',s.services[key].enabled);
  DB.saveSettings(s); showToast(s.services[key].enabled?'تم التفعيل':'تم الإيقاف');
}

function toggleModel(key, el) {
  const s=DB.getSettings();
  s.models[key].enabled=!s.models[key].enabled;
  el.classList.toggle('on',s.models[key].enabled);
  DB.saveSettings(s); showToast(s.models[key].enabled?'تم التفعيل':'تم الإيقاف');
}

/* ═══════════════════════ UTILITIES ═══════════════════════ */
async function fileToBase64(file) {
  return new Promise(resolve=>{
    const r=new FileReader(); r.onload=e=>resolve(e.target.result.split(',')[1]); r.readAsDataURL(file);
  });
}

function escHtml(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(iso) {
  if(!iso) return '-';
  try{ return new Date(iso).toLocaleDateString('ar-SA',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}); }
  catch{ return iso; }
}

function showToast(msg,dur=3000) {
  const t=document.getElementById('toast');
  document.getElementById('toastMsg').textContent=msg;
  t.classList.remove('hidden'); t.classList.add('show');
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.classList.add('hidden'),300); },dur);
}

function copyText(btn,text) {
  navigator.clipboard.writeText(text).then(()=>{
    showToast('تم النسخ');
    if(btn){ btn.style.color='rgba(0,200,100,0.8)'; setTimeout(()=>{btn.style.color='';},1500); }
  });
}

function closeModal() { document.getElementById('modalOverlay').classList.add('hidden'); }

function autoResize(el) { el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,120)+'px'; }

/* ═══════════════════════ INIT ═══════════════════════ */
window.addEventListener('DOMContentLoaded', startLoading);
