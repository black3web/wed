/* ═══════════════════════════════════════
   ILYA — Admin Module
   Developer-only control panel
   ═══════════════════════════════════════ */

const Admin = {

  loadStats() {
    const stats = Auth.getStats();
    const users = Auth.getUsers();
    let msgs = [];
    try { msgs = JSON.parse(localStorage.getItem('ilya_support_msgs')) || []; } catch {}

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val !== undefined ? val : '0';
    };

    set('stat-visitors',    stats.visitors    || 0);
    set('stat-users',       users.length);
    set('stat-chat-uses',   stats.chatUses    || 0);
    set('stat-img-uses',    stats.imageUses   || 0);
    set('stat-vid-uses',    stats.videoUses   || 0);
    set('stat-support-msgs', msgs.length);
  },

  loadUsers() {
    const users = Auth.getUsers();
    const list  = document.getElementById('users-list');
    if (!list) return;
    list.innerHTML = '';

    const sorted = [...users].sort((a,b) => {
      const ta = a.lastSeen ? new Date(a.lastSeen).getTime() : 0;
      const tb = b.lastSeen ? new Date(b.lastSeen).getTime() : 0;
      return tb - ta;
    });

    for (const u of sorted) {
      if (u.banned) continue;
      const row = document.createElement('div');
      row.className = 'user-row';
      row.innerHTML = `
        <div class="user-row-name">${escapeHtml(u.name)} <span style="font-size:0.7rem;color:var(--neon2)">[${u.role}]</span></div>
        <div class="user-row-meta">@${u.username} · ID:${u.id} · آخر دخول: ${u.lastSeen ? new Date(u.lastSeen).toLocaleString('ar') : 'لم يدخل'}</div>
      `;
      row.onclick = () => Admin.showUserDetail(u);
      list.appendChild(row);
    }
    if (sorted.filter(u=>!u.banned).length === 0) {
      list.innerHTML = '<div class="inbox-empty">لا يوجد مستخدمون</div>';
    }
  },

  loadBlocked() {
    const users = Auth.getUsers();
    const list  = document.getElementById('blocked-list');
    if (!list) return;
    list.innerHTML = '';
    const blocked = users.filter(u => u.banned || u.banUntil);

    if (!blocked.length) {
      list.innerHTML = '<div class="inbox-empty">لا يوجد محظورون</div>';
      return;
    }
    for (const u of blocked) {
      const row = document.createElement('div');
      row.className = 'user-row';
      row.innerHTML = `
        <div class="user-row-name">${escapeHtml(u.name)}</div>
        <div class="user-row-meta">@${u.username} · ${u.banUntil ? 'مؤقت حتى ' + new Date(u.banUntil).toLocaleDateString('ar') : 'محظور دائم'}</div>
      `;
      row.onclick = () => Admin.showUserDetail(u);
      list.appendChild(row);
    }
  },

  showUserDetail(u) {
    const msgs_raw = localStorage.getItem('ilya_support_msgs') || '[]';
    let msgs = [];
    try { msgs = JSON.parse(msgs_raw); } catch {}
    const userMsgs = msgs.filter(m => m.userId === u.id);

    UI.showModal('معلومات المستخدم', `
      <div class="user-detail-card">
        <div style="text-align:center;margin-bottom:1rem">
          <img src="${escapeHtml(u.avatar)}" style="width:56px;height:56px;border-radius:50%;border:1px solid rgba(255,0,64,0.4)">
        </div>
        <div class="user-detail-field"><span class="user-detail-key">الاسم</span><span class="user-detail-val">${escapeHtml(u.name)}</span></div>
        <div class="user-detail-field"><span class="user-detail-key">اليوزر</span><span class="user-detail-val">@${escapeHtml(u.username)}</span></div>
        <div class="user-detail-field"><span class="user-detail-key">المعرف</span><span class="user-detail-val">${u.id}</span></div>
        <div class="user-detail-field"><span class="user-detail-key">كلمة المرور (hash)</span><span class="user-detail-val" style="font-size:0.65rem;word-break:break-all">${escapeHtml(u.password)}</span></div>
        <div class="user-detail-field"><span class="user-detail-key">الصلاحية</span><span class="user-detail-val">${u.role}</span></div>
        <div class="user-detail-field"><span class="user-detail-key">تاريخ الإنشاء</span><span class="user-detail-val">${new Date(u.createdAt).toLocaleDateString('ar')}</span></div>
        <div class="user-detail-field"><span class="user-detail-key">آخر دخول</span><span class="user-detail-val">${u.lastSeen ? new Date(u.lastSeen).toLocaleString('ar') : '—'}</span></div>
        <div class="user-detail-field"><span class="user-detail-key">استخدام الدردشة</span><span class="user-detail-val">${u.stats?.chatUses || 0}</span></div>
        <div class="user-detail-field"><span class="user-detail-key">استخدام الصور</span><span class="user-detail-val">${u.stats?.imageUses || 0}</span></div>
        <div class="user-detail-field"><span class="user-detail-key">استخدام الفيديو</span><span class="user-detail-val">${u.stats?.videoUses || 0}</span></div>
        <div class="user-detail-field"><span class="user-detail-key">رسائل الدعم</span><span class="user-detail-val">${userMsgs.length}</span></div>
        <div class="user-detail-field"><span class="user-detail-key">الحالة</span><span class="user-detail-val" style="color:${u.banned?'var(--neon)':'#00cc55'}">${u.banned ? 'محظور' : 'نشط'}</span></div>
      </div>
    `, [
      u.id !== 1 ? {
        label: u.banned ? 'رفع الحظر' : 'حظر دائم', cls: 'danger-btn', fn: () => {
          Admin.banUser(u.id, !u.banned, null);
          UI.toast(u.banned ? 'تم رفع الحظر' : 'تم حظر المستخدم');
        }
      } : null,
      u.id !== 1 ? {
        label: 'حظر 24 ساعة', cls: 'secondary-btn', fn: () => {
          const until = new Date(Date.now() + 24*60*60*1000).toISOString();
          Admin.banUser(u.id, true, until);
          UI.toast('تم الحظر المؤقت');
        }
      } : null,
      { label: 'إغلاق', cls: 'ghost-btn', fn: () => {} }
    ].filter(Boolean));
  },

  banUser(id, banned, banUntil) {
    const users = Auth.getUsers();
    const u = users.find(u => u.id === id);
    if (u) { u.banned = banned; u.banUntil = banUntil; Auth.saveUsers(users); }
    Admin.loadUsers();
    Admin.loadBlocked();
  },

  loadMessages() {
    let msgs = [];
    try { msgs = JSON.parse(localStorage.getItem('ilya_support_msgs')) || []; } catch {}
    const list = document.getElementById('admin-msgs-list');
    if (!list) return;

    if (!msgs.length) {
      list.innerHTML = '<div class="inbox-empty">لا توجد رسائل دعم</div>';
      return;
    }

    list.innerHTML = '';
    for (const m of [...msgs].reverse()) {
      const card = document.createElement('div');
      card.className = 'admin-msg-card glass-card';
      card.innerHTML = `
        <div class="admin-msg-from">من: ${escapeHtml(m.userName)} (@${escapeHtml(m.userUsername)}) · ${new Date(m.sentAt).toLocaleString('ar')}</div>
        <div class="admin-msg-body">${escapeHtml(m.body)}</div>
        ${m.attachments?.length ? `<div class="admin-msg-attachments">${m.attachments.map(a => `<img src="${a}" class="admin-msg-img">`).join('')}</div>` : ''}
        <div class="admin-reply-area">
          <input type="text" id="reply-${m.id}" class="glass-input" placeholder="رد على الرسالة..." style="flex:1;height:36px;padding:0.4rem 0.7rem">
          <button class="glass-btn primary-btn" style="padding:0.4rem 0.7rem;height:36px" onclick="Admin.replyMsg(${m.id})">إرسال</button>
        </div>
        ${m.replies?.length ? m.replies.map(r => `
          <div style="margin-top:0.5rem;padding:0.4rem;background:rgba(255,0,64,0.05);border-radius:6px;font-size:0.75rem;color:var(--neon2)">رد الإدارة: ${escapeHtml(r.body)}</div>
        `).join('') : ''}
      `;
      list.appendChild(card);
    }
  },

  replyMsg(msgId) {
    const input = document.getElementById('reply-' + msgId);
    if (!input || !input.value.trim()) return;

    let msgs = [];
    try { msgs = JSON.parse(localStorage.getItem('ilya_support_msgs')) || []; } catch {}
    const msg = msgs.find(m => m.id === msgId);
    if (!msg) return;

    msg.replies = msg.replies || [];
    msg.replies.push({ body: input.value.trim(), sentAt: new Date().toISOString() });
    localStorage.setItem('ilya_support_msgs', JSON.stringify(msgs));

    input.value = '';
    UI.toast('تم إرسال الرد', 'success');
    Admin.loadMessages();
  },

  toggleService(service, enabled) {
    const services = getServices();
    services[service] = enabled;
    localStorage.setItem('ilya_services', JSON.stringify(services));
    UI.toast(enabled ? 'الخدمة مفعّلة' : 'الخدمة متوقفة', enabled ? 'success' : '');
  },

  toggleModel(model, enabled) {
    const MODELS_KEY = 'ilya_models';
    let models = {};
    try { models = JSON.parse(localStorage.getItem(MODELS_KEY)) || {}; } catch {}
    models[model] = enabled;
    localStorage.setItem(MODELS_KEY, JSON.stringify(models));
    UI.toast(enabled ? 'النموذج مفعّل' : 'النموذج متوقف');
  },

  saveCustomization() {
    const custom = getCustom();
    const welcome   = document.getElementById('custom-welcome')?.value;
    const copyright = document.getElementById('custom-copyright')?.value;
    const siteName  = document.getElementById('custom-site-name')?.value;

    if (welcome)   custom.welcomeMsg = welcome;
    if (copyright) custom.copyright  = copyright;
    if (siteName)  custom.siteName   = siteName;
    saveCustom(custom);

    // Apply live
    const welEl = document.getElementById('home-welcome');
    if (welEl && welcome) welEl.textContent = welcome;
    const titleEl = document.getElementById('topbar-title');
    if (titleEl && siteName) titleEl.textContent = siteName;

    UI.toast('تم حفظ التخصيص', 'success');
  }
};
