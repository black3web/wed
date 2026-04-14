/* ═══════════════════════════════════════════════════════════
   ILYA AI Platform v3 — Auth Module (auth.js)
═══════════════════════════════════════════════════════════ */
const ILYAAuth = {

  show() {
    ILYA.reg('auth', () => this.show());
    const cfg  = ILYA.state.config;
    const t    = k => ILYA.t(k);
    const isAr = ILYA.state.lang === 'ar';
    const sub  = isAr ? (cfg.welcome_ar || t('welcome')) : (cfg.welcome_en || t('welcome'));

    document.getElementById('page-auth').innerHTML = `
      <div class="auth-wrap">
        <div class="auth-box">
          <img src="https://iili.io/B04MxcX.md.jpg" class="auth-logo" alt="ILYA"
               onerror="this.style.background='linear-gradient(135deg,#3d0000,#8B0000)'">
          <div class="auth-title">ILYA AI</div>
          <div class="auth-sub">${ILYA.esc(sub)}</div>

          <div class="auth-tabs">
            <button class="auth-tab active" id="atab-login">${t('have_acc')}</button>
            <button class="auth-tab"        id="atab-reg">${t('create_acc')}</button>
          </div>

          <!-- Login -->
          <div id="f-login">
            <div class="form-grp">
              <label class="form-lbl"><i class="fa-solid fa-at"></i> ${t('username')}</label>
              <input id="l-u" type="text" class="form-ctrl" placeholder="${t('username')}" autocomplete="username">
            </div>
            <div class="form-grp">
              <label class="form-lbl"><i class="fa-solid fa-lock"></i> ${t('password')}</label>
              <div style="position:relative">
                <input id="l-p" type="password" class="form-ctrl" placeholder="••••••••" autocomplete="current-password">
                <button type="button" class="pw-toggle" id="l-eye" aria-label="Show password"
                  style="position:absolute;top:50%;inset-inline-end:12px;transform:translateY(-50%);color:var(--t4);background:none;border:none;cursor:pointer;font-size:.9rem">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </div>
            </div>
            <div class="form-err" id="l-err"></div>
            <button class="btn btn-primary btn-full" id="l-btn">
              <i class="fa-solid fa-right-to-bracket"></i> ${t('login')}
            </button>
          </div>

          <!-- Register -->
          <div id="f-reg" style="display:none">
            <div class="form-grp">
              <label class="form-lbl"><i class="fa-solid fa-signature"></i> ${t('name')}</label>
              <input id="r-n" type="text" class="form-ctrl" placeholder="${t('name')}" autocomplete="name">
            </div>
            <div class="form-grp">
              <label class="form-lbl"><i class="fa-solid fa-at"></i> ${t('username')}</label>
              <input id="r-u" type="text" class="form-ctrl" placeholder="${t('uname_hint')}" autocomplete="username">
            </div>
            <div class="form-grp">
              <label class="form-lbl"><i class="fa-solid fa-lock"></i> ${t('password')}</label>
              <input id="r-p" type="password" class="form-ctrl" placeholder="••••••••" autocomplete="new-password">
            </div>
            <div class="form-grp">
              <label class="form-lbl"><i class="fa-solid fa-lock"></i> ${t('confirm_pw')}</label>
              <input id="r-p2" type="password" class="form-ctrl" placeholder="••••••••" autocomplete="new-password">
            </div>
            <div class="form-err" id="r-err"></div>
            <button class="btn btn-primary btn-full" id="r-btn">
              <i class="fa-solid fa-user-plus"></i> ${t('register')}
            </button>
          </div>

          <div class="page-foot" style="border-top:none;padding-top:18px">
            <div>ILYA AI © ${new Date().getFullYear()} — ${t('copyright')}</div>
            <div>
              <a href="${cfg.tg_link || 'https://t.me/swc_t'}" target="_blank"><i class="fa-brands fa-telegram"></i> Telegram</a>
              &nbsp;·&nbsp;
              <a href="${cfg.dev_site || 'https://black3web.github.io/Blackweb/'}" target="_blank"><i class="fa-solid fa-globe"></i> ${t('dev_site_btn')}</a>
            </div>
          </div>
        </div>
      </div>
    `;

    ILYA.go('auth');
    this._bind();
  },

  _bind() {
    const tLogin = document.getElementById('atab-login');
    const tReg   = document.getElementById('atab-reg');
    const fLogin  = document.getElementById('f-login');
    const fReg    = document.getElementById('f-reg');

    const switchTo = isLogin => {
      tLogin.classList.toggle('active',  isLogin);
      tReg.classList.toggle('active',   !isLogin);
      fLogin.style.display = isLogin ? 'block' : 'none';
      fReg.style.display   = isLogin ? 'none'  : 'block';
      document.getElementById('l-err').classList.remove('show');
      document.getElementById('r-err').classList.remove('show');
    };

    tLogin.addEventListener('click', () => switchTo(true));
    tReg.addEventListener('click',   () => switchTo(false));

    document.getElementById('l-btn').addEventListener('click', () => this._login());
    document.getElementById('r-btn').addEventListener('click', () => this._register());

    document.getElementById('l-p')?.addEventListener('keydown',  e => { if (e.key === 'Enter') this._login(); });
    document.getElementById('r-p2')?.addEventListener('keydown', e => { if (e.key === 'Enter') this._register(); });

    // Password visibility toggle
    const eye = document.getElementById('l-eye');
    const pw  = document.getElementById('l-p');
    eye?.addEventListener('click', () => {
      const show = pw.type === 'password';
      pw.type = show ? 'text' : 'password';
      eye.innerHTML = `<i class="fa-solid fa-eye${show ? '-slash' : ''}"></i>`;
    });
  },

  _err(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.classList.add('show'); }
  },
  _clearErr(id) { document.getElementById(id)?.classList.remove('show'); },

  _login() {
    const u  = document.getElementById('l-u')?.value?.trim();
    const pw = document.getElementById('l-p')?.value;
    this._clearErr('l-err');

    if (!u || !pw) { this._err('l-err', ILYA.t('err_fields')); return; }

    const btn = document.getElementById('l-btn');
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;

    setTimeout(() => {
      const res = DB.login(u, pw);
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> ${ILYA.t('login')}`;

      if (res.error === 'not_found' || res.error === 'wrong_pw') {
        this._err('l-err', ILYA.t('err_wrong_cred'));
      } else if (res.error === 'banned') {
        this._err('l-err', `${ILYA.t('err_banned')} (${res.ban_type})`);
      } else if (res.user) {
        ILYA.saveSession(res.user);
        DB.incVis();
        ILYADashboard.show();
        ILYA.toast(ILYA.t('greeting', res.user.name), 'success');
      }
    }, 400);
  },

  _register() {
    const cfg = ILYA.state.config;
    if (cfg.maint === 'true')  { ILYA.toast(ILYA.t('err_maint'),   'warn'); return; }
    if (cfg.reg_on === 'false') { ILYA.toast(ILYA.t('err_reg_off'), 'warn'); return; }

    const n   = document.getElementById('r-n')?.value?.trim();
    const u   = document.getElementById('r-u')?.value?.trim();
    const pw  = document.getElementById('r-p')?.value;
    const pw2 = document.getElementById('r-p2')?.value;
    this._clearErr('r-err');

    if (!n || !u || !pw || !pw2) { this._err('r-err', ILYA.t('err_fields'));       return; }
    if (u.length < 4)             { this._err('r-err', ILYA.t('err_uname_short')); return; }
    if (pw !== pw2)               { this._err('r-err', ILYA.t('err_pw_match'));     return; }

    const btn = document.getElementById('r-btn');
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;

    setTimeout(() => {
      const res = DB.register(n, u, pw);
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-user-plus"></i> ${ILYA.t('register')}`;

      if (res.error === 'username_taken') {
        this._err('r-err', ILYA.t('err_uname_taken'));
      } else if (res.user) {
        ILYA.saveSession(res.user);
        DB.incVis();
        ILYADashboard.show();
        ILYA.toast(ILYA.state.lang === 'ar' ? 'تم إنشاء حسابك بنجاح! 🎉' : 'Account created! 🎉', 'success');
      }
    }, 440);
  },

  logout() {
    ILYA.clearSession();
    ILYA.closeSidebar();
    setTimeout(() => {
      ILYAAuth.show();
      ILYA.toast(ILYA.state.lang === 'ar' ? 'تم تسجيل الخروج' : 'Logged out', 'info');
    }, 320);
  },
};
