/* ═══════════════════════════════════════════════
   ILYA AI v3 — Admin Panel (admin.js)
   Stats · Full Edit · Banned · Support · Config · Activity · Broadcast
═══════════════════════════════════════════════ */
var ILYAAdmin = {

  _tab: 'stats',

  show: function() {
    if (!ILYA.state.user || ILYA.state.user.role !== 'admin') return;
    var self = this;
    ILYA.reg('admin', function() { self.show(); });
    this._render();
    ILYA.go('admin');
  },

  _render: function() {
    var self  = this;
    var isAr  = ILYA.state.lang === 'ar';
    var tabs  = [
      { id:'stats',     icon:'fa-chart-bar',         lbl: ILYA.t('stats') },
      { id:'users',     icon:'fa-users',             lbl: ILYA.t('users_mgmt') },
      { id:'banned',    icon:'fa-ban',               lbl: ILYA.t('banned') },
      { id:'support',   icon:'fa-headset',           lbl: ILYA.t('support_inbox') },
      { id:'config',    icon:'fa-sliders',           lbl: ILYA.t('sys_config') },
      { id:'activity',  icon:'fa-clock-rotate-left', lbl: ILYA.t('act_log') },
      { id:'broadcast', icon:'fa-bullhorn',          lbl: ILYA.t('broadcast') },
    ];

    document.getElementById('page-admin').innerHTML =
      '<div class="pg">' +
        '<div class="pg-hdr">' +
          ILYA.backBtn('back-admin') +
          '<div class="pg-title"><i class="fa-solid fa-shield-halved" style="margin-inline-end:8px;color:var(--neon)"></i>' + ILYA.t('admin') + '</div>' +
        '</div>' +
        '<div class="admin-tabs" id="admin-tabs">' +
          tabs.map(function(tab) {
            return '<button class="admin-tab' + (tab.id === self._tab ? ' active' : '') + '" data-tab="' + tab.id + '">' +
              '<i class="fa-solid ' + tab.icon + '" style="margin-inline-end:6px"></i>' + ILYA.esc(tab.lbl) +
              '</button>';
          }).join('') +
        '</div>' +
        '<div id="admin-content"><div class="spinner"></div></div>' +
        ILYA.footer() +
      '</div>';

    var backBtn = document.getElementById('back-admin');
    if (backBtn) backBtn.addEventListener('click', function() { ILYADashboard.show(); });

    document.querySelectorAll('#page-admin [data-tab]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        self._tab = btn.dataset.tab;
        document.querySelectorAll('#page-admin .admin-tab').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        self._load(self._tab);
      });
    });

    this._load(this._tab);
  },

  _load: function(tab) {
    var self = this;
    var c    = document.getElementById('admin-content');
    if (!c) return;
    c.innerHTML = '<div class="spinner"></div>';
    setTimeout(function() {
      switch (tab) {
        case 'stats':     self._stats(c);     break;
        case 'users':     self._users(c);     break;
        case 'banned':    self._banned(c);    break;
        case 'support':   self._support(c);   break;
        case 'config':    self._config(c);    break;
        case 'activity':  self._activity(c);  break;
        case 'broadcast': self._broadcast(c); break;
      }
    }, 50);
  },

  /* ── Stats ─────────────────────────────────── */
  _stats: function(el) {
    var isAr = ILYA.state.lang === 'ar';
    var s    = DB.stats();

    var statsData = [
      ['fa-users',         ILYA.t('total_users'),   s.users,    '#fff'],
      ['fa-eye',           ILYA.t('total_vis'),     s.visitors, '#fff'],
      ['fa-wand-sparkles', ILYA.t('total_ai'),      s.aitotal,  '#fff'],
      ['fa-ticket',        ILYA.t('total_tickets'), s.tickets,  '#fff'],
      ['fa-circle-check',  isAr?'نشطون':'Active',   s.active,   '#44ff88'],
      ['fa-ban',           isAr?'محظورون':'Banned', s.banned,   '#ff6688'],
    ];

    var html = '<div class="stat-grid">' +
      statsData.map(function(d) {
        return '<div class="stat-card">' +
          '<i class="fa-solid ' + d[0] + '" style="font-size:1.15rem;color:var(--neon);margin-bottom:8px;display:block"></i>' +
          '<div class="stat-num" style="color:' + d[3] + '">' + d[2] + '</div>' +
          '<div class="stat-lbl">' + ILYA.esc(d[1]) + '</div>' +
          '</div>';
      }).join('') +
      '</div>';

    if (s.breakdown && s.breakdown.length) {
      html += '<div class="glass glass-p">' +
        '<div style="font-weight:700;margin-bottom:14px;font-size:.88rem"><i class="fa-solid fa-chart-bar" style="color:var(--neon);margin-inline-end:8px"></i>' +
          (isAr?'استخدام الخدمات':'Service Usage') + '</div>' +
        s.breakdown.map(function(row) {
          var pct = s.aitotal > 0 ? Math.round(row.count / s.aitotal * 100) : 0;
          return '<div style="margin-bottom:13px">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:5px">' +
              '<span style="font-size:.81rem;color:var(--t2)">' + ILYA.esc(row.service) + '</span>' +
              '<span style="font-family:\'Orbitron\',monospace;font-size:.78rem;color:var(--neon)">' + row.count +
                '<span style="color:var(--t4);font-family:\'Cairo\',sans-serif;font-size:.72rem"> (' + pct + '%)</span></span>' +
            '</div>' +
            '<div class="prog-bar"><div class="prog-fill" style="width:' + pct + '%"></div></div>' +
            '</div>';
        }).join('') +
        '</div>';
    }

    el.innerHTML = html;
  },

  /* ── Users ─────────────────────────────────── */
  _users: function(el) {
    var self  = this;
    var isAr  = ILYA.state.lang === 'ar';
    var users = DB.users().filter(function(u) { return !u.banned; });

    el.innerHTML =
      '<div class="fgrp" style="margin-bottom:14px;position:relative">' +
        '<input id="user-search" type="text" class="finp"' +
               ' placeholder="' + (isAr?'بحث باسم أو معرف...':'Search by name or username...') + '"' +
               ' style="padding-inline-start:36px">' +
        '<i class="fa-solid fa-magnifying-glass" style="position:absolute;top:50%;inset-inline-start:12px;transform:translateY(-50%);color:var(--t4);font-size:.85rem;pointer-events:none"></i>' +
      '</div>' +
      '<div id="user-rows">' +
        (users.length ? users.map(function(u) { return self._userRow(u); }).join('') : self._empty()) +
      '</div>';

    this._bindUserRows(el, users);

    var searchInp = document.getElementById('user-search');
    if (searchInp) {
      searchInp.addEventListener('input', function() {
        var q       = this.value.toLowerCase();
        var filtered = users.filter(function(u) {
          return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || String(u.id).includes(q);
        });
        var rowsEl = document.getElementById('user-rows');
        if (rowsEl) {
          rowsEl.innerHTML = filtered.length
            ? filtered.map(function(u) { return self._userRow(u); }).join('')
            : '<div class="empty-state" style="padding:20px"><div class="empty-txt">' + (isAr?'لا توجد نتائج':'No results') + '</div></div>';
          self._bindUserRows(el, filtered);
        }
      });
    }
  },

  _userRow: function(u) {
    var bc = u.role === 'admin' ? 'b-admin' : u.role === 'vip' ? 'b-vip' : 'b-user';
    var isRtl = document.documentElement.dir === 'rtl';
    return '<div class="user-row" data-uid="' + ILYA.esc(u.id) + '">' +
      '<img src="' + ILYA.esc(u.pic||'https://iili.io/B04MxcX.md.jpg') + '" class="user-av"' +
           ' onerror="this.src=\'https://iili.io/B04MxcX.md.jpg\'" alt="' + ILYA.esc(u.name) + '">' +
      '<div class="user-row-info">' +
        '<div class="user-row-name">' + ILYA.esc(u.name) + '</div>' +
        '<div class="user-row-meta">@' + ILYA.esc(u.username) + ' · ID: ' + ILYA.esc(u.id) + '</div>' +
        '<div class="user-row-meta">' + (u.created_at||'').slice(0,10) + '</div>' +
      '</div>' +
      '<span class="sb-badge ' + bc + '" style="font-size:.62rem">' + u.role + '</span>' +
      '<i class="fa-solid ' + (isRtl?'fa-chevron-left':'fa-chevron-right') + '" style="color:var(--t4);font-size:.8rem"></i>' +
      '</div>';
  },

  _bindUserRows: function(el, users) {
    var self = this;
    el.querySelectorAll('[data-uid]').forEach(function(row) {
      row.addEventListener('click', function() {
        var u = DB.userById(row.dataset.uid);
        if (u) self._userDetail(u, el);
      });
    });
  },

  /* ── User Detail (Full Admin Edit) ─────────── */
  _userDetail: function(u, container) {
    var self  = this;
    var isAr  = ILYA.state.lang === 'ar';
    var act   = DB.activityFor(u.id).slice(0, 30);
    var bc    = u.role === 'admin' ? 'b-admin' : u.role === 'vip' ? 'b-vip' : 'b-user';
    var isRtl = document.documentElement.dir === 'rtl';

    container.innerHTML =
      '<button class="btn btn-sm btn-info" id="back-ulist" style="margin-bottom:16px">' +
        '<i class="fa-solid fa-arrow-' + (isRtl?'right':'left') + '"></i> ' + (isAr?'رجوع للقائمة':'Back to list') +
      '</button>' +

      // User card
      '<div class="glass glass-p" style="margin-bottom:14px">' +
        '<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">' +
          '<img src="' + ILYA.esc(u.pic||'https://iili.io/B04MxcX.md.jpg') + '" id="ud-av"' +
               ' style="width:66px;height:66px;border-radius:50%;object-fit:cover;border:2px solid var(--red3)"' +
               ' onerror="this.src=\'https://iili.io/B04MxcX.md.jpg\'" alt="' + ILYA.esc(u.name) + '">' +
          '<div>' +
            '<div style="font-size:1rem;font-weight:700">' + ILYA.esc(u.name) + '</div>' +
            '<div style="font-size:.8rem;color:var(--t3)">@' + ILYA.esc(u.username) + '</div>' +
            '<span class="sb-badge ' + bc + '" style="font-size:.62rem;margin-top:4px;display:inline-block">' + u.role + '</span>' +
          '</div>' +
        '</div>' +

        '<div class="sec-lbl"><i class="fa-solid fa-pen-to-square"></i>' + (isAr?'تعديل شامل — كل الحقول قابلة للتغيير':'Full Edit — All fields editable') + '</div>' +

        // Editable fields
        [
          { id:'ae-id',   lbl: 'ID',                         val: u.id,          note: isAr?'⚠️ تغيير ID يؤثر على البيانات المرتبطة':'⚠️ Changing ID affects linked data' },
          { id:'ae-name', lbl: isAr?'الاسم':'Name',         val: u.name,        note: '' },
          { id:'ae-user', lbl: isAr?'المعرف':'Username',    val: u.username,    note: '' },
          { id:'ae-pw',   lbl: isAr?'كلمة المرور (نص أو MD5)':'Password (plain or MD5)', val: u.ph, note: isAr?'النص الواضح سيُحوّل تلقائياً لـ MD5':'Plain text will be auto-hashed to MD5' },
          { id:'ae-pic',  lbl: isAr?'رابط الصورة':'Picture URL', val: u.pic||'', note: '' },
        ].map(function(f) {
          return '<div class="fgrp">' +
            '<label class="flbl">' + ILYA.esc(f.lbl) + '</label>' +
            '<input id="' + f.id + '" type="text" class="finp" value="' + ILYA.esc(f.val||'') + '">' +
            (f.note ? '<div style="font-size:.7rem;color:var(--t4);margin-top:4px">' + ILYA.esc(f.note) + '</div>' : '') +
            '</div>';
        }).join('') +

        '<div class="fgrp">' +
          '<label class="flbl">' + (isAr?'الدور':'Role') + '</label>' +
          '<select id="ae-role" class="finp">' +
            ['user','vip','admin'].map(function(r) {
              return '<option value="' + r + '"' + (u.role===r?' selected':'') + '>' + r + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +

        '<button class="btn btn-sm btn-glass" id="prev-av" style="margin-bottom:14px">' +
          '<i class="fa-solid fa-eye"></i> ' + (isAr?'معاينة الصورة':'Preview Avatar') +
        '</button>' +

        '<div id="ae-msg" style="text-align:center;font-size:.82rem;margin-bottom:10px;display:none"></div>' +

        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          '<button class="btn btn-success" id="ae-save" style="flex:1;min-width:140px">' +
            '<i class="fa-solid fa-floppy-disk"></i> ' + (isAr?'حفظ كل التغييرات':'Save All Changes') +
          '</button>' +
          (String(u.id) !== '1' && String(u.id) !== '2' ?
            '<button class="btn btn-danger btn-sm" id="ae-del"><i class="fa-solid fa-trash"></i> ' + ILYA.t('del_user') + '</button>' : '') +
        '</div>' +
      '</div>' +

      // Ban section
      (String(u.id) !== '1' ?
        '<div class="glass glass-p" style="margin-bottom:14px">' +
          '<div style="font-weight:700;margin-bottom:12px;font-size:.88rem"><i class="fa-solid fa-shield-halved" style="color:var(--neon);margin-inline-end:8px"></i>' +
            (isAr?'إدارة الحظر':'Ban Management') + '</div>' +
          (u.banned ?
            '<div class="note-warn" style="margin-bottom:12px;font-size:.8rem"><i class="fa-solid fa-ban" style="margin-inline-end:6px"></i>' +
              (isAr?'الحساب محظور (' + (u.ban_type||'') + ')':'Account is banned (' + (u.ban_type||'') + ')') + '</div>' +
            '<button class="btn btn-success btn-full" id="do-unban"><i class="fa-solid fa-lock-open"></i> ' + ILYA.t('unban') + '</button>' :
            '<div style="display:flex;gap:10px">' +
              '<button class="btn btn-danger" id="do-ban-tmp" style="flex:1"><i class="fa-solid fa-clock"></i> ' + ILYA.t('ban_tmp') + '</button>' +
              '<button class="btn btn-danger" id="do-ban-prm" style="flex:1;background:linear-gradient(135deg,#6a0000,#cc0000)"><i class="fa-solid fa-ban"></i> ' + ILYA.t('ban_prm') + '</button>' +
            '</div>') +
        '</div>' :
        '<div class="note-info" style="margin-bottom:14px;font-size:.8rem"><i class="fa-solid fa-shield-halved" style="margin-inline-end:7px"></i>' +
          (isAr?'لا يمكن حظر حساب المبرمج الرئيسي':'Cannot ban the main admin account') + '</div>') +

      // Activity
      '<div class="glass glass-p">' +
        '<div class="sec-lbl"><i class="fa-solid fa-clock-rotate-left"></i>' + (isAr?'سجل النشاط':'Activity Log') + '</div>' +
        (act.length ? act.map(function(a) {
          return '<div style="display:flex;align-items:flex-start;gap:9px;padding:9px 0;border-bottom:1px solid var(--gb)">' +
            (a.url ?
              '<img src="' + ILYA.esc(a.url) + '" style="width:42px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0;cursor:zoom-in;border:1px solid var(--gb)" onclick="ILYA.openLightbox(\'' + ILYA.esc(a.url) + '\')" onerror="this.style.display=\'none\'" loading="lazy">' :
              '<div style="width:42px;height:42px;border-radius:8px;background:var(--gs2);display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fa-solid fa-wand-sparkles" style="color:var(--neon);font-size:.85rem"></i></div>') +
            '<div style="flex:1;min-width:0">' +
              '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:3px;margin-bottom:3px">' +
                '<span style="font-size:.8rem;font-weight:700;color:var(--bright)">' + ILYA.esc(a.service) + '</span>' +
                '<span style="font-size:.7rem;color:var(--t4)">' + (a.created_at||'').slice(0,16) + '</span>' +
              '</div>' +
              (a.prompt ? '<div style="font-size:.74rem;color:var(--t3);overflow:hidden;white-space:nowrap;text-overflow:ellipsis">' + ILYA.esc(a.prompt) + '</div>' : '') +
              (a.url ? '<a href="' + ILYA.esc(a.url) + '" target="_blank" rel="noopener" style="font-size:.71rem;color:var(--bright);display:inline-block;margin-top:3px"><i class="fa-solid fa-arrow-up-right-from-square" style="margin-inline-end:3px"></i>' + ILYA.t('open_link') + '</a>' : '') +
            '</div>' +
            '</div>';
        }).join('') :
        '<div class="empty-state" style="padding:18px"><div class="empty-icon" style="font-size:1.8rem"><i class="fa-solid fa-inbox"></i></div><div class="empty-txt">' + (isAr?'لا يوجد نشاط':'No activity') + '</div></div>') +
      '</div>';

    // Bind events
    var bind = function(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener('click', fn); };

    bind('back-ulist', function() { self._load('users'); });

    bind('prev-av', function() {
      var pic = document.getElementById('ae-pic');
      var av  = document.getElementById('ud-av');
      if (pic && av && pic.value.trim()) av.src = pic.value.trim();
    });

    bind('ae-save', function() {
      var newId   = (document.getElementById('ae-id')   && document.getElementById('ae-id').value.trim())   || '';
      var name    = (document.getElementById('ae-name') && document.getElementById('ae-name').value.trim())  || '';
      var uname   = (document.getElementById('ae-user') && document.getElementById('ae-user').value.trim())  || '';
      var rawPw   = (document.getElementById('ae-pw')   && document.getElementById('ae-pw').value.trim())    || '';
      var pic     = (document.getElementById('ae-pic')  && document.getElementById('ae-pic').value.trim())   || '';
      var role    = (document.getElementById('ae-role') && document.getElementById('ae-role').value)         || 'user';
      var msgEl   = document.getElementById('ae-msg');

      if (!newId || !name || !uname) { ILYA.toast(ILYA.t('err_fields'), 'error'); return; }
      if (uname.length < 4) { ILYA.toast(ILYA.t('err_uname_short'), 'error'); return; }

      var conflict = DB.userByUsername(uname);
      if (conflict && String(conflict.id) !== String(u.id)) { ILYA.toast(ILYA.t('err_uname_taken'), 'error'); return; }

      // Password: if 32 hex chars, treat as raw MD5; otherwise hash it
      var ph = rawPw;
      if (rawPw && !/^[0-9a-f]{32}$/.test(rawPw)) {
        ph = md5(rawPw);
      } else if (!rawPw) {
        ph = u.ph;
      }

      var updates = { id: newId, name: name, username: uname, ph: ph, role: role };
      if (pic) updates.pic = pic;

      var resultId = DB.adminEditUser(u.id, updates);
      if (msgEl) { msgEl.textContent = ILYA.t('saved'); msgEl.style.color = '#44ff88'; msgEl.style.display = 'block'; }
      ILYA.toast(ILYA.t('saved'), 'success');
      setTimeout(function() {
        if (msgEl) msgEl.style.display = 'none';
        self._load('users');
      }, 1500);
    });

    bind('ae-del', function() {
      var conf = isAr
        ? 'حذف المستخدم "' + u.name + '"؟ هذا الإجراء لا يمكن التراجع عنه.'
        : 'Delete user "' + u.name + '"? This cannot be undone.';
      if (confirm(conf)) {
        DB.deleteUser(u.id);
        ILYA.toast(isAr?'تم حذف المستخدم':'User deleted', 'success');
        self._load('users');
      }
    });

    bind('do-ban-tmp', function() {
      if (confirm(isAr?'تأكيد الحظر المؤقت؟':'Confirm temporary ban?')) {
        DB.banUser(u.id, 'temporary');
        ILYA.toast(isAr?'تم الحظر المؤقت':'Temporary ban applied', 'success');
        self._load('users');
      }
    });

    bind('do-ban-prm', function() {
      if (confirm(isAr?'تأكيد الحظر النهائي؟':'Confirm permanent ban?')) {
        DB.banUser(u.id, 'permanent');
        ILYA.toast(isAr?'تم الحظر النهائي':'Permanent ban applied', 'success');
        self._load('users');
      }
    });

    bind('do-unban', function() {
      DB.unbanUser(u.id);
      ILYA.toast(isAr?'تم رفع الحظر':'Unbanned', 'success');
      var fresh = DB.userById(u.id);
      if (fresh) self._userDetail(fresh, container);
    });
  },

  /* ── Banned ─────────────────────────────────── */
  _banned: function(el) {
    var self   = this;
    var isAr   = ILYA.state.lang === 'ar';
    var banned = DB.users().filter(function(u) { return u.banned; });

    if (!banned.length) {
      el.innerHTML = '<div class="empty-state">' +
        '<div class="empty-icon"><i class="fa-solid fa-circle-check" style="color:#44ff88"></i></div>' +
        '<div class="empty-txt">' + (isAr?'لا توجد حسابات محظورة':'No banned accounts') + '</div>' +
        '</div>';
      return;
    }

    el.innerHTML = banned.map(function(u) {
      return '<div class="user-row" style="border-color:rgba(255,60,60,.15)">' +
        '<img src="' + ILYA.esc(u.pic||'https://iili.io/B04MxcX.md.jpg') + '" class="user-av"' +
             ' onerror="this.src=\'https://iili.io/B04MxcX.md.jpg\'" alt="' + ILYA.esc(u.name) + '">' +
        '<div class="user-row-info">' +
          '<div class="user-row-name">' + ILYA.esc(u.name) + '</div>' +
          '<div class="user-row-meta">@' + ILYA.esc(u.username) + '</div>' +
          '<div style="font-size:.71rem;color:#ff8888;margin-top:2px"><i class="fa-solid fa-ban" style="margin-inline-end:4px"></i>' +
            (u.ban_type === 'permanent' ? (isAr?'حظر نهائي':'Permanent') : (isAr?'حظر مؤقت':'Temporary')) +
          '</div>' +
        '</div>' +
        '<button class="btn btn-sm btn-success" data-unban="' + ILYA.esc(u.id) + '">' +
          '<i class="fa-solid fa-lock-open"></i> ' + ILYA.t('unban') +
        '</button>' +
        '</div>';
    }).join('');

    el.querySelectorAll('[data-unban]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        DB.unbanUser(btn.dataset.unban);
        ILYA.toast(isAr?'تم رفع الحظر':'Unbanned', 'success');
        self._banned(el);
      });
    });
  },

  /* ── Support Inbox ──────────────────────────── */
  _support: function(el) {
    var self    = this;
    var isAr    = ILYA.state.lang === 'ar';
    var tickets = DB.tickets(null);
    var users   = DB.users();

    if (!tickets.length) {
      el.innerHTML = '<div class="empty-state"><div class="empty-icon"><i class="fa-solid fa-inbox"></i></div><div class="empty-txt">' + (isAr?'لا توجد تذاكر':'No tickets') + '</div></div>';
      return;
    }

    el.innerHTML = tickets.map(function(tk) {
      var u = null;
      for (var i = 0; i < users.length; i++) if (String(users[i].id) === String(tk.uid)) { u = users[i]; break; }
      if (!u) u = { name:'?', username:'?', pic:'' };

      return '<div class="ticket-card">' +
        '<div class="ticket-hdr">' +
          '<img src="' + ILYA.esc(u.pic||'https://iili.io/B04MxcX.md.jpg') + '" class="ticket-av"' +
               ' onerror="this.src=\'https://iili.io/B04MxcX.md.jpg\'" alt="' + ILYA.esc(u.name) + '">' +
          '<div class="ticket-meta" style="flex:1;min-width:0">' +
            '<div class="ticket-meta-name">' + ILYA.esc(u.name) + '</div>' +
            '<div class="ticket-meta-date">@' + ILYA.esc(u.username) + ' · ' + (tk.created_at||'').slice(0,16) + '</div>' +
          '</div>' +
          '<span class="t-badge ' + (tk.status==='replied'?'t-replied':'t-open') + '">' +
            (tk.status==='replied'?(isAr?'تم الرد':'Replied'):(isAr?'مفتوحة':'Open')) + '</span>' +
        '</div>' +
        '<div class="ticket-msg">' + ILYA.esc(tk.message) + '</div>' +
        (tk.att1||tk.att2 ?
          '<div class="ticket-atts">' +
            (tk.att1 ? '<img src="' + ILYA.esc(tk.att1) + '" class="ticket-att" onclick="ILYA.openLightbox(\'' + ILYA.esc(tk.att1) + '\')" onerror="this.style.display=\'none\'">' : '') +
            (tk.att2 ? '<img src="' + ILYA.esc(tk.att2) + '" class="ticket-att" onclick="ILYA.openLightbox(\'' + ILYA.esc(tk.att2) + '\')" onerror="this.style.display=\'none\'">' : '') +
          '</div>' : '') +
        (tk.reply ?
          '<div class="ticket-reply-box"><strong><i class="fa-solid fa-reply" style="margin-inline-end:5px"></i>' + ILYA.t('admin_reply') + '</strong>' + ILYA.esc(tk.reply) + '</div>' : '') +
        '<div style="display:flex;gap:8px;margin-top:11px">' +
          '<input type="text" class="finp rep-inp" data-tid="' + tk.id + '"' +
                 ' placeholder="' + ILYA.t('write_reply') + '"' +
                 ' style="flex:1;padding:8px 12px;font-size:.81rem">' +
          '<button class="btn btn-sm btn-info rep-btn" data-tid="' + tk.id + '"><i class="fa-solid fa-paper-plane"></i></button>' +
        '</div>' +
        '</div>';
    }).join('');

    el.querySelectorAll('.rep-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var tid   = btn.dataset.tid;
        var inp   = el.querySelector('.rep-inp[data-tid="' + tid + '"]');
        var reply = inp && inp.value.trim();
        if (!reply) return;
        DB.replyTicket(tid, reply);
        ILYA.toast(isAr?'تم إرسال الرد':'Reply sent', 'success');
        self._support(el);
      });
    });

    el.querySelectorAll('.rep-inp').forEach(function(inp) {
      inp.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          var btn = el.querySelector('.rep-btn[data-tid="' + inp.dataset.tid + '"]');
          if (btn) btn.click();
        }
      });
    });
  },

  /* ── System Config ──────────────────────────── */
  _config: function(el) {
    var self  = this;
    var isAr  = ILYA.state.lang === 'ar';
    var cfg   = DB.config();

    var textRows = isAr ? [
      { k:'welcome_ar',   lbl:'نص الترحيب (عربي)' },
      { k:'welcome_en',   lbl:'نص الترحيب (إنجليزي)' },
      { k:'about_ar',     lbl:'نص التعريف (عربي)' },
      { k:'about_en',     lbl:'نص التعريف (إنجليزي)' },
      { k:'copyright_ar', lbl:'حقوق الملكية (عربي)' },
      { k:'copyright_en', lbl:'حقوق الملكية (إنجليزي)' },
      { k:'tg_link',      lbl:'رابط تيليجرام' },
      { k:'dev_site',     lbl:'رابط موقع المبرمج' },
    ] : [
      { k:'welcome_ar',   lbl:'Welcome Text (AR)' },
      { k:'welcome_en',   lbl:'Welcome Text (EN)' },
      { k:'about_ar',     lbl:'About Text (AR)' },
      { k:'about_en',     lbl:'About Text (EN)' },
      { k:'copyright_ar', lbl:'Copyright (AR)' },
      { k:'copyright_en', lbl:'Copyright (EN)' },
      { k:'tg_link',      lbl:'Telegram Link' },
      { k:'dev_site',     lbl:"Developer's Website" },
    ];

    var toggleRows = isAr ? [
      { k:'reg_on',     lbl:'تسجيل المستخدمين الجدد',         d:'السماح بإنشاء حسابات جديدة',       inv:false },
      { k:'maint',      lbl:'وضع الصيانة',                    d:'إيقاف وصول المستخدمين مؤقتاً',      inv:true  },
      { k:'svc_v1',     lbl:'توليد صورة من نص (V-Gen)',         d:'نموذج V-Gen بدقة حتى 2K',           inv:false },
      { k:'svc_anime',  lbl:'تحويل صورة إلى أنمي',            d:'14 نمطاً أنمي',                     inv:false },
      { k:'svc_seed',   lbl:'SeedDream 4.5',                  d:'13 نمطاً فنياً',                    inv:false },
      { k:'svc_pfoto',  lbl:'الصورة الشخصية الاحترافية',       d:'15 نمطاً',                          inv:false },
      { k:'svc_flux',   lbl:'Flux MAX',                       d:'11 نسبة أبعاد',                     inv:false },
      { k:'svc_nb2',    lbl:'Nano Banana 2 (2K)',              d:'توليد نصي بدقة 2K',                 inv:false },
      { k:'svc_nbp',    lbl:'NanoBanana Pro',                 d:'إنشاء وتعديل حتى 4K',               inv:false },
    ] : [
      { k:'reg_on',     lbl:'User Registration',              d:'Allow new account creation',         inv:false },
      { k:'maint',      lbl:'Maintenance Mode',               d:'Block user access temporarily',      inv:true  },
      { k:'svc_v1',     lbl:'Text to Image (V-Gen)',           d:'V-Gen model up to 2K',              inv:false },
      { k:'svc_anime',  lbl:'Image to Anime',                 d:'14 anime styles',                    inv:false },
      { k:'svc_seed',   lbl:'SeedDream 4.5',                  d:'13 artistic styles',                 inv:false },
      { k:'svc_pfoto',  lbl:'Personal Photo Maker',           d:'15 professional styles',             inv:false },
      { k:'svc_flux',   lbl:'Flux MAX',                       d:'11 aspect ratios',                   inv:false },
      { k:'svc_nb2',    lbl:'Nano Banana 2 (2K)',              d:'Text-to-2K generation',              inv:false },
      { k:'svc_nbp',    lbl:'NanoBanana Pro',                 d:'Create & edit up to 4K',             inv:false },
    ];

    el.innerHTML =
      '<div class="glass glass-p" style="margin-bottom:14px">' +
        '<div style="font-weight:700;margin-bottom:14px;font-size:.88rem"><i class="fa-solid fa-pen-to-square" style="color:var(--neon);margin-inline-end:8px"></i>' +
          (isAr?'النصوص والروابط':'Texts & Links') + '</div>' +
        textRows.map(function(r) {
          return '<div class="fgrp"><label class="flbl">' + ILYA.esc(r.lbl) + '</label>' +
            '<input type="text" class="finp cfg-txt" data-k="' + r.k + '" value="' + ILYA.esc(cfg[r.k]||'') + '"></div>';
        }).join('') +
        '<button class="btn btn-primary btn-full" id="save-cfg-txt"><i class="fa-solid fa-floppy-disk"></i> ' + ILYA.t('save') + '</button>' +
      '</div>' +

      '<div class="glass glass-p">' +
        '<div style="font-weight:700;margin-bottom:14px;font-size:.88rem"><i class="fa-solid fa-toggle-on" style="color:var(--neon);margin-inline-end:8px"></i>' +
          (isAr?'تفعيل / تعطيل الخدمات':'Enable / Disable Services') + '</div>' +
        toggleRows.map(function(r) {
          var isOn = r.inv ? cfg[r.k] !== 'true' : cfg[r.k] !== 'false';
          return '<div class="cfg-row">' +
            '<div><div class="cfg-lbl">' + ILYA.esc(r.lbl) + '</div>' + (r.d ? '<div class="cfg-desc">' + ILYA.esc(r.d) + '</div>' : '') + '</div>' +
            '<label class="toggle">' +
              '<input type="checkbox" class="cfg-tog" data-k="' + r.k + '" data-inv="' + r.inv + '"' + (isOn?' checked':'') + '>' +
              '<span class="toggle-s"></span>' +
            '</label>' +
            '</div>';
        }).join('') +
      '</div>';

    var saveTxt = document.getElementById('save-cfg-txt');
    if (saveTxt) {
      saveTxt.addEventListener('click', function() {
        var updates = {};
        el.querySelectorAll('.cfg-txt').forEach(function(inp) { updates[inp.dataset.k] = inp.value; });
        DB.setConfig(updates);
        ILYA.state.config = DB.config();
        ILYA.toast(ILYA.t('saved'), 'success');
      });
    }

    el.querySelectorAll('.cfg-tog').forEach(function(toggle) {
      toggle.addEventListener('change', function() {
        var inv = toggle.dataset.inv === 'true';
        var val = inv ? (toggle.checked ? 'false' : 'true') : (toggle.checked ? 'true' : 'false');
        var updates = {};
        updates[toggle.dataset.k] = val;
        DB.setConfig(updates);
        ILYA.state.config = DB.config();
        ILYA.toast(ILYA.t('saved'), 'success');
      });
    });
  },

  /* ── Activity Log ───────────────────────────── */
  _activity: function(el) {
    var isAr = ILYA.state.lang === 'ar';
    var log  = DB.activityFor(null).slice(0, 150);

    if (!log.length) { el.innerHTML = this._empty(); return; }

    el.innerHTML =
      '<div style="font-size:.78rem;color:var(--t4);margin-bottom:12px;display:flex;align-items:center;gap:10px">' +
        (isAr ? 'إجمالي: ' + log.length + ' نشاط' : 'Total: ' + log.length + ' activities') +
        '<button class="copy-btn" id="export-log"><i class="fa-solid fa-download"></i> ' + (isAr?'تصدير':'Export') + '</button>' +
      '</div>' +
      log.map(function(a) {
        return '<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;background:var(--gs);border:1px solid var(--gb);border-radius:var(--r1);margin-bottom:7px">' +
          (a.url ?
            '<img src="' + ILYA.esc(a.url) + '" style="width:42px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0;cursor:zoom-in;border:1px solid var(--gb)" onclick="ILYA.openLightbox(\'' + ILYA.esc(a.url) + '\')" onerror="this.style.display=\'none\'" loading="lazy">' :
            '<div style="width:42px;height:42px;border-radius:8px;background:var(--gs2);display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fa-solid fa-wand-sparkles" style="color:var(--neon);font-size:.85rem"></i></div>') +
          '<div style="flex:1;min-width:0">' +
            '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:3px;margin-bottom:2px">' +
              '<span style="font-size:.8rem;font-weight:700;color:var(--bright)">' + ILYA.esc(a.service) + '</span>' +
              '<span style="font-size:.7rem;color:var(--t4)">' + (a.created_at||'').slice(0,16) + '</span>' +
            '</div>' +
            '<div style="font-size:.73rem;color:var(--t3);margin-bottom:2px"><i class="fa-solid fa-user" style="margin-inline-end:4px"></i>' + ILYA.esc(a.uname_full) + ' (@' + ILYA.esc(a.uname) + ')</div>' +
            (a.prompt ? '<div style="font-size:.74rem;color:var(--t3);overflow:hidden;white-space:nowrap;text-overflow:ellipsis">' + ILYA.esc(a.prompt) + '</div>' : '') +
            (a.url ? '<a href="' + ILYA.esc(a.url) + '" target="_blank" rel="noopener" style="font-size:.71rem;color:var(--bright);display:inline-block;margin-top:3px"><i class="fa-solid fa-arrow-up-right-from-square" style="margin-inline-end:3px"></i>' + ILYA.t('open_link') + '</a>' : '') +
          '</div>' +
          '</div>';
      }).join('');

    var expBtn = document.getElementById('export-log');
    if (expBtn) {
      expBtn.addEventListener('click', function() {
        var data = JSON.stringify(log, null, 2);
        var blob = new Blob([data], { type: 'application/json' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a');
        a.href   = url;
        a.download = 'ilya_activity_' + new Date().toISOString().slice(0,10) + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
  },

  /* ── Broadcast ──────────────────────────────── */
  _broadcast: function(el) {
    var self  = this;
    var isAr  = ILYA.state.lang === 'ar';
    var bcast = DB._g('broadcasts', []);

    el.innerHTML =
      '<div class="glass glass-p" style="margin-bottom:16px">' +
        '<div style="font-weight:700;margin-bottom:14px;font-size:.9rem"><i class="fa-solid fa-bullhorn" style="color:var(--neon);margin-inline-end:8px"></i>' +
          (isAr?'إرسال رسالة عامة لجميع المستخدمين':'Send Broadcast to All Users') + '</div>' +
        '<div class="note-warn" style="margin-bottom:14px;font-size:.79rem"><i class="fa-solid fa-triangle-exclamation" style="margin-inline-end:6px"></i>' +
          (isAr?'ستظهر كتذكرة دعم في حساب كل مستخدم':'Will appear as a support ticket for each user') + '</div>' +
        '<div class="fgrp"><label class="flbl">' + (isAr?'الرسالة':'Message') + '</label>' +
          '<textarea id="bc-msg" class="finp" rows="4" placeholder="' + (isAr?'اكتب رسالتك هنا...':'Write your message here...') + '" style="resize:vertical"></textarea></div>' +
        '<div id="bc-st" style="text-align:center;font-size:.82rem;margin-bottom:10px;display:none"></div>' +
        '<button class="btn btn-primary btn-full" id="bc-send"><i class="fa-solid fa-bullhorn"></i> ' + ILYA.t('broadcast_send') + '</button>' +
      '</div>' +
      '<div class="sec-lbl"><i class="fa-solid fa-history"></i>' + (isAr?'البث السابق':'Past Broadcasts') + '</div>' +
      '<div id="bc-hist">' +
        (bcast.length ? bcast.slice(0, 10).map(function(b) {
          return '<div class="glass glass-p" style="margin-bottom:8px;padding:12px 14px">' +
            '<div style="font-size:.79rem;font-weight:600;margin-bottom:4px">' + ILYA.esc(b.msg) + '</div>' +
            '<div style="font-size:.71rem;color:var(--t4)">' + (b.ts||'').slice(0,16) + ' · ' + (isAr?'أُرسل لـ ' + b.count + ' مستخدم':'Sent to ' + b.count + ' users') + '</div>' +
            '</div>';
        }).join('') :
        '<div class="empty-state" style="padding:16px"><div class="empty-txt">' + (isAr?'لا يوجد بث سابق':'No past broadcasts') + '</div></div>') +
      '</div>';

    var sendBtn = document.getElementById('bc-send');
    if (sendBtn) {
      sendBtn.addEventListener('click', function() {
        var msg = document.getElementById('bc-msg') && document.getElementById('bc-msg').value.trim();
        var st  = document.getElementById('bc-st');
        if (!msg) { ILYA.toast(isAr?'الرسالة مطلوبة':'Message required', 'error'); return; }

        var users = DB.users().filter(function(u) { return u.role !== 'admin'; });
        users.forEach(function(u) {
          DB.addTicket('1', (isAr?'📢 إعلان من الإدارة: ':'📢 Admin Broadcast: ') + msg, null, null);
        });

        var history = DB._g('broadcasts', []);
        history.unshift({ msg: msg, ts: new Date().toISOString().replace('T',' ').slice(0,19), count: users.length });
        if (history.length > 20) history.splice(20);
        DB._s('broadcasts', history);

        document.getElementById('bc-msg').value = '';
        if (st) { st.textContent = isAr ? 'تم الإرسال لـ ' + users.length + ' مستخدم' : 'Sent to ' + users.length + ' users'; st.style.color = '#44ff88'; st.style.display = 'block'; }
        ILYA.toast(isAr?'تم البث بنجاح':'Broadcast sent', 'success');
        setTimeout(function() { self._broadcast(el); }, 1500);
      });
    }
  },

  /* ── Helpers ────────────────────────────────── */
  _empty: function() {
    var isAr = ILYA.state.lang === 'ar';
    return '<div class="empty-state"><div class="empty-icon"><i class="fa-solid fa-box-open"></i></div><div class="empty-txt">' + (isAr?'لا توجد بيانات':'No data found') + '</div></div>';
  },
};
