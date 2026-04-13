/* ═══════════════════════════════════════════════════════════
   ILYA AI Platform — Auth Module (auth.js)
═══════════════════════════════════════════════════════════ */
const ILYAAuth = {

  show() {
    ILYA.registerPageRender('auth', () => this.show());
    const cfg = ILYA.state.config;
    const t   = k => ILYA.t(k);
    const welcome = ILYA.state.lang === 'ar' ? (cfg.welcome_ar || '') : (cfg.welcome_en || '');

    document.getElementById('page-auth').innerHTML = `
      <div class="auth-page">
        <div class="auth-box">
          <img src="https://iili.io/B04MxcX.md.jpg" class="auth-logo" alt="ILYA"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22/>'">
          <div class="auth-title">ILYA AI</div>
          <div class="auth-sub">${ILYA.esc(welcome) || t('welcome')}</div>

          <div class="auth-tabs">
            <button class="auth-tab active" id="tab-login">${t('have_acc')}</button>
            <button class="auth-tab"        id="tab-reg">${t('create_acc')}</button>
          </div>

          <!-- Login -->
          <div id="form-login">
            <div class="form-grp">
              <label class="form-lbl"><i class="fa-solid fa-user" style="margin-inline-end:6px;color:var(--c-t4)"></i>${t('username')}</label>
              <input id="l-user" type="text" class="form-ctrl" placeholder="${t('username')}" autocomplete="username">
            </div>
            <div class="form-grp">
              <label class="form-lbl"><i class="fa-solid fa-lock" style="margin-inline-end:6px;color:var(--c-t4)"></i>${t('password')}</label>
              <input id="l-pw" type="password" class="form-ctrl" placeholder="••••••••" autocomplete="current-password">
            </div>
            <div class="form-error" id="l-err"></div>
            <button class="btn btn-primary" id="l-btn">
              <i class="fa-solid fa-right-to-bracket"></i> ${t('login')}
            </button>
          </div>

          <!-- Register -->
          <div id="form-reg" style="display:none">
            <div class="form-grp">
              <label class="form-lbl"><i class="fa-solid fa-signature" style="margin-inline-end:6px;color:var(--c-t4)"></i>${t('name')}</label>
              <input id="r-name" type="text" class="form-ctrl" placeholder="${t('name')}">
            </div>
            <div class="form-grp">
              <label class="form-lbl"><i class="fa-solid fa-at" style="margin-inline-end:6px;color:var(--c-t4)"></i>${t('username')}</label>
              <input id="r-user" type="text" class="form-ctrl" placeholder="${t('uname_hint')}" autocomplete="username">
            </div>
            <div class="form-grp">
              <label class="form-lbl"><i class="fa-solid fa-lock" style="margin-inline-end:6px;color:var(--c-t4)"></i>${t('password')}</label>
              <input id="r-pw" type="password" class="form-ctrl" placeholder="••••••••" autocomplete="new-password">
            </div>
            <div class="form-grp">
              <label class="form-lbl"><i class="fa-solid fa-lock" style="margin-inline-end:6px;color:var(--c-t4)"></i>${t('confirm_pw')}</label>
              <input id="r-pw2" type="password" class="form-ctrl" placeholder="••••••••" autocomplete="new-password">
            </div>
            <div class="form-error" id="r-err"></div>
            <button class="btn btn-primary" id="r-btn">
              <i class="fa-solid fa-user-plus"></i> ${t('register')}
            </button>
          </div>

          <!-- Footer -->
          <div class="page-foot" style="border-top:none;padding-top:16px">
            <div>ILYA AI © ${new Date().getFullYear()} — ${t('copyright')}</div>
            <div>
              <a href="${cfg.tg_link||'https://t.me/swc_t'}" target="_blank">
                <i class="fa-brands fa-telegram"></i> Telegram
              </a>
              &nbsp;·&nbsp;
              <a href="${cfg.dev_site||'https://black3web.github.io/Blackweb/'}" target="_blank">
                <i class="fa-solid fa-globe"></i> ${t('dev_site_btn')}
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    ILYA.showPage('auth');
    this._bind();
  },

  _bind() {
    const tabLogin = document.getElementById('tab-login');
    const tabReg   = document.getElementById('tab-reg');
    const fLogin   = document.getElementById('form-login');
    const fReg     = document.getElementById('form-reg');

    const switchTo = (isLogin) => {
      tabLogin.classList.toggle('active',  isLogin);
      tabReg.classList.toggle('active',   !isLogin);
      fLogin.style.display = isLogin ? 'block' : 'none';
      fReg.style.display   = isLogin ? 'none'  : 'block';
      document.getElementById('l-err').classList.remove('show');
      document.getElementById('r-err').classList.remove('show');
    };

    tabLogin.addEventListener('click', () => switchTo(true));
    tabReg.addEventListener('click',   () => switchTo(false));

    document.getElementById('l-btn').addEventListener('click', () => this._login());
    document.getElementById('r-btn').addEventListener('click', () => this._register());

    // Enter key
    document.getElementById('l-pw')?.addEventListener('keydown',  e => { if(e.key==='Enter') this._login(); });
    document.getElementById('r-pw2')?.addEventListener('keydown', e => { if(e.key==='Enter') this._register(); });
  },

  _setErr(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
  },
  _clearErr(id) { document.getElementById(id)?.classList.remove('show'); },

  _login() {
    const username = document.getElementById('l-user')?.value?.trim();
    const password = document.getElementById('l-pw')?.value;
    this._clearErr('l-err');

    if (!username || !password) { this._setErr('l-err', ILYA.t('err_fields')); return; }

    const btn = document.getElementById('l-btn');
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;

    // Simulate async (looks professional)
    setTimeout(() => {
      const result = DB.login(username, password);
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> ${ILYA.t('login')}`;

      if (result.error === 'user_not_found' || result.error === 'wrong_password') {
        this._setErr('l-err', ILYA.t('err_wrong_cred'));
      } else if (result.error === 'banned') {
        this._setErr('l-err', `${ILYA.t('err_banned')} (${result.ban_type})`);
      } else if (result.user) {
        ILYA.saveSession(result.user);
        DB.incVisitors();
        ILYADashboard.show();
        ILYA.toast(ILYA.state.lang === 'ar' ? `مرحباً، ${result.user.name}` : `Welcome, ${result.user.name}`, 'success');
      }
    }, 420);
  },

  _register() {
    const cfg  = ILYA.state.config;
    if (cfg.maintenance === 'true') { ILYA.toast(ILYA.t('err_maint'), 'warn'); return; }
    if (cfg.reg_enabled === 'false') { ILYA.toast(ILYA.t('err_reg_off'), 'warn'); return; }

    const name = document.getElementById('r-name')?.value?.trim();
    const user = document.getElementById('r-user')?.value?.trim();
    const pw   = document.getElementById('r-pw')?.value;
    const pw2  = document.getElementById('r-pw2')?.value;
    this._clearErr('r-err');

    if (!name || !user || !pw || !pw2) { this._setErr('r-err', ILYA.t('err_fields')); return; }
    if (user.length < 4)  { this._setErr('r-err', ILYA.t('err_uname_short')); return; }
    if (pw !== pw2)        { this._setErr('r-err', ILYA.t('err_pw_match'));    return; }

    const btn = document.getElementById('r-btn');
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;

    setTimeout(() => {
      const result = DB.register(name, user, pw);
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-user-plus"></i> ${ILYA.t('register')}`;

      if (result.error === 'username_taken') {
        this._setErr('r-err', ILYA.t('err_uname_taken'));
      } else if (result.user) {
        ILYA.saveSession(result.user);
        DB.incVisitors();
        ILYADashboard.show();
        ILYA.toast(ILYA.state.lang === 'ar' ? 'تم إنشاء حسابك بنجاح!' : 'Account created!', 'success');
      }
    }, 480);
  },

  logout() {
    ILYA.clearSession();
    ILYA.closeSidebar();
    setTimeout(() => {
      ILYAAuth.show();
      ILYA.toast(ILYA.state.lang === 'ar' ? 'تم تسجيل الخروج' : 'Logged out', 'info');
    }, 350);
  }
};
