// ============================================================
//   ILYA AI Platform — Admin Panel Module (admin.js)
//   Only accessible to role = 'admin'
// ============================================================

const ILYAAdmin = {

  _activeTab: 'stats',

  show() {
    if (ILYA.state.user?.role !== 'admin') return;
    this._activeTab = 'stats';
    this._render();
    ILYA.showPage('admin');
  },

  _render() {
    const t    = (k) => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    const tabs = [
      { id: 'stats',   icon: '📊', label: t('stats') },
      { id: 'users',   icon: '👥', label: t('users_mgmt') },
      { id: 'banned',  icon: '🚫', label: t('banned_list') },
      { id: 'support', icon: '📩', label: t('support_inbox') },
      { id: 'config',  icon: '⚙️', label: t('system_config') },
      { id: 'activity',icon: '📋', label: t('activity_log') },
    ];

    const page = document.getElementById('page-admin');
    page.innerHTML = `
      <div class="page-inner">
        <div class="page-header">
          <button class="page-header-back" id="back-from-admin">←</button>
          <div class="page-title">⚙️ ${t('admin_panel')}</div>
        </div>

        <!-- Tabs -->
        <div class="admin-tabs" id="admin-tabs">
          ${tabs.map(tab => `
            <button class="admin-tab${tab.id === this._activeTab ? ' active' : ''}"
                    data-tab="${tab.id}">
              ${tab.icon} ${tab.label}
            </button>
          `).join('')}
        </div>

        <!-- Content -->
        <div id="admin-content">
          <div class="spinner"></div>
        </div>
      </div>
    `;

    document.getElementById('back-from-admin').addEventListener('click', () => ILYADashboard.show());

    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._activeTab = btn.dataset.tab;
        document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._loadTab(this._activeTab);
      });
    });

    this._loadTab(this._activeTab);
  },

  async _loadTab(tab) {
    const content = document.getElementById('admin-content');
    content.innerHTML = '<div class="spinner"></div>';

    switch (tab) {
      case 'stats':    await this._renderStats(content);    break;
      case 'users':    await this._renderUsers(content);    break;
      case 'banned':   await this._renderBanned(content);   break;
      case 'support':  await this._renderSupport(content);  break;
      case 'config':   await this._renderConfig(content);   break;
      case 'activity': await this._renderActivity(content); break;
    }
  },

  // ── Stats ─────────────────────────────────────────────────
  async _renderStats(el) {
    const isAr = ILYA.state.lang === 'ar';
    const res  = await ILYA.api('/admin/stats');
    if (!res.ok) { el.innerHTML = this._err(); return; }
    const s = res.data;

    el.innerHTML = `
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-num">${s.users ?? 0}</div>
          <div class="stat-label">${ILYA.t('total_users')}</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${s.visitors ?? 0}</div>
          <div class="stat-label">${ILYA.t('total_visitors')}</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${s.total_services ?? 0}</div>
          <div class="stat-label">${ILYA.t('total_services')}</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${s.tickets ?? 0}</div>
          <div class="stat-label">${ILYA.t('total_tickets')}</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${s.banned ?? 0}</div>
          <div class="stat-label">${isAr ? 'المحظورون' : 'Banned'}</div>
        </div>
      </div>

      ${s.services_breakdown?.length ? `
        <div class="glass-card" style="margin-top:0">
          <div style="font-weight:700;margin-bottom:16px;font-size:.9rem">
            ${isAr ? '📈 استخدام الخدمات' : '📈 Service Usage'}
          </div>
          ${s.services_breakdown.map(row => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--glass-border)">
              <span style="font-size:.85rem;color:var(--text-2)">${row.service}</span>
              <span style="font-family:'Orbitron',monospace;font-size:.9rem;color:var(--red-neon)">${row.count}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  },

  // ── Users ─────────────────────────────────────────────────
  async _renderUsers(el) {
    const isAr = ILYA.state.lang === 'ar';
    const res  = await ILYA.api('/admin/users');
    if (!res.ok) { el.innerHTML = this._err(); return; }

    const users = res.data.filter(u => !u.is_banned);
    if (!users.length) { el.innerHTML = this._empty(); return; }

    el.innerHTML = users.map(u => `
      <div class="user-list-item" data-uid="${u.id}">
        <img src="${u.profile_pic || 'https://iili.io/B04MxcX.md.jpg'}"
             alt="${u.name}" class="user-list-avatar"
             onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
        <div class="user-list-info">
          <div class="user-list-name">${this._esc(u.name)}</div>
          <div class="user-list-meta">@${this._esc(u.username)} · ID: ${u.id}</div>
          <div class="user-list-meta">${u.created_at?.slice(0,10) || ''}</div>
        </div>
        <span class="user-list-badge ${u.role === 'admin' ? 'badge-admin' : u.role === 'vip' ? 'badge-vip' : 'badge-user'}">
          ${u.role}
        </span>
      </div>
    `).join('');

    el.querySelectorAll('[data-uid]').forEach(item => {
      item.addEventListener('click', () => this._showUserDetail(item.dataset.uid));
    });
  },

  async _showUserDetail(uid) {
    const isAr   = ILYA.state.lang === 'ar';
    const content = document.getElementById('admin-content');
    content.innerHTML = '<div class="spinner"></div>';

    const res = await ILYA.api(`/admin/user/${uid}`);
    if (!res.ok) { content.innerHTML = this._err(); return; }

    const { user: u, activity } = res.data;

    content.innerHTML = `
      <button id="back-user-list" class="btn-sm btn-info" style="margin-bottom:16px">
        ← ${isAr ? 'رجوع للقائمة' : 'Back to list'}
      </button>

      <div class="glass-card" style="margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
          <img src="${u.profile_pic || 'https://iili.io/B04MxcX.md.jpg'}"
               style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:2px solid var(--red-mid)"
               onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
          <div>
            <div style="font-size:1.1rem;font-weight:700">${this._esc(u.name)}</div>
            <div style="color:var(--text-3);font-size:.85rem">@${this._esc(u.username)}</div>
          </div>
        </div>
        ${[
          ['🔑 ID', u.id],
          [isAr ? '👤 الدور' : '👤 Role', u.role],
          [isAr ? '📅 التسجيل' : '📅 Registered', u.created_at?.slice(0,10) || ''],
          [isAr ? '🚫 محظور' : '🚫 Banned', u.is_banned ? (isAr ? 'نعم' : 'Yes') : (isAr ? 'لا' : 'No')],
        ].map(([l, v]) => `
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--glass-border)">
            <span style="color:var(--text-3);font-size:.85rem">${l}</span>
            <span style="font-size:.85rem">${v}</span>
          </div>
        `).join('')}
      </div>

      <!-- Actions -->
      ${u.id !== 1 ? `
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px">
          ${u.is_banned ? `
            <button class="btn-sm btn-success" id="admin-unban-btn">✓ ${ILYA.t('unban')}</button>
          ` : `
            <button class="btn-sm btn-danger" id="admin-ban-temp-btn">⏸ ${ILYA.t('ban_temp')}</button>
            <button class="btn-sm btn-danger" id="admin-ban-perm-btn" style="background:linear-gradient(135deg,#6a0000,#cc0000)">🚫 ${ILYA.t('ban_perm')}</button>
          `}
        </div>
      ` : `
        <div style="padding:10px;background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.2);border-radius:var(--radius-sm);margin-bottom:16px;font-size:.82rem;color:rgba(255,215,0,.8)">
          🛡️ ${isAr ? 'لا يمكن حظر حساب المبرمج' : 'Cannot ban the admin account'}
        </div>
      `}

      <!-- Activity -->
      <div style="font-size:.8rem;color:var(--text-3);margin-bottom:12px;letter-spacing:.05em">
        ${isAr ? '— سجل نشاط المستخدم —' : '— User Activity Log —'}
      </div>
      ${activity.length ? activity.slice(0, 20).map(a => `
        <div style="padding:10px 12px;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--radius-sm);margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:.82rem;color:var(--red-bright)">${a.service}</span>
            <span style="font-size:.75rem;color:var(--text-3)">${a.created_at?.slice(0,16) || ''}</span>
          </div>
          ${a.details ? `<div style="font-size:.78rem;color:var(--text-2);overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${this._esc(a.details)}</div>` : ''}
          ${a.result_url ? `<a href="${a.result_url}" target="_blank" style="font-size:.75rem;color:var(--red-bright)">🔗 ${ILYA.t('open_link')}</a>` : ''}
        </div>
      `).join('') : `<div class="empty-state" style="padding:20px"><div class="empty-icon">📋</div><div class="empty-text">${isAr ? 'لا يوجد نشاط' : 'No activity'}</div></div>`}
    `;

    document.getElementById('back-user-list')?.addEventListener('click', () => this._loadTab('users'));
    document.getElementById('admin-ban-temp-btn')?.addEventListener('click', () => this._ban(uid, 'temporary'));
    document.getElementById('admin-ban-perm-btn')?.addEventListener('click', () => this._ban(uid, 'permanent'));
    document.getElementById('admin-unban-btn')?.addEventListener('click',    () => this._unban(uid));
  },

  async _ban(uid, type) {
    const isAr = ILYA.state.lang === 'ar';
    const res  = await ILYA.api(`/admin/user/${uid}/ban`, 'POST', { ban_type: type });
    if (res.ok) {
      ILYA.toast(isAr ? 'تم تطبيق الحظر' : 'Ban applied', 'success');
      this._loadTab('users');
    } else {
      ILYA.toast(res.data.error || (isAr ? 'فشل الحظر' : 'Ban failed'), 'error');
    }
  },

  async _unban(uid) {
    const isAr = ILYA.state.lang === 'ar';
    const res  = await ILYA.api(`/admin/user/${uid}/unban`, 'POST');
    if (res.ok) {
      ILYA.toast(isAr ? 'تم رفع الحظر' : 'Unbanned', 'success');
      this._loadTab('users');
    } else {
      ILYA.toast(isAr ? 'فشل رفع الحظر' : 'Unban failed', 'error');
    }
  },

  // ── Banned ────────────────────────────────────────────────
  async _renderBanned(el) {
    const isAr = ILYA.state.lang === 'ar';
    const res  = await ILYA.api('/admin/users');
    if (!res.ok) { el.innerHTML = this._err(); return; }

    const banned = res.data.filter(u => u.is_banned);
    if (!banned.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">✅</div><div class="empty-text">${isAr ? 'لا يوجد حسابات محظورة' : 'No banned accounts'}</div></div>`;
      return;
    }

    el.innerHTML = banned.map(u => `
      <div class="user-list-item">
        <img src="${u.profile_pic || 'https://iili.io/B04MxcX.md.jpg'}"
             alt="${u.name}" class="user-list-avatar"
             onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
        <div class="user-list-info">
          <div class="user-list-name">${this._esc(u.name)}</div>
          <div class="user-list-meta">@${this._esc(u.username)}</div>
          <span class="banned-badge">${u.ban_type === 'permanent' ? (isAr ? 'حظر نهائي' : 'Permanent') : (isAr ? 'حظر مؤقت' : 'Temporary')}</span>
        </div>
        <button class="btn-sm btn-success" data-unban="${u.id}">${ILYA.t('unban')}</button>
      </div>
    `).join('');

    el.querySelectorAll('[data-unban]').forEach(btn => {
      btn.addEventListener('click', () => this._unban(btn.dataset.unban));
    });
  },

  // ── Support Inbox ─────────────────────────────────────────
  async _renderSupport(el) {
    const isAr = ILYA.state.lang === 'ar';
    const res  = await ILYA.api('/admin/tickets');
    if (!res.ok) { el.innerHTML = this._err(); return; }

    if (!res.data.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">📩</div><div class="empty-text">${isAr ? 'لا توجد تذاكر دعم' : 'No support tickets'}</div></div>`;
      return;
    }

    el.innerHTML = res.data.map(ticket => `
      <div class="ticket-card" id="ticket-${ticket.id}">
        <div class="ticket-header">
          <img src="${ticket.profile_pic || 'https://iili.io/B04MxcX.md.jpg'}"
               class="ticket-avatar" alt="${ticket.name}"
               onerror="this.src='https://iili.io/B04MxcX.md.jpg'">
          <div>
            <div style="font-size:.85rem;font-weight:600">${this._esc(ticket.name)}</div>
            <div style="font-size:.75rem;color:var(--text-3)">@${this._esc(ticket.username)} · ${ticket.created_at?.slice(0,16) || ''}</div>
          </div>
          <span class="ticket-status status-${ticket.status}">
            ${ticket.status === 'open' ? (isAr ? 'مفتوحة' : 'Open') : (isAr ? 'تم الرد' : 'Replied')}
          </span>
        </div>
        <div class="ticket-msg">${this._esc(ticket.message)}</div>
        ${ticket.attachment1 || ticket.attachment2 ? `
          <div class="ticket-attach">
            ${ticket.attachment1 ? `<img src="${ticket.attachment1}" alt="Attachment" onclick="ILYA.openLightbox('${ticket.attachment1}')">` : ''}
            ${ticket.attachment2 ? `<img src="${ticket.attachment2}" alt="Attachment" onclick="ILYA.openLightbox('${ticket.attachment2}')">` : ''}
          </div>` : ''}
        ${ticket.admin_reply ? `
          <div class="ticket-reply">
            <strong>${ILYA.t('reply_from_admin')}:</strong><br>${this._esc(ticket.admin_reply)}
          </div>` : ''}
        <!-- Reply form -->
        <div style="margin-top:12px;display:flex;gap:8px">
          <input type="text" class="form-input reply-input" data-tid="${ticket.id}"
            placeholder="${ILYA.t('your_reply')}"
            style="flex:1;padding:8px 12px;font-size:.83rem">
          <button class="btn-sm btn-info reply-send-btn" data-tid="${ticket.id}">
            ${ILYA.t('send_reply')}
          </button>
        </div>
      </div>
    `).join('');

    el.querySelectorAll('.reply-send-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const tid   = btn.dataset.tid;
        const input = el.querySelector(`.reply-input[data-tid="${tid}"]`);
        const reply = input.value.trim();
        if (!reply) return;

        btn.disabled = true;
        const res2 = await ILYA.api(`/admin/ticket/${tid}/reply`, 'POST', { reply });
        btn.disabled = false;

        if (res2.ok) {
          ILYA.toast(isAr ? 'تم إرسال الرد' : 'Reply sent', 'success');
          input.value = '';
          this._loadTab('support');
        } else {
          ILYA.toast(isAr ? 'فشل الإرسال' : 'Send failed', 'error');
        }
      });
    });
  },

  // ── System Config ─────────────────────────────────────────
  async _renderConfig(el) {
    const isAr = ILYA.state.lang === 'ar';
    const res  = await ILYA.api('/admin/config');
    if (!res.ok) { el.innerHTML = this._err(); return; }

    const cfg = res.data;

    const textFields = [
      { key:'welcome_text_ar', label: isAr ? 'نص الترحيب (عربي)' : 'Welcome Text (AR)' },
      { key:'welcome_text_en', label: isAr ? 'نص الترحيب (إنجليزي)' : 'Welcome Text (EN)' },
      { key:'about_text_ar',   label: isAr ? 'نص التعريف (عربي)' : 'About Text (AR)' },
      { key:'about_text_en',   label: isAr ? 'نص التعريف (إنجليزي)' : 'About Text (EN)' },
      { key:'copyright_text_ar', label: isAr ? 'نص حقوق الملكية (عربي)' : 'Copyright Text (AR)' },
      { key:'copyright_text_en', label: isAr ? 'نص حقوق الملكية (إنجليزي)' : 'Copyright Text (EN)' },
      { key:'telegram_link',   label: isAr ? 'رابط تيليجرام' : 'Telegram Link' },
    ];

    const toggles = [
      { key:'registration_enabled',    label: isAr ? 'تسجيل المستخدمين الجدد' : 'User Registration' },
      { key:'maintenance_mode',        label: isAr ? 'وضع الصيانة' : 'Maintenance Mode' },
      { key:'text_to_image_enabled',   label: isAr ? 'خدمة توليد الصور' : 'Text to Image' },
      { key:'image_to_anime_enabled',  label: isAr ? 'خدمة تحويل أنمي' : 'Image to Anime' },
      { key:'seedream_enabled',        label: isAr ? 'خدمة SeedDream' : 'SeedDream Service' },
      { key:'image_to_personal_enabled', label: isAr ? 'الصورة الشخصية' : 'Personal Photo Maker' },
      { key:'flux_max_enabled',        label: isAr ? 'خدمة Flux MAX' : 'Flux MAX Service' },
    ];

    el.innerHTML = `
      <div class="glass-card" style="margin-bottom:16px">
        <div style="font-weight:700;margin-bottom:16px;font-size:.9rem">
          ${isAr ? '📝 النصوص والروابط' : '📝 Texts & Links'}
        </div>
        ${textFields.map(f => `
          <div class="form-group">
            <label class="form-label">${f.label}</label>
            <input type="text" class="form-input config-input" data-key="${f.key}"
              value="${this._esc(cfg[f.key] || '')}">
          </div>
        `).join('')}
        <button class="btn-primary" id="save-texts-btn">${ILYA.t('save')}</button>
      </div>

      <div class="glass-card">
        <div style="font-weight:700;margin-bottom:16px;font-size:.9rem">
          ${isAr ? '🔧 تفعيل / تعطيل الخدمات' : '🔧 Enable / Disable Services'}
        </div>
        ${toggles.map(f => `
          <div class="config-row">
            <div>
              <div class="config-label">${f.label}</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" class="config-toggle" data-key="${f.key}"
                ${cfg[f.key] !== 'false' ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
        `).join('')}
      </div>
    `;

    // Save text fields
    document.getElementById('save-texts-btn').addEventListener('click', async () => {
      const updates = {};
      el.querySelectorAll('.config-input').forEach(input => {
        updates[input.dataset.key] = input.value;
      });
      const r = await ILYA.api('/admin/config', 'PUT', updates);
      if (r.ok) {
        ILYA.toast(ILYA.t('saved'), 'success');
        // Refresh global config
        const cfgRes = await ILYA.api('/config');
        if (cfgRes.ok) ILYA.state.config = cfgRes.data;
      } else {
        ILYA.toast(isAr ? 'فشل الحفظ' : 'Save failed', 'error');
      }
    });

    // Toggle switches — save immediately on change
    el.querySelectorAll('.config-toggle').forEach(toggle => {
      toggle.addEventListener('change', async () => {
        const key   = toggle.dataset.key;
        const value = toggle.checked ? 'true' : 'false';
        const r     = await ILYA.api('/admin/config', 'PUT', { [key]: value });
        if (r.ok) {
          ILYA.state.config[key] = value;
          ILYA.toast(ILYA.t('saved'), 'success');
        } else {
          toggle.checked = !toggle.checked; // revert
          ILYA.toast(isAr ? 'فشل الحفظ' : 'Save failed', 'error');
        }
      });
    });
  },

  // ── Activity Log ──────────────────────────────────────────
  async _renderActivity(el) {
    const isAr = ILYA.state.lang === 'ar';
    const res  = await ILYA.api('/admin/activity');
    if (!res.ok) { el.innerHTML = this._err(); return; }

    if (!res.data.length) { el.innerHTML = this._empty(); return; }

    el.innerHTML = res.data.slice(0, 100).map(a => `
      <div style="display:flex;align-items:flex-start;gap:10px;padding:12px;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--radius-sm);margin-bottom:8px">
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:.82rem;font-weight:600;color:var(--red-bright)">${a.service}</span>
            <span style="font-size:.72rem;color:var(--text-3)">${a.created_at?.slice(0,16) || ''}</span>
          </div>
          <div style="font-size:.78rem;color:var(--text-3)">@${this._esc(a.username)} · ${this._esc(a.name)}</div>
          ${a.details ? `<div style="font-size:.78rem;color:var(--text-2);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;margin-top:4px">${this._esc(a.details)}</div>` : ''}
          ${a.result_url ? `<a href="${a.result_url}" target="_blank" style="font-size:.75rem;color:var(--red-bright);display:inline-block;margin-top:4px">🔗 ${ILYA.t('open_link')}</a>` : ''}
        </div>
      </div>
    `).join('');
  },

  // ── Helpers ───────────────────────────────────────────────
  _err() {
    const isAr = ILYA.state.lang === 'ar';
    return `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-text">${isAr ? 'حدث خطأ في تحميل البيانات' : 'Error loading data'}</div></div>`;
  },
  _empty() {
    const isAr = ILYA.state.lang === 'ar';
    return `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">${isAr ? 'لا توجد بيانات' : 'No data found'}</div></div>`;
  },
  _esc(str) {
    return String(str || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
};
