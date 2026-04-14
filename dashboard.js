/* ═══════════════════════════════════════════════
   ILYA AI v3 — Dashboard (dashboard.js)
   Home · VIP · Sidebar · Profile · Help · Support · Gallery
═══════════════════════════════════════════════ */
var ILYADashboard = {

  show: function() {
    var u = ILYA.state.user;
    if (!u) { ILYAAuth.show(); return; }
    if (u.role === 'vip') { this._vip(); return; }
    this._home();
  },

  /* ── Home ───────────────────────────────────── */
  _home: function() {
    var self = this;
    var u    = ILYA.state.user;
    var cfg  = ILYA.state.config;
    var isAr = ILYA.state.lang === 'ar';
    ILYA.reg('dashboard', function() { self._home(); });

    var welcome = isAr ? (cfg.welcome_ar || ILYA.t('welcome')) : (cfg.welcome_en || ILYA.t('welcome'));
    var about   = isAr ? cfg.about_ar : cfg.about_en;
    var actCnt  = DB.activityFor(u.id).filter(function(a) { return a.url; }).length;

    var html = '<div class="pg">' +
      '<div class="welcome-card">' +
        '<img src="' + ILYA.esc(u.pic||'https://iili.io/B04MxcX.md.jpg') + '" class="welcome-av" alt="' + ILYA.esc(u.name) + '"' +
             ' onerror="this.src=\'https://iili.io/B04MxcX.md.jpg\'">' +
        '<div class="welcome-greet">' + ILYA.esc(welcome) + '</div>' +
        '<div class="welcome-sub">' + ILYA.t('greeting', u.name) + '</div>' +
        (u.role === 'admin' ?
          '<button class="btn btn-sm" id="admin-btn" style="margin-top:13px;background:linear-gradient(135deg,#4a0000,#8B0000,#DC143C);color:#fff;padding:9px 22px;border-radius:22px;box-shadow:var(--gs1)">' +
            '<i class="fa-solid fa-shield-halved"></i> ' + ILYA.t('admin') +
          '</button>' : '') +
      '</div>' +
      (about ? '<div class="glass glass-p" style="margin-bottom:16px"><p style="font-size:.83rem;color:var(--t2);line-height:1.85">' + ILYA.esc(about) + '</p></div>' : '') +
      '<div class="sec-lbl"><i class="fa-solid fa-layer-group"></i>' + (isAr ? 'خدمات المنصة' : 'Platform Services') + '</div>' +
      '<div class="srv-grid">' +
        this._srvCard('s-ai',      'fa-wand-magic-sparkles', ILYA.t('ai_srv'),  isAr ? '7 نماذج AI':'7 AI Models') +
        this._srvCard('s-gallery', 'fa-images',               ILYA.t('gallery'), isAr ? actCnt + ' صورة مولّدة': actCnt + ' generated') +
        this._srvCard('s-profile', 'fa-user-pen',             ILYA.t('my_acc'), isAr ? 'إدارة ملفك':'Manage profile') +
        this._srvCard('s-help',    'fa-circle-question',      ILYA.t('help'),   isAr ? 'أسئلة وشروحات':'FAQ & guides') +
        this._srvCard('s-support', 'fa-headset',              ILYA.t('support'), isAr ? 'تواصل معنا':'Contact us') +
      '</div>' +
      ILYA.footer() +
      '</div>';

    document.getElementById('page-dashboard').innerHTML = html;
    ILYA.go('dashboard');

    var self2 = this;
    var bind  = function(id, fn) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('click', fn);
    };
    bind('s-ai',      function() { ILYAAI.showList(); });
    bind('s-gallery', function() { self2.showGallery(); });
    bind('s-profile', function() { self2.showProfile(); });
    bind('s-help',    function() { self2.showHelp(); });
    bind('s-support', function() { self2.showSupport(); });
    bind('admin-btn', function() { ILYAAdmin.show(); });
  },

  _srvCard: function(id, icon, name, desc) {
    return '<div class="srv-card tilt" id="' + id + '">' +
      '<div class="srv-ico"><i class="fa-solid ' + icon + '"></i></div>' +
      '<div class="srv-name">' + ILYA.esc(name) + '</div>' +
      '<div class="srv-desc">' + ILYA.esc(desc) + '</div>' +
      '</div>';
  },

  /* ── VIP ─────────────────────────────────────── */
  _vip: function() {
    var self = this;
    var u    = ILYA.state.user;
    var isAr = ILYA.state.lang === 'ar';
    ILYA.reg('dashboard', function() { self._vip(); });

    var feats = isAr ? [
      ['fa-crown',     'عضوية حصرية VIP وصلاحيات متقدمة'],
      ['fa-bolt',      'أولوية معالجة الطلبات السريعة'],
      ['fa-lock-open', 'وصول كامل لجميع الخدمات والنماذج'],
      ['fa-headset',   'دعم فني مباشر وفوري'],
      ['fa-images',    'معرض صور غير محدود'],
      ['fa-star',      'ميزات حصرية غير متاحة للمستخدم العادي'],
    ] : [
      ['fa-crown',     'Exclusive VIP membership & advanced privileges'],
      ['fa-bolt',      'Priority request processing'],
      ['fa-lock-open', 'Full access to all services and models'],
      ['fa-headset',   'Direct & instant technical support'],
      ['fa-images',    'Unlimited personal image gallery'],
      ['fa-star',      'Exclusive features unavailable to standard users'],
    ];

    var html = '<div class="pg">' +
      '<div class="vip-hero">' +
        '<i class="fa-solid fa-crown vip-crown"></i>' +
        '<div class="vip-title">VIP Member</div>' +
        '<div style="color:rgba(255,215,0,.65);font-size:.8rem;margin-bottom:12px">' + (isAr ? 'عضو حصري — صلاحيات متقدمة':'Exclusive Member') + '</div>' +
        '<img src="' + ILYA.esc(u.pic||'https://iili.io/B04MxcX.md.jpg') + '" class="vip-av" alt="' + ILYA.esc(u.name) + '"' +
             ' onerror="this.src=\'https://iili.io/B04MxcX.md.jpg\'">' +
        '<div style="font-size:1.05rem;font-weight:700;margin-bottom:4px">' + ILYA.esc(u.name) + '</div>' +
        '<div style="font-size:.8rem;color:rgba(255,215,0,.6)">@' + ILYA.esc(u.username) + '</div>' +
      '</div>' +
      '<div class="glass glass-p" style="margin-bottom:16px;border-color:rgba(255,215,0,.2)">' +
        '<div style="font-weight:700;margin-bottom:13px;color:rgba(255,215,0,.9);font-size:.9rem"><i class="fa-solid fa-gem" style="margin-inline-end:7px"></i>' + (isAr?'مميزاتك الحصرية':'Your Privileges') + '</div>' +
        feats.map(function(f) {
          return '<div class="vip-feat"><i class="fa-solid ' + f[0] + '"></i><span>' + f[1] + '</span></div>';
        }).join('') +
      '</div>' +
      '<div class="srv-grid">' +
        this._srvCard('v-ai',      'fa-wand-magic-sparkles', ILYA.t('ai_srv'), '') +
        this._srvCard('v-gallery', 'fa-images',               ILYA.t('gallery'), '') +
        this._srvCard('v-profile', 'fa-user-pen',             ILYA.t('my_acc'), '') +
        this._srvCard('v-support', 'fa-headset',              ILYA.t('support'), '') +
      '</div>' +
      ILYA.footer() + '</div>';

    document.getElementById('page-dashboard').innerHTML = html;
    ILYA.go('dashboard');

    var self2 = this;
    [['v-ai',      function() { ILYAAI.showList(); }],
     ['v-gallery', function() { self2.showGallery(); }],
     ['v-profile', function() { self2.showProfile(); }],
     ['v-support', function() { self2.showSupport(); }]
    ].forEach(function(pair) {
      var el = document.getElementById(pair[0]);
      if (el) el.addEventListener('click', pair[1]);
    });
  },

  /* ── Sidebar ─────────────────────────────────── */
  renderSidebar: function() {
    var self  = this;
    var u     = ILYA.state.user;
    var cfg   = ILYA.state.config;
    var isAr  = ILYA.state.lang === 'ar';
    if (!u) return;

    var badgeCls = u.role === 'admin' ? 'b-admin' : u.role === 'vip' ? 'b-vip' : 'b-user';
    var badgeTxt = u.role;

    var items = [
      { id:'sb-home',    icon:'fa-house',               lbl: ILYA.t('home') },
      { id:'sb-ai',      icon:'fa-wand-magic-sparkles',  lbl: ILYA.t('ai_srv'), isNew: true },
      { id:'sb-gallery', icon:'fa-images',               lbl: ILYA.t('gallery') },
      { id:'sb-profile', icon:'fa-user-pen',             lbl: ILYA.t('my_acc') },
      { id:'sb-help',    icon:'fa-circle-question',      lbl: ILYA.t('help') },
      { id:'sb-support', icon:'fa-headset',              lbl: ILYA.t('support') },
    ];
    if (u.role === 'admin') items.push({ id:'sb-admin', icon:'fa-shield-halved', lbl: ILYA.t('admin'), extra:'style="color:var(--neon)"' });

    document.getElementById('sidebar').innerHTML =
      '<div class="sb-hdr">' +
        '<img src="https://iili.io/B04Wttf.md.jpg" class="sb-banner" alt="Banner"' +
             ' onerror="this.style.background=\'linear-gradient(135deg,#3d0000,#0d0000)\'">' +
        '<div class="sb-banner-grad"></div>' +
        '<button class="sb-x" id="sb-x"><i class="fa-solid fa-xmark"></i></button>' +
      '</div>' +
      '<div class="sb-user">' +
        '<img src="' + ILYA.esc(u.pic||'https://iili.io/B04MxcX.md.jpg') + '" class="sb-av" alt="' + ILYA.esc(u.name) + '"' +
             ' onerror="this.src=\'https://iili.io/B04MxcX.md.jpg\'">' +
        '<div class="sb-info">' +
          '<div class="sb-name">' + ILYA.esc(u.name) + '</div>' +
          '<div class="sb-uname">@' + ILYA.esc(u.username) + '</div>' +
          '<span class="sb-badge ' + badgeCls + '">' + badgeTxt + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="sb-div"></div>' +
      '<nav class="sb-nav">' +
        items.map(function(item) {
          return '<button class="sb-item" id="' + item.id + '" ' + (item.extra||'') + '>' +
            '<i class="fa-solid ' + item.icon + ' sb-icon"></i>' +
            '<span>' + ILYA.esc(item.lbl) + '</span>' +
            (item.isNew ? '<span class="sb-new">NEW</span>' : '') +
            '</button>';
        }).join('') +
        '<div class="sb-div" style="margin:6px 0"></div>' +
        '<a href="' + (cfg.dev_site||'https://black3web.github.io/Blackweb/') + '" target="_blank" rel="noopener" class="sb-item">' +
          '<i class="fa-solid fa-globe sb-icon"></i>' +
          '<span>' + ILYA.t('dev_site_btn') + '</span>' +
          '<i class="fa-solid fa-arrow-up-right-from-square" style="font-size:.7rem;margin-inline-start:auto;color:var(--t4)"></i>' +
        '</a>' +
        '<button class="sb-item sb-logout" id="sb-logout">' +
          '<i class="fa-solid fa-right-from-bracket sb-icon"></i>' +
          '<span>' + ILYA.t('logout') + '</span>' +
        '</button>' +
      '</nav>' +
      '<div class="sb-foot">' +
        '<div>ILYA AI &copy; ' + new Date().getFullYear() + ' &mdash; ' + ILYA.t('copyright') + '</div>' +
        '<div><a href="' + (cfg.tg_link||'https://t.me/swc_t') + '" target="_blank" rel="noopener">' +
          '<i class="fa-brands fa-telegram"></i> Telegram</a></div>' +
      '</div>';

    var go = function(fn) { ILYA.closeSidebar(); setTimeout(fn, 280); };
    var bind = function(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener('click', fn); };

    bind('sb-x',       function() { ILYA.closeSidebar(); });
    bind('sb-home',    function() { go(function() { self.show(); }); });
    bind('sb-ai',      function() { go(function() { ILYAAI.showList(); }); });
    bind('sb-gallery', function() { go(function() { self.showGallery(); }); });
    bind('sb-profile', function() { go(function() { self.showProfile(); }); });
    bind('sb-help',    function() { go(function() { self.showHelp(); }); });
    bind('sb-support', function() { go(function() { self.showSupport(); }); });
    bind('sb-admin',   function() { go(function() { ILYAAdmin.show(); }); });
    bind('sb-logout',  function() { ILYAAuth.logout(); });
  },

  /* ── Profile ─────────────────────────────────── */
  showProfile: function() {
    var self = this;
    ILYA.reg('profile', function() { self.showProfile(); });

    // Always get fresh data
    var u = DB.userById(ILYA.state.user && ILYA.state.user.id);
    if (!u) { ILYAAuth.show(); return; }
    ILYA.saveSession(u);

    var isAr = ILYA.state.lang === 'ar';
    var uploadedUrl = '';

    document.getElementById('page-profile').innerHTML =
      '<div class="pg">' +
        '<div class="pg-hdr">' +
          ILYA.backBtn('back-prof') +
          '<div class="pg-title"><i class="fa-solid fa-user-pen" style="margin-inline-end:8px;color:var(--neon)"></i>' + ILYA.t('my_acc') + '</div>' +
        '</div>' +
        '<div class="prof-hero">' +
          '<img src="' + ILYA.esc(u.pic||'https://iili.io/B04MxcX.md.jpg') + '" class="prof-av" id="prof-av" alt="' + ILYA.esc(u.name) + '"' +
               ' onerror="this.src=\'https://iili.io/B04MxcX.md.jpg\'">' +
        '</div>' +
        '<div class="prof-id">' +
          '<i class="fa-solid fa-id-card" style="color:var(--neon);flex-shrink:0"></i>' +
          '<span style="font-size:.79rem;color:var(--t3)">' + ILYA.t('my_id') + ':</span>' +
          '<span class="prof-id-val">' + ILYA.esc(u.id) + '</span>' +
          '<span class="prof-id-lock"><i class="fa-solid fa-lock"></i>' + (isAr?'ثابت':'Fixed') + '</span>' +
        '</div>' +
        '<div class="glass glass-p" style="margin-bottom:14px">' +
          '<div class="sec-lbl"><i class="fa-solid fa-user"></i>' + (isAr?'المعلومات الشخصية':'Personal Info') + '</div>' +
          '<div class="fgrp"><label class="flbl"><i class="fa-solid fa-signature"></i>' + ILYA.t('name') + '</label>' +
            '<input id="p-name" type="text" class="finp" value="' + ILYA.esc(u.name) + '"></div>' +
          '<div class="fgrp"><label class="flbl"><i class="fa-solid fa-at"></i>' + ILYA.t('username') + '</label>' +
            '<input id="p-user" type="text" class="finp" value="' + ILYA.esc(u.username) + '"></div>' +
          '<div class="fgrp"><label class="flbl"><i class="fa-solid fa-lock"></i>' + ILYA.t('password') + '</label>' +
            '<input id="p-pw" type="password" class="finp" placeholder="' + (isAr?'اتركه فارغاً للإبقاء على الحالي':'Leave blank to keep current') + '"></div>' +
        '</div>' +
        // Avatar upload
        '<div class="glass glass-p" style="margin-bottom:14px">' +
          '<div class="sec-lbl"><i class="fa-solid fa-image"></i>' + (isAr?'الصورة الشخصية':'Profile Picture') + '</div>' +
          '<div class="img-tabs">' +
            '<button class="img-tab active" id="av-tab-url"><i class="fa-solid fa-link" style="margin-inline-end:5px"></i>' + ILYA.t('from_url') + '</button>' +
            '<button class="img-tab" id="av-tab-file"><i class="fa-solid fa-upload" style="margin-inline-end:5px"></i>' + ILYA.t('from_device') + '</button>' +
          '</div>' +
          '<div id="av-url-pnl">' +
            '<input id="p-pic" type="url" class="finp" value="' + ILYA.esc(u.pic||'') + '" placeholder="https://...">' +
          '</div>' +
          '<div id="av-file-pnl" style="display:none">' +
            '<div class="upload-zone" id="av-zone">' +
              '<input type="file" id="av-file" accept="image/png,image/jpeg,image/webp,image/gif">' +
              '<span class="up-ico"><i class="fa-solid fa-cloud-arrow-up"></i></span>' +
              '<div class="up-txt">' + ILYA.t('drag_drop') + '</div>' +
              '<div class="up-sub">' + ILYA.t('drag_drop_sub') + '</div>' +
            '</div>' +
            '<div class="up-preview" id="av-preview"><img src="" id="av-prev-img" alt="Preview"><button class="up-clear" id="av-clear"><i class="fa-solid fa-xmark"></i></button></div>' +
            '<div class="up-prog" id="av-prog"><i class="fa-solid fa-circle-notch fa-spin" style="color:var(--neon)"></i><div class="up-pb"><div class="up-pf" id="av-prog-fill" style="width:0%"></div></div><span id="av-prog-txt">0%</span></div>' +
          '</div>' +
        '</div>' +
        '<div id="p-msg" style="text-align:center;font-size:.82rem;margin-bottom:10px;display:none"></div>' +
        '<button class="btn btn-primary btn-full" id="save-prof"><i class="fa-solid fa-floppy-disk"></i> ' + ILYA.t('save') + '</button>' +
        '<div style="text-align:center;font-size:.73rem;color:var(--t4);margin-top:12px">' + ILYA.t('member_since', (u.created_at||'').slice(0,10)) + '</div>' +
        ILYA.footer() +
      '</div>';

    ILYA.go('profile');

    var bind = function(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener('click', fn); };

    bind('back-prof', function() { self.show(); });

    // URL tab live preview
    var picInput = document.getElementById('p-pic');
    if (picInput) {
      picInput.addEventListener('input', function() {
        var av = document.getElementById('prof-av');
        if (av && this.value) av.src = this.value;
      });
    }

    // Tab switch
    bind('av-tab-url', function() {
      document.getElementById('av-tab-url').classList.add('active');
      document.getElementById('av-tab-file').classList.remove('active');
      document.getElementById('av-url-pnl').style.display = 'block';
      document.getElementById('av-file-pnl').style.display = 'none';
    });
    bind('av-tab-file', function() {
      document.getElementById('av-tab-file').classList.add('active');
      document.getElementById('av-tab-url').classList.remove('active');
      document.getElementById('av-file-pnl').style.display = 'block';
      document.getElementById('av-url-pnl').style.display = 'none';
    });

    // File upload
    var avFile = document.getElementById('av-file');
    if (avFile) {
      avFile.addEventListener('change', function(e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { ILYA.toast(isAr?'الحجم يتجاوز 10MB':'File exceeds 10MB','error'); return; }

        IMG_UPLOADER.toDataURL(file).then(function(dataUrl) {
          document.getElementById('av-prev-img').src = dataUrl;
          document.getElementById('av-preview').classList.add('show');
          document.getElementById('prof-av').src = dataUrl;

          var prog = document.getElementById('av-prog');
          var fill = document.getElementById('av-prog-fill');
          var txt  = document.getElementById('av-prog-txt');
          prog.classList.add('show');

          IMG_UPLOADER.upload(file, function(pct) {
            if (fill) fill.style.width = pct + '%';
            if (txt)  txt.textContent  = pct + '%';
          }).then(function(url) {
            uploadedUrl = url;
            prog.classList.remove('show');
            ILYA.toast(ILYA.t('upload_done'), 'success');
          }).catch(function() {
            prog.classList.remove('show');
            uploadedUrl = dataUrl;
            ILYA.toast(isAr?'رفع محلي — الصورة قد لا تظهر للآخرين':'Local — image may not show to others','warn');
          });
        });
      });
    }

    // Clear
    bind('av-clear', function() {
      document.getElementById('av-preview').classList.remove('show');
      var f = document.getElementById('av-file'); if (f) f.value = '';
      uploadedUrl = '';
      document.getElementById('prof-av').src = u.pic || 'https://iili.io/B04MxcX.md.jpg';
    });

    // Drag-drop
    var zone = document.getElementById('av-zone');
    if (zone) {
      zone.addEventListener('dragover',  function(e) { e.preventDefault(); zone.classList.add('dv'); });
      zone.addEventListener('dragleave', function() { zone.classList.remove('dv'); });
      zone.addEventListener('drop', function(e) {
        e.preventDefault(); zone.classList.remove('dv');
        var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (file && avFile) {
          try { var dt = new DataTransfer(); dt.items.add(file); avFile.files = dt.files; avFile.dispatchEvent(new Event('change')); } catch(err){}
        }
      });
    }

    // Save
    bind('save-prof', function() {
      var name   = (document.getElementById('p-name') && document.getElementById('p-name').value.trim())  || '';
      var uname  = (document.getElementById('p-user') && document.getElementById('p-user').value.trim())  || '';
      var pw     = (document.getElementById('p-pw')   && document.getElementById('p-pw').value.trim())    || '';
      var msgEl  = document.getElementById('p-msg');
      var btn    = document.getElementById('save-prof');

      var tabUrl = document.getElementById('av-tab-url');
      var picUrl = '';
      if (tabUrl && tabUrl.classList.contains('active')) {
        picUrl = (document.getElementById('p-pic') && document.getElementById('p-pic').value.trim()) || '';
      } else {
        picUrl = uploadedUrl || '';
      }

      if (!name || !uname) { ILYA.toast(ILYA.t('err_fields'), 'error'); return; }
      if (uname.length < 4) { ILYA.toast(ILYA.t('err_uname_short'), 'error'); return; }

      var conflict = DB.userByUsername(uname);
      if (conflict && String(conflict.id) !== String(u.id)) { ILYA.toast(ILYA.t('err_uname_taken'), 'error'); return; }

      var updates = { name:name, username:uname };
      if (pw)     updates.ph  = md5(pw);
      if (picUrl) updates.pic = picUrl;

      btn.disabled = true;
      setTimeout(function() {
        DB.updateUser(u.id, updates);
        var fresh = DB.userById(u.id);
        ILYA.saveSession(fresh);
        btn.disabled = false;
        msgEl.textContent = ILYA.t('saved'); msgEl.style.color = '#44ff88'; msgEl.style.display = 'block';
        ILYA.toast(ILYA.t('saved'), 'success');
        setTimeout(function() { msgEl.style.display = 'none'; }, 3000);
      }, 300);
    });
  },

  /* ── Gallery ─────────────────────────────────── */
  showGallery: function() {
    var self = this;
    ILYA.reg('gallery', function() { self.showGallery(); });
    var isAr = ILYA.state.lang === 'ar';
    var u    = ILYA.state.user;
    var acts = DB.activityFor(u && u.id).filter(function(a) { return !!a.url; });

    var html = '<div class="pg">' +
      '<div class="pg-hdr">' +
        ILYA.backBtn('back-gal') +
        '<div class="pg-title"><i class="fa-solid fa-images" style="margin-inline-end:8px;color:var(--neon)"></i>' + ILYA.t('gallery') + '</div>' +
      '</div>';

    if (acts.length) {
      html += '<div style="font-size:.79rem;color:var(--t3);margin-bottom:14px">' +
        (isAr ? acts.length + ' صورة مولّدة' : acts.length + ' generated images') + '</div>' +
        '<div class="gallery-grid">' +
        acts.map(function(a) {
          return '<div class="gallery-item" onclick="ILYA.openLightbox(\'' + ILYA.esc(a.url) + '\')">' +
            '<img src="' + ILYA.esc(a.url) + '" alt="' + ILYA.esc(a.service) + '" loading="lazy"' +
                 ' onerror="this.parentElement.style.display=\'none\'">' +
            '<div class="gallery-overlay">' +
              '<span class="gallery-svc">' + ILYA.esc(a.service) + '</span>' +
              '<a href="' + ILYA.esc(a.url) + '" download onclick="event.stopPropagation()" class="btn btn-sm btn-glass" style="width:28px;height:28px;min-height:auto;padding:0;font-size:.75rem">' +
                '<i class="fa-solid fa-download"></i></a>' +
            '</div>' +
          '</div>';
        }).join('') +
        '</div>';
    } else {
      html += '<div class="empty-state">' +
        '<div class="empty-icon"><i class="fa-solid fa-images"></i></div>' +
        '<div class="empty-txt">' + (isAr ? 'لا توجد صور مولّدة بعد — جرّب أحد نماذج AI!' : 'No generated images yet — try an AI model!') + '</div>' +
        '</div>';
    }

    html += ILYA.footer() + '</div>';
    document.getElementById('page-gallery').innerHTML = html;
    ILYA.go('gallery');

    var bg = document.getElementById('back-gal');
    if (bg) bg.addEventListener('click', function() { self.show(); });
  },

  /* ── Help ────────────────────────────────────── */
  showHelp: function() {
    var self = this;
    ILYA.reg('help', function() { self.showHelp(); });
    var isAr = ILYA.state.lang === 'ar';

    var faqs = isAr ? [
      ['ما هي منصة ILYA AI؟', 'ILYA AI هي منصتك المتكاملة لخدمات الذكاء الاصطناعي — تقدم 7 نماذج متخصصة لتوليد وتعديل الصور بأعلى جودة ممكنة.'],
      ['كيف أستخدم خدمات AI؟', 'انتقل لـ "خدمات AI"، اختر النموذج، أدخل وصفاً أو ارفع صورة، ثم اضغط إرسال. النتيجة تصل خلال ثوانٍ مع إمكانية التحميل.'],
      ['ما الفرق بين النماذج السبعة؟', 'V-Gen للتوليد النصي، أنمي لتحويل الصور، SeedDream بـ 13 نمطاً، صورة شخصية بـ 15 نمطاً، Flux MAX الأقوى، Nano Banana 2 بدقة 2K، وNanoBanana Pro للتوليد والتعديل حتى 4K.'],
      ['كيف أرفع صورة للنماذج؟', 'في نماذج الصور، اختر "من الجهاز" للرفع المباشر أو "رابط URL" لإدخال رابط. الصورة تُرفع تلقائياً على catbox.moe مجاناً.'],
      ['كيف أغير صورة ملفي الشخصي؟', 'اذهب لـ "حسابي"، اختر "رابط URL" أو "من الجهاز"، ثم احفظ. الصورة تتحدث فوراً في كل مكان.'],
      ['هل يمكن تغيير رقم الهوية؟', 'رقم الهوية (ID) ثابت عند إنشاء الحساب ولا يمكن للمستخدم تغييره. يمكن للمبرمج فقط تغييره من لوحة التحكم.'],
      ['ما هو معرض الصور؟', '"معرضي" يحفظ تلقائياً كل صورة تولّدها في مكان واحد مع إمكانية التكبير والتحميل.'],
      ['كيف أتواصل مع الدعم؟', 'اذهب لـ "الدعم"، اكتب رسالتك مع إمكانية إرفاق صورتين. سيرد الفريق مباشرة داخل المنصة.'],
    ] : [
      ['What is ILYA AI Platform?', 'ILYA AI is your integrated platform for advanced AI services — offering 7 specialized models for generating and editing images at the highest quality.'],
      ['How do I use AI services?', 'Go to "AI Services", choose your model, enter a description or upload an image, then press send. Results arrive in seconds with download capability.'],
      ['What\'s the difference between the 7 models?', 'V-Gen for text-to-image, Anime for image conversion, SeedDream with 13 styles, Personal Photo with 15 styles, Flux MAX (most powerful), Nano Banana 2 in 2K, and NanoBanana Pro for creation & editing up to 4K.'],
      ['How do I upload an image?', 'In image-based models, choose "From Device" to upload directly or "URL Link" to paste a URL. Images are automatically uploaded to catbox.moe for free.'],
      ['How do I change my profile picture?', 'Go to "My Account", select "URL Link" or "From Device", then save. The picture updates instantly everywhere.'],
      ['Can I change my ID number?', 'The ID is fixed at account creation and cannot be changed by the user. Only the admin can change it from the control panel.'],
      ['What is My Gallery?', '"My Gallery" automatically saves every image you generate in one place, with zoom and download capability.'],
      ['How do I contact support?', 'Go to "Support", write your message with up to 2 image attachments. The team will reply directly inside the platform.'],
    ];

    var html = '<div class="pg">' +
      '<div class="pg-hdr">' +
        ILYA.backBtn('back-help') +
        '<div class="pg-title"><i class="fa-solid fa-circle-question" style="margin-inline-end:8px;color:var(--neon)"></i>' + ILYA.t('help') + '</div>' +
      '</div>' +
      '<div class="glass glass-p glass-r" style="margin-bottom:18px">' +
        '<div style="font-weight:700;margin-bottom:8px;font-size:.92rem"><i class="fa-solid fa-robot" style="color:var(--neon);margin-inline-end:8px"></i>' +
          (isAr?'كيف يمكننا مساعدتك؟':'How can we help you?') + '</div>' +
        '<p style="font-size:.82rem;color:var(--t2);line-height:1.8">' +
          (isAr?'ستجد هنا إجابات لأكثر الأسئلة شيوعاً. لمزيد من المساعدة يمكنك إرسال تذكرة دعم فني.':'Find answers to common questions here. For more help, send a support ticket.') + '</p>' +
      '</div>' +
      '<div class="sec-lbl"><i class="fa-solid fa-list-ul"></i>' + (isAr?'الأسئلة الشائعة':'FAQ') + '</div>' +
      faqs.map(function(f, i) {
        return '<div class="faq-item" data-i="' + i + '"><div class="faq-q"><span>' + ILYA.esc(f[0]) + '</span><i class="fa-solid fa-chevron-down"></i></div><div class="faq-a">' + ILYA.esc(f[1]) + '</div></div>';
      }).join('') +
      ILYA.footer() + '</div>';

    document.getElementById('page-help').innerHTML = html;
    ILYA.go('help');

    var bh = document.getElementById('back-help');
    if (bh) bh.addEventListener('click', function() { self.show(); });
    document.querySelectorAll('#page-help .faq-item').forEach(function(item) {
      item.querySelector('.faq-q').addEventListener('click', function() { item.classList.toggle('open'); });
    });
  },

  /* ── Support ─────────────────────────────────── */
  showSupport: function() {
    var self = this;
    ILYA.reg('support', function() { self.showSupport(); });
    var isAr = ILYA.state.lang === 'ar';

    var html = '<div class="pg">' +
      '<div class="pg-hdr">' +
        ILYA.backBtn('back-sup') +
        '<div class="pg-title"><i class="fa-solid fa-headset" style="margin-inline-end:8px;color:var(--neon)"></i>' + ILYA.t('support') + '</div>' +
      '</div>' +
      '<div class="glass glass-p" style="margin-bottom:20px">' +
        '<div style="font-weight:700;margin-bottom:14px;font-size:.9rem"><i class="fa-solid fa-paper-plane" style="color:var(--neon);margin-inline-end:8px"></i>' +
          (isAr?'إرسال تذكرة دعم جديدة':'Send New Support Ticket') + '</div>' +
        '<div class="fgrp"><label class="flbl">' + ILYA.t('your_msg') + '</label>' +
          '<textarea id="tk-msg" class="finp" rows="4" placeholder="' + ILYA.t('your_msg') + '" style="resize:vertical"></textarea></div>' +
        '<div class="fgrp"><label class="flbl">' + ILYA.t('attach') + ' 1</label>' +
          '<input id="tk-a1" type="url" class="finp" placeholder="https://... (' + (isAr?'اختياري':'optional') + ')"></div>' +
        '<div class="fgrp"><label class="flbl">' + ILYA.t('attach') + ' 2</label>' +
          '<input id="tk-a2" type="url" class="finp" placeholder="https://... (' + (isAr?'اختياري':'optional') + ')"></div>' +
        '<div id="tk-st" style="text-align:center;font-size:.82rem;margin-bottom:10px;display:none"></div>' +
        '<button class="btn btn-primary btn-full" id="tk-send"><i class="fa-solid fa-paper-plane"></i> ' + ILYA.t('send_ticket') + '</button>' +
      '</div>' +
      '<div class="sec-lbl"><i class="fa-solid fa-clock-rotate-left"></i>' + (isAr?'تذاكرك السابقة':'Your Tickets') + '</div>' +
      '<div id="tk-list"><div class="spinner"></div></div>' +
      ILYA.footer() + '</div>';

    document.getElementById('page-support').innerHTML = html;
    ILYA.go('support');

    var bs = document.getElementById('back-sup');
    if (bs) bs.addEventListener('click', function() { self.show(); });

    var sendBtn = document.getElementById('tk-send');
    if (sendBtn) {
      sendBtn.addEventListener('click', function() {
        var msg  = (document.getElementById('tk-msg') && document.getElementById('tk-msg').value.trim()) || '';
        var a1   = (document.getElementById('tk-a1') && document.getElementById('tk-a1').value.trim())  || null;
        var a2   = (document.getElementById('tk-a2') && document.getElementById('tk-a2').value.trim())  || null;
        var st   = document.getElementById('tk-st');
        if (!msg) { ILYA.toast(isAr?'الرسالة مطلوبة':'Message required','error'); return; }
        sendBtn.disabled = true;
        setTimeout(function() {
          DB.addTicket(ILYA.state.user.id, msg, a1, a2);
          sendBtn.disabled = false;
          document.getElementById('tk-msg').value = '';
          document.getElementById('tk-a1').value  = '';
          document.getElementById('tk-a2').value  = '';
          st.textContent = ILYA.t('ticket_sent'); st.style.color = '#44ff88'; st.style.display = 'block';
          ILYA.toast(ILYA.t('ticket_sent'), 'success');
          self._loadTickets();
          setTimeout(function() { st.style.display = 'none'; }, 3000);
        }, 280);
      });
    }

    this._loadTickets();
  },

  _loadTickets: function() {
    var list = document.getElementById('tk-list');
    if (!list) return;
    var isAr   = ILYA.state.lang === 'ar';
    var tickets = DB.tickets(ILYA.state.user && ILYA.state.user.id);

    if (!tickets.length) {
      list.innerHTML = '<div class="empty-state"><div class="empty-icon"><i class="fa-solid fa-ticket"></i></div><div class="empty-txt">' + ILYA.t('no_tickets') + '</div></div>';
      return;
    }

    list.innerHTML = tickets.map(function(tk) {
      return '<div class="ticket-card">' +
        '<div class="ticket-hdr">' +
          '<div class="ticket-meta">' +
            '<div class="ticket-meta-date">' + (tk.created_at||'').slice(0,16) + '</div>' +
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
        '</div>';
    }).join('');
  },
};
