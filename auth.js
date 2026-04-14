/* ═══════════════════════════════════════════════
   ILYA AI v3 — Auth Module (auth.js)
═══════════════════════════════════════════════ */
var ILYAAuth = {

  show: function() {
    ILYA.reg('auth', function() { ILYAAuth.show(); });
    var cfg  = ILYA.state.config;
    var isAr = ILYA.state.lang === 'ar';
    var sub  = isAr ? (cfg.welcome_ar || ILYA.t('welcome')) : (cfg.welcome_en || ILYA.t('welcome'));

    document.getElementById('page-auth').innerHTML =
      '<div class="auth-wrap">' +
        '<div class="auth-box">' +
          '<img src="https://iili.io/B04MxcX.md.jpg" class="auth-logo" alt="ILYA"' +
               ' onerror="this.style.cssText=\'background:linear-gradient(135deg,#3d0000,#8B0000);border-radius:50%\'">' +
          '<div class="auth-title">ILYA AI</div>' +
          '<div class="auth-sub">' + ILYA.esc(sub) + '</div>' +
          '<div class="auth-tabs">' +
            '<button class="auth-tab active" id="atab-login">' + ILYA.t('have_acc') + '</button>' +
            '<button class="auth-tab" id="atab-reg">' + ILYA.t('create_acc') + '</button>' +
          '</div>' +
          // Login form
          '<div id="f-login">' +
            '<div class="fgrp">' +
              '<label class="flbl"><i class="fa-solid fa-at"></i>' + ILYA.t('username') + '</label>' +
              '<input id="l-u" type="text" class="finp" placeholder="' + ILYA.t('username') + '" autocomplete="username">' +
            '</div>' +
            '<div class="fgrp">' +
              '<label class="flbl"><i class="fa-solid fa-lock"></i>' + ILYA.t('password') + '</label>' +
              '<div class="pw-wrap">' +
                '<input id="l-p" type="password" class="finp" placeholder="••••••••" autocomplete="current-password">' +
                '<button type="button" class="pw-eye" id="l-eye"><i class="fa-solid fa-eye"></i></button>' +
              '</div>' +
            '</div>' +
            '<div class="ferr" id="l-err"></div>' +
            '<button class="btn btn-primary btn-full" id="l-btn">' +
              '<i class="fa-solid fa-right-to-bracket"></i> ' + ILYA.t('login') +
            '</button>' +
          '</div>' +
          // Register form
          '<div id="f-reg" style="display:none">' +
            '<div class="fgrp">' +
              '<label class="flbl"><i class="fa-solid fa-signature"></i>' + ILYA.t('name') + '</label>' +
              '<input id="r-n" type="text" class="finp" placeholder="' + ILYA.t('name') + '" autocomplete="name">' +
            '</div>' +
            '<div class="fgrp">' +
              '<label class="flbl"><i class="fa-solid fa-at"></i>' + ILYA.t('username') + '</label>' +
              '<input id="r-u" type="text" class="finp" placeholder="' + ILYA.t('uname_hint') + '" autocomplete="username">' +
            '</div>' +
            '<div class="fgrp">' +
              '<label class="flbl"><i class="fa-solid fa-lock"></i>' + ILYA.t('password') + '</label>' +
              '<input id="r-p" type="password" class="finp" placeholder="••••••••" autocomplete="new-password">' +
            '</div>' +
            '<div class="fgrp">' +
              '<label class="flbl"><i class="fa-solid fa-lock"></i>' + ILYA.t('confirm_pw') + '</label>' +
              '<input id="r-p2" type="password" class="finp" placeholder="••••••••" autocomplete="new-password">' +
            '</div>' +
            '<div class="ferr" id="r-err"></div>' +
            '<button class="btn btn-primary btn-full" id="r-btn">' +
              '<i class="fa-solid fa-user-plus"></i> ' + ILYA.t('register') +
            '</button>' +
          '</div>' +
          // Footer
          '<div class="pg-foot" style="border-top:none;padding-top:18px">' +
            '<div>ILYA AI &copy; ' + new Date().getFullYear() + ' &mdash; ' + ILYA.t('copyright') + '</div>' +
            '<div>' +
              '<a href="' + (cfg.tg_link||'https://t.me/swc_t') + '" target="_blank" rel="noopener">' +
                '<i class="fa-brands fa-telegram"></i> Telegram</a>' +
              ' &nbsp;&middot;&nbsp; ' +
              '<a href="' + (cfg.dev_site||'https://black3web.github.io/Blackweb/') + '" target="_blank" rel="noopener">' +
                '<i class="fa-solid fa-globe"></i> ' + ILYA.t('dev_site_btn') + '</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    ILYA.go('auth');
    this._bind();
  },

  _bind: function() {
    var tLogin = document.getElementById('atab-login');
    var tReg   = document.getElementById('atab-reg');
    var fLogin = document.getElementById('f-login');
    var fReg   = document.getElementById('f-reg');

    function switchTo(isLogin) {
      tLogin.classList.toggle('active',  isLogin);
      tReg.classList.toggle('active',   !isLogin);
      fLogin.style.display = isLogin ? 'block' : 'none';
      fReg.style.display   = isLogin ? 'none'  : 'block';
      var le = document.getElementById('l-err');
      var re = document.getElementById('r-err');
      if (le) le.classList.remove('show');
      if (re) re.classList.remove('show');
    }

    tLogin.addEventListener('click', function() { switchTo(true); });
    tReg.addEventListener('click',   function() { switchTo(false); });

    document.getElementById('l-btn').addEventListener('click', function() { ILYAAuth._login(); });
    document.getElementById('r-btn').addEventListener('click', function() { ILYAAuth._register(); });

    var lp = document.getElementById('l-p');
    var rp2 = document.getElementById('r-p2');
    if (lp)  lp.addEventListener('keydown',  function(e) { if(e.key==='Enter') ILYAAuth._login(); });
    if (rp2) rp2.addEventListener('keydown', function(e) { if(e.key==='Enter') ILYAAuth._register(); });

    // Password toggle
    var eye = document.getElementById('l-eye');
    if (eye) {
      eye.addEventListener('click', function() {
        var inp  = document.getElementById('l-p');
        var show = inp.type === 'password';
        inp.type = show ? 'text' : 'password';
        eye.innerHTML = '<i class="fa-solid fa-eye' + (show?'-slash':'') + '"></i>';
      });
    }
  },

  _err: function(id, msg) {
    var el = document.getElementById(id);
    if (el) { el.textContent = msg; el.classList.add('show'); }
  },
  _clearErr: function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('show');
  },

  _login: function() {
    var u  = (document.getElementById('l-u')  && document.getElementById('l-u').value.trim())  || '';
    var pw = (document.getElementById('l-p')  && document.getElementById('l-p').value)          || '';
    this._clearErr('l-err');

    if (!u || !pw) { this._err('l-err', ILYA.t('err_fields')); return; }

    var btn = document.getElementById('l-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    setTimeout(function() {
      var res = DB.login(u, pw);
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> ' + ILYA.t('login');

      if (res.error === 'not_found' || res.error === 'wrong_pw') {
        ILYAAuth._err('l-err', ILYA.t('err_wrong_cred'));
      } else if (res.error === 'banned') {
        ILYAAuth._err('l-err', ILYA.t('err_banned') + ' (' + res.ban_type + ')');
      } else if (res.user) {
        ILYA.saveSession(res.user);
        DB.incVis();
        ILYADashboard.show();
        ILYA.toast(ILYA.t('greeting', res.user.name), 'success');
      }
    }, 400);
  },

  _register: function() {
    var cfg = ILYA.state.config;
    if (cfg.maint  === 'true')  { ILYA.toast(ILYA.t('err_maint'),   'warn'); return; }
    if (cfg.reg_on === 'false') { ILYA.toast(ILYA.t('err_reg_off'), 'warn'); return; }

    var n   = (document.getElementById('r-n')  && document.getElementById('r-n').value.trim())  || '';
    var u   = (document.getElementById('r-u')  && document.getElementById('r-u').value.trim())  || '';
    var pw  = (document.getElementById('r-p')  && document.getElementById('r-p').value)          || '';
    var pw2 = (document.getElementById('r-p2') && document.getElementById('r-p2').value)         || '';
    this._clearErr('r-err');

    if (!n || !u || !pw || !pw2) { this._err('r-err', ILYA.t('err_fields'));       return; }
    if (u.length < 4)             { this._err('r-err', ILYA.t('err_uname_short')); return; }
    if (pw !== pw2)               { this._err('r-err', ILYA.t('err_pw_match'));     return; }

    var btn = document.getElementById('r-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    setTimeout(function() {
      var res = DB.register(n, u, pw);
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> ' + ILYA.t('register');

      if (res.error === 'username_taken') {
        ILYAAuth._err('r-err', ILYA.t('err_uname_taken'));
      } else if (res.user) {
        ILYA.saveSession(res.user);
        DB.incVis();
        ILYADashboard.show();
        ILYA.toast(ILYA.state.lang === 'ar' ? 'تم إنشاء حسابك بنجاح! 🎉' : 'Account created! 🎉', 'success');
      }
    }, 440);
  },

  logout: function() {
    ILYA.clearSession();
    ILYA.closeSidebar();
    var self = this;
    setTimeout(function() {
      self.show();
      ILYA.toast(ILYA.state.lang === 'ar' ? 'تم تسجيل الخروج' : 'Logged out', 'info');
    }, 300);
  },
};
