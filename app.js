/* ═══════════════════════════════════════════════════════════
   ILYA AI Platform v3 — Core (app.js)
   CONFIG · MD5 · LocalDB · AI_MODELS · i18n · Router
═══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════
   ⚙️  إعدادات الربط — CONNECTION SETTINGS
   ضع رابط الـ Backend هنا بعد رفعه على wispbyte.com
══════════════════════════════════════════════════════════ */
const CONFIG = {
  // ✏️ ضع رابط Backend هنا / Put backend URL here:
  // API_BASE: 'https://ilya-ai.wispbyte.com/api'
  API_BASE: '',

  // غيّر إلى true بعد رفع الـ Backend / Set true after deploying backend
  USE_BACKEND: false,
};

/* ── MD5 (pure JS — matches PHP md5() exactly) ──────────── */
function md5(str) {
  function s(x,y){var l=(x&0xffff)+(y&0xffff),m=(x>>16)+(y>>16)+(l>>16);return(m<<16)|(l&0xffff);}
  function r(n,c){return(n<<c)|(n>>>(32-c));}
  function c(q,a,b,x,s,t){return s(r(s(s(a,q),s(x,t)),s),b);}
  function F(a,b,c,d,x,s,t){return c((b&c)|((~b)&d),a,b,x,s,t);}
  function G(a,b,c,d,x,s,t){return c((b&d)|(c&(~d)),a,b,x,s,t);}
  function H(a,b,c,d,x,s,t){return c(b^c^d,a,b,x,s,t);}
  function I(a,b,c,d,x,s,t){return c(c^(b|(~d)),a,b,x,s,t);}
  function K(s){var l=s.length,r=[],i;for(i=0;i<l;i++)r[i>>2]|=s.charCodeAt(i)<<((i%4)*8);r[l>>2]|=0x80<<((l%4)*8);r[((l+64>>9)<<4)+14]=l*8;return r;}
  function X(n){var s='';for(var i=0;i<4;i++)s+=('0'+((n>>>(i*8))&0xff).toString(16)).slice(-2);return s;}
  str=unescape(encodeURIComponent(str));
  var x=K(str),a=0x67452301,b=0xEFCDAB89,cc=0x98BADCFE,d=0x10325476;
  for(var i=0;i<x.length;i+=16){var A=a,B=b,C=cc,D=d;
    a=F(a,b,cc,d,x[i],7,-680876936);d=F(d,a,b,cc,x[i+1],12,-389564586);cc=F(cc,d,a,b,x[i+2],17,606105819);b=F(b,cc,d,a,x[i+3],22,-1044525330);
    a=F(a,b,cc,d,x[i+4],7,-176418897);d=F(d,a,b,cc,x[i+5],12,1200080426);cc=F(cc,d,a,b,x[i+6],17,-1473231341);b=F(b,cc,d,a,x[i+7],22,-45705983);
    a=F(a,b,cc,d,x[i+8],7,1770035416);d=F(d,a,b,cc,x[i+9],12,-1958414417);cc=F(cc,d,a,b,x[i+10],17,-42063);b=F(b,cc,d,a,x[i+11],22,-1990404162);
    a=F(a,b,cc,d,x[i+12],7,1804603682);d=F(d,a,b,cc,x[i+13],12,-40341101);cc=F(cc,d,a,b,x[i+14],17,-1502002290);b=F(b,cc,d,a,x[i+15],22,1236535329);
    a=G(a,b,cc,d,x[i+1],5,-165796510);d=G(d,a,b,cc,x[i+6],9,-1069501632);cc=G(cc,d,a,b,x[i+11],14,643717713);b=G(b,cc,d,a,x[i],20,-373897302);
    a=G(a,b,cc,d,x[i+5],5,-701558691);d=G(d,a,b,cc,x[i+10],9,38016083);cc=G(cc,d,a,b,x[i+15],14,-660478335);b=G(b,cc,d,a,x[i+4],20,-405537848);
    a=G(a,b,cc,d,x[i+9],5,568446438);d=G(d,a,b,cc,x[i+14],9,-1019803690);cc=G(cc,d,a,b,x[i+3],14,-187363961);b=G(b,cc,d,a,x[i+8],20,1163531501);
    a=G(a,b,cc,d,x[i+13],5,-1444681467);d=G(d,a,b,cc,x[i+2],9,-51403784);cc=G(cc,d,a,b,x[i+7],14,1735328473);b=G(b,cc,d,a,x[i+12],20,-1926607734);
    a=H(a,b,cc,d,x[i+5],4,-378558);d=H(d,a,b,cc,x[i+8],11,-2022574463);cc=H(cc,d,a,b,x[i+11],16,1839030562);b=H(b,cc,d,a,x[i+14],23,-35309556);
    a=H(a,b,cc,d,x[i+1],4,-1530992060);d=H(d,a,b,cc,x[i+4],11,1272893353);cc=H(cc,d,a,b,x[i+7],16,-155497632);b=H(b,cc,d,a,x[i+10],23,-1094730640);
    a=H(a,b,cc,d,x[i+13],4,681279174);d=H(d,a,b,cc,x[i],11,-358537222);cc=H(cc,d,a,b,x[i+3],16,-722521979);b=H(b,cc,d,a,x[i+6],23,76029189);
    a=H(a,b,cc,d,x[i+9],4,-640364487);d=H(d,a,b,cc,x[i+12],11,-421815835);cc=H(cc,d,a,b,x[i+15],16,530742520);b=H(b,cc,d,a,x[i+2],23,-995338651);
    a=I(a,b,cc,d,x[i],6,-198630844);d=I(d,a,b,cc,x[i+7],10,1126891415);cc=I(cc,d,a,b,x[i+14],15,-1416354905);b=I(b,cc,d,a,x[i+5],21,-57434055);
    a=I(a,b,cc,d,x[i+12],6,1700485571);d=I(d,a,b,cc,x[i+3],10,-1894986606);cc=I(cc,d,a,b,x[i+10],15,-1051523);b=I(b,cc,d,a,x[i+1],21,-2054922799);
    a=I(a,b,cc,d,x[i+8],6,1873313359);d=I(d,a,b,cc,x[i+15],10,-30611744);cc=I(cc,d,a,b,x[i+6],15,-1560198380);b=I(b,cc,d,a,x[i+13],21,1309151649);
    a=I(a,b,cc,d,x[i+4],6,-145523070);d=I(d,a,b,cc,x[i+11],10,-1120210379);cc=I(cc,d,a,b,x[i+2],15,718787259);b=I(b,cc,d,a,x[i+9],21,-343485551);
    a=s(a,A);b=s(b,B);cc=s(cc,C);d=s(d,D);
  }
  return X(a)+X(b)+X(cc)+X(d);
}

/* ── Image Upload Utility ────────────────────────────────── */
const IMG_UPLOADER = {
  // Upload via catbox.moe (free, no API key)
  async upload(file, onProgress) {
    const fd = new FormData();
    fd.append('reqtype', 'fileupload');
    fd.append('fileToUpload', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://catbox.moe/user.php');
      xhr.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        const url = xhr.responseText.trim();
        if (url.startsWith('https://files.catbox.moe/')) {
          resolve(url);
        } else {
          // Fallback: try backend if configured
          if (CONFIG.USE_BACKEND && CONFIG.API_BASE) {
            this.uploadToBackend(file, onProgress).then(resolve).catch(reject);
          } else {
            reject(new Error('Upload failed'));
          }
        }
      };
      xhr.onerror = () => {
        if (CONFIG.USE_BACKEND && CONFIG.API_BASE) {
          this.uploadToBackend(file, onProgress).then(resolve).catch(reject);
        } else {
          reject(new Error('Network error'));
        }
      };
      xhr.send(fd);
    });
  },

  // Upload to ILYA backend
  async uploadToBackend(file, onProgress) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(CONFIG.API_BASE + '/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) return data.url;
    throw new Error(data.error || 'Upload failed');
  },

  // Convert file to base64 data URL (for preview only)
  toDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};

/* ── Robust API Fetch (retry + timeout + fallback) ───────── */
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchAPI(url, opts = {}, retries = 3, timeout = 40000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await fetch(url, { ...opts, signal: ctrl.signal });
      clearTimeout(tid);
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('json')) throw new Error('Non-JSON response');
      const data = await res.json();
      return { ok: true, data, attempt };
    } catch (err) {
      clearTimeout(tid);
      if (attempt === retries) return { ok: false, error: err.message, attempt };
      await sleep(1500 * attempt); // 1.5s, 3s, 4.5s backoff
    }
  }
}

/* ── Client-side LocalDB ─────────────────────────────────── */
const DB = {
  SYSTEM: [
    { id:'1', name:'المبرمج',      username:'A1', ph:'5cd9e55dcaf491d32289b848adeb216e', role:'admin', pic:'https://iili.io/B04MxcX.md.jpg', created_at:'2025-01-01 00:00:00' },
    { id:'2', name:'زوجة المبرمج', username:'M1', ph:'5cd9e55dcaf491d32289b848adeb216e', role:'vip',   pic:'https://iili.io/B04MxcX.md.jpg', created_at:'2025-01-01 00:00:01' },
  ],

  _g(k, d=null) {
    try { const v = localStorage.getItem('ilya_' + k); return v !== null ? JSON.parse(v) : d; }
    catch { return d; }
  },
  _s(k, v) { try { localStorage.setItem('ilya_' + k, JSON.stringify(v)); } catch {} },

  users() {
    const stored = this._g('users', []);
    const overr  = this._g('overrides', {});
    const sys    = this.SYSTEM.map(u => overr[u.id] ? { ...u, ...overr[u.id] } : u);
    return [...sys, ...stored];
  },

  userById(id) {
    return this.users().find(u => String(u.id) === String(id)) || null;
  },

  userByUsername(un) {
    return this.users().find(u => u.username.toLowerCase() === un.toLowerCase()) || null;
  },

  login(username, password) {
    const user = this.userByUsername(username);
    if (!user)               return { error: 'not_found' };
    if (user.ph !== md5(password)) return { error: 'wrong_pw' };
    if (user.banned)         return { error: 'banned', ban_type: user.ban_type };
    return { user };
  },

  register(name, username, password) {
    if (this.userByUsername(username)) return { error: 'username_taken' };
    if (username.length < 4)           return { error: 'uname_short' };
    let id;
    do { id = String(Math.floor(Math.random() * 9e14 + 1e14)); }
    while (this.userById(id));
    const user = { id, name, username, ph: md5(password), role: 'user', pic: 'https://iili.io/B04MxcX.md.jpg', created_at: new Date().toISOString().replace('T', ' ').slice(0, 19) };
    const stored = this._g('users', []);
    stored.push(user);
    this._s('users', stored);
    return { user };
  },

  updateUser(id, updates) {
    const isSys = this.SYSTEM.find(u => String(u.id) === String(id));
    if (isSys) {
      const ovr = this._g('overrides', {});
      ovr[id]   = { ...(ovr[id] || {}), ...updates };
      this._s('overrides', ovr);
    } else {
      const arr = this._g('users', []);
      const i   = arr.findIndex(u => String(u.id) === String(id));
      if (i !== -1) { arr[i] = { ...arr[i], ...updates }; this._s('users', arr); }
    }
  },

  // Admin: full edit including id change
  adminEditUser(oldId, updates) {
    const uid = String(oldId);
    const isSys = this.SYSTEM.find(u => String(u.id) === uid);
    const newId = updates.id ? String(updates.id) : uid;

    if (isSys) {
      const ovr = this._g('overrides', {});
      if (newId !== uid) {
        // Migrate override key if ID changed
        ovr[newId] = { ...(ovr[uid] || {}), ...updates };
        delete ovr[uid];
      } else {
        ovr[uid] = { ...(ovr[uid] || {}), ...updates };
      }
      this._s('overrides', ovr);
    } else {
      const arr = this._g('users', []);
      const i   = arr.findIndex(u => String(u.id) === uid);
      if (i !== -1) { arr[i] = { ...arr[i], ...updates, id: newId }; this._s('users', arr); }
    }
    // Migrate session if editing logged-in user
    if (ILYA.state.user && String(ILYA.state.user.id) === uid) {
      const fresh = this.userById(newId);
      if (fresh) ILYA.saveSession(fresh);
    }
  },

  deleteUser(id) {
    if (String(id) === '1' || String(id) === '2') return; // protect system
    const arr = this._g('users', []);
    this._s('users', arr.filter(u => String(u.id) !== String(id)));
  },

  banUser(id, type) {
    if (String(id) === '1') return;
    this.updateUser(id, { banned: true, ban_type: type });
  },
  unbanUser(id) { this.updateUser(id, { banned: false, ban_type: null }); },

  tickets(uid) {
    const all = this._g('tickets', []);
    return uid ? all.filter(t => String(t.uid) === String(uid)) : all;
  },
  addTicket(uid, msg, a1, a2) {
    const list = this._g('tickets', []);
    list.unshift({ id: Date.now(), uid: String(uid), message: msg, att1: a1 || null, att2: a2 || null, status: 'open', reply: null, created_at: new Date().toISOString().replace('T',' ').slice(0,19) });
    this._s('tickets', list);
  },
  replyTicket(id, reply) {
    const list = this._g('tickets', []);
    const t = list.find(t => String(t.id) === String(id));
    if (t) { t.reply = reply; t.status = 'replied'; t.replied_at = new Date().toISOString().replace('T',' ').slice(0,19); }
    this._s('tickets', list);
  },

  logActivity(uid, service, prompt, url) {
    const log = this._g('activity', []);
    log.unshift({ id: Date.now(), uid: String(uid), service, prompt: (prompt||'').slice(0,180), url: url||null, created_at: new Date().toISOString().replace('T',' ').slice(0,19) });
    if (log.length > 800) log.splice(800);
    this._s('activity', log);
  },
  activityFor(uid) {
    const all = this._g('activity', []);
    return uid ? all.filter(a => String(a.uid) === String(uid)) : all;
  },

  config() {
    const def = {
      welcome_ar: 'أهلاً بك في موقع خدمات ILYA',
      welcome_en: 'Welcome to ILYA AI Services',
      about_ar:   'منصة ILYA هي وجهتك المتكاملة لخدمات الذكاء الاصطناعي المتقدمة',
      about_en:   'ILYA Platform — your integrated AI services destination',
      copyright_ar: 'جميع الحقوق محفوظة',
      copyright_en: 'All Rights Reserved',
      tg_link:    'https://t.me/swc_t',
      dev_site:   'https://black3web.github.io/Blackweb/',
      reg_on:     'true',
      maint:      'false',
      svc_v1:     'true',
      svc_anime:  'true',
      svc_seed:   'true',
      svc_pfoto:  'true',
      svc_flux:   'true',
      svc_nb2:    'true',
      svc_nbp:    'true',
    };
    return { ...def, ...this._g('config', {}) };
  },
  setConfig(updates) {
    const cur = this._g('config', {});
    this._s('config', { ...cur, ...updates });
  },

  stats() {
    const users = this.users();
    const act   = this._g('activity', []);
    const tkts  = this._g('tickets',  []);
    const vis   = this._g('visitors', 0);
    const bkd   = {};
    act.forEach(a => { bkd[a.service] = (bkd[a.service] || 0) + 1; });
    return {
      users:    users.length,
      banned:   users.filter(u => u.banned).length,
      active:   users.filter(u => !u.banned).length,
      visitors: vis,
      tickets:  tkts.length,
      aitotal:  act.length,
      breakdown: Object.entries(bkd).sort((a,b) => b[1]-a[1]).map(([s,c]) => ({ service:s, count:c })),
    };
  },
  incVis() { this._s('visitors', (this._g('visitors', 0)) + 1); },
};

/* ── AI Models ───────────────────────────────────────────── */
const AI_MODELS = [
  {
    id:'v1', cfgKey:'svc_v1', type:'text',
    icon:'fa-image',
    nameAr:'توليد صورة من نص', nameEn:'Text to Image',
    descAr:'حوّل وصفك النصي إلى صورة عالية الجودة — 4 نسب أبعاد · 4 مستويات جودة',
    descEn:'Transform text into stunning images — 4 ratios · 4 quality levels',
    img:'https://iili.io/BhMseEB.md.jpg',
    isNew:false,
    params: {
      ratios:   ['1:1','9:16','9:21','3:4','16:9','4:3'],
      upscales: [{ v:'1',l:'HD' },{ v:'2',l:'HD+' },{ v:'3',l:'Full HD' },{ v:'4',l:'2K' }],
      counts:   ['1','2','3'],
    },
  },
  {
    id:'anime', cfgKey:'svc_anime', type:'image',
    icon:'fa-star',
    nameAr:'تحويل صورة إلى أنمي', nameEn:'Image to Anime',
    descAr:'14 نمطاً أنمي — أكشن · مانغا · سايبربانك · كلاي وأكثر',
    descEn:'14 anime styles — action · manga · cyberpunk · clay & more',
    img:'https://iili.io/BhVE2F1.md.jpg',
    isNew:false,
    params: {
      ratios:  ['auto','1:1','1:2','2:1','2:3','3:2','9:16','16:9'],
      genders: ['Male','Female'],
      styles:  ['dc_comics','claymation','cyberpunk','pencil_anime','pop_art','cartoon_glamour','bw_comic','manga','bright_realistic','voxel','fantasy_anime','abstract_painting','cartoon_poster','cubist'],
    },
  },
  {
    id:'seed', cfgKey:'svc_seed', type:'text',
    icon:'fa-seedling',
    nameAr:'SeedDream 4.5', nameEn:'SeedDream 4.5',
    descAr:'13 نمطاً فنياً — من الواقعية إلى الجيبلي والسينمائي',
    descEn:'13 artistic styles — from photo-realistic to Ghibli & cinematic',
    img:'https://iili.io/BhVbVRI.md.jpg',
    isNew:false,
    params: {
      ratios: ['square','portrait','landscape','classic','ultrawide'],
      styles: ['none','photo','fantasy','portrait','anime','landscape','scifi','cinematic','oil','pixel','watercolor','ghibli','vintage'],
    },
  },
  {
    id:'pfoto', cfgKey:'svc_pfoto', type:'image',
    icon:'fa-id-badge',
    nameAr:'صورة شخصية احترافية', nameEn:'Personal Photo Maker',
    descAr:'15 نمطاً — حوّل صورتك إلى بروفايل احترافي',
    descEn:'15 styles — turn any photo into a professional profile picture',
    img:'https://iili.io/BhWuQt9.md.jpg',
    isNew:false,
    params: {
      ratios:  ['1:1','2:1','3:2','9:16','16:9'],
      genders: ['male','female'],
      styles:  ['apple_executive','apple_founder','linkedin_exec','modern_fashion','high_fashion','urban_trend','minimalist','lifestyle','studio_photo','social_media','street_style','luxury_fashion','natural_light','christmas','graduation'],
    },
  },
  {
    id:'flux', cfgKey:'svc_flux', type:'text',
    icon:'fa-bolt',
    nameAr:'Flux MAX', nameEn:'Flux MAX',
    descAr:'أقوى نماذج التوليد — جودة استثنائية بـ 11 نسبة أبعاد',
    descEn:'Most powerful model — exceptional quality across 11 aspect ratios',
    img:'https://iili.io/BhWVPja.md.jpg',
    isNew:false,
    params: {
      ratios: ['1:1','1:2','2:1','2:3','3:2','3:4','4:3','4:5','5:4','9:16','16:9'],
    },
  },
  {
    id:'nb2', cfgKey:'svc_nb2', type:'text',
    icon:'fa-wand-sparkles',
    nameAr:'Nano Banana 2 (2K)', nameEn:'Nano Banana 2 (2K)',
    descAr:'نموذج Nano Banana 2 — توليد صور بدقة 2K من وصف نصي',
    descEn:'Nano Banana 2 — generate 2K images from text descriptions',
    img:'https://iili.io/BNVpjCg.md.jpg',
    isNew:true,
    params: {},
  },
  {
    id:'nbp', cfgKey:'svc_nbp', type:'both',
    icon:'fa-pen-nib',
    nameAr:'NanoBanana Pro — إنشاء وتعديل', nameEn:'NanoBanana Pro — Create & Edit',
    descAr:'أنشئ صورة جديدة أو عدّل صورة موجودة بوصف نصي — دقة حتى 4K',
    descEn:'Create or edit images with text — up to 4K resolution',
    img:'https://iili.io/BNV86wN.md.jpg',
    isNew:true,
    params: {
      ratios: ['1:1','16:9','9:16','4:3','3:4'],
      resolutions: ['1K','2K','4K'],
    },
  },
];

/* ── Translations ────────────────────────────────────────── */
const T = {
  ar: {
    app:'ILYA AI', welcome:'أهلاً بك', have_acc:'لدي حساب', create_acc:'إنشاء حساب',
    login:'دخول', register:'تسجيل', name:'الاسم الكامل', username:'معرف المستخدم',
    password:'كلمة المرور', confirm_pw:'تأكيد المرور', uname_hint:'4 أحرف على الأقل',
    ai_srv:'خدمات AI', my_acc:'حسابي', help:'المساعدة', support:'الدعم',
    gallery:'معرضي', admin:'لوحة التحكم', logout:'خروج', back:'رجوع',
    send:'إرسال', generating:'جاري التوليد...', error_gen:'حدث خطأ، جاري إعادة المحاولة...',
    error_final:'فشل التوليد — تحقق من الوصف وأعد المحاولة',
    write_desc:'أدخل وصفاً تفصيلياً...', img_url:'رابط الصورة (URL)',
    ratio:'نسبة الأبعاد', quality:'الجودة', style:'النمط', gender:'الجنس', count:'عدد الصور',
    resolution:'الدقة', settings:'الإعدادات',
    save:'حفظ التغييرات', saved:'تم الحفظ ✓', my_id:'رقم هويتك',
    pic_url:'رابط الصورة', pic_from_device:'رفع من الجهاز',
    send_ticket:'إرسال تذكرة', your_msg:'رسالتك...',
    attach:'إرفاق صورة', no_tickets:'لا توجد تذاكر', ticket_sent:'تم الإرسال',
    admin_reply:'رد الإدارة', stats:'الإحصائيات', users_mgmt:'المستخدمون',
    banned:'المحظورون', support_inbox:'صندوق الدعم', sys_config:'إعدادات النظام',
    act_log:'سجل النشاط', ban_tmp:'حظر مؤقت', ban_prm:'حظر نهائي', unban:'رفع الحظر',
    del_user:'حذف المستخدم', reply:'إرسال رد', write_reply:'اكتب ردك...',
    copyright:'جميع الحقوق محفوظة', result_ready:'النتيجة جاهزة!',
    download:'تحميل', open_link:'فتح الرابط', copy:'نسخ الرابط', copied:'تم النسخ!',
    home:'الرئيسية', menu:'القائمة', dev_site_btn:'موقع المبرمج',
    upload_img:'رفع صورة', uploading:'جاري الرفع...',
    upload_done:'تم رفع الصورة', upload_fail:'فشل الرفع',
    drag_drop:'اسحب الصورة هنا أو انقر للاختيار',
    drag_drop_sub:'PNG, JPG, WEBP — حجم أقصى 10MB',
    or:'أو',
    from_device:'من الجهاز',
    from_url:'رابط URL',
    regenerate:'إعادة التوليد',
    retry:'إعادة المحاولة',
    clear_results:'مسح النتائج',
    select_model:'اختر نموذجاً',
    total_users:'المستخدمون', total_vis:'الزوار', total_ai:'طلبات AI', total_tickets:'التذاكر',
    broadcast:'رسالة عامة', broadcast_send:'إرسال لجميع المستخدمين',
    err_fields:'جميع الحقول مطلوبة',
    err_uname_taken:'المعرف مستخدم بالفعل',
    err_wrong_cred:'بيانات الدخول غير صحيحة',
    err_banned:'الحساب موقوف',
    err_reg_off:'التسجيل مغلق حالياً',
    err_maint:'المنصة في وضع الصيانة',
    err_pw_match:'كلمتا المرور غير متطابقتين',
    err_uname_short:'المعرف يجب أن يكون 4 أحرف على الأقل',
    err_no_prompt:'الرجاء إدخال وصف',
    err_no_img:'الرجاء إدخال رابط الصورة أو رفع صورة',
    greeting: n => `أهلاً، ${n}`,
    member_since: d => `عضو منذ: ${d}`,
  },
  en: {
    app:'ILYA AI', welcome:'Welcome', have_acc:'I have an account', create_acc:'Create Account',
    login:'Login', register:'Register', name:'Full Name', username:'Username',
    password:'Password', confirm_pw:'Confirm Password', uname_hint:'At least 4 characters',
    ai_srv:'AI Services', my_acc:'My Account', help:'Help', support:'Support',
    gallery:'My Gallery', admin:'Admin Panel', logout:'Logout', back:'Back',
    send:'Send', generating:'Generating...', error_gen:'Error occurred, retrying...',
    error_final:'Generation failed — check your prompt and try again',
    write_desc:'Enter a detailed description...', img_url:'Image URL',
    ratio:'Aspect Ratio', quality:'Quality', style:'Style', gender:'Gender', count:'Image Count',
    resolution:'Resolution', settings:'Settings',
    save:'Save Changes', saved:'Saved ✓', my_id:'Your ID',
    pic_url:'Image URL', pic_from_device:'Upload from device',
    send_ticket:'Send Ticket', your_msg:'Your message...',
    attach:'Attach image', no_tickets:'No tickets yet', ticket_sent:'Ticket sent',
    admin_reply:'Admin Reply', stats:'Statistics', users_mgmt:'Users',
    banned:'Banned', support_inbox:'Support Inbox', sys_config:'System Config',
    act_log:'Activity Log', ban_tmp:'Temp Ban', ban_prm:'Permanent Ban', unban:'Unban',
    del_user:'Delete User', reply:'Send Reply', write_reply:'Write your reply...',
    copyright:'All Rights Reserved', result_ready:'Result Ready!',
    download:'Download', open_link:'Open Link', copy:'Copy URL', copied:'Copied!',
    home:'Home', menu:'Menu', dev_site_btn:"Developer's Website",
    upload_img:'Upload Image', uploading:'Uploading...', upload_done:'Image uploaded',
    upload_fail:'Upload failed', drag_drop:'Drag image here or click to select',
    drag_drop_sub:'PNG, JPG, WEBP — max 10MB',
    or:'OR',
    from_device:'From device',
    from_url:'URL link',
    regenerate:'Regenerate',
    retry:'Retry',
    clear_results:'Clear Results',
    select_model:'Select a model',
    total_users:'Users', total_vis:'Visitors', total_ai:'AI Requests', total_tickets:'Tickets',
    broadcast:'Broadcast', broadcast_send:'Send to all users',
    err_fields:'All fields are required',
    err_uname_taken:'Username already taken',
    err_wrong_cred:'Incorrect credentials',
    err_banned:'Account suspended',
    err_reg_off:'Registration is currently closed',
    err_maint:'Platform is under maintenance',
    err_pw_match:'Passwords do not match',
    err_uname_short:'Username must be at least 4 characters',
    err_no_prompt:'Please enter a description',
    err_no_img:'Please enter an image URL or upload an image',
    greeting: n => `Hello, ${n}`,
    member_since: d => `Member since: ${d}`,
  },
};

/* ── ILYA Core ───────────────────────────────────────────── */
const ILYA = {
  state: {
    user:    null,
    token:   null,
    lang:    'ar',
    page:    '',
    config:  {},
    modelId: null,
  },

  t(k, ...args) {
    const e = T[this.state.lang]?.[k];
    return typeof e === 'function' ? e(...args) : (e || k);
  },

  esc(s) {
    return String(s || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },

  // ── Language ───────────────────────────────────────
  toggleLang() {
    this.state.lang = this.state.lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('ilya_lang', this.state.lang);
    this._applyLang(true);
  },

  _applyLang(rerender = false) {
    const isAr = this.state.lang === 'ar';
    document.documentElement.lang = this.state.lang;
    document.documentElement.dir  = isAr ? 'rtl' : 'ltr';
    const lbl = document.getElementById('lang-label');
    if (lbl) lbl.textContent = isAr ? 'EN' : 'AR';
    document.querySelectorAll('[data-ar][data-en]').forEach(el => {
      el.textContent = isAr ? el.dataset.ar : el.dataset.en;
    });
    if (rerender && this.state.page) {
      const fn = this._renders[this.state.page];
      if (fn) fn();
    }
  },

  _renders: {},
  reg(page, fn) { this._renders[page] = fn; },

  // ── Router ──────────────────────────────────────────
  go(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pg = document.getElementById('page-' + id);
    if (!pg) return;
    pg.classList.add('active');
    pg.scrollTop = 0;
    this.state.page = id;

    // Top bar visibility
    const tb = document.getElementById('top-bar');
    if (id === 'auth') {
      tb.classList.add('hidden');
      pg.classList.add('auth-page-active');
    } else {
      tb.classList.remove('hidden');
      pg.classList.remove('auth-page-active');
    }

    // Hamburger open state reset
    const hbtn = document.getElementById('hamburger-btn');
    if (hbtn) hbtn.classList.remove('open');
  },

  // ── Sidebar ─────────────────────────────────────────
  openSidebar() {
    const ov = document.getElementById('sidebar-overlay');
    ov.classList.add('open');
    const hbtn = document.getElementById('hamburger-btn');
    if (hbtn) hbtn.classList.add('open');
    ILYADashboard.renderSidebar();
  },
  closeSidebar() {
    document.getElementById('sidebar-overlay').classList.remove('open');
    const hbtn = document.getElementById('hamburger-btn');
    if (hbtn) hbtn.classList.remove('open');
  },

  // ── Toast ───────────────────────────────────────────
  toast(msg, type = 'info', ms = 3000) {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const icons = { success:'fa-circle-check', error:'fa-circle-exclamation', info:'fa-circle-info', warn:'fa-triangle-exclamation' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<i class="fa-solid ${icons[type]||icons.info}"></i><span>${this.esc(msg)}</span>`;
    c.appendChild(el);
    setTimeout(() => el.remove(), ms);
  },

  // ── Lightbox ────────────────────────────────────────
  openLightbox(src) {
    const lb = document.getElementById('lightbox');
    document.getElementById('lb-img').src = src;
    lb.classList.add('open');
  },
  closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
  },

  // ── Copy to clipboard ──────────────────────────────
  async copyToClipboard(text, btn) {
    try {
      await navigator.clipboard.writeText(text);
      if (btn) { const orig = btn.innerHTML; btn.innerHTML = `<i class="fa-solid fa-check"></i>`; setTimeout(() => btn.innerHTML = orig, 1800); }
      this.toast(this.t('copied'), 'success', 1500);
    } catch { this.toast('Copy failed', 'error'); }
  },

  // ── Session ─────────────────────────────────────────
  saveSession(user) {
    this.state.user  = user;
    this.state.token = user.id;
    localStorage.setItem('ilya_session', JSON.stringify({ id: user.id, ts: Date.now() }));
    // Update top avatar
    const av = document.getElementById('top-avatar-img');
    if (av) av.src = user.pic || 'https://iili.io/B04MxcX.md.jpg';
  },
  clearSession() {
    this.state.user  = null;
    this.state.token = null;
    localStorage.removeItem('ilya_session');
  },
  getSavedId() {
    try {
      const s = JSON.parse(localStorage.getItem('ilya_session'));
      // Session expires after 30 days
      if (s && s.id && (Date.now() - s.ts < 30 * 24 * 3600 * 1000)) return s.id;
      return null;
    } catch { return null; }
  },

  // ── Footer HTML helper ──────────────────────────────
  footer() {
    const cfg  = this.state.config;
    const t    = k => this.t(k);
    const year = new Date().getFullYear();
    return `
      <div class="page-foot">
        <div>ILYA AI © ${year} — ${t('copyright')}</div>
        <div>
          <a href="${cfg.tg_link || 'https://t.me/swc_t'}" target="_blank" rel="noopener">
            <i class="fa-brands fa-telegram"></i> Telegram
          </a>
          &nbsp;·&nbsp;
          <a href="${cfg.dev_site || 'https://black3web.github.io/Blackweb/'}" target="_blank" rel="noopener">
            <i class="fa-solid fa-globe"></i> ${t('dev_site_btn')}
          </a>
        </div>
      </div>`;
  },

  // ── Init ────────────────────────────────────────────
  init() {
    const savedLang = localStorage.getItem('ilya_lang') || 'ar';
    this.state.lang = savedLang;
    this._applyLang();

    this.state.config = DB.config();

    // Events
    document.getElementById('lb-close')?.addEventListener('click', () => this.closeLightbox());
    document.getElementById('lightbox')?.addEventListener('click', e => {
      if (e.target.classList.contains('lb-backdrop')) this.closeLightbox();
    });
    document.getElementById('hamburger-btn')?.addEventListener('click', () => this.openSidebar());
    document.getElementById('lang-btn')?.addEventListener('click', () => this.toggleLang());
    document.getElementById('top-avatar-btn')?.addEventListener('click', () => {
      this.closeSidebar();
      ILYADashboard.showProfile();
    });
    document.getElementById('sidebar-overlay')?.addEventListener('click', e => {
      if (e.target.id === 'sidebar-overlay') this.closeSidebar();
    });

    // Restore session
    const savedId = this.getSavedId();
    if (savedId) {
      const fresh = DB.userById(savedId);
      if (fresh && !fresh.banned) {
        this.saveSession(fresh);
        DB.incVis();
        ILYADashboard.show();
        return;
      }
      this.clearSession();
    }
    ILYAAuth.show();
  },
};

/* ── Preloader ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const fill  = document.getElementById('pre-fill');
  const bolt  = document.getElementById('pre-bolt');
  const pct   = document.getElementById('pre-pct');
  const stTxt = document.getElementById('pre-status');
  const pre   = document.getElementById('preloader');
  const app   = document.getElementById('app');

  let progress = 0;
  const statusAr = ['تهيئة المنصة...','تحميل الأصول...','الاتصال بالخدمات...','التحقق من الجلسة...','جاهز!'];
  const statusEn = ['Initializing...','Loading assets...','Connecting...','Verifying session...','Ready!'];

  const tick = setInterval(() => {
    progress = Math.min(progress + Math.random() * 4.2 + 1.1, 100);
    if (fill) fill.style.width = progress + '%';
    if (pct)  pct.textContent  = Math.floor(progress) + '%';
    const idx  = Math.min(Math.floor(progress / 25), 4);
    const lang = localStorage.getItem('ilya_lang') || 'ar';
    if (stTxt) stTxt.textContent = lang === 'ar' ? statusAr[idx] : statusEn[idx];
    if (progress >= 100) clearInterval(tick);
  }, 48);

  setTimeout(() => {
    clearInterval(tick);
    if (fill) fill.style.width = '100%';
    if (pct)  pct.textContent  = '100%';
    pre.style.transition = 'opacity .65s ease';
    pre.style.opacity    = '0';
    setTimeout(() => {
      pre.style.display = 'none';
      app.style.display = 'block';
      // Use rAF to allow layout, then fade in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          app.classList.add('ready');
          ILYA.init();
        });
      });
    }, 650);
  }, 5000);
});
