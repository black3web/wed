/* ═══════════════════════════════════════════════════════
   ILYA AI Platform v3 — Core (app.js)
   FIXED: MD5, DB, CONFIG, Router, i18n, Upload
═══════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   ⚙️ CONNECTION SETTINGS — إعدادات الاتصال
   ضع رابط Backend هنا بعد الرفع / Put backend URL
══════════════════════════════════════════════ */
var CONFIG = {
  API_BASE:    'https://ilya.com/',     // 'https://your-domain.wispbyte.com/api'
  USE_BACKEND: false,  // true after deploying backend
};

/* ══════════════════════════════════════════════
   MD5 — FIXED (no variable name collisions)
   Tested: md5("test") === 098f6bcd4621d373cade4e832627b4f6
══════════════════════════════════════════════ */
function md5(inputStr) {
  function safeAdd(x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    return ((((x >> 16) + (y >> 16) + (lsw >> 16)) << 16) | (lsw & 0xFFFF));
  }
  function rol(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)); }
  function cmn(q, aa, bb, xx, ss, tt) {
    return safeAdd(rol(safeAdd(safeAdd(aa, q), safeAdd(xx, tt)), ss), bb);
  }
  function ff(aa, bb, cc, dd, xx, ss, tt) { return cmn((bb & cc) | (~bb & dd), aa, bb, xx, ss, tt); }
  function gg(aa, bb, cc, dd, xx, ss, tt) { return cmn((bb & dd) | (cc & ~dd), aa, bb, xx, ss, tt); }
  function hh(aa, bb, cc, dd, xx, ss, tt) { return cmn(bb ^ cc ^ dd,          aa, bb, xx, ss, tt); }
  function ii(aa, bb, cc, dd, xx, ss, tt) { return cmn(cc ^ (bb | ~dd),       aa, bb, xx, ss, tt); }

  function str2blks(str) {
    var nblk = ((str.length + 8) >> 6) + 1;
    var blks = new Array(nblk * 16).fill(0);
    for (var i = 0; i < str.length; i++) {
      blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
    }
    blks[str.length >> 2] |= 0x80 << ((str.length % 4) * 8);
    blks[nblk * 16 - 2] = str.length * 8;
    return blks;
  }

  function binl2hex(binArray) {
    var hex = '';
    var hexTab = '0123456789abcdef';
    for (var i = 0; i < binArray.length * 4; i++) {
      hex += hexTab.charAt((binArray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
             hexTab.charAt((binArray[i >> 2] >> ((i % 4) * 8    )) & 0xF);
    }
    return hex;
  }

  // Encode to UTF-8
  var str = unescape(encodeURIComponent(inputStr));
  var x = str2blks(str);
  var a =  1732584193, b = -271733879;
  var c = -1732584194, d =  271733878;

  for (var i = 0; i < x.length; i += 16) {
    var olda = a, oldb = b, oldc = c, oldd = d;

    a = ff(a,b,c,d, x[i+0],  7, -680876936); d = ff(d,a,b,c, x[i+1], 12, -389564586);
    c = ff(c,d,a,b, x[i+2], 17,  606105819); b = ff(b,c,d,a, x[i+3], 22,-1044525330);
    a = ff(a,b,c,d, x[i+4],  7, -176418897); d = ff(d,a,b,c, x[i+5], 12, 1200080426);
    c = ff(c,d,a,b, x[i+6], 17,-1473231341); b = ff(b,c,d,a, x[i+7], 22,  -45705983);
    a = ff(a,b,c,d, x[i+8],  7, 1770035416); d = ff(d,a,b,c, x[i+9], 12,-1958414417);
    c = ff(c,d,a,b, x[i+10],17,    -42063);  b = ff(b,c,d,a, x[i+11],22,-1990404162);
    a = ff(a,b,c,d, x[i+12], 7, 1804603682); d = ff(d,a,b,c, x[i+13],12,  -40341101);
    c = ff(c,d,a,b, x[i+14],17,-1502002290); b = ff(b,c,d,a, x[i+15],22, 1236535329);

    a = gg(a,b,c,d, x[i+1],  5, -165796510); d = gg(d,a,b,c, x[i+6],  9,-1069501632);
    c = gg(c,d,a,b, x[i+11],14,  643717713); b = gg(b,c,d,a, x[i+0], 20, -373897302);
    a = gg(a,b,c,d, x[i+5],  5, -701558691); d = gg(d,a,b,c, x[i+10], 9,   38016083);
    c = gg(c,d,a,b, x[i+15],14, -660478335); b = gg(b,c,d,a, x[i+4], 20, -405537848);
    a = gg(a,b,c,d, x[i+9],  5,  568446438); d = gg(d,a,b,c, x[i+14], 9,-1019803690);
    c = gg(c,d,a,b, x[i+3], 14, -187363961); b = gg(b,c,d,a, x[i+8], 20, 1163531501);
    a = gg(a,b,c,d, x[i+13], 5,-1444681467); d = gg(d,a,b,c, x[i+2],  9,  -51403784);
    c = gg(c,d,a,b, x[i+7], 14, 1735328473); b = gg(b,c,d,a, x[i+12],20,-1926607734);

    a = hh(a,b,c,d, x[i+5],  4,   -378558); d = hh(d,a,b,c, x[i+8], 11,-2022574463);
    c = hh(c,d,a,b, x[i+11],16, 1839030562); b = hh(b,c,d,a, x[i+14],23,  -35309556);
    a = hh(a,b,c,d, x[i+1],  4,-1530992060); d = hh(d,a,b,c, x[i+4], 11, 1272893353);
    c = hh(c,d,a,b, x[i+7], 16, -155497632); b = hh(b,c,d,a, x[i+10],23,-1094730640);
    a = hh(a,b,c,d, x[i+13], 4,  681279174); d = hh(d,a,b,c, x[i+0], 11, -358537222);
    c = hh(c,d,a,b, x[i+3], 16, -722521979); b = hh(b,c,d,a, x[i+6], 23,   76029189);
    a = hh(a,b,c,d, x[i+9],  4, -640364487); d = hh(d,a,b,c, x[i+12],11, -421815835);
    c = hh(c,d,a,b, x[i+15],16,  530742520); b = hh(b,c,d,a, x[i+2], 23, -995338651);

    a = ii(a,b,c,d, x[i+0],  6, -198630844); d = ii(d,a,b,c, x[i+7], 10, 1126891415);
    c = ii(c,d,a,b, x[i+14],15,-1416354905); b = ii(b,c,d,a, x[i+5], 21,  -57434055);
    a = ii(a,b,c,d, x[i+12], 6, 1700485571); d = ii(d,a,b,c, x[i+3], 10,-1894986606);
    c = ii(c,d,a,b, x[i+10],15,   -1051523); b = ii(b,c,d,a, x[i+1], 21,-2054922799);
    a = ii(a,b,c,d, x[i+8],  6, 1873313359); d = ii(d,a,b,c, x[i+15],10,  -30611744);
    c = ii(c,d,a,b, x[i+6], 15,-1560198380); b = ii(b,c,d,a, x[i+13],21, 1309151649);
    a = ii(a,b,c,d, x[i+4],  6, -145523070); d = ii(d,a,b,c, x[i+11],10,-1120210379);
    c = ii(c,d,a,b, x[i+2], 15,  718787259); b = ii(b,c,d,a, x[i+9], 21, -343485551);

    a = safeAdd(a, olda); b = safeAdd(b, oldb);
    c = safeAdd(c, oldc); d = safeAdd(d, oldd);
  }
  return binl2hex([a, b, c, d]);
}

/* ══════════════════════════════════════════════
   IMAGE UPLOAD UTILITY
══════════════════════════════════════════════ */
var IMG_UPLOADER = {
  upload: function(file, onProgress) {
    var self = this; // capture context
    return new Promise(function(resolve, reject) {
      var fd = new FormData();
      fd.append('reqtype', 'fileupload');
      fd.append('fileToUpload', file);
      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://catbox.moe/user.php');
      xhr.upload.onprogress = function(e) {
        if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded / e.total * 100));
      };
      xhr.onload = function() {
        var url = (xhr.responseText || '').trim();
        if (url.startsWith('https://files.catbox.moe/')) {
          resolve(url);
        } else if (CONFIG.USE_BACKEND && CONFIG.API_BASE) {
          self.uploadToBackend(file, onProgress).then(resolve).catch(reject);
        } else {
          reject(new Error('Upload failed: ' + url.slice(0, 80)));
        }
      };
      xhr.onerror = function() {
        if (CONFIG.USE_BACKEND && CONFIG.API_BASE) {
          self.uploadToBackend(file, onProgress).then(resolve).catch(reject);
        } else {
          reject(new Error('Network error'));
        }
      };
      xhr.send(fd);
    });
  },
  uploadToBackend: function(file, onProgress) {
    var fd = new FormData();
    fd.append('file', file);
    return fetch(CONFIG.API_BASE + '/upload', { method: 'POST', body: fd })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.url) return d.url;
        throw new Error(d.error || 'Upload failed');
      });
  },
  toDataURL: function(file) {
    return new Promise(function(resolve, reject) {
      var r = new FileReader();
      r.onload  = function(e) { resolve(e.target.result); };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }
};

/* ══════════════════════════════════════════════
   ROBUST FETCH (retry + timeout + JSON parse)
══════════════════════════════════════════════ */
function fetchAPI(url, opts, retries, timeout) {
  retries = retries || 3;
  timeout = timeout || 40000;
  opts    = opts    || {};

  function attempt(n) {
    return new Promise(function(resolve, reject) {
      var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
      var tid  = setTimeout(function() { if (ctrl) ctrl.abort(); }, timeout);
      var fetchOpts = Object.assign({}, opts);
      if (ctrl) fetchOpts.signal = ctrl.signal;

      fetch(url, fetchOpts)
        .then(function(res) {
          clearTimeout(tid);
          var ct = res.headers.get('content-type') || '';
          if (!ct.includes('json')) {
            // Return text as-is for non-JSON APIs
            return res.text().then(function(txt) {
              return { ok: res.ok, data: { _raw: txt }, attempt: n };
            });
          }
          return res.json().then(function(data) {
            return { ok: res.ok, data: data, attempt: n };
          });
        })
        .then(resolve)
        .catch(function(err) {
          clearTimeout(tid);
          if (n < retries) {
            setTimeout(function() { attempt(n + 1).then(resolve).catch(reject); }, 1500 * n);
          } else {
            resolve({ ok: false, data: { error: err.message }, attempt: n });
          }
        });
    });
  }
  return attempt(1);
}

/* ══════════════════════════════════════════════
   CLIENT-SIDE DATABASE (localStorage)
══════════════════════════════════════════════ */
var DB = {
  // Hardcoded accounts — password is MD5 hash of actual password
  SYSTEM: [
    { id:'1', name:'المبرمج',      username:'A1', ph:'5cd9e55dcaf491d32289b848adeb216e', role:'admin', pic:'https://iili.io/B04MxcX.md.jpg', created_at:'2025-01-01 00:00:00' },
    { id:'2', name:'زوجة المبرمج', username:'M1', ph:'5cd9e55dcaf491d32289b848adeb216e', role:'vip',   pic:'https://iili.io/B04MxcX.md.jpg', created_at:'2025-01-01 00:00:01' },
  ],

  _g: function(k, def) {
    try { var v=localStorage.getItem('ilya_'+k); return v!==null?JSON.parse(v):(def===undefined?null:def); }
    catch(e) { return def===undefined?null:def; }
  },
  _s: function(k, v) { try { localStorage.setItem('ilya_'+k, JSON.stringify(v)); } catch(e){} },

  users: function() {
    var stored = this._g('users', []);
    var ovr    = this._g('overrides', {});
    var sys    = this.SYSTEM.map(function(u) {
      return ovr[u.id] ? Object.assign({}, u, ovr[u.id]) : Object.assign({}, u);
    });
    return sys.concat(stored);
  },

  userById: function(id) {
    var all = this.users();
    for (var i = 0; i < all.length; i++) if (String(all[i].id) === String(id)) return all[i];
    return null;
  },

  userByUsername: function(uname) {
    var all = this.users();
    var lo  = uname.toLowerCase();
    for (var i = 0; i < all.length; i++) if (all[i].username.toLowerCase() === lo) return all[i];
    return null;
  },

  login: function(username, password) {
    var u = this.userByUsername(username);
    if (!u)               return { error: 'not_found' };
    if (u.ph !== md5(password)) return { error: 'wrong_pw' };
    if (u.banned)         return { error: 'banned', ban_type: u.ban_type };
    return { user: u };
  },

  register: function(name, username, password) {
    if (this.userByUsername(username)) return { error: 'username_taken' };
    if (username.length < 4)           return { error: 'uname_short' };
    var id;
    do { id = String(Math.floor(Math.random() * 9e14 + 1e14)); } while (this.userById(id));
    var now  = new Date().toISOString().replace('T',' ').slice(0,19);
    var user = { id:id, name:name, username:username, ph:md5(password), role:'user', pic:'https://iili.io/B04MxcX.md.jpg', created_at:now };
    var stored = this._g('users', []);
    stored.push(user);
    this._s('users', stored);
    return { user: user };
  },

  updateUser: function(id, updates) {
    var sid = String(id);
    var isSys = this.SYSTEM.filter(function(u) { return String(u.id) === sid; }).length > 0;
    if (isSys) {
      var ovr = this._g('overrides', {});
      ovr[sid] = Object.assign({}, ovr[sid] || {}, updates);
      this._s('overrides', ovr);
    } else {
      var arr = this._g('users', []);
      for (var i = 0; i < arr.length; i++) {
        if (String(arr[i].id) === sid) { arr[i] = Object.assign({}, arr[i], updates); break; }
      }
      this._s('users', arr);
    }
  },

  /* Admin full edit — can change ID, password, role, everything */
  adminEditUser: function(oldId, updates) {
    var sid    = String(oldId);
    var newId  = updates.id ? String(updates.id) : sid;
    var isSys  = this.SYSTEM.filter(function(u) { return String(u.id) === sid; }).length > 0;

    if (isSys) {
      var ovr = this._g('overrides', {});
      var existing = ovr[sid] || {};
      delete ovr[sid];
      ovr[newId] = Object.assign({}, existing, updates);
      this._s('overrides', ovr);
    } else {
      var arr = this._g('users', []);
      for (var i = 0; i < arr.length; i++) {
        if (String(arr[i].id) === sid) {
          arr[i] = Object.assign({}, arr[i], updates, { id: newId });
          break;
        }
      }
      this._s('users', arr);
    }
    // Refresh session if editing logged-in user
    if (ILYA.state.user && String(ILYA.state.user.id) === sid) {
      var fresh = this.userById(newId);
      if (fresh) ILYA.saveSession(fresh);
    }
    return newId;
  },

  deleteUser: function(id) {
    var sid = String(id);
    if (sid === '1' || sid === '2') return false;
    var arr = this._g('users', []);
    this._s('users', arr.filter(function(u) { return String(u.id) !== sid; }));
    return true;
  },

  banUser:   function(id, type) { if (String(id) !== '1') this.updateUser(id, { banned:true,  ban_type:type }); },
  unbanUser: function(id)       { this.updateUser(id, { banned:false, ban_type:null }); },

  tickets: function(uid) {
    var all = this._g('tickets', []);
    if (!uid) return all;
    var sid = String(uid);
    return all.filter(function(t) { return String(t.uid) === sid; });
  },
  addTicket: function(uid, msg, a1, a2) {
    var list = this._g('tickets', []);
    list.unshift({ id:Date.now(), uid:String(uid), message:msg, att1:a1||null, att2:a2||null, status:'open', reply:null, created_at:new Date().toISOString().replace('T',' ').slice(0,19) });
    this._s('tickets', list);
  },
  replyTicket: function(id, reply) {
    var list = this._g('tickets', []);
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id) === String(id)) { list[i].reply = reply; list[i].status = 'replied'; list[i].replied_at = new Date().toISOString().replace('T',' ').slice(0,19); break; }
    }
    this._s('tickets', list);
  },

  logActivity: function(uid, service, prompt, url) {
    var log = this._g('activity', []);
    log.unshift({ id:Date.now(), uid:String(uid), service:service, prompt:(prompt||'').slice(0,180), url:url||null, created_at:new Date().toISOString().replace('T',' ').slice(0,19) });
    if (log.length > 800) log.splice(800);
    this._s('activity', log);
  },
  activityFor: function(uid) {
    var all   = this._g('activity', []);
    var users = this.users();
    var res   = all.map(function(a) {
      var u = null;
      for (var i = 0; i < users.length; i++) if (String(users[i].id) === String(a.uid)) { u = users[i]; break; }
      return Object.assign({}, a, { uname: u ? u.username : '?', uname_full: u ? u.name : '?' });
    });
    if (!uid) return res;
    var sid = String(uid);
    return res.filter(function(a) { return String(a.uid) === sid; });
  },

  config: function() {
    var def = {
      welcome_ar:'أهلاً بك في موقع خدمات ILYA',
      welcome_en:'Welcome to ILYA AI Services',
      about_ar:'منصة ILYA هي وجهتك المتكاملة لخدمات الذكاء الاصطناعي المتقدمة',
      about_en:'ILYA Platform — your integrated AI services destination',
      copyright_ar:'جميع الحقوق محفوظة',
      copyright_en:'All Rights Reserved',
      tg_link:'https://t.me/swc_t',
      dev_site:'https://black3web.github.io/Blackweb/',
      reg_on:'true', maint:'false',
      svc_v1:'true', svc_anime:'true', svc_seed:'true',
      svc_pfoto:'true', svc_flux:'true', svc_nb2:'true', svc_nbp:'true',
    };
    var saved = this._g('config', {});
    return Object.assign({}, def, saved);
  },
  setConfig: function(updates) {
    var cur = this._g('config', {});
    this._s('config', Object.assign({}, cur, updates));
  },

  stats: function() {
    var users = this.users();
    var act   = this._g('activity', []);
    var tkts  = this._g('tickets',  []);
    var vis   = this._g('visitors', 0);
    var bkd   = {};
    for (var i = 0; i < act.length; i++) { bkd[act[i].service] = (bkd[act[i].service] || 0) + 1; }
    var bkdArr = [];
    for (var k in bkd) bkdArr.push({ service:k, count:bkd[k] });
    bkdArr.sort(function(a,b) { return b.count - a.count; });
    return {
      users:    users.length,
      banned:   users.filter(function(u){ return u.banned; }).length,
      active:   users.filter(function(u){ return !u.banned; }).length,
      visitors: vis,
      tickets:  tkts.length,
      aitotal:  act.length,
      breakdown:bkdArr,
    };
  },
  incVis: function() { this._s('visitors', (this._g('visitors', 0)) + 1); },
};

/* ══════════════════════════════════════════════
   AI MODELS CONFIG
══════════════════════════════════════════════ */
var AI_MODELS = [
  { id:'v1',    cfgKey:'svc_v1',    type:'text',  isNew:false,
    icon:'fa-image',
    nameAr:'توليد صورة من نص',        nameEn:'Text to Image',
    descAr:'حوّل وصفك النصي إلى صورة عالية الجودة — 4 نسب · 4 مستويات جودة',
    descEn:'Transform text into stunning images — 4 ratios · 4 quality levels',
    img:'https://iili.io/BhMseEB.md.jpg',
    params:{ ratios:['1:1','9:16','9:21','3:4','16:9','4:3'], upscales:[{v:'1',l:'HD'},{v:'2',l:'HD+'},{v:'3',l:'Full HD'},{v:'4',l:'2K'}], counts:['1','2','3'] } },
  { id:'anime', cfgKey:'svc_anime', type:'image', isNew:false,
    icon:'fa-star',
    nameAr:'تحويل صورة إلى أنمي',     nameEn:'Image to Anime',
    descAr:'14 نمطاً أنمي — مانغا · سايبربانك · كلاي · فانتازي وأكثر',
    descEn:'14 anime styles — manga · cyberpunk · clay · fantasy & more',
    img:'https://iili.io/BhVE2F1.md.jpg',
    params:{ ratios:['auto','1:1','1:2','2:1','2:3','3:2','9:16','16:9'], genders:['Male','Female'], styles:['dc_comics','claymation','cyberpunk','pencil_anime','pop_art','cartoon_glamour','bw_comic','manga','bright_realistic','voxel','fantasy_anime','abstract_painting','cartoon_poster','cubist'] } },
  { id:'seed',  cfgKey:'svc_seed',  type:'text',  isNew:false,
    icon:'fa-seedling',
    nameAr:'SeedDream 4.5',            nameEn:'SeedDream 4.5',
    descAr:'13 نمطاً فنياً — من الواقعية إلى الجيبلي والسينمائي',
    descEn:'13 artistic styles — from photo-realistic to Ghibli & cinematic',
    img:'https://iili.io/BhVbVRI.md.jpg',
    params:{ ratios:['square','portrait','landscape','classic','ultrawide'], styles:['none','photo','fantasy','portrait','anime','landscape','scifi','cinematic','oil','pixel','watercolor','ghibli','vintage'] } },
  { id:'pfoto', cfgKey:'svc_pfoto', type:'image', isNew:false,
    icon:'fa-id-badge',
    nameAr:'صورة شخصية احترافية',     nameEn:'Personal Photo Maker',
    descAr:'15 نمطاً — حوّل صورتك لبروفايل احترافي',
    descEn:'15 styles — turn any photo into a professional profile picture',
    img:'https://iili.io/BhWuQt9.md.jpg',
    params:{ ratios:['1:1','2:1','3:2','9:16','16:9'], genders:['male','female'], styles:['apple_executive','apple_founder','linkedin_exec','modern_fashion','high_fashion','urban_trend','minimalist','lifestyle','studio_photo','social_media','street_style','luxury_fashion','natural_light','christmas','graduation'] } },
  { id:'flux',  cfgKey:'svc_flux',  type:'text',  isNew:false,
    icon:'fa-bolt',
    nameAr:'Flux MAX',                 nameEn:'Flux MAX',
    descAr:'أقوى نماذج التوليد — جودة استثنائية بـ 11 نسبة',
    descEn:'Most powerful model — exceptional quality across 11 ratios',
    img:'https://iili.io/BhWVPja.md.jpg',
    params:{ ratios:['1:1','1:2','2:1','2:3','3:2','3:4','4:3','4:5','5:4','9:16','16:9'] } },
  { id:'nb2',   cfgKey:'svc_nb2',   type:'text',  isNew:true,
    icon:'fa-wand-sparkles',
    nameAr:'Nano Banana 2 (2K)',        nameEn:'Nano Banana 2 (2K)',
    descAr:'نموذج Nano Banana 2 — توليد صور بدقة 2K من وصف نصي',
    descEn:'Nano Banana 2 — generate 2K images from text descriptions',
    img:'https://iili.io/BNVpjCg.md.jpg',
    params:{} },
  { id:'nbp',   cfgKey:'svc_nbp',   type:'both',  isNew:true,
    icon:'fa-pen-nib',
    nameAr:'NanoBanana Pro — إنشاء وتعديل', nameEn:'NanoBanana Pro — Create & Edit',
    descAr:'أنشئ أو عدّل صورة بوصف نصي — دقة حتى 4K',
    descEn:'Create or edit images with text — up to 4K resolution',
    img:'https://iili.io/BNV86wN.md.jpg',
    params:{ ratios:['1:1','16:9','9:16','4:3','3:4'], resolutions:['1K','2K','4K'] } },
];

/* ══════════════════════════════════════════════
   TRANSLATIONS
══════════════════════════════════════════════ */
var T = {
  ar:{
    app:'ILYA AI',
    welcome:'أهلاً بك',have_acc:'لدي حساب',create_acc:'إنشاء حساب',
    login:'دخول',register:'تسجيل',name:'الاسم الكامل',username:'معرف المستخدم',
    password:'كلمة المرور',confirm_pw:'تأكيد المرور',uname_hint:'4 أحرف على الأقل',
    ai_srv:'خدمات AI',my_acc:'حسابي',help:'المساعدة',support:'الدعم',
    gallery:'معرضي',admin:'لوحة التحكم',logout:'خروج',back:'رجوع',
    send:'إرسال',generating:'جاري التوليد...',
    error_gen:'حدث خطأ، جاري إعادة المحاولة...',
    error_final:'فشل التوليد — تحقق من الوصف وأعد المحاولة',
    write_desc:'أدخل وصفاً تفصيلياً...',img_url:'رابط الصورة',
    ratio:'نسبة الأبعاد',quality:'الجودة',style:'النمط',gender:'الجنس',
    count:'عدد الصور',resolution:'الدقة',settings:'الإعدادات',
    save:'حفظ التغييرات',saved:'تم الحفظ ✓',my_id:'رقم هويتك',
    pic_url:'رابط الصورة',
    send_ticket:'إرسال تذكرة',your_msg:'رسالتك...',
    attach:'إرفاق صورة',no_tickets:'لا توجد تذاكر',ticket_sent:'تم الإرسال',
    admin_reply:'رد الإدارة',
    stats:'الإحصائيات',users_mgmt:'المستخدمون',banned:'المحظورون',
    support_inbox:'صندوق الدعم',sys_config:'إعدادات النظام',act_log:'سجل النشاط',
    ban_tmp:'حظر مؤقت',ban_prm:'حظر نهائي',unban:'رفع الحظر',del_user:'حذف',
    reply:'إرسال رد',write_reply:'اكتب ردك...',
    copyright:'جميع الحقوق محفوظة',result_ready:'النتيجة جاهزة!',
    download:'تحميل',open_link:'فتح',copy:'نسخ',copied:'تم النسخ!',
    home:'الرئيسية',menu:'القائمة',dev_site_btn:'موقع المبرمج',
    upload_img:'رفع صورة',uploading:'جاري الرفع...',upload_done:'تم الرفع',upload_fail:'فشل الرفع',
    drag_drop:'اسحب الصورة هنا أو انقر للاختيار',drag_drop_sub:'PNG · JPG · WEBP — حجم أقصى 10MB',
    from_device:'من الجهاز',from_url:'رابط URL',
    regenerate:'إعادة التوليد',retry:'إعادة المحاولة',clear_res:'مسح',
    total_users:'المستخدمون',total_vis:'الزوار',total_ai:'طلبات AI',total_tickets:'التذاكر',
    broadcast:'بث عام',broadcast_send:'إرسال لجميع المستخدمين',
    err_fields:'جميع الحقول مطلوبة',err_uname_taken:'المعرف مستخدم بالفعل',
    err_wrong_cred:'بيانات الدخول غير صحيحة',err_banned:'الحساب موقوف',
    err_reg_off:'التسجيل مغلق حالياً',err_maint:'المنصة في وضع الصيانة',
    err_pw_match:'كلمتا المرور غير متطابقتين',err_uname_short:'المعرف يجب أن يكون 4 أحرف على الأقل',
    err_no_prompt:'الرجاء إدخال وصف',err_no_img:'الرجاء إدخال رابط الصورة أو رفع صورة',
    greeting:function(n){ return 'أهلاً، '+n; },
    member_since:function(d){ return 'عضو منذ: '+d; },
  },
  en:{
    app:'ILYA AI',
    welcome:'Welcome',have_acc:'I have an account',create_acc:'Create Account',
    login:'Login',register:'Register',name:'Full Name',username:'Username',
    password:'Password',confirm_pw:'Confirm Password',uname_hint:'At least 4 characters',
    ai_srv:'AI Services',my_acc:'My Account',help:'Help',support:'Support',
    gallery:'My Gallery',admin:'Admin Panel',logout:'Logout',back:'Back',
    send:'Send',generating:'Generating...',
    error_gen:'Error occurred, retrying...',
    error_final:'Generation failed — check your prompt and retry',
    write_desc:'Enter a detailed description...',img_url:'Image URL',
    ratio:'Aspect Ratio',quality:'Quality',style:'Style',gender:'Gender',
    count:'Image Count',resolution:'Resolution',settings:'Settings',
    save:'Save Changes',saved:'Saved ✓',my_id:'Your ID',
    pic_url:'Image URL',
    send_ticket:'Send Ticket',your_msg:'Your message...',
    attach:'Attach image',no_tickets:'No tickets yet',ticket_sent:'Ticket sent',
    admin_reply:'Admin Reply',
    stats:'Statistics',users_mgmt:'Users',banned:'Banned',
    support_inbox:'Support Inbox',sys_config:'System Config',act_log:'Activity Log',
    ban_tmp:'Temp Ban',ban_prm:'Permanent Ban',unban:'Unban',del_user:'Delete',
    reply:'Send Reply',write_reply:'Write your reply...',
    copyright:'All Rights Reserved',result_ready:'Result Ready!',
    download:'Download',open_link:'Open',copy:'Copy',copied:'Copied!',
    home:'Home',menu:'Menu',dev_site_btn:"Developer's Website",
    upload_img:'Upload Image',uploading:'Uploading...',upload_done:'Image uploaded',upload_fail:'Upload failed',
    drag_drop:'Drag image here or click to select',drag_drop_sub:'PNG · JPG · WEBP — max 10MB',
    from_device:'From Device',from_url:'URL Link',
    regenerate:'Regenerate',retry:'Retry',clear_res:'Clear',
    total_users:'Users',total_vis:'Visitors',total_ai:'AI Requests',total_tickets:'Tickets',
    broadcast:'Broadcast',broadcast_send:'Send to all users',
    err_fields:'All fields are required',err_uname_taken:'Username already taken',
    err_wrong_cred:'Incorrect credentials',err_banned:'Account suspended',
    err_reg_off:'Registration is currently closed',err_maint:'Platform is under maintenance',
    err_pw_match:'Passwords do not match',err_uname_short:'Username must be at least 4 characters',
    err_no_prompt:'Please enter a description',err_no_img:'Please enter an image URL or upload an image',
    greeting:function(n){ return 'Hello, '+n; },
    member_since:function(d){ return 'Member since: '+d; },
  }
};

/* ══════════════════════════════════════════════
   ILYA CORE
══════════════════════════════════════════════ */
var ILYA = {
  state: {
    user:null,token:null,lang:'ar',page:'',config:{},modelId:null
  },

  t: function(k) {
    var e = T[this.state.lang] && T[this.state.lang][k];
    if (typeof e === 'function') {
      var args = Array.prototype.slice.call(arguments, 1);
      return e.apply(null, args);
    }
    return e || k;
  },

  esc: function(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },

  /* Language */
  toggleLang: function() {
    this.state.lang = this.state.lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('ilya_lang', this.state.lang);
    this._applyLang(true);
  },

  _applyLang: function(rerender) {
    var isAr = this.state.lang === 'ar';
    document.documentElement.lang = this.state.lang;
    document.documentElement.dir  = isAr ? 'rtl' : 'ltr';
    var lbl = document.getElementById('lang-label');
    if (lbl) lbl.textContent = isAr ? 'EN' : 'AR';
    document.querySelectorAll('[data-ar][data-en]').forEach(function(el) {
      el.textContent = isAr ? el.dataset.ar : el.dataset.en;
    });
    if (rerender && this.state.page && this._renders[this.state.page]) {
      this._renders[this.state.page]();
    }
  },

  _renders: {},
  reg: function(page, fn) { this._renders[page] = fn; },

  /* Router */
  go: function(id) {
    document.querySelectorAll('.page').forEach(function(p) {
      p.classList.remove('active','auth-top');
    });
    var pg = document.getElementById('page-' + id);
    if (!pg) return;
    pg.classList.add('active');
    if (id === 'auth') pg.classList.add('auth-top');
    pg.scrollTop = 0;
    this.state.page = id;

    var tb = document.getElementById('top-bar');
    if (tb) tb.classList.toggle('hidden', id === 'auth');

    var hbtn = document.getElementById('tb-menu');
    if (hbtn) hbtn.classList.remove('open');
  },

  /* Sidebar */
  openSidebar: function() {
    document.getElementById('sidebar-overlay').classList.add('open');
    var hbtn = document.getElementById('tb-menu');
    if (hbtn) hbtn.classList.add('open');
    ILYADashboard.renderSidebar();
  },
  closeSidebar: function() {
    document.getElementById('sidebar-overlay').classList.remove('open');
    var hbtn = document.getElementById('tb-menu');
    if (hbtn) hbtn.classList.remove('open');
  },

  /* Toast */
  toast: function(msg, type, ms) {
    type = type || 'info'; ms = ms || 3000;
    var c = document.getElementById('toast-container');
    if (!c) return;
    var icons = { success:'fa-circle-check', error:'fa-circle-exclamation', info:'fa-circle-info', warn:'fa-triangle-exclamation' };
    var el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.innerHTML = '<i class="fa-solid ' + (icons[type]||icons.info) + '"></i><span>' + this.esc(msg) + '</span>';
    c.appendChild(el);
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, ms);
  },

  /* Lightbox */
  openLightbox: function(src) {
    var lb  = document.getElementById('lightbox');
    var img = document.getElementById('lb-img');
    if (!lb || !img) return;
    img.src = src;
    lb.classList.add('open');
  },
  closeLightbox: function() {
    var lb = document.getElementById('lightbox');
    if (lb) lb.classList.remove('open');
  },

  /* Clipboard */
  copyToClipboard: function(text, btn) {
    var self = this;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        self.toast(self.t('copied'), 'success', 1500);
        if (btn) {
          var orig = btn.innerHTML;
          btn.innerHTML = '<i class="fa-solid fa-check"></i>';
          setTimeout(function() { btn.innerHTML = orig; }, 1800);
        }
      }).catch(function() { self._fallbackCopy(text); });
    } else {
      this._fallbackCopy(text);
    }
  },
  _fallbackCopy: function(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand('copy'); this.toast(this.t('copied'), 'success', 1500); }
    catch(e) { this.toast('Copy failed', 'error'); }
    document.body.removeChild(ta);
  },

  /* Session */
  saveSession: function(user) {
    this.state.user  = user;
    this.state.token = user.id;
    localStorage.setItem('ilya_session', JSON.stringify({ id:user.id, ts:Date.now() }));
    var av = document.getElementById('tb-av-img');
    if (av) { av.src = user.pic || 'https://iili.io/B04MxcX.md.jpg'; }
  },
  clearSession: function() {
    this.state.user = null; this.state.token = null;
    localStorage.removeItem('ilya_session');
  },
  getSavedId: function() {
    try {
      var s = JSON.parse(localStorage.getItem('ilya_session') || 'null');
      if (s && s.id && (Date.now() - s.ts < 30 * 24 * 3600 * 1000)) return s.id;
    } catch(e){}
    return null;
  },

  /* Footer HTML */
  footer: function() {
    var cfg  = this.state.config;
    var t    = this.t.bind(this);
    var year = new Date().getFullYear();
    return '<div class="pg-foot">' +
      '<div>ILYA AI &copy; ' + year + ' &mdash; ' + t('copyright') + '</div>' +
      '<div>' +
        '<a href="' + (cfg.tg_link||'https://t.me/swc_t') + '" target="_blank" rel="noopener"><i class="fa-brands fa-telegram"></i> Telegram</a>' +
        ' &nbsp;&middot;&nbsp; ' +
        '<a href="' + (cfg.dev_site||'https://black3web.github.io/Blackweb/') + '" target="_blank" rel="noopener"><i class="fa-solid fa-globe"></i> ' + t('dev_site_btn') + '</a>' +
      '</div>' +
      '</div>';
  },

  /* Back button HTML helper — shows correct arrow for RTL/LTR */
  backBtn: function(id) {
    return '<button class="back-btn" id="' + id + '" aria-label="Back">' +
      '<i class="fa-solid fa-arrow-right arr-rtl"></i>' +
      '<i class="fa-solid fa-arrow-left arr-ltr"></i>' +
      '</button>';
  },

  /* Bootstrap */
  init: function() {
    var self = this;
    var savedLang = localStorage.getItem('ilya_lang') || 'ar';
    this.state.lang = savedLang;
    this._applyLang(false);
    this.state.config = DB.config();

    /* Lightbox */
    var lbClose = document.getElementById('lb-close');
    var lbBg    = document.getElementById('lb-bg');
    if (lbClose) lbClose.addEventListener('click', function() { self.closeLightbox(); });
    if (lbBg)    lbBg.addEventListener('click',    function() { self.closeLightbox(); });

    /* Top bar buttons */
    var tbMenu   = document.getElementById('tb-menu');
    var tbLogo   = document.getElementById('tb-logo');
    var langBtn  = document.getElementById('lang-btn');
    var tbAvatar = document.getElementById('tb-avatar');
    if (tbMenu)   tbMenu.addEventListener('click', function() { self.openSidebar(); });
    if (tbLogo)   tbLogo.addEventListener('click', function() { if (self.state.user) ILYADashboard.show(); });
    if (langBtn)  langBtn.addEventListener('click', function() { self.toggleLang(); });
    if (tbAvatar) tbAvatar.addEventListener('click', function() { self.closeSidebar(); ILYADashboard.showProfile(); });

    /* Sidebar overlay click-outside */
    var sbOverlay = document.getElementById('sidebar-overlay');
    if (sbOverlay) sbOverlay.addEventListener('click', function(e) {
      if (e.target === sbOverlay) self.closeSidebar();
    });

    /* Restore session */
    var savedId = this.getSavedId();
    if (savedId) {
      var fresh = DB.userById(savedId);
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

/* ══════════════════════════════════════════════
   PRELOADER → APP INIT
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  var fill   = document.getElementById('pre-fill');
  var bolt   = document.getElementById('pre-bolt');
  var pct    = document.getElementById('pre-pct');
  var stTxt  = document.getElementById('pre-status');
  var pre    = document.getElementById('preloader');
  var app    = document.getElementById('app');
  var progress = 0;
  var isAr     = localStorage.getItem('ilya_lang') !== 'en';

  var msgsAr = ['تهيئة المنصة...','تحميل الأصول...','الاتصال بالخدمات...','التحقق من الجلسة...','جاهز!'];
  var msgsEn = ['Initializing...','Loading assets...','Connecting...','Verifying session...','Ready!'];

  var tick = setInterval(function() {
    progress = Math.min(progress + Math.random() * 4.2 + 1.1, 100);
    var pct_int = Math.floor(progress);
    if (fill) fill.style.width = progress + '%';
    if (pct)  pct.textContent  = pct_int + '%';

    // Move bolt: RTL moves from left, LTR moves from right
    if (bolt) {
      var dir = document.documentElement.dir;
      if (dir === 'rtl') {
        bolt.style.right = 'auto';
        bolt.style.left  = 'calc(' + (100 - progress) + '% - 8px)';
      } else {
        bolt.style.left  = 'auto';
        bolt.style.right = 'calc(' + (100 - progress) + '% - 8px)';
      }
    }

    var idx = Math.min(Math.floor(progress / 25), 4);
    if (stTxt) stTxt.textContent = isAr ? msgsAr[idx] : msgsEn[idx];
    if (progress >= 100) clearInterval(tick);
  }, 48);

  setTimeout(function() {
    clearInterval(tick);
    if (fill) fill.style.width = '100%';
    if (pct)  pct.textContent  = '100%';
    pre.style.transition = 'opacity .65s ease';
    pre.style.opacity    = '0';
    setTimeout(function() {
      pre.style.display = 'none';
      app.style.display = 'block';
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          app.classList.add('ready');
          ILYA.init();
        });
      });
    }, 650);
  }, 5000);
});
