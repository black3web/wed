// ============================================================
//   ILYA AI Platform — Auth Module (auth.js)
// ============================================================

const ILYAAuth = {

  show() {
    const page = document.getElementById('page-auth');
    page.innerHTML = this._render();
    ILYA.showPage('auth');
    this._bind();
  },

  _render() {
    const t = (k) => ILYA.t(k);
    return `
      <div class="auth-wrapper">
        <div class="auth-box">
          <img src="https://iili.io/B04MxcX.md.jpg" alt="ILYA" class="auth-logo" loading="lazy">
          <div class="auth-title">ILYA AI</div>
          <div class="auth-sub">${ILYA.state.config.welcome_text_ar || t('welcome_auth')}</div>

          <div class="auth-choice">
            <button class="choice-btn active" id="btn-choose-login">${t('have_account')}</button>
            <button class="choice-btn" id="btn-choose-register">${t('create_account')}</button>
          </div>

          <!-- Login Form -->
          <div id="login-form">
            <div class="form-group">
              <label class="form-label">${t('username')}</label>
              <input type="text" id="login-username" class="form-input"
                placeholder="${t('username')}" autocomplete="username">
            </div>
            <div class="form-group">
              <label class="form-label">${t('password')}</label>
              <input type="password" id="login-password" class="form-input"
                placeholder="••••••••" autocomplete="current-password">
            </div>
            <div id="login-error" style="color:#ff6688;font-size:.82rem;margin-bottom:14px;text-align:center;display:none"></div>
            <button class="btn-primary" id="login-btn">${t('login')}</button>
          </div>

          <!-- Register Form -->
          <div id="register-form" style="display:none">
            <div class="form-group">
              <label class="form-label">${t('name')}</label>
              <input type="text" id="reg-name" class="form-input" placeholder="${t('name')}">
            </div>
            <div class="form-group">
              <label class="form-label">${t('username')}</label>
              <input type="text" id="reg-username" class="form-input"
                placeholder="${t('username_hint')}" autocomplete="username">
            </div>
            <div class="form-group">
              <label class="form-label">${t('password')}</label>
              <input type="password" id="reg-password" class="form-input"
                placeholder="••••••••" autocomplete="new-password">
            </div>
            <div class="form-group">
              <label class="form-label">${t('confirm_password')}</label>
              <input type="password" id="reg-confirm" class="form-input"
                placeholder="••••••••" autocomplete="new-password">
            </div>
            <div id="reg-error" style="color:#ff6688;font-size:.82rem;margin-bottom:14px;text-align:center;display:none"></div>
            <button class="btn-primary" id="register-btn">${t('register')}</button>
          </div>
        </div>
      </div>
    `;
  },

  _bind() {
    const loginForm    = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const btnLogin     = document.getElementById('btn-choose-login');
    const btnRegister  = document.getElementById('btn-choose-register');

    btnLogin.addEventListener('click', () => {
      loginForm.style.display    = 'block';
      registerForm.style.display = 'none';
      btnLogin.classList.add('active');
      btnRegister.classList.remove('active');
    });

    btnRegister.addEventListener('click', () => {
      loginForm.style.display    = 'none';
      registerForm.style.display = 'block';
      btnRegister.classList.add('active');
      btnLogin.classList.remove('active');
    });

    // Login submit
    const loginBtn = document.getElementById('login-btn');
    loginBtn.addEventListener('click', () => this._doLogin());
    document.getElementById('login-password').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._doLogin();
    });

    // Register submit
    const regBtn = document.getElementById('register-btn');
    regBtn.addEventListener('click', () => this._doRegister());
    document.getElementById('reg-confirm').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._doRegister();
    });
  },

  async _doLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errEl    = document.getElementById('login-error');
    const btn      = document.getElementById('login-btn');

    errEl.style.display = 'none';

    if (!username || !password) {
      errEl.textContent = ILYA.state.lang === 'ar'
        ? 'يرجى إدخال جميع البيانات'
        : 'Please fill all fields';
      errEl.style.display = 'block';
      return;
    }

    btn.disabled = true;
    btn.textContent = ILYA.state.lang === 'ar' ? 'جاري الدخول...' : 'Logging in...';

    const res = await ILYA.api('/auth/login', 'POST', { username, password });

    btn.disabled = false;
    btn.textContent = ILYA.t('login');

    if (res.ok) {
      ILYA.saveSession(res.data.token, res.data.user);
      ILYADashboard.show();
    } else {
      errEl.textContent = res.data.error || (ILYA.state.lang === 'ar' ? 'خطأ في تسجيل الدخول' : 'Login failed');
      errEl.style.display = 'block';
    }
  },

  async _doRegister() {
    const name     = document.getElementById('reg-name').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const confirm  = document.getElementById('reg-confirm').value.trim();
    const errEl    = document.getElementById('reg-error');
    const btn      = document.getElementById('register-btn');

    errEl.style.display = 'none';

    if (!name || !username || !password || !confirm) {
      errEl.textContent = ILYA.state.lang === 'ar' ? 'جميع الحقول مطلوبة' : 'All fields required';
      errEl.style.display = 'block'; return;
    }
    if (username.length < 4) {
      errEl.textContent = ILYA.state.lang === 'ar'
        ? 'المعرف يجب أن يكون 4 أحرف على الأقل'
        : 'Username must be at least 4 characters';
      errEl.style.display = 'block'; return;
    }
    if (password !== confirm) {
      errEl.textContent = ILYA.state.lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match';
      errEl.style.display = 'block'; return;
    }

    btn.disabled = true;
    btn.textContent = ILYA.state.lang === 'ar' ? 'جاري الإنشاء...' : 'Creating...';

    const res = await ILYA.api('/auth/register', 'POST', { name, username, password, confirm_password: confirm });

    btn.disabled = false;
    btn.textContent = ILYA.t('register');

    if (res.ok) {
      ILYA.saveSession(res.data.token, res.data.user);
      ILYADashboard.show();
    } else {
      errEl.textContent = res.data.error || (ILYA.state.lang === 'ar' ? 'فشل إنشاء الحساب' : 'Registration failed');
      errEl.style.display = 'block';
    }
  },

  async logout() {
    await ILYA.api('/auth/logout', 'POST');
    ILYA.clearSession();
    ILYA.closeSidebar();
    ILYAAuth.show();
    ILYA.toast(ILYA.state.lang === 'ar' ? 'تم تسجيل الخروج' : 'Logged out', 'info');
  }
};
