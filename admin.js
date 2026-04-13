/* ═══════════════════════════════════════════════════════════
   ILYA AI Platform — Admin Panel (admin.js)
   Admin-only · Stats · Users · Banned · Support · Config · Log
═══════════════════════════════════════════════════════════ */
const ILYAAdmin = {

  _tab: 'stats',

  show() {
    if (ILYA.state.user?.role !== 'admin') return;
    ILYA.registerPageRender('admin', () => this.show());
    this._render();
    ILYA.showPage('admin');
  },

  _render() {
    const t    = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    const tabs = [
      { id:'stats',    icon:'fa-chart-bar',        lbl: t('stats') },
      { id:'users',    icon:'fa-users',             lbl: t('users_mgmt') },
      { id:'banned',   icon:'fa-ban',               lbl: t('banned') },
      { id:'support',  icon:'fa-headset',           lbl: t('support_inbox') },
      { id:'config',   icon:'fa-sliders',           lbl: t('sys_config') },
      { id:'activity', icon:'fa-clock-rotate-left', lbl: t('act_log') },
    ];

    document.getElementById('page-admin').innerHTML = `
      <div class="page-wrap">
        <div class="page-hdr">
          <button class="back-btn" id="back-admin">
            <i class="fa-solid fa-arrow-right"></i><i class="fa-solid fa-arrow-left"></i>
          </button>
          <div class="page-title">
            <i class="fa-solid fa-shield-halved" style="margin-inline-end:8px;color:var(--c-neon)"></i>${t('admin')}
          </div>
        </div>

        <div class="admin-tabs" id="admin-tabs">
          ${tabs.map(tab => `
            <button class="admin-tab${tab.id === this._tab ? ' active' : ''}" data-tab="${tab.id}">
              <i class="fa-solid ${tab.icon}" style="margin-inline-end:6px"></i>${tab.lbl}
            </button>`).join('')}
        </div>

        <div id="admin-content"><div class="spinner"></div></div>
      </div>
    `;

    document.getElementById('back-admin')?.addEventListener('click', () => ILYADashboard.show());

    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._tab = btn.dataset.tab;
        document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._loadTab(this._tab);
      });
    });

    this._loadTab(this._tab);
  },

  _loadTab(tab) {
    const c = document.getElementById('admin-content');
    c.innerHTML = '<div class="spinner"></div>';
    switch(tab) {
      case 'stats':    this._stats(c);    break;
      case 'users':    this._users(c);    break;
      case 'banned':   this._banned(c);   break;
      case 'support':  this._support(c);  break;
      case 'config':   this._config(c);   break;
      case 'activity': this._activity(c); break;
    }
  },

  // ── Stats ─────────────────────────────────────────────
  _stats(el) {
    const t    = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    const s    = DB.stats();

    el.innerHTML = `
      <div class="stat-grid">
        ${[
          ['fa-users',       t('total_users'), s.users],
          ['fa-eye',         t('total_vis'),   s.visitors],
          ['fa-wand-sparkles',t('total_srv'),  s.total_services],
          ['fa-ticket',      t('total_tkt'),   s.tickets],
          ['fa-ban',         isAr ? 'محظورون' : 'Banned', s.banned],
          ['fa-database',    isAr ? 'المستخدمون النشطون' : 'Active Users', s.users - s.banned],
        ].map(([icon, lbl, num]) => `
          <div class="stat-card">
            <i class="fa-solid ${icon}" style="font-size:1.2rem;color:var(--c-neon);margin-bottom:8px"></i>
            <div class="stat-num">${num}</div>
            <div class="stat-lbl">${lbl}</div>
          </div>`).join('')}
      </div>

      ${s.services_breakdown.length ? `
        <div class="glass glass-p">
          <div style="font-weight:700;margin-bottom:14px;font-size:.88rem">
            <i class="fa-solid fa-chart-bar" style="color:var(--c-neon);margin-inline-end:8px"></i>
            ${isAr ? 'استخدام الخدمات' : 'Service Usage'}
          </div>
          ${s.services_breakdown.sort((a,b) => b.count - a.count).map(row => {
            const max = s.services_breakdown[0]?.count || 1;
            const pct = Math.round((row.count / max) * 100);
            return `
              <div style="margin-bottom:12px">
                <div style="display:flex;justify-content:space-between;margin-bottom:5px">
                  <span style="font-size:.82rem;color:var(--c-t2)">${ILYA.esc(row.service)}</span>
                  <span style="font-family:'Orbitron',monospace;font-size:.8rem;color:var(--c-neon)">${row.count}</span>
                </div>
                <div style="height:5px;border-radius:5px;background:rgba(255,255,255,.06)">
                  <div style="height:100%;border-radius:5px;width:${pct}%;
                    background:linear-gradient(90deg,var(--c-red),var(--c-neon));
                    box-shadow:0 0 8px rgba(255,0,64,.3)"></div>
                </div>
              </div>`;
          }).join('')}
        </div>` : ''}
    `;
  },

  // ── Users ─────────────────────────────────────────────
  _users(el) {
    const users = DB.users().filter(u => !u.banned);
    const isAr  = ILYA.state.lang === 'ar';
    if (!users.length) { el.innerHTML = this._empty(); return; }

    el.innerHTML = users.map(u => `
      <div class="user-row" data-uid="${u.id}">
        <img src="${u.pic || 'https://iili.io/B04MxcX.md.jpg'}" class="user-row-avatar"
             onerror="this.src='https://iili.io/B04MxcX.md.jpg'" alt="${ILYA.esc(u.name)}">
        <div class="user-row-info">
          <div class="user-row-name">${ILYA.esc(u.name)}</div>
          <div class="user-row-meta">@${ILYA.esc(u.username)} · ID: ${u.id}</div>
          <div class="user-row-meta">${u.created_at || ''}</div>
        </div>
        <span class="role-badge ${u.role === 'admin' ? 'badge-admin' : u.role === 'vip' ? 'badge-vip' : 'badge-user'}">
          ${u.role}
        </span>
        <i class="fa-solid fa-chevron-${document.documentElement.dir === 'rtl' ? 'left' : 'right'}" style="color:var(--c-t4);font-size:.85rem"></i>
      </div>`).join('');

    el.querySelectorAll('[data-uid]').forEach(row => {
      row.addEventListener('click', () => this._userDetail(row.dataset.uid, el));
    });
  },

  _userDetail(uid, container) {
    const isAr    = ILYA.state.lang === 'ar';
    const u       = DB.userById(uid);
    if (!u) return;
    const activity = DB.activity(uid).slice(0, 30);

    container.innerHTML = `
      <button class="btn btn-sm btn-info" id="back-user-list" style="margin-bottom:16px">
        <i class="fa-solid fa-arrow-${document.documentElement.dir === 'rtl' ? 'right' : 'left'}"></i>
        ${isAr ? 'رجوع للقائمة' : 'Back to list'}
      </button>

      <div class="glass glass-p" style="margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px">
          <img src="${u.pic || 'https://iili.io/B04MxcX.md.jpg'}"
               style="width:68px;height:68px;border-radius:50%;object-fit:cover;border:2px solid var(--c-red3)"
               onerror="this.src='https://iili.io/B04MxcX.md.jpg'" alt="${ILYA.esc(u.name)}">
          <div>
            <div style="font-size:1rem;font-weight:700">${ILYA.esc(u.name)}</div>
            <div style="font-size:.8rem;color:var(--c-t3)">@${ILYA.esc(u.username)}</div>
            <span class="role-badge ${u.role === 'admin' ? 'badge-admin' : u.role === 'vip' ? 'badge-vip' : 'badge-user'}" style="margin-top:5px;display:inline-block">${u.role}</span>
          </div>
        </div>

        ${[
          ['fa-id-card',  'ID',                           u.id],
          ['fa-calendar', isAr ? 'تاريخ التسجيل' : 'Joined', u.created_at || '—'],
          ['fa-ban',      isAr ? 'الحالة' : 'Status',
            u.banned ? `<span style="color:#ff8888">${isAr ? 'محظور' : 'Banned'} (${u.ban_type})</span>` : `<span style="color:#88ff88">${isAr ? 'نشط' : 'Active'}</span>`],
        ].map(([icon, lbl, val]) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--c-border)">
            <span style="display:flex;align-items:center;gap:7px;font-size:.82rem;color:var(--c-t3)">
              <i class="fa-solid ${icon}" style="color:var(--c-neon);width:16px;text-align:center"></i>${lbl}
            </span>
            <span style="font-size:.83rem">${val}</span>
          </div>`).join('')}
      </div>

      <!-- Actions -->
      ${String(u.id) !== '1' ? `
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
          ${u.banned ? `
            <button class="btn btn-sm btn-success" id="do-unban">
              <i class="fa-solid fa-lock-open"></i> ${ILYA.t('unban')}
            </button>` : `
            <button class="btn btn-sm btn-danger" id="do-ban-tmp">
              <i class="fa-solid fa-clock"></i> ${ILYA.t('ban_tmp')}
            </button>
            <button class="btn btn-sm btn-danger" id="do-ban-prm" style="background:linear-gradient(135deg,#6a0000,#cc0000)">
              <i class="fa-solid fa-ban"></i> ${ILYA.t('ban_prm')}
            </button>`}
        </div>` : `
        <div class="note-box note-warn" style="margin-bottom:14px;font-size:.8rem">
          <i class="fa-solid fa-shield-halved" style="margin-inline-end:6px"></i>
          ${isAr ? 'لا يمكن حظر حساب المبرمج' : 'Cannot ban the admin account'}
        </div>`}

      <!-- Activity -->
      <div class="section-lbl">
        <i class="fa-solid fa-clock-rotate-left"></i>
        ${isAr ? 'سجل النشاط' : 'Activity Log'}
      </div>
      ${activity.length ? activity.map(a => `
        <div class="act-item">
          <i class="fa-solid fa-wand-sparkles" style="color:var(--c-neon);font-size:.9rem;margin-top:2px;flex-shrink:0"></i>
          <div style="flex:1;min-width:0">
            <div style="display:flex;justify-content:space-between">
              <span class="act-service">${ILYA.esc(a.service)}</span>
              <span class="act-meta">${(a.created_at||'').slice(0,16)}</span>
            </div>
            ${a.details ? `<div class="act-details">${ILYA.esc(a.details)}</div>` : ''}
            ${a.result_url ? `
              <a href="${ILYA.esc(a.result_url)}" target="_blank" style="font-size:.73rem;color:var(--c-bright)">
                <i class="fa-solid fa-arrow-up-right-from-square" style="margin-inline-end:3px"></i>${ILYA.t('open_link')}
              </a>` : ''}
          </div>
        </div>`).join('')
      : `<div class="empty-state" style="padding:20px">
          <div class="empty-icon"><i class="fa-solid fa-inbox"></i></div>
          <div class="empty-txt">${isAr ? 'لا يوجد نشاط' : 'No activity'}</div>
        </div>`}
    `;

    container.querySelector('#back-user-list')?.addEventListener('click', () => this._users(container));
    container.querySelector('#do-ban-tmp')?.addEventListener('click', () => {
      if (confirm(isAr ? 'تأكيد حظر مؤقت؟' : 'Confirm temporary ban?')) {
        DB.banUser(uid, 'temporary');
        ILYA.toast(isAr ? 'تم الحظر المؤقت' : 'Temporary ban applied', 'success');
        this._users(container);
      }
    });
    container.querySelector('#do-ban-prm')?.addEventListener('click', () => {
      if (confirm(isAr ? 'تأكيد حظر نهائي؟' : 'Confirm permanent ban?')) {
        DB.banUser(uid, 'permanent');
        ILYA.toast(isAr ? 'تم الحظر النهائي' : 'Permanent ban applied', 'success');
        this._users(container);
      }
    });
    container.querySelector('#do-unban')?.addEventListener('click', () => {
      DB.unbanUser(uid);
      ILYA.toast(isAr ? 'تم رفع الحظر' : 'Unbanned', 'success');
      this._userDetail(uid, container);
    });
  },

  // ── Banned ────────────────────────────────────────────
  _banned(el) {
    const banned = DB.users().filter(u => u.banned);
    const isAr   = ILYA.state.lang === 'ar';

    if (!banned.length) {
      el.innerHTML = `<div class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-circle-check" style="color:#44ff88"></i></div>
        <div class="empty-txt">${isAr ? 'لا يوجد حسابات محظورة' : 'No banned accounts'}</div>
      </div>`;
      return;
    }

    el.innerHTML = banned.map(u => `
      <div class="user-row">
        <img src="${u.pic || 'https://iili.io/B04MxcX.md.jpg'}" class="user-row-avatar"
             onerror="this.src='https://iili.io/B04MxcX.md.jpg'" alt="${ILYA.esc(u.name)}">
        <div class="user-row-info">
          <div class="user-row-name">${ILYA.esc(u.name)}</div>
          <div class="user-row-meta">@${ILYA.esc(u.username)}</div>
          <span style="font-size:.72rem;color:#ff9988">
            <i class="fa-solid fa-ban" style="margin-inline-end:4px"></i>
            ${u.ban_type === 'permanent' ? (isAr ? 'حظر نهائي' : 'Permanent') : (isAr ? 'حظر مؤقت' : 'Temporary')}
          </span>
        </div>
        <button class="btn btn-sm btn-success" data-unban-uid="${u.id}">
          <i class="fa-solid fa-lock-open"></i> ${ILYA.t('unban')}
        </button>
      </div>`).join('');

    el.querySelectorAll('[data-unban-uid]').forEach(btn => {
      btn.addEventListener('click', () => {
        DB.unbanUser(btn.dataset.unbanUid);
        ILYA.toast(isAr ? 'تم رفع الحظر' : 'Unbanned', 'success');
        this._banned(el);
      });
    });
  },

  // ── Support Inbox ─────────────────────────────────────
  _support(el) {
    const tickets = DB.tickets(null);
    const isAr    = ILYA.state.lang === 'ar';
    const users   = DB.users();

    if (!tickets.length) {
      el.innerHTML = `<div class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-inbox"></i></div>
        <div class="empty-txt">${isAr ? 'لا توجد تذاكر' : 'No tickets'}</div>
      </div>`;
      return;
    }

    el.innerHTML = tickets.map(tk => {
      const u = users.find(u => String(u.id) === String(tk.user_id)) || {};
      return `
        <div class="ticket-card">
          <div class="ticket-hdr">
            <img src="${u.pic || 'https://iili.io/B04MxcX.md.jpg'}"
                 class="ticket-avatar" alt="${ILYA.esc(u.name||'')}"
                 onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
            <div style="flex:1;min-width:0">
              <div style="font-size:.85rem;font-weight:600">${ILYA.esc(u.name||'—')}</div>
              <div style="font-size:.74rem;color:var(--c-t3)">@${ILYA.esc(u.username||'?')} · ${(tk.created_at||'').slice(0,16)}</div>
            </div>
            <span class="ticket-status status-${tk.status}">
              ${tk.status === 'open' ? (isAr ? 'مفتوحة' : 'Open') : (isAr ? 'تم الرد' : 'Replied')}
            </span>
          </div>
          <div class="ticket-msg">${ILYA.esc(tk.message)}</div>
          ${tk.attachment1 || tk.attachment2 ? `
            <div class="ticket-attaches">
              ${tk.attachment1 ? `<img src="${tk.attachment1}" class="ticket-attach-img" onclick="ILYA.openLightbox('${tk.attachment1}')" onerror="this.style.display='none'">` : ''}
              ${tk.attachment2 ? `<img src="${tk.attachment2}" class="ticket-attach-img" onclick="ILYA.openLightbox('${tk.attachment2}')" onerror="this.style.display='none'">` : ''}
            </div>` : ''}
          ${tk.admin_reply ? `
            <div class="ticket-reply">
              <strong><i class="fa-solid fa-reply" style="margin-inline-end:5px"></i>${ILYA.t('admin_reply')}</strong>
              ${ILYA.esc(tk.admin_reply)}
            </div>` : ''}
          <!-- Reply -->
          <div style="display:flex;gap:8px;margin-top:12px">
            <input type="text" class="form-ctrl reply-input" data-tid="${tk.id}"
              placeholder="${ILYA.t('write_reply')}"
              style="flex:1;padding:9px 12px;font-size:.82rem">
            <button class="btn btn-sm btn-info reply-send" data-tid="${tk.id}">
              <i class="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>`;
    }).join('');

    el.querySelectorAll('.reply-send').forEach(btn => {
      btn.addEventListener('click', () => {
        const tid   = btn.dataset.tid;
        const input = el.querySelector(`.reply-input[data-tid="${tid}"]`);
        const reply = input?.value?.trim();
        if (!reply) return;
        DB.replyTicket(tid, reply);
        ILYA.toast(isAr ? 'تم إرسال الرد' : 'Reply sent', 'success');
        this._support(el);
      });
    });

    el.querySelectorAll('.reply-input').forEach(inp => {
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          const btn = el.querySelector(`.reply-send[data-tid="${inp.dataset.tid}"]`);
          btn?.click();
        }
      });
    });
  },

  // ── System Config ─────────────────────────────────────
  _config(el) {
    const isAr = ILYA.state.lang === 'ar';
    const cfg  = DB.config();

    const textFields = isAr ? [
      { k:'welcome_ar',    l:'نص الترحيب (عربي)' },
      { k:'welcome_en',    l:'نص الترحيب (إنجليزي)' },
      { k:'about_ar',      l:'نص التعريف (عربي)' },
      { k:'about_en',      l:'نص التعريف (إنجليزي)' },
      { k:'copyright_ar',  l:'حقوق الملكية (عربي)' },
      { k:'copyright_en',  l:'حقوق الملكية (إنجليزي)' },
      { k:'tg_link',       l:'رابط تيليجرام' },
      { k:'dev_site',      l:'رابط موقع المبرمج' },
    ] : [
      { k:'welcome_ar',    l:'Welcome Text (AR)' },
      { k:'welcome_en',    l:'Welcome Text (EN)' },
      { k:'about_ar',      l:'About Text (AR)' },
      { k:'about_en',      l:'About Text (EN)' },
      { k:'copyright_ar',  l:'Copyright (AR)' },
      { k:'copyright_en',  l:'Copyright (EN)' },
      { k:'tg_link',       l:'Telegram Link' },
      { k:'dev_site',      l:"Developer's Website" },
    ];

    const toggleFields = isAr ? [
      { k:'reg_enabled',          l:'تسجيل المستخدمين الجدد',  d:'تفعيل / إيقاف إنشاء الحسابات' },
      { k:'maintenance',          l:'وضع الصيانة',             d:'إيقاف وصول المستخدمين مؤقتاً' },
      { k:'svc_text_to_image',    l:'توليد صورة من نص',        d:'نموذج V-Gen' },
      { k:'svc_image_to_anime',   l:'تحويل صورة إلى أنمي',    d:'14 نمط أنمي' },
      { k:'svc_seedream',         l:'SeedDream 4.5',           d:'13 نمط فني' },
      { k:'svc_image_to_personal',l:'الصورة الشخصية الاحترافية',d:'15 نمط احترافي' },
      { k:'svc_flux_max',         l:'Flux MAX',                d:'أقوى نماذج التوليد' },
      { k:'svc_nano_banana_2',    l:'Nano Banana 2 (2K)',      d:'توليد نصي بدقة 2K' },
      { k:'svc_nano_banana_pro',  l:'NanoBanana Pro',          d:'إنشاء وتعديل الصور' },
    ] : [
      { k:'reg_enabled',          l:'User Registration',       d:'Enable/disable new accounts' },
      { k:'maintenance',          l:'Maintenance Mode',        d:'Block user access temporarily' },
      { k:'svc_text_to_image',    l:'Text to Image',           d:'V-Gen model' },
      { k:'svc_image_to_anime',   l:'Image to Anime',          d:'14 anime styles' },
      { k:'svc_seedream',         l:'SeedDream 4.5',           d:'13 artistic styles' },
      { k:'svc_image_to_personal',l:'Personal Photo Maker',    d:'15 professional styles' },
      { k:'svc_flux_max',         l:'Flux MAX',                d:'Most powerful generation model' },
      { k:'svc_nano_banana_2',    l:'Nano Banana 2 (2K)',      d:'2K text-to-image' },
      { k:'svc_nano_banana_pro',  l:'NanoBanana Pro',          d:'Create & edit images' },
    ];

    el.innerHTML = `
      <!-- Text Config -->
      <div class="glass glass-p" style="margin-bottom:14px">
        <div style="font-weight:700;margin-bottom:14px;font-size:.88rem">
          <i class="fa-solid fa-pen-to-square" style="color:var(--c-neon);margin-inline-end:7px"></i>
          ${isAr ? 'النصوص والروابط' : 'Texts & Links'}
        </div>
        ${textFields.map(f => `
          <div class="form-grp">
            <label class="form-lbl">${f.l}</label>
            <input type="text" class="form-ctrl cfg-txt" data-k="${f.k}"
              value="${ILYA.esc(cfg[f.k] || '')}">
          </div>`).join('')}
        <button class="btn btn-primary" id="save-cfg-texts">
          <i class="fa-solid fa-floppy-disk"></i> ${ILYA.t('save')}
        </button>
      </div>

      <!-- Toggle Config -->
      <div class="glass glass-p">
        <div style="font-weight:700;margin-bottom:14px;font-size:.88rem">
          <i class="fa-solid fa-toggle-on" style="color:var(--c-neon);margin-inline-end:7px"></i>
          ${isAr ? 'تفعيل / تعطيل الخدمات' : 'Enable / Disable Services'}
        </div>
        ${toggleFields.map(f => `
          <div class="config-row">
            <div>
              <div class="config-lbl">${f.l}</div>
              <div class="config-desc">${f.d}</div>
            </div>
            <label class="toggle">
              <input type="checkbox" class="cfg-toggle" data-k="${f.k}"
                ${cfg[f.k] !== 'false' ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>`).join('')}
      </div>
    `;

    el.querySelector('#save-cfg-texts')?.addEventListener('click', () => {
      const updates = {};
      el.querySelectorAll('.cfg-txt').forEach(inp => updates[inp.dataset.k] = inp.value);
      DB.setConfig(updates);
      ILYA.state.config = DB.config();
      ILYA.toast(ILYA.t('saved'), 'success');
    });

    el.querySelectorAll('.cfg-toggle').forEach(toggle => {
      toggle.addEventListener('change', () => {
        const updates = { [toggle.dataset.k]: toggle.checked ? 'true' : 'false' };
        DB.setConfig(updates);
        ILYA.state.config = DB.config();
        ILYA.toast(ILYA.t('saved'), 'success');
      });
    });
  },

  // ── Activity Log ──────────────────────────────────────
  _activity(el) {
    const log  = DB.activity(null).slice(0, 120);
    const isAr = ILYA.state.lang === 'ar';

    if (!log.length) { el.innerHTML = this._empty(); return; }

    el.innerHTML = log.map(a => `
      <div class="act-item">
        <i class="fa-solid fa-wand-sparkles" style="color:var(--c-neon);font-size:.9rem;margin-top:2px;flex-shrink:0"></i>
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px">
            <span class="act-service">${ILYA.esc(a.service)}</span>
            <span class="act-meta">${(a.created_at||'').slice(0,16)}</span>
          </div>
          <div class="act-meta" style="margin:2px 0">
            <i class="fa-solid fa-user" style="margin-inline-end:4px"></i>
            ${ILYA.esc(a.uname_full)} (@${ILYA.esc(a.uname)})
          </div>
          ${a.details ? `<div class="act-details">${ILYA.esc(a.details)}</div>` : ''}
          ${a.result_url ? `
            <a href="${ILYA.esc(a.result_url)}" target="_blank" style="font-size:.73rem;color:var(--c-bright);display:inline-block;margin-top:3px">
              <i class="fa-solid fa-arrow-up-right-from-square" style="margin-inline-end:3px"></i>${ILYA.t('open_link')}
            </a>` : ''}
        </div>
      </div>`).join('');
  },

  // ── Helpers ───────────────────────────────────────────
  _empty() {
    const isAr = ILYA.state.lang === 'ar';
    return `<div class="empty-state">
      <div class="empty-icon"><i class="fa-solid fa-box-open"></i></div>
      <div class="empty-txt">${isAr ? 'لا توجد بيانات' : 'No data found'}</div>
    </div>`;
  },
};
