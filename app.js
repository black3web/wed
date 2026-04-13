/* ═══════════════════════════════════════════════════════════
   ILYA AI Platform — Core (app.js)
   Client-side auth · MD5 · Router · i18n · Config
═══════════════════════════════════════════════════════════ */

/* ── MD5 (pure JS, matches PHP md5()) ───────────────────── */
function md5(str) {
  function safe(x,y){const l=(x&0xffff)+(y&0xffff);const m=(x>>16)+(y>>16)+(l>>16);return(m<<16)|(l&0xffff);}
  function rot(n,c){return(n<<c)|(n>>>(32-c));}
  function cmn(q,a,b,x,s,t){return safe(rot(safe(safe(a,q),safe(x,t)),s),b);}
  function ff(a,b,c,d,x,s,t){return cmn((b&c)|((~b)&d),a,b,x,s,t);}
  function gg(a,b,c,d,x,s,t){return cmn((b&d)|(c&(~d)),a,b,x,s,t);}
  function hh(a,b,c,d,x,s,t){return cmn(b^c^d,a,b,x,s,t);}
  function ii(a,b,c,d,x,s,t){return cmn(c^(b|(~d)),a,b,x,s,t);}
  function blk(s){const l=s.length;const r=[];let i;for(i=0;i<l;i++)r[i>>2]|=s.charCodeAt(i)<<((i%4)*8);r[l>>2]|=0x80<<((l%4)*8);r[((l+64>>9)<<4)+14]=l*8;return r;}
  function hex(n){let s='';for(let i=0;i<4;i++)s+=('0'+((n>>>(i*8))&0xff).toString(16)).slice(-2);return s;}
  str=unescape(encodeURIComponent(str));
  let x=blk(str),a=0x67452301,b=0xEFCDAB89,c=0x98BADCFE,d=0x10325476;
  for(let i=0;i<x.length;i+=16){const A=a,B=b,C=c,D=d;
    a=ff(a,b,c,d,x[i],7,-680876936);d=ff(d,a,b,c,x[i+1],12,-389564586);c=ff(c,d,a,b,x[i+2],17,606105819);b=ff(b,c,d,a,x[i+3],22,-1044525330);
    a=ff(a,b,c,d,x[i+4],7,-176418897);d=ff(d,a,b,c,x[i+5],12,1200080426);c=ff(c,d,a,b,x[i+6],17,-1473231341);b=ff(b,c,d,a,x[i+7],22,-45705983);
    a=ff(a,b,c,d,x[i+8],7,1770035416);d=ff(d,a,b,c,x[i+9],12,-1958414417);c=ff(c,d,a,b,x[i+10],17,-42063);b=ff(b,c,d,a,x[i+11],22,-1990404162);
    a=ff(a,b,c,d,x[i+12],7,1804603682);d=ff(d,a,b,c,x[i+13],12,-40341101);c=ff(c,d,a,b,x[i+14],17,-1502002290);b=ff(b,c,d,a,x[i+15],22,1236535329);
    a=gg(a,b,c,d,x[i+1],5,-165796510);d=gg(d,a,b,c,x[i+6],9,-1069501632);c=gg(c,d,a,b,x[i+11],14,643717713);b=gg(b,c,d,a,x[i],20,-373897302);
    a=gg(a,b,c,d,x[i+5],5,-701558691);d=gg(d,a,b,c,x[i+10],9,38016083);c=gg(c,d,a,b,x[i+15],14,-660478335);b=gg(b,c,d,a,x[i+4],20,-405537848);
    a=gg(a,b,c,d,x[i+9],5,568446438);d=gg(d,a,b,c,x[i+14],9,-1019803690);c=gg(c,d,a,b,x[i+3],14,-187363961);b=gg(b,c,d,a,x[i+8],20,1163531501);
    a=gg(a,b,c,d,x[i+13],5,-1444681467);d=gg(d,a,b,c,x[i+2],9,-51403784);c=gg(c,d,a,b,x[i+7],14,1735328473);b=gg(b,c,d,a,x[i+12],20,-1926607734);
    a=hh(a,b,c,d,x[i+5],4,-378558);d=hh(d,a,b,c,x[i+8],11,-2022574463);c=hh(c,d,a,b,x[i+11],16,1839030562);b=hh(b,c,d,a,x[i+14],23,-35309556);
    a=hh(a,b,c,d,x[i+1],4,-1530992060);d=hh(d,a,b,c,x[i+4],11,1272893353);c=hh(c,d,a,b,x[i+7],16,-155497632);b=hh(b,c,d,a,x[i+10],23,-1094730640);
    a=hh(a,b,c,d,x[i+13],4,681279174);d=hh(d,a,b,c,x[i],11,-358537222);c=hh(c,d,a,b,x[i+3],16,-722521979);b=hh(b,c,d,a,x[i+6],23,76029189);
    a=hh(a,b,c,d,x[i+9],4,-640364487);d=hh(d,a,b,c,x[i+12],11,-421815835);c=hh(c,d,a,b,x[i+15],16,530742520);b=hh(b,c,d,a,x[i+2],23,-995338651);
    a=ii(a,b,c,d,x[i],6,-198630844);d=ii(d,a,b,c,x[i+7],10,1126891415);c=ii(c,d,a,b,x[i+14],15,-1416354905);b=ii(b,c,d,a,x[i+5],21,-57434055);
    a=ii(a,b,c,d,x[i+12],6,1700485571);d=ii(d,a,b,c,x[i+3],10,-1894986606);c=ii(c,d,a,b,x[i+10],15,-1051523);b=ii(b,c,d,a,x[i+1],21,-2054922799);
    a=ii(a,b,c,d,x[i+8],6,1873313359);d=ii(d,a,b,c,x[i+15],10,-30611744);c=ii(c,d,a,b,x[i+6],15,-1560198380);b=ii(b,c,d,a,x[i+13],21,1309151649);
    a=ii(a,b,c,d,x[i+4],6,-145523070);d=ii(d,a,b,c,x[i+11],10,-1120210379);c=ii(c,d,a,b,x[i+2],15,718787259);b=ii(b,c,d,a,x[i+9],21,-343485551);
    a=safe(a,A);b=safe(b,B);c=safe(c,C);d=safe(d,D);
  }
  return hex(a)+hex(b)+hex(c)+hex(d);
}

/* ── Client-side Database ───────────────────────────────── */
const DB = {
  SYSTEM: [
    { id:'1', name:'المبرمج',     username:'A1', ph:'5cd9e55dcaf491d32289b848adeb216e', role:'admin', pic:'https://iili.io/B04MxcX.md.jpg', created_at:'2025-01-01' },
    { id:'2', name:'زوجة المبرمج',username:'M1', ph:'5cd9e55dcaf491d32289b848adeb216e', role:'vip',   pic:'https://iili.io/B04MxcX.md.jpg', created_at:'2025-01-01' },
  ],

  _get(k, def=null) {
    try { const v=localStorage.getItem('ilya_'+k); return v!==null ? JSON.parse(v) : def; } catch{ return def; }
  },
  _set(k, v) { try { localStorage.setItem('ilya_'+k, JSON.stringify(v)); } catch{} },

  users() {
    const stored  = this._get('users', []);
    const ovr     = this._get('overrides', {});
    const sys = this.SYSTEM.map(u => ovr[u.id] ? {...u, ...ovr[u.id]} : u);
    return [...sys, ...stored];
  },

  userById(id) { return this.users().find(u => String(u.id) === String(id)); },

  userByUsername(uname) {
    return this.users().find(u => u.username.toLowerCase() === uname.toLowerCase());
  },

  login(username, password) {
    const user = this.userByUsername(username);
    if (!user) return { error: 'user_not_found' };
    if (user.ph !== md5(password)) return { error: 'wrong_password' };
    if (user.banned) return { error: 'banned', ban_type: user.ban_type };
    return { user };
  },

  register(name, username, password) {
    if (this.userByUsername(username)) return { error: 'username_taken' };
    if (username.length < 4) return { error: 'username_short' };
    // 15-digit ID
    let id;
    do { id = String(Math.floor(Math.random() * 9e14 + 1e14)); }
    while (this.userById(id));

    const user = {
      id, name, username,
      ph: md5(password),
      role: 'user',
      pic: 'https://iili.io/B04MxcX.md.jpg',
      created_at: new Date().toISOString().slice(0,10)
    };
    const stored = this._get('users', []);
    stored.push(user);
    this._set('users', stored);
    return { user };
  },

  updateUser(id, updates) {
    const isSystem = this.SYSTEM.find(u => String(u.id) === String(id));
    if (isSystem) {
      const ovr = this._get('overrides', {});
      ovr[id] = { ...(ovr[id]||{}), ...updates };
      this._set('overrides', ovr);
    } else {
      const stored = this._get('users', []);
      const i = stored.findIndex(u => String(u.id) === String(id));
      if (i !== -1) { stored[i] = {...stored[i], ...updates}; this._set('users', stored); }
    }
  },

  banUser(id, type) {
    if (String(id) === '1') return; // protect admin
    this.updateUser(id, { banned: true, ban_type: type });
  },
  unbanUser(id) { this.updateUser(id, { banned: false, ban_type: null }); },

  // Tickets
  tickets(userId) {
    const all = this._get('tickets', []);
    return userId ? all.filter(t => String(t.user_id) === String(userId)) : all;
  },
  addTicket(userId, message, att1, att2) {
    const list = this._get('tickets', []);
    list.unshift({ id: Date.now(), user_id: String(userId), message, attachment1: att1||null, attachment2: att2||null, status:'open', admin_reply:null, created_at: new Date().toISOString() });
    this._set('tickets', list);
  },
  replyTicket(id, reply) {
    const list = this._get('tickets', []);
    const t = list.find(t => String(t.id) === String(id));
    if (t) { t.admin_reply = reply; t.status = 'replied'; t.replied_at = new Date().toISOString(); }
    this._set('tickets', list);
  },

  // Activity
  logActivity(userId, service, details, url) {
    const log = this._get('activity', []);
    log.unshift({ id: Date.now(), user_id: String(userId), service, details: details||'', result_url: url||null, created_at: new Date().toISOString() });
    if (log.length > 600) log.splice(600);
    this._set('activity', log);
  },
  activity(userId) {
    const log = this._get('activity', []);
    const users = this.users();
    const enriched = log.map(a => {
      const u = users.find(u => String(u.id) === String(a.user_id));
      return { ...a, uname: u?.username || '', uname_full: u?.name || '' };
    });
    return userId ? enriched.filter(a => String(a.user_id) === String(userId)) : enriched;
  },

  // Config
  config() {
    const def = {
      welcome_ar: 'أهلاً بك في موقع خدمات ILYA',
      welcome_en: 'Welcome to ILYA AI Services',
      about_ar:   'منصة ILYA هي وجهتك المتكاملة لخدمات الذكاء الاصطناعي المتقدمة',
      about_en:   'ILYA Platform — your destination for advanced AI services',
      copyright_ar: 'جميع الحقوق محفوظة',
      copyright_en: 'All Rights Reserved',
      tg_link: 'https://t.me/swc_t',
      dev_site: 'https://black3web.github.io/Blackweb/',
      reg_enabled: 'true',
      maintenance: 'false',
      svc_text_to_image: 'true',
      svc_image_to_anime: 'true',
      svc_seedream: 'true',
      svc_image_to_personal: 'true',
      svc_flux_max: 'true',
      svc_nano_banana_2: 'true',
      svc_nano_banana_pro: 'true',
    };
    return { ...def, ...this._get('config', {}) };
  },
  setConfig(updates) {
    const cur = this._get('config', {});
    this._set('config', { ...cur, ...updates });
  },

  stats() {
    const users    = this.users();
    const activity = this._get('activity', []);
    const tickets  = this._get('tickets',  []);
    const visitors = this._get('visitors', 0);
    const bkd = {};
    activity.forEach(a => { bkd[a.service] = (bkd[a.service]||0)+1; });
    return {
      users:    users.length,
      banned:   users.filter(u => u.banned).length,
      visitors, tickets: tickets.length,
      total_services: activity.length,
      services_breakdown: Object.entries(bkd).map(([service,count]) => ({service,count}))
    };
  },
  incVisitors() { this._set('visitors', (this._get('visitors', 0)) + 1); },
};

/* ── Translations ───────────────────────────────────────── */
const T = {
  ar: {
    app:'ILYA AI', loading:'جاري التهيئة...', welcome:'أهلاً بك',
    have_acc:'لدي حساب', create_acc:'إنشاء حساب', login:'دخول', register:'تسجيل',
    name:'الاسم الكامل', username:'معرف المستخدم', password:'كلمة المرور',
    confirm_pw:'تأكيد المرور', uname_hint:'4 أحرف على الأقل',
    ai_srv:'خدمات AI', my_acc:'حسابي', help:'المساعدة', support:'الدعم',
    admin:'لوحة التحكم', logout:'خروج', back:'رجوع',
    send:'إرسال', generating:'جاري التوليد...', error_gen:'حدث خطأ، أعد المحاولة',
    write_desc:'أدخل وصفاً تفصيلياً...', img_url:'رابط الصورة',
    ratio:'نسبة الأبعاد', quality:'الجودة', style:'النمط', gender:'الجنس', count:'عدد الصور',
    save:'حفظ التغييرات', saved:'تم الحفظ ✓', my_id:'رقم هويتك',
    pic_url:'رابط صورة الملف الشخصي', edit_profile:'تعديل الملف',
    send_ticket:'إرسال تذكرة دعم', your_msg:'رسالتك...',
    attach:'إرفاق صورة (اختياري)', no_tickets:'لا توجد تذاكر سابقة',
    ticket_sent:'تم إرسال التذكرة بنجاح', admin_reply:'رد الإدارة',
    stats:'الإحصائيات', users_mgmt:'المستخدمون', banned:'المحظورون',
    support_inbox:'صندوق الدعم', sys_config:'إعدادات النظام', act_log:'سجل النشاط',
    total_users:'المستخدمون', total_vis:'الزوار', total_srv:'طلبات AI', total_tkt:'تذاكر الدعم',
    ban_tmp:'حظر مؤقت', ban_prm:'حظر نهائي', unban:'رفع الحظر',
    reply:'إرسال رد', write_reply:'اكتب ردك...',
    copyright:'جميع الحقوق محفوظة', result_ready:'النتيجة جاهزة!',
    download:'تحميل', open_link:'فتح الرابط',
    home:'الرئيسية', menu:'القائمة',
    dev_site_btn:'موقع المبرمج',
    platform_info:'معلومات المنصة',
    resolution:'الدقة',
    err_uname_taken:'المعرف مستخدم بالفعل',
    err_wrong_cred:'بيانات الدخول غير صحيحة',
    err_banned:'الحساب موقوف',
    err_reg_off:'التسجيل مغلق حالياً',
    err_maint:'المنصة في وضع الصيانة',
    err_fields:'جميع الحقول مطلوبة',
    err_pw_match:'كلمتا المرور غير متطابقتين',
    err_uname_short:'المعرف يجب أن يكون 4 أحرف على الأقل',
    greeting: (n) => `أهلاً، ${n}`,
    member_since: (d) => `عضو منذ: ${d}`,
  },
  en: {
    app:'ILYA AI', loading:'Initializing...', welcome:'Welcome',
    have_acc:'I have an account', create_acc:'Create Account', login:'Login', register:'Register',
    name:'Full Name', username:'Username', password:'Password',
    confirm_pw:'Confirm Password', uname_hint:'At least 4 characters',
    ai_srv:'AI Services', my_acc:'My Account', help:'Help', support:'Support',
    admin:'Admin Panel', logout:'Logout', back:'Back',
    send:'Send', generating:'Generating...', error_gen:'Error occurred, please retry',
    write_desc:'Enter a detailed description...', img_url:'Image URL',
    ratio:'Aspect Ratio', quality:'Quality', style:'Style', gender:'Gender', count:'Image Count',
    save:'Save Changes', saved:'Saved ✓', my_id:'Your ID',
    pic_url:'Profile Picture URL', edit_profile:'Edit Profile',
    send_ticket:'Send Support Ticket', your_msg:'Your message...',
    attach:'Attach image (optional)', no_tickets:'No tickets yet',
    ticket_sent:'Ticket sent successfully', admin_reply:'Admin Reply',
    stats:'Statistics', users_mgmt:'Users', banned:'Banned',
    support_inbox:'Support Inbox', sys_config:'System Config', act_log:'Activity Log',
    total_users:'Users', total_vis:'Visitors', total_srv:'AI Requests', total_tkt:'Tickets',
    ban_tmp:'Temp Ban', ban_prm:'Permanent Ban', unban:'Unban',
    reply:'Send Reply', write_reply:'Write your reply...',
    copyright:'All Rights Reserved', result_ready:'Result Ready!',
    download:'Download', open_link:'Open Link',
    home:'Home', menu:'Menu',
    dev_site_btn:"Developer's Website",
    platform_info:'Platform Info',
    resolution:'Resolution',
    err_uname_taken:'Username already taken',
    err_wrong_cred:'Incorrect login credentials',
    err_banned:'Account suspended',
    err_reg_off:'Registration is currently closed',
    err_maint:'Platform is under maintenance',
    err_fields:'All fields are required',
    err_pw_match:'Passwords do not match',
    err_uname_short:'Username must be at least 4 characters',
    greeting: (n) => `Hello, ${n}`,
    member_since: (d) => `Member since: ${d}`,
  }
};

/* ── AI Models Config ───────────────────────────────────── */
const AI_MODELS = [
  {
    id: 'text_to_image',
    icon: 'fa-image',
    nameAr:'توليد صورة من نص', nameEn:'Text to Image',
    descAr:'حوّل وصفك النصي إلى صورة بجودة 2K مع 4 نسب أبعاد',
    descEn:'Transform your text into a stunning image — 4 ratios, 4 quality levels',
    img: 'https://iili.io/BhMseEB.md.jpg',
    type:'text', cfgKey:'svc_text_to_image',
    params: {
      ratios:   ['1:1','9:16','9:21','3:4','16:9','4:3'],
      upscales: [{ v:'1',l:'HD' },{ v:'2',l:'HD+' },{ v:'3',l:'Full HD' },{ v:'4',l:'2K' }],
      counts:   ['1','2','3'],
    }
  },
  {
    id: 'image_to_anime',
    icon: 'fa-star',
    nameAr:'تحويل صورة إلى أنمي', nameEn:'Image to Anime',
    descAr:'14 نمطاً أنمي — حوّل أي صورة إلى أنمي أو كاريكاتير احترافي',
    descEn:'14 anime styles — convert any image to anime or cartoon',
    img: 'https://iili.io/BhVE2F1.md.jpg',
    type:'image', cfgKey:'svc_image_to_anime',
    params: {
      ratios:  ['auto','1:1','1:2','2:1','2:3','3:2','9:16','16:9'],
      genders: ['Male','Female'],
      styles:  ['dc_comics','claymation','cyberpunk','pencil_anime','pop_art','cartoon_glamour','bw_comic','manga','bright_realistic','voxel','fantasy_anime','abstract_painting','cartoon_poster','cubist'],
    }
  },
  {
    id: 'seedream',
    icon: 'fa-seedling',
    nameAr:'SeedDream 4.5', nameEn:'SeedDream 4.5',
    descAr:'13 نمطاً فنياً — من الواقعية إلى الجيبلي والسينمائي',
    descEn:'13 artistic styles — from photo-realistic to Ghibli & cinematic',
    img: 'https://iili.io/BhVbVRI.md.jpg',
    type:'text', cfgKey:'svc_seedream',
    params: {
      ratios: ['square','portrait','landscape','classic','ultrawide'],
      styles: ['none','photo','fantasy','portrait','anime','landscape','scifi','cinematic','oil','pixel','watercolor','ghibli','vintage'],
    }
  },
  {
    id: 'image_to_personal',
    icon: 'fa-id-badge',
    nameAr:'صورة شخصية احترافية', nameEn:'Personal Photo Maker',
    descAr:'15 نمطاً — اجعل صورتك صورة بروفايل احترافية',
    descEn:'15 styles — turn any photo into a professional profile picture',
    img: 'https://iili.io/BhWuQt9.md.jpg',
    type:'image', cfgKey:'svc_image_to_personal',
    params: {
      ratios:  ['1:1','2:1','3:2','9:16','16:9'],
      genders: ['male','female'],
      styles:  ['apple_executive','apple_founder','linkedin_exec','modern_fashion','high_fashion','urban_trend','minimalist','lifestyle','studio_photo','social_media','street_style','luxury_fashion','natural_light','christmas','graduation'],
    }
  },
  {
    id: 'flux_max',
    icon: 'fa-bolt',
    nameAr:'Flux MAX', nameEn:'Flux MAX',
    descAr:'أقوى نماذج التوليد — جودة استثنائية بـ 11 نسبة أبعاد',
    descEn:'Most powerful model — exceptional quality, 11 aspect ratios',
    img: 'https://iili.io/BhWVPja.md.jpg',
    type:'text', cfgKey:'svc_flux_max',
    params: {
      ratios: ['1:1','1:2','2:1','2:3','3:2','3:4','4:3','4:5','5:4','9:16','16:9'],
    }
  },
  {
    id: 'nano_banana_2',
    icon: 'fa-wand-sparkles',
    nameAr:'Nano Banana 2 (2K)', nameEn:'Nano Banana 2 (2K)',
    descAr:'نموذج Nano Banana 2 — توليد صور بدقة 2K من وصف نصي',
    descEn:'Nano Banana 2 — Generate 2K images from text description',
    img: 'https://iili.io/BhMseEB.md.jpg',
    type:'text', cfgKey:'svc_nano_banana_2',
    params: {}
  },
  {
    id: 'nano_banana_pro',
    icon: 'fa-pen-nib',
    nameAr:'NanoBanana Pro (إنشاء وتعديل)', nameEn:'NanoBanana Pro (Create & Edit)',
    descAr:'توليد وتعديل الصور — أنشئ صورة أو عدّل صورة موجودة بوصف نصي',
    descEn:'Create or edit images with text — supports image input for editing',
    img: 'https://iili.io/BhWVPja.md.jpg',
    type:'both', cfgKey:'svc_nano_banana_pro',
    params: {
      ratios: ['1:1','16:9','9:16','4:3','3:4'],
      resolutions: ['1K','2K','4K'],
    }
  },
];

/* ── ILYA Core ──────────────────────────────────────────── */
const ILYA = {

  state: {
    user:     null,
    token:    null,
    lang:     'ar',
    page:     '',
    config:   {},
    modelId:  null,
  },

  t(k, ...args) {
    const entry = T[this.state.lang]?.[k];
    if (typeof entry === 'function') return entry(...args);
    return entry || k;
  },

  // ── Language Toggle ─────────────────────────────────
  toggleLang() {
    this.state.lang = this.state.lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('ilya_lang', this.state.lang);
    this._applyLang();
    // Re-render current page
    if (this.state.page) {
      const fn = this._pageRenders[this.state.page];
      if (fn) fn();
    }
  },

  _applyLang() {
    const isAr = this.state.lang === 'ar';
    document.documentElement.lang = this.state.lang;
    document.documentElement.dir  = isAr ? 'rtl' : 'ltr';
    const label = document.getElementById('lang-label');
    if (label) label.textContent = isAr ? 'EN' : 'AR';
    // Update static nav labels
    document.querySelectorAll('[data-ar][data-en]').forEach(el => {
      el.textContent = isAr ? el.dataset.ar : el.dataset.en;
    });
  },

  _pageRenders: {},
  registerPageRender(page, fn) { this._pageRenders[page] = fn; },

  // ── Router ──────────────────────────────────────────
  showPage(id, rerender = false) {
    if (this.state.page === id && !rerender) return;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pg = document.getElementById('page-' + id);
    if (!pg) return;
    // Small delay for transition
    requestAnimationFrame(() => {
      pg.classList.add('active');
      pg.scrollTop = 0;
    });
    this.state.page = id;

    // Nav
    const nav = document.getElementById('main-nav');
    if (nav) nav.classList.toggle('hidden', id === 'auth');

    // Active nav button
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const navMap = { dashboard:'nav-home', ai:'nav-ai', model:'nav-ai', profile:'nav-profile' };
    const activeNav = document.getElementById(navMap[id]);
    if (activeNav) activeNav.classList.add('active');
  },

  // ── Sidebar ─────────────────────────────────────────
  openSidebar() {
    document.getElementById('sidebar-overlay').classList.add('open');
    ILYADashboard.renderSidebar();
  },
  closeSidebar() {
    document.getElementById('sidebar-overlay').classList.remove('open');
  },

  // ── Toast ───────────────────────────────────────────
  toast(msg, type='info', ms=3000) {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => el.remove(), ms);
  },

  // ── Lightbox ─────────────────────────────────────────
  openLightbox(src) {
    const lb = document.getElementById('lightbox');
    document.getElementById('lb-img').src = src;
    lb.classList.add('open');
  },
  closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
  },

  // ── Session ─────────────────────────────────────────
  saveSession(user) {
    this.state.user  = user;
    this.state.token = user.id;
    localStorage.setItem('ilya_session', JSON.stringify(user));
  },
  clearSession() {
    this.state.user  = null;
    this.state.token = null;
    localStorage.removeItem('ilya_session');
  },
  getSavedUser() {
    try { return JSON.parse(localStorage.getItem('ilya_session')); } catch { return null; }
  },

  // ── Escape HTML ──────────────────────────────────────
  esc(s) {
    return String(s||'')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },

  // ── Bootstrap ───────────────────────────────────────
  init() {
    // Lang
    const savedLang = localStorage.getItem('ilya_lang') || 'ar';
    this.state.lang = savedLang;
    this._applyLang();

    // Config
    this.state.config = DB.config();

    // Lightbox
    document.getElementById('lb-close')?.addEventListener('click', () => this.closeLightbox());
    document.getElementById('lightbox')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('lightbox')) this.closeLightbox();
    });

    // Nav buttons
    document.getElementById('nav-home')?.addEventListener('click',    () => ILYADashboard.show());
    document.getElementById('nav-ai')?.addEventListener('click',      () => ILYAAI.showList());
    document.getElementById('nav-profile')?.addEventListener('click', () => ILYADashboard.showProfile());
    document.getElementById('nav-menu')?.addEventListener('click',    () => this.openSidebar());
    document.getElementById('lang-btn')?.addEventListener('click',    () => this.toggleLang());

    // Sidebar overlay click to close
    document.getElementById('sidebar-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'sidebar-overlay') this.closeSidebar();
    });

    // Restore session
    const saved = this.getSavedUser();
    if (saved) {
      // Re-validate from DB
      const fresh = DB.userById(saved.id);
      if (fresh && !fresh.banned) {
        this.saveSession(fresh);
        DB.incVisitors();
        ILYADashboard.show();
        return;
      }
      this.clearSession();
    }
    ILYAAuth.show();
  },
};

/* ── Preloader → Init ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const fill = document.getElementById('pre-fill');
  const bolt = document.getElementById('pre-bolt');
  const pct  = document.getElementById('pre-pct');
  const txt  = document.getElementById('pre-txt');
  const pre  = document.getElementById('preloader');
  const app  = document.getElementById('app');

  let progress = 0;
  const msgs_ar = ['تهيئة المنصة...','تحميل الأصول...','الاتصال بالخدمات...','التحقق من الجلسة...','جاهز!'];
  const msgs_en = ['Initializing...','Loading assets...','Connecting...','Verifying session...','Ready!'];

  const interval = setInterval(() => {
    progress = Math.min(progress + Math.random() * 4 + 1.2, 100);

    if (fill) fill.style.width = progress + '%';
    if (pct)  pct.textContent  = Math.floor(progress) + '%';

    // RTL: bolt moves from left to right (fill goes right to left visually but pct increases)
    // We handle bolt position in CSS via the `pre-fill` width

    const idx = Math.min(Math.floor(progress / 25), 4);
    const lang = localStorage.getItem('ilya_lang') || 'ar';
    if (txt) txt.textContent = lang === 'ar' ? msgs_ar[idx] : msgs_en[idx];

    if (progress >= 100) clearInterval(interval);
  }, 50);

  setTimeout(() => {
    clearInterval(interval);
    if (fill) fill.style.width = '100%';
    if (pct)  pct.textContent  = '100%';

    pre.style.transition = 'opacity .6s ease';
    pre.style.opacity    = '0';
    setTimeout(() => {
      pre.style.display = 'none';
      app.style.display = 'block';
      app.style.opacity = '0';
      app.style.transition = 'opacity .5s ease';
      requestAnimationFrame(() => {
        app.style.opacity = '1';
        ILYA.init();
      });
    }, 600);
  }, 5000);
});
