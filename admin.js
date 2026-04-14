/* ═══════════════════════════════════════════════════════════
   ILYA AI Platform v3 — Admin Panel (admin.js)
   Stats · Full User Edit · Banned · Support · Config · Log · Broadcast
═══════════════════════════════════════════════════════════ */
const ILYAAdmin = {

  _tab: 'stats',

  show() {
    if (ILYA.state.user?.role !== 'admin') return;
    ILYA.reg('admin', () => this.show());
    this._render();
    ILYA.go('admin');
  },

  _render() {
    const t    = k => ILYA.t(k);
    const tabs = [
      { id:'stats',    icon:'fa-chart-bar',           lbl: t('stats') },
      { id:'users',    icon:'fa-users',               lbl: t('users_mgmt') },
      { id:'banned',   icon:'fa-ban',                 lbl: t('banned') },
      { id:'support',  icon:'fa-headset',             lbl: t('support_inbox') },
      { id:'config',   icon:'fa-sliders',             lbl: t('sys_config') },
      { id:'activity', icon:'fa-clock-rotate-left',   lbl: t('act_log') },
      { id:'broadcast',icon:'fa-bullhorn',            lbl: t('broadcast') },
    ];

    document.getElementById('page-admin').innerHTML = `
      <div class="pg">
        <div class="pg-hdr">
          <button class="back-btn" id="back-admin">
            <i class="fa-solid fa-arrow-right"></i><i class="fa-solid fa-arrow-left"></i>
          </button>
          <div class="pg-title">
            <i class="fa-solid fa-shield-halved" style="margin-inline-end:8px;color:var(--neon)"></i>${t('admin')}
          </div>
        </div>

        <div class="admin-tabs" id="admin-tabs">
          ${tabs.map(tab => `
            <button class="admin-tab${tab.id === this._tab ? ' active' : ''}" data-tab="${tab.id}">
              <i class="fa-solid ${tab.icon}" style="margin-inline-end:6px"></i>${tab.lbl}
            </button>`).join('')}
        </div>

        <div id="admin-content"><div class="spinner"></div></div>
        ${ILYA.footer()}
      </div>`;

    document.getElementById('back-admin')?.addEventListener('click', () => ILYADashboard.show());

    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._tab = btn.dataset.tab;
        document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._load(this._tab);
      });
    });

    this._load(this._tab);
  },

  _load(tab) {
    const c = document.getElementById('admin-content');
    if (!c) return;
    c.innerHTML = '<div class="spinner"></div>';
    setTimeout(() => {
      switch (tab) {
        case 'stats':     this._stats(c);     break;
        case 'users':     this._users(c);     break;
        case 'banned':    this._banned(c);    break;
        case 'support':   this._support(c);   break;
        case 'config':    this._config(c);    break;
        case 'activity':  this._activity(c);  break;
        case 'broadcast': this._broadcast(c); break;
      }
    }, 60);
  },

  /* ── Stats ─────────────────────────────────────────────── */
  _stats(el) {
    const s    = DB.stats();
    const t    = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';

    el.innerHTML = `
      <div class="stat-grid">
        ${[
          ['fa-users',          t('total_users'),  s.users,    '#fff'],
          ['fa-eye',            t('total_vis'),    s.visitors, '#fff'],
          ['fa-wand-sparkles',  t('total_ai'),     s.aitotal,  '#fff'],
          ['fa-ticket',         t('total_tickets'),s.tickets,  '#fff'],
          ['fa-circle-check',   isAr ? 'نشطون' : 'Active',  s.active, '#44ff88'],
          ['fa-ban',            isAr ? 'محظورون':'Banned', s.banned, '#ff6688'],
        ].map(([icon, lbl, num, clr]) => `
          <div class="stat-card">
            <i class="fa-solid ${icon}" style="font-size:1.15rem;color:var(--neon);margin-bottom:8px;display:block"></i>
            <div class="stat-num" style="color:${clr}">${num}</div>
            <div class="stat-lbl">${lbl}</div>
          </div>`).join('')}
      </div>

      ${s.breakdown.length ? `
        <div class="glass glass-p" style="margin-bottom:0">
          <div style="font-weight:700;margin-bottom:14px;font-size:.88rem">
            <i class="fa-solid fa-chart-bar" style="color:var(--neon);margin-inline-end:8px"></i>
            ${isAr ? 'استخدام الخدمات' : 'Service Usage'}
          </div>
          ${s.breakdown.map(row => {
            const pct = s.aitotal > 0 ? Math.round((row.count / s.aitotal) * 100) : 0;
            return `
              <div style="margin-bottom:13px">
                <div style="display:flex;justify-content:space-between;margin-bottom:5px">
                  <span style="font-size:.81rem;color:var(--t2)">${ILYA.esc(row.service)}</span>
                  <span style="font-family:'Orbitron',monospace;font-size:.78rem;color:var(--neon)">${row.count} <span style="color:var(--t4);font-family:'Cairo',sans-serif;font-size:.72rem">(${pct}%)</span></span>
                </div>
                <div class="prog-bar"><div class="prog-bar-fill" style="width:${pct}%"></div></div>
              </div>`;
          }).join('')}
        </div>` : ''}
    `;
  },

  /* ── Users List ──────────────────────────────────────── */
  _users(el) {
    const isAr  = ILYA.state.lang === 'ar';
    const t     = k => ILYA.t(k);
    const users = DB.users().filter(u => !u.banned);

    if (!users.length) { el.innerHTML = this._empty(); return; }

    // Search bar
    el.innerHTML = `
      <div class="form-grp" style="margin-bottom:14px">
        <input id="user-search" type="text" class="form-ctrl"
          placeholder="${isAr ? 'بحث باسم أو معرف...' : 'Search by name or username...'}"
          style="padding-inline-start:36px;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='rgba(255,255,255,.3)' viewBox='0 0 24 24'%3E%3Cpath d='M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/%3E%3C/svg%3E\");background-repeat:no-repeat;background-position:inline-start 10px center">
      </div>
      <div id="user-list">
        ${users.map(u => this._userRow(u)).join('')}
      </div>`;

    this._bindUserRows(el, users);

    // Live search
    document.getElementById('user-search')?.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      const filtered = users.filter(u =>
        u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || String(u.id).includes(q)
      );
      const listEl = document.getElementById('user-list');
      listEl.innerHTML = filtered.length
        ? filtered.map(u => this._userRow(u)).join('')
        : `<div class="empty-state" style="padding:20px"><div class="empty-txt">${isAr ? 'لا توجد نتائج' : 'No results'}</div></div>`;
      this._bindUserRows(el, filtered);
    });
  },

  _userRow(u) {
    const roleCls = u.role === 'admin' ? 'badge-admin' : u.role === 'vip' ? 'badge-vip' : 'badge-user';
    return `
      <div class="user-row" data-uid="${u.id}">
        <img src="${u.pic||'https://iili.io/B04MxcX.md.jpg'}" class="user-av" alt="${ILYA.esc(u.name)}"
             onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
        <div class="user-row-info">
          <div class="user-row-name">${ILYA.esc(u.name)}</div>
          <div class="user-row-meta">@${ILYA.esc(u.username)} · ID: ${u.id}</div>
          <div class="user-row-meta">${(u.created_at||'').slice(0,10)}</div>
        </div>
        <span class="sb-badge ${roleCls}" style="font-size:.62rem">${u.role}</span>
        <i class="fa-solid ${document.documentElement.dir==='rtl'?'fa-chevron-left':'fa-chevron-right'}" style="color:var(--t4);font-size:.8rem"></i>
      </div>`;
  },

  _bindUserRows(el, users) {
    el.querySelectorAll('[data-uid]').forEach(row => {
      row.addEventListener('click', () => {
        const u = DB.userById(row.dataset.uid);
        if (u) this._userDetail(u, el);
      });
    });
  },

  /* ── User Detail (full edit) ─────────────────────────── */
  _userDetail(u, container) {
    const t    = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    const act  = DB.activityFor(u.id).slice(0, 30);
    const roleCls = u.role === 'admin' ? 'badge-admin' : u.role === 'vip' ? 'badge-vip' : 'badge-user';

    container.innerHTML = `
      <button class="btn btn-sm btn-info" id="back-user" style="margin-bottom:16px">
        <i class="fa-solid fa-arrow-${document.documentElement.dir==='rtl'?'right':'left'}"></i>
        ${isAr ? 'رجوع للقائمة' : 'Back to list'}
      </button>

      <!-- User Card -->
      <div class="glass glass-p" style="margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
          <img src="${u.pic||'https://iili.io/B04MxcX.md.jpg'}"
               id="detail-av"
               style="width:66px;height:66px;border-radius:50%;object-fit:cover;border:2px solid var(--red3)"
               onerror="this.src='https://iili.io/B04MxcX.md.jpg'" alt="${ILYA.esc(u.name)}">
          <div>
            <div style="font-size:1rem;font-weight:700">${ILYA.esc(u.name)}</div>
            <div style="font-size:.8rem;color:var(--t3)">@${ILYA.esc(u.username)}</div>
            <span class="sb-badge ${roleCls}" style="font-size:.62rem;margin-top:4px;display:inline-block">${u.role}</span>
          </div>
        </div>

        <div class="sec-lbl"><i class="fa-solid fa-pen-to-square"></i>${isAr ? 'تعديل شامل — كل الحقول قابلة للتغيير':'Full Edit — All fields editable'}</div>

        <!-- Admin can edit ALL fields including ID and password -->
        ${[
          { id:'ae-id',   lbl: 'ID',                  val: u.id,       type:'text',     note: isAr ? '⚠️ تغيير ID قد يؤثر على البيانات المرتبطة':'⚠️ Changing ID may affect linked data' },
          { id:'ae-name', lbl: isAr?'الاسم':'Name',   val: u.name,     type:'text',     note: '' },
          { id:'ae-user', lbl: isAr?'المعرف':'Username', val: u.username, type:'text',  note: '' },
          { id:'ae-pw',   lbl: isAr?'كلمة المرور (MD5 أو نص واضح)':'Password (MD5 or plain text)', val: u.ph, type:'text', note: isAr ? 'إذا أدخلت نصاً واضحاً سيتم تحويله تلقائياً':'Plain text will be auto-hashed' },
          { id:'ae-pic',  lbl: isAr?'رابط الصورة':'Profile Picture URL', val: u.pic||'', type:'url', note: '' },
        ].map(f => `
          <div class="form-grp">
            <label class="form-lbl">${f.lbl}</label>
            <input id="${f.id}" type="${f.type}" class="form-ctrl" value="${ILYA.esc(f.val||'')}">
            ${f.note ? `<div style="font-size:.7rem;color:var(--t4);margin-top:4px">${f.note}</div>` : ''}
          </div>`).join('')}

        <div class="form-grp">
          <label class="form-lbl">${isAr ? 'الدور':'Role'}</label>
          <select id="ae-role" class="form-ctrl">
            ${['user','vip','admin'].map(r => `<option value="${r}" ${u.role===r?'selected':''}>${r}</option>`).join('')}
          </select>
        </div>

        <!-- Avatar preview from URL -->
        <button class="btn btn-sm btn-glass" id="prev-av-btn" style="margin-bottom:14px">
          <i class="fa-solid fa-eye"></i> ${isAr ? 'معاينة الصورة':'Preview Avatar'}
        </button>

        <div id="ae-msg" style="text-align:center;font-size:.82rem;margin-bottom:10px;display:none"></div>

        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-success" id="ae-save" style="flex:1;min-width:140px">
            <i class="fa-solid fa-floppy-disk"></i> ${isAr ? 'حفظ التغييرات':'Save Changes'}
          </button>
          ${String(u.id) !== '1' && String(u.id) !== '2' ? `
            <button class="btn btn-danger btn-sm" id="ae-delete">
              <i class="fa-solid fa-trash"></i> ${t('del_user')}
            </button>` : ''}
        </div>
      </div>

      <!-- Ban Actions -->
      ${String(u.id) !== '1' ? `
        <div class="glass glass-p" style="margin-bottom:14px">
          <div style="font-weight:700;margin-bottom:12px;font-size:.88rem">
            <i class="fa-solid fa-shield-halved" style="color:var(--neon);margin-inline-end:8px"></i>
            ${isAr ? 'إدارة الحظر':'Ban Management'}
          </div>
          ${u.banned ? `
            <div class="note-warn" style="margin-bottom:12px;font-size:.8rem">
              ${isAr ? `الحساب محظور (${u.ban_type}) منذ الإجراء الأخير` : `Account is banned (${u.ban_type})`}
            </div>
            <button class="btn btn-success btn-full" id="do-unban">
              <i class="fa-solid fa-lock-open"></i> ${t('unban')}
            </button>` : `
            <div style="display:flex;gap:10px">
              <button class="btn btn-danger" id="do-ban-tmp" style="flex:1">
                <i class="fa-solid fa-clock"></i> ${t('ban_tmp')}
              </button>
              <button class="btn btn-danger" id="do-ban-prm" style="flex:1;background:linear-gradient(135deg,#6a0000,#cc0000)">
                <i class="fa-solid fa-ban"></i> ${t('ban_prm')}
              </button>
            </div>`}
        </div>` : `
        <div class="note-info" style="margin-bottom:14px;font-size:.8rem">
          <i class="fa-solid fa-shield-halved" style="margin-inline-end:7px"></i>
          ${isAr ? 'لا يمكن حظر حساب المبرمج الرئيسي' : 'Cannot ban the main admin account'}
        </div>`}

      <!-- Activity -->
      <div class="glass glass-p" style="margin-bottom:0">
        <div class="sec-lbl"><i class="fa-solid fa-clock-rotate-left"></i>${isAr ? 'سجل النشاط':'Activity Log'}</div>
        ${act.length ? act.map(a => `
          <div style="display:flex;align-items:flex-start;gap:9px;padding:9px 0;border-bottom:1px solid var(--g-border)">
            <i class="fa-solid fa-wand-sparkles" style="color:var(--neon);font-size:.85rem;margin-top:2px;flex-shrink:0"></i>
            <div style="flex:1;min-width:0">
              <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px">
                <span style="font-size:.8rem;font-weight:700;color:var(--bright)">${ILYA.esc(a.service)}</span>
                <span style="font-size:.7rem;color:var(--t4)">${(a.created_at||'').slice(0,16)}</span>
              </div>
              ${a.prompt ? `<div style="font-size:.75rem;color:var(--t3);overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${ILYA.esc(a.prompt)}</div>` : ''}
              ${a.url ? `
                <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">
                  <a href="${ILYA.esc(a.url)}" target="_blank" rel="noopener" style="font-size:.72rem;color:var(--bright)">
                    <i class="fa-solid fa-arrow-up-right-from-square" style="margin-inline-end:3px"></i>${ILYA.t('open_link')}
                  </a>
                  <button class="copy-btn" onclick="ILYA.copyToClipboard('${ILYA.esc(a.url)}',this)">
                    <i class="fa-solid fa-copy"></i>${ILYA.t('copy')}
                  </button>
                </div>
                <img src="${ILYA.esc(a.url)}" style="width:56px;height:56px;border-radius:8px;object-fit:cover;margin-top:5px;cursor:zoom-in;border:1px solid var(--g-border)"
                     onclick="ILYA.openLightbox('${ILYA.esc(a.url)}')"
                     onerror="this.style.display='none'" loading="lazy">` : ''}
            </div>
          </div>`).join('') :
          `<div class="empty-state" style="padding:18px"><div class="empty-icon" style="font-size:1.8rem"><i class="fa-solid fa-inbox"></i></div><div class="empty-txt">${isAr ? 'لا يوجد نشاط':'No activity'}</div></div>`}
      </div>
    `;

    // Back
    container.querySelector('#back-user')?.addEventListener('click', () => this._load('users'));

    // Preview avatar
    container.querySelector('#prev-av-btn')?.addEventListener('click', () => {
      const url = document.getElementById('ae-pic')?.value?.trim();
      if (url) {
        const av = document.getElementById('detail-av');
        if (av) av.src = url;
      }
    });

    // Save all edits
    container.querySelector('#ae-save')?.addEventListener('click', () => {
      const newId   = document.getElementById('ae-id')?.value?.trim();
      const name    = document.getElementById('ae-name')?.value?.trim();
      const uname   = document.getElementById('ae-user')?.value?.trim();
      const rawPw   = document.getElementById('ae-pw')?.value?.trim();
      const pic     = document.getElementById('ae-pic')?.value?.trim();
      const role    = document.getElementById('ae-role')?.value;
      const msgEl   = document.getElementById('ae-msg');

      if (!newId || !name || !uname) { ILYA.toast(t('err_fields'), 'error'); return; }
      if (uname.length < 4) { ILYA.toast(t('err_uname_short'), 'error'); return; }

      // Check username conflict
      const conflict = DB.userByUsername(uname);
      if (conflict && String(conflict.id) !== String(u.id)) { ILYA.toast(t('err_uname_taken'), 'error'); return; }

      // Determine password hash
      let ph = rawPw;
      if (rawPw && rawPw.length !== 32) {
        // Plain text — hash it
        ph = md5(rawPw);
      } else if (!rawPw) {
        ph = u.ph; // unchanged
      }

      const updates = { id: newId, name, username: uname, ph, role };
      if (pic) updates.pic = pic;

      DB.adminEditUser(u.id, updates);

      msgEl.textContent = t('saved'); msgEl.style.color = '#44ff88'; msgEl.style.display = 'block';
      ILYA.toast(t('saved'), 'success');
      setTimeout(() => { msgEl.style.display = 'none'; this._load('users'); }, 1500);
    });

    // Delete user
    container.querySelector('#ae-delete')?.addEventListener('click', () => {
      const confirmed = confirm(isAr ? `حذف المستخدم "${u.name}"؟ هذا لا يمكن التراجع عنه.` : `Delete user "${u.name}"? This cannot be undone.`);
      if (confirmed) {
        DB.deleteUser(u.id);
        ILYA.toast(isAr ? 'تم حذف المستخدم' : 'User deleted', 'success');
        this._load('users');
      }
    });

    // Ban / Unban
    container.querySelector('#do-ban-tmp')?.addEventListener('click', () => {
      if (confirm(isAr ? 'تأكيد الحظر المؤقت؟' : 'Confirm temporary ban?')) {
        DB.banUser(u.id, 'temporary');
        ILYA.toast(isAr ? 'تم الحظر المؤقت' : 'Temp ban applied', 'success');
        this._load('users');
      }
    });
    container.querySelector('#do-ban-prm')?.addEventListener('click', () => {
      if (confirm(isAr ? 'تأكيد الحظر النهائي؟' : 'Confirm permanent ban?')) {
        DB.banUser(u.id, 'permanent');
        ILYA.toast(isAr ? 'تم الحظر النهائي' : 'Permanent ban applied', 'success');
        this._load('users');
      }
    });
    container.querySelector('#do-unban')?.addEventListener('click', () => {
      DB.unbanUser(u.id);
      ILYA.toast(isAr ? 'تم رفع الحظر' : 'Unbanned', 'success');
      this._userDetail(DB.userById(newId || u.id) || u, container);
    });
  },

  /* ── Banned List ─────────────────────────────────────── */
  _banned(el) {
    const banned = DB.users().filter(u => u.banned);
    const isAr   = ILYA.state.lang === 'ar';
    const t      = k => ILYA.t(k);

    if (!banned.length) {
      el.innerHTML = `<div class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-circle-check" style="color:#44ff88"></i></div>
        <div class="empty-txt">${isAr ? 'لا توجد حسابات محظورة' : 'No banned accounts'}</div>
      </div>`;
      return;
    }

    el.innerHTML = banned.map(u => `
      <div class="user-row" style="border-color:rgba(255,60,60,.15)">
        <img src="${u.pic||'https://iili.io/B04MxcX.md.jpg'}" class="user-av" alt="${ILYA.esc(u.name)}"
             onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
        <div class="user-row-info">
          <div class="user-row-name">${ILYA.esc(u.name)}</div>
          <div class="user-row-meta">@${ILYA.esc(u.username)} · ID: ${u.id}</div>
          <div style="font-size:.71rem;color:#ff8888;margin-top:2px">
            <i class="fa-solid fa-ban" style="margin-inline-end:4px"></i>
            ${u.ban_type === 'permanent' ? (isAr ? 'حظر نهائي':'Permanent') : (isAr ? 'حظر مؤقت':'Temporary')}
          </div>
        </div>
        <button class="btn btn-sm btn-success" data-unban="${u.id}">
          <i class="fa-solid fa-lock-open"></i> ${t('unban')}
        </button>
      </div>`).join('');

    el.querySelectorAll('[data-unban]').forEach(btn => {
      btn.addEventListener('click', () => {
        DB.unbanUser(btn.dataset.unban);
        ILYA.toast(isAr ? 'تم رفع الحظر' : 'Unbanned', 'success');
        this._banned(el);
      });
    });
  },

  /* ── Support Inbox ───────────────────────────────────── */
  _support(el) {
    const tickets = DB.tickets(null);
    const isAr    = ILYA.state.lang === 'ar';
    const t       = k => ILYA.t(k);
    const users   = DB.users();

    if (!tickets.length) {
      el.innerHTML = `<div class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-inbox"></i></div>
        <div class="empty-txt">${isAr ? 'لا توجد تذاكر دعم' : 'No support tickets'}</div>
      </div>`;
      return;
    }

    el.innerHTML = tickets.map(tk => {
      const u = users.find(u => String(u.id) === String(tk.uid)) || {};
      return `
        <div class="ticket-card">
          <div class="ticket-hdr">
            <img src="${u.pic||'https://iili.io/B04MxcX.md.jpg'}" class="ticket-av"
                 onerror="this.src='https://iili.io/B04MxcX.md.jpg'" alt="${ILYA.esc(u.name||'')}">
            <div class="ticket-meta" style="flex:1;min-width:0">
              <div class="ticket-meta-name">${ILYA.esc(u.name||'—')}</div>
              <div class="ticket-meta-date">@${ILYA.esc(u.username||'?')} · ${(tk.created_at||'').slice(0,16)}</div>
            </div>
            <span class="ticket-status-badge ${tk.status === 'replied' ? 's-replied':'s-open'}">
              ${tk.status === 'replied' ? (isAr ? 'تم الرد':'Replied') : (isAr ? 'مفتوحة':'Open')}
            </span>
          </div>
          <div class="ticket-msg">${ILYA.esc(tk.message)}</div>
          ${tk.att1 || tk.att2 ? `
            <div class="ticket-attaches">
              ${tk.att1 ? `<img src="${ILYA.esc(tk.att1)}" class="ticket-att" onclick="ILYA.openLightbox('${ILYA.esc(tk.att1)}')" onerror="this.style.display='none'">` : ''}
              ${tk.att2 ? `<img src="${ILYA.esc(tk.att2)}" class="ticket-att" onclick="ILYA.openLightbox('${ILYA.esc(tk.att2)}')" onerror="this.style.display='none'">` : ''}
            </div>` : ''}
          ${tk.reply ? `
            <div class="ticket-reply-box">
              <strong><i class="fa-solid fa-reply" style="margin-inline-end:5px"></i>${t('admin_reply')}</strong>
              ${ILYA.esc(tk.reply)}
            </div>` : ''}
          <div style="display:flex;gap:8px;margin-top:11px">
            <input type="text" class="form-ctrl reply-inp" data-tid="${tk.id}"
              placeholder="${t('write_reply')}"
              style="flex:1;padding:8px 12px;font-size:.81rem">
            <button class="btn btn-sm btn-info reply-btn" data-tid="${tk.id}">
              <i class="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>`;
    }).join('');

    // Reply handlers
    el.querySelectorAll('.reply-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tid   = btn.dataset.tid;
        const input = el.querySelector(`.reply-inp[data-tid="${tid}"]`);
        const reply = input?.value?.trim();
        if (!reply) return;
        DB.replyTicket(tid, reply);
        ILYA.toast(isAr ? 'تم إرسال الرد' : 'Reply sent', 'success');
        this._support(el);
      });
    });
    el.querySelectorAll('.reply-inp').forEach(inp => {
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          el.querySelector(`.reply-btn[data-tid="${inp.dataset.tid}"]`)?.click();
        }
      });
    });
  },

  /* ── System Config ───────────────────────────────────── */
  _config(el) {
    const isAr = ILYA.state.lang === 'ar';
    const t    = k => ILYA.t(k);
    const cfg  = DB.config();

    const textRows = [
      { k:'welcome_ar',   lbl: isAr ? 'نص الترحيب (عربي)'     : 'Welcome Text (AR)' },
      { k:'welcome_en',   lbl: isAr ? 'نص الترحيب (إنجليزي)' : 'Welcome Text (EN)' },
      { k:'about_ar',     lbl: isAr ? 'نص التعريف (عربي)'     : 'About Text (AR)' },
      { k:'about_en',     lbl: isAr ? 'نص التعريف (إنجليزي)' : 'About Text (EN)' },
      { k:'copyright_ar', lbl: isAr ? 'حقوق الملكية (عربي)'  : 'Copyright (AR)' },
      { k:'copyright_en', lbl: isAr ? 'حقوق الملكية (إنجليزي)':'Copyright (EN)' },
      { k:'tg_link',      lbl: isAr ? 'رابط تيليجرام'         : 'Telegram Link' },
      { k:'dev_site',     lbl: isAr ? 'رابط موقع المبرمج'     : "Developer's Website" },
    ];

    const toggleRows = [
      { k:'reg_on',   lbl: isAr ? 'تسجيل المستخدمين الجدد':'User Registration',       d: isAr ? 'السماح بإنشاء حسابات جديدة':'Allow new account creation' },
      { k:'maint',    lbl: isAr ? 'وضع الصيانة':'Maintenance Mode',                   d: isAr ? 'إيقاف وصول المستخدمين مؤقتاً':'Block user access temporarily', invert: true },
      { k:'svc_v1',   lbl: isAr ? 'توليد صورة من نص (V-Gen)':'Text to Image (V-Gen)', d: '' },
      { k:'svc_anime',lbl: isAr ? 'تحويل صورة إلى أنمي':'Image to Anime',             d: isAr ? '14 نمط':'14 styles' },
      { k:'svc_seed', lbl: 'SeedDream 4.5',                                             d: isAr ? '13 نمط':'13 styles' },
      { k:'svc_pfoto',lbl: isAr ? 'الصورة الشخصية الاحترافية':'Personal Photo Maker', d: isAr ? '15 نمط':'15 styles' },
      { k:'svc_flux', lbl: 'Flux MAX',                                                  d: isAr ? '11 نسبة':'11 ratios' },
      { k:'svc_nb2',  lbl: 'Nano Banana 2 (2K)',                                        d: isAr ? 'نص→صورة 2K':'Text→2K Image' },
      { k:'svc_nbp',  lbl: 'NanoBanana Pro',                                           d: isAr ? 'إنشاء وتعديل':'Create & Edit' },
    ];

    el.innerHTML = `
      <!-- Texts -->
      <div class="glass glass-p" style="margin-bottom:14px">
        <div style="font-weight:700;margin-bottom:14px;font-size:.88rem">
          <i class="fa-solid fa-pen-to-square" style="color:var(--neon);margin-inline-end:8px"></i>
          ${isAr ? 'النصوص والروابط' : 'Texts & Links'}
        </div>
        ${textRows.map(r => `
          <div class="form-grp">
            <label class="form-lbl">${r.lbl}</label>
            <input type="text" class="form-ctrl cfg-txt" data-k="${r.k}" value="${ILYA.esc(cfg[r.k]||'')}">
          </div>`).join('')}
        <button class="btn btn-primary btn-full" id="save-cfg-txt">
          <i class="fa-solid fa-floppy-disk"></i> ${t('save')}
        </button>
      </div>

      <!-- Toggles -->
      <div class="glass glass-p" style="margin-bottom:0">
        <div style="font-weight:700;margin-bottom:14px;font-size:.88rem">
          <i class="fa-solid fa-toggle-on" style="color:var(--neon);margin-inline-end:8px"></i>
          ${isAr ? 'تفعيل / تعطيل الخدمات' : 'Enable / Disable Services'}
        </div>
        ${toggleRows.map(r => {
          const isOn = r.invert ? cfg[r.k] !== 'true' : cfg[r.k] !== 'false';
          return `
            <div class="config-row">
              <div>
                <div class="config-lbl">${r.lbl}</div>
                ${r.d ? `<div class="config-desc">${r.d}</div>` : ''}
              </div>
              <label class="toggle">
                <input type="checkbox" class="cfg-toggle" data-k="${r.k}" data-invert="${!!r.invert}" ${isOn ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>`;
        }).join('')}
      </div>
    `;

    el.querySelector('#save-cfg-txt')?.addEventListener('click', () => {
      const updates = {};
      el.querySelectorAll('.cfg-txt').forEach(inp => { updates[inp.dataset.k] = inp.value; });
      DB.setConfig(updates);
      ILYA.state.config = DB.config();
      ILYA.toast(t('saved'), 'success');
    });

    el.querySelectorAll('.cfg-toggle').forEach(toggle => {
      toggle.addEventListener('change', () => {
        const invert = toggle.dataset.invert === 'true';
        const val    = invert
          ? (toggle.checked ? 'false' : 'true')
          : (toggle.checked ? 'true'  : 'false');
        DB.setConfig({ [toggle.dataset.k]: val });
        ILYA.state.config = DB.config();
        ILYA.toast(t('saved'), 'success');
      });
    });
  },

  /* ── Activity Log ────────────────────────────────────── */
  _activity(el) {
    const log  = DB.activityFor(null).slice(0, 150);
    const isAr = ILYA.state.lang === 'ar';

    if (!log.length) { el.innerHTML = this._empty(); return; }

    el.innerHTML = `
      <div style="font-size:.78rem;color:var(--t4);margin-bottom:12px">
        ${isAr ? `إجمالي: ${log.length} نشاط` : `Total: ${log.length} activities`}
        <button class="copy-btn" style="margin-inline-start:8px;font-size:.7rem" id="export-log">
          <i class="fa-solid fa-download"></i> ${isAr ? 'تصدير':'Export'}
        </button>
      </div>
      ${log.map(a => {
        const u = DB.userById(a.uid) || {};
        return `
          <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;
            background:var(--g-surface);border:1px solid var(--g-border);border-radius:var(--r-sm);margin-bottom:7px">
            ${a.url ? `<img src="${ILYA.esc(a.url)}" style="width:42px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0;cursor:zoom-in;border:1px solid var(--g-border)"
                onclick="ILYA.openLightbox('${ILYA.esc(a.url)}')" onerror="this.style.display='none'" loading="lazy">` :
              `<div style="width:42px;height:42px;border-radius:8px;background:var(--g-surface2);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <i class="fa-solid fa-wand-sparkles" style="color:var(--neon);font-size:.85rem"></i></div>`}
            <div style="flex:1;min-width:0">
              <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:3px;margin-bottom:3px">
                <span style="font-size:.8rem;font-weight:700;color:var(--bright)">${ILYA.esc(a.service)}</span>
                <span style="font-size:.7rem;color:var(--t4)">${(a.created_at||'').slice(0,16)}</span>
              </div>
              <div style="font-size:.73rem;color:var(--t3);margin-bottom:3px">
                <i class="fa-solid fa-user" style="margin-inline-end:4px"></i>${ILYA.esc(u.name||'?')} (@${ILYA.esc(u.username||a.uid)})
              </div>
              ${a.prompt ? `<div style="font-size:.74rem;color:var(--t3);overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${ILYA.esc(a.prompt)}</div>` : ''}
              ${a.url ? `
                <a href="${ILYA.esc(a.url)}" target="_blank" rel="noopener" style="font-size:.71rem;color:var(--bright);display:inline-block;margin-top:3px">
                  <i class="fa-solid fa-arrow-up-right-from-square" style="margin-inline-end:3px"></i>${ILYA.t('open_link')}
                </a>` : ''}
            </div>
          </div>`;
      }).join('')}`;

    el.querySelector('#export-log')?.addEventListener('click', () => {
      const data    = JSON.stringify(log, null, 2);
      const blob    = new Blob([data], { type: 'application/json' });
      const url     = URL.createObjectURL(blob);
      const a       = document.createElement('a');
      a.href        = url;
      a.download    = `ilya_activity_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  },

  /* ── Broadcast ───────────────────────────────────────── */
  _broadcast(el) {
    const isAr = ILYA.state.lang === 'ar';
    const t    = k => ILYA.t(k);

    el.innerHTML = `
      <div class="glass glass-p">
        <div style="font-weight:700;margin-bottom:14px;font-size:.9rem">
          <i class="fa-solid fa-bullhorn" style="color:var(--neon);margin-inline-end:8px"></i>
          ${isAr ? 'إرسال رسالة عامة لجميع المستخدمين' : 'Send Broadcast to All Users'}
        </div>
        <div class="note-warn" style="margin-bottom:14px;font-size:.79rem">
          <i class="fa-solid fa-triangle-exclamation" style="margin-inline-end:6px"></i>
          ${isAr ? 'ستظهر هذه الرسالة كإشعار في تذاكر الدعم لكل مستخدم' : 'This message will appear as a support notification for each user'}
        </div>
        <div class="form-grp">
          <label class="form-lbl">${isAr ? 'الرسالة':'Message'}</label>
          <textarea id="bc-msg" class="form-ctrl" rows="4"
            placeholder="${isAr ? 'اكتب رسالتك هنا...':'Write your message here...'}" style="resize:vertical"></textarea>
        </div>
        <div id="bc-st" style="text-align:center;font-size:.82rem;margin-bottom:10px;display:none"></div>
        <button class="btn btn-primary btn-full" id="bc-send">
          <i class="fa-solid fa-bullhorn"></i> ${t('broadcast_send')}
        </button>
      </div>

      <!-- Sent broadcasts history -->
      <div style="margin-top:18px">
        <div class="sec-lbl"><i class="fa-solid fa-history"></i>${isAr ? 'البث السابق':'Past Broadcasts'}</div>
        <div id="bc-history"></div>
      </div>
    `;

    // Load history
    const bcast = DB._g('broadcasts', []);
    const histEl = el.querySelector('#bc-history');
    if (bcast.length) {
      histEl.innerHTML = bcast.slice(0, 10).map(b => `
        <div class="glass glass-p" style="margin-bottom:8px;padding:12px 14px">
          <div style="font-size:.79rem;font-weight:600;margin-bottom:4px">${ILYA.esc(b.msg)}</div>
          <div style="font-size:.71rem;color:var(--t4)">${(b.ts||'').slice(0,16)} · ${isAr ? `أُرسل لـ ${b.count} مستخدم`:`Sent to ${b.count} users`}</div>
        </div>`).join('');
    } else {
      histEl.innerHTML = `<div class="empty-state" style="padding:16px"><div class="empty-txt">${isAr ? 'لا يوجد بث سابق':'No past broadcasts'}</div></div>`;
    }

    el.querySelector('#bc-send')?.addEventListener('click', () => {
      const msg  = document.getElementById('bc-msg')?.value?.trim();
      const st   = document.getElementById('bc-st');
      if (!msg) { ILYA.toast(isAr ? 'الرسالة مطلوبة':'Message required', 'error'); return; }

      const users = DB.users().filter(u => u.role !== 'admin');
      users.forEach(u => {
        DB.addTicket('1', `📢 ${isAr ? 'إعلان من الإدارة':'Admin Broadcast'}: ${msg}`, null, null);
      });

      // Save to history
      const history = DB._g('broadcasts', []);
      history.unshift({ msg, ts: new Date().toISOString(), count: users.length });
      if (history.length > 20) history.splice(20);
      DB._s('broadcasts', history);

      document.getElementById('bc-msg').value = '';
      st.textContent = isAr ? `تم الإرسال لـ ${users.length} مستخدم` : `Sent to ${users.length} users`;
      st.style.color  = '#44ff88'; st.style.display = 'block';
      ILYA.toast(isAr ? 'تم البث بنجاح' : 'Broadcast sent', 'success');
      setTimeout(() => this._broadcast(el), 2000);
    });
  },

  /* ── Helpers ─────────────────────────────────────────── */
  _empty() {
    const isAr = ILYA.state.lang === 'ar';
    return `<div class="empty-state">
      <div class="empty-icon"><i class="fa-solid fa-box-open"></i></div>
      <div class="empty-txt">${isAr ? 'لا توجد بيانات' : 'No data found'}</div>
    </div>`;
  },
};
