/* ═══════════════════════════════════════
   ILYA — Auth Module
   Handles user registration, login, session
   ═══════════════════════════════════════ */

const Auth = (function() {
  'use strict';

  // ─── CONFIG ───
  const BACKEND = window.ILYA_CONFIG?.backend || 'https://ilya-api.wispbyte.com';
  const STORAGE_KEY = 'ilya_session';
  const USERS_KEY   = 'ilya_users';
  const STATS_KEY   = 'ilya_stats';

  // ─── DEFAULT ACCOUNTS (pre-seeded) ───
  const DEFAULT_USERS = [
    {
      id: 1,
      name: 'المبرمج',
      username: 'A1',
      password: '5cd9e55dcaf491d32289b848adeb216e',
      avatar: 'https://iili.io/B04MxcX.md.jpg',
      role: 'admin',
      createdAt: new Date('2025-01-01').toISOString(),
      lastSeen: null,
      banned: false,
      banUntil: null,
      stats: { chatUses:0, imgUses:0, vidUses:0 }
    },
    {
      id: 2,
      name: 'زوجة المبرمج',
      username: 'M1',
      password: '5cd9e55dcaf491d32289b848adeb216e',
      avatar: 'https://iili.io/B04MxcX.md.jpg',
      role: 'vip',
      createdAt: new Date('2025-01-01').toISOString(),
      lastSeen: null,
      banned: false,
      banUntil: null,
      stats: { chatUses:0, imgUses:0, vidUses:0 }
    }
  ];

  // ─── LOCAL DB ───
  function getUsers() {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (!raw) {
        const init = DEFAULT_USERS;
        localStorage.setItem(USERS_KEY, JSON.stringify(init));
        return init;
      }
      const saved = JSON.parse(raw);
      // Ensure default users exist
      let dirty = false;
      for (const def of DEFAULT_USERS) {
        if (!saved.find(u => u.id === def.id)) {
          saved.push(def);
          dirty = true;
        }
      }
      if (dirty) localStorage.setItem(USERS_KEY, JSON.stringify(saved));
      return saved;
    } catch { return [...DEFAULT_USERS]; }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function generateId() {
    const users = getUsers();
    const maxId = users.reduce((m, u) => Math.max(m, u.id), 0);
    return maxId + 1;
  }

  // ─── SESSION ───
  function getSession() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
    catch { return null; }
  }

  function setSession(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      id: user.id,
      username: user.username,
      role: user.role,
      savedAt: Date.now()
    }));
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // ─── AUTH LOGIC ───
  function register(name, username, password, confirmPassword) {
    if (!name.trim()) return { ok: false, msg: 'الاسم مطلوب' };
    if (username.length < 4) return { ok: false, msg: 'اسم المستخدم يجب أن يكون 4 أحرف على الأقل' };
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return { ok: false, msg: 'اسم المستخدم: أحرف وأرقام فقط' };
    if (password.length < 6) return { ok: false, msg: 'كلمة المرور 6 أحرف على الأقل' };
    if (password !== confirmPassword) return { ok: false, msg: 'كلمة المرور غير متطابقة' };

    const users = getUsers();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { ok: false, msg: 'اسم المستخدم مستخدم بالفعل' };
    }

    // Simple MD5-like hash (use actual MD5 for consistency with stored hashes)
    const hashed = md5(password);
    const newUser = {
      id: generateId(),
      name: name.trim(),
      username: username.trim(),
      password: hashed,
      avatar: 'https://iili.io/B04MxcX.md.jpg',
      role: 'user',
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      banned: false,
      banUntil: null,
      stats: { chatUses:0, imgUses:0, vidUses:0 }
    };
    users.push(newUser);
    saveUsers(users);
    updateStats('users', getUsers().length);
    setSession(newUser);
    return { ok: true, user: newUser };
  }

  function login(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return { ok: false, msg: 'اسم المستخدم غير موجود' };

    const hashed = md5(password);
    if (user.password !== hashed) return { ok: false, msg: 'كلمة المرور خاطئة' };

    // Check ban
    if (user.banned && !user.banUntil) return { ok: false, msg: 'الحساب محظور' };
    if (user.banUntil && new Date(user.banUntil) > new Date()) {
      return { ok: false, msg: `الحساب محظور مؤقتاً حتى ${new Date(user.banUntil).toLocaleDateString('ar')}` };
    }
    if (user.banUntil && new Date(user.banUntil) <= new Date()) {
      // Unban
      user.banned = false;
      user.banUntil = null;
      saveUsers(users);
    }

    user.lastSeen = new Date().toISOString();
    saveUsers(users);
    setSession(user);

    // Track visitor
    incrementStat('visitors');

    return { ok: true, user };
  }

  function autoLogin() {
    const session = getSession();
    if (!session) return null;
    const users = getUsers();
    const user = users.find(u => u.id === session.id);
    if (!user || user.banned) { clearSession(); return null; }
    user.lastSeen = new Date().toISOString();
    saveUsers(users);
    incrementStat('visitors');
    return user;
  }

  function logout() {
    clearSession();
  }

  function getCurrentUser() {
    const session = getSession();
    if (!session) return null;
    return getUsers().find(u => u.id === session.id) || null;
  }

  function updateUser(id, changes) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx < 0) return false;
    // Don't allow changing id
    delete changes.id;
    if (changes.password) changes.password = md5(changes.password);
    Object.assign(users[idx], changes);
    saveUsers(users);
    return true;
  }

  // ─── STATS ───
  function getStats() {
    try { return JSON.parse(localStorage.getItem(STATS_KEY)) || {}; }
    catch { return {}; }
  }

  function updateStats(key, val) {
    const s = getStats();
    s[key] = val;
    localStorage.setItem(STATS_KEY, JSON.stringify(s));
  }

  function incrementStat(key) {
    const s = getStats();
    s[key] = (s[key] || 0) + 1;
    localStorage.setItem(STATS_KEY, JSON.stringify(s));
  }

  function recordServiceUse(userId, service) {
    incrementStat(service + 'Uses');
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.stats = user.stats || {};
      user.stats[service + 'Uses'] = (user.stats[service + 'Uses'] || 0) + 1;
      saveUsers(users);
    }
  }

  // ─── MD5 (lightweight) ───
  function md5(str) {
    // Using a simple but consistent hash for client-side
    // For production, use server-side hashing
    function safeAdd(x, y) {
      const lsw = (x & 0xffff) + (y & 0xffff);
      const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xffff);
    }
    function bitRotateLeft(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)); }
    function md5cmn(q,a,b,x,s,t){return safeAdd(bitRotateLeft(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b);}
    function md5ff(a,b,c,d,x,s,t){return md5cmn((b&c)|((~b)&d),a,b,x,s,t);}
    function md5gg(a,b,c,d,x,s,t){return md5cmn((b&d)|(c&(~d)),a,b,x,s,t);}
    function md5hh(a,b,c,d,x,s,t){return md5cmn(b^c^d,a,b,x,s,t);}
    function md5ii(a,b,c,d,x,s,t){return md5cmn(c^(b|(~d)),a,b,x,s,t);}

    const M = [];
    for (let i=0; i<str.length*8; i+=8) {
      M[i>>5] = (M[i>>5]||0) | ((str.charCodeAt(i/8) & 0xff) << (i%32));
    }
    const len = str.length * 8;
    M[len>>5] = (M[len>>5]||0) | (0x80 << (len%32));
    M[(((len+64)>>>9)<<4)+14] = len;

    let a=1732584193, b=-271733879, c=-1732584194, d=271733878;
    for (let i=0; i<M.length; i+=16) {
      const [oa,ob,oc,od]=[a,b,c,d];
      a=md5ff(a,b,c,d,M[i],7,-680876936);d=md5ff(d,a,b,c,M[i+1],12,-389564586);c=md5ff(c,d,a,b,M[i+2],17,606105819);b=md5ff(b,c,d,a,M[i+3],22,-1044525330);
      a=md5ff(a,b,c,d,M[i+4],7,-176418897);d=md5ff(d,a,b,c,M[i+5],12,1200080426);c=md5ff(c,d,a,b,M[i+6],17,-1473231341);b=md5ff(b,c,d,a,M[i+7],22,-45705983);
      a=md5ff(a,b,c,d,M[i+8],7,1770035416);d=md5ff(d,a,b,c,M[i+9],12,-1958414417);c=md5ff(c,d,a,b,M[i+10],17,-42063);b=md5ff(b,c,d,a,M[i+11],22,-1990404162);
      a=md5ff(a,b,c,d,M[i+12],7,1804603682);d=md5ff(d,a,b,c,M[i+13],12,-40341101);c=md5ff(c,d,a,b,M[i+14],17,-1502002290);b=md5ff(b,c,d,a,M[i+15],22,1236535329);
      a=md5gg(a,b,c,d,M[i+1],5,-165796510);d=md5gg(d,a,b,c,M[i+6],9,-1069501632);c=md5gg(c,d,a,b,M[i+11],14,643717713);b=md5gg(b,c,d,a,M[i],20,-373897302);
      a=md5gg(a,b,c,d,M[i+5],5,-701558691);d=md5gg(d,a,b,c,M[i+10],9,38016083);c=md5gg(c,d,a,b,M[i+15],14,-660478335);b=md5gg(b,c,d,a,M[i+4],20,-405537848);
      a=md5gg(a,b,c,d,M[i+9],5,568446438);d=md5gg(d,a,b,c,M[i+14],9,-1019803690);c=md5gg(c,d,a,b,M[i+3],14,-187363961);b=md5gg(b,c,d,a,M[i+8],20,1163531501);
      a=md5gg(a,b,c,d,M[i+13],5,-1444681467);d=md5gg(d,a,b,c,M[i+2],9,-51403784);c=md5gg(c,d,a,b,M[i+7],14,1735328473);b=md5gg(b,c,d,a,M[i+12],20,-1926607734);
      a=md5hh(a,b,c,d,M[i+5],4,-378558);d=md5hh(d,a,b,c,M[i+8],11,-2022574463);c=md5hh(c,d,a,b,M[i+11],16,1839030562);b=md5hh(b,c,d,a,M[i+14],23,-35309556);
      a=md5hh(a,b,c,d,M[i+1],4,-1530992060);d=md5hh(d,a,b,c,M[i+4],11,1272893353);c=md5hh(c,d,a,b,M[i+7],16,-155497632);b=md5hh(b,c,d,a,M[i+10],23,-1094730640);
      a=md5hh(a,b,c,d,M[i+13],4,681279174);d=md5hh(d,a,b,c,M[i],11,-358537222);c=md5hh(c,d,a,b,M[i+3],16,-722521979);b=md5hh(b,c,d,a,M[i+6],23,76029189);
      a=md5hh(a,b,c,d,M[i+9],4,-640364487);d=md5hh(d,a,b,c,M[i+12],11,-421815835);c=md5hh(c,d,a,b,M[i+15],16,530742520);b=md5hh(b,c,d,a,M[i+2],23,-995338651);
      a=md5ii(a,b,c,d,M[i],6,-198630844);d=md5ii(d,a,b,c,M[i+7],10,1126891415);c=md5ii(c,d,a,b,M[i+14],15,-1416354905);b=md5ii(b,c,d,a,M[i+5],21,-57434055);
      a=md5ii(a,b,c,d,M[i+12],6,1700485571);d=md5ii(d,a,b,c,M[i+3],10,-1894986606);c=md5ii(c,d,a,b,M[i+10],15,-1051523);b=md5ii(b,c,d,a,M[i+1],21,-2054922799);
      a=md5ii(a,b,c,d,M[i+8],6,1873313359);d=md5ii(d,a,b,c,M[i+15],10,-30611744);c=md5ii(c,d,a,b,M[i+6],15,-1560198380);b=md5ii(b,c,d,a,M[i+13],21,1309151649);
      a=md5ii(a,b,c,d,M[i+4],6,-145523070);d=md5ii(d,a,b,c,M[i+11],10,-1120210379);c=md5ii(c,d,a,b,M[i+2],15,718787259);b=md5ii(b,c,d,a,M[i+9],21,-343485551);
      a=safeAdd(a,oa); b=safeAdd(b,ob); c=safeAdd(c,oc); d=safeAdd(d,od);
    }

    return [a,b,c,d].map(v => {
      let s = '';
      for (let j=0; j<4; j++) s += ('0' + ((v >> (j*8)) & 0xff).toString(16)).slice(-2);
      return s;
    }).join('');
  }

  // ─── PUBLIC API ───
  return {
    register,
    login,
    logout,
    autoLogin,
    getCurrentUser,
    updateUser,
    getUsers,
    saveUsers,
    getStats,
    updateStats,
    incrementStat,
    recordServiceUse,
    md5,
    // Config
    BACKEND
  };

})();
