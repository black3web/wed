/* ═══════════════════════════════════════════════
   ILYA AI v3 — AI Services (ai.js)
   7 Models · Retry · Upload · Gallery Save
═══════════════════════════════════════════════ */
var ILYAAI = {

  _uploadedUrl: '',

  /* ── Model List ─────────────────────────────── */
  showList: function() {
    var self = this;
    ILYA.reg('ai', function() { self.showList(); });
    var isAr = ILYA.state.lang === 'ar';
    var cfg  = ILYA.state.config;
    var isRtl= document.documentElement.dir === 'rtl';

    var html = '<div class="pg">' +
      '<div class="pg-hdr">' +
        ILYA.backBtn('back-ai') +
        '<div class="pg-title"><i class="fa-solid fa-wand-magic-sparkles" style="margin-inline-end:8px;color:var(--neon)"></i>' + ILYA.t('ai_srv') + '</div>' +
      '</div>' +
      '<div class="note-info" style="margin-bottom:16px">' +
        '<i class="fa-solid fa-circle-info" style="margin-inline-end:7px"></i>' +
        (isAr ? 'اختر النموذج المناسب. انقر على الصورة المصغرة لتكبيرها.' : 'Choose a model. Tap the thumbnail to enlarge it.') +
      '</div>' +
      '<div id="model-list-wrap"></div>' +
      ILYA.footer() + '</div>';

    document.getElementById('page-ai').innerHTML = html;
    ILYA.go('ai');

    var backBtn = document.getElementById('back-ai');
    if (backBtn) backBtn.addEventListener('click', function() { ILYADashboard.show(); });

    var wrap = document.getElementById('model-list-wrap');
    AI_MODELS.forEach(function(model) {
      var enabled  = cfg[model.cfgKey] !== 'false';
      var name     = isAr ? model.nameAr : model.nameEn;
      var desc     = isAr ? model.descAr : model.descEn;
      var typeMap  = { text: isAr?'نص → صورة':'Text → Image', image: isAr?'صورة → صورة':'Image → Image', both: isAr?'إنشاء وتعديل':'Create & Edit' };
      var typeLabel = typeMap[model.type] || '';

      var card = document.createElement('div');
      card.className = 'model-card' + (enabled ? '' : ' dis');
      card.innerHTML =
        '<img src="' + ILYA.esc(model.img) + '" class="model-thumb" alt="' + ILYA.esc(name) + '" loading="lazy"' +
             ' onerror="this.src=\'https://iili.io/B04MxcX.md.jpg\'">' +
        '<div class="model-info">' +
          '<div class="model-name"><i class="fa-solid ' + model.icon + '"></i>' + ILYA.esc(name) + '</div>' +
          '<div class="model-desc">' + ILYA.esc(desc) + '</div>' +
          '<div class="model-tags">' +
            '<span class="model-tag">' + typeLabel + '</span>' +
            (model.isNew  ? '<span class="model-tag tnew">NEW</span>' : '') +
            (!enabled     ? '<span class="model-tag" style="background:rgba(255,100,0,.15);color:#ff8844">' + (isAr?'معطّل':'Disabled') + '</span>' : '') +
          '</div>' +
        '</div>' +
        (enabled ? '<i class="fa-solid ' + (isRtl?'fa-chevron-left':'fa-chevron-right') + ' model-arr"></i>' : '');

      // Thumbnail → lightbox (stop propagation so card click doesn't fire)
      var thumb = card.querySelector('.model-thumb');
      if (thumb) {
        thumb.addEventListener('click', function(e) {
          e.stopPropagation();
          ILYA.openLightbox(model.img);
        });
      }

      if (enabled) {
        card.addEventListener('click', function() { self.showModel(model.id); });
      }
      wrap.appendChild(card);
    });
  },

  /* ── Model Interface ───────────────────────── */
  showModel: function(modelId) {
    var self  = this;
    var model = null;
    for (var i = 0; i < AI_MODELS.length; i++) {
      if (AI_MODELS[i].id === modelId) { model = AI_MODELS[i]; break; }
    }
    if (!model) return;

    ILYA.state.modelId  = modelId;
    this._uploadedUrl   = '';
    ILYA.reg('model', function() { self.showModel(modelId); });

    var isAr  = ILYA.state.lang === 'ar';
    var name  = isAr ? model.nameAr : model.nameEn;
    var desc  = isAr ? model.descAr : model.descEn;
    var hasSettings = model.params && Object.keys(model.params).length > 0;

    var html = '<div class="pg">' +
      '<div class="pg-hdr">' +
        ILYA.backBtn('back-model') +
        '<div class="pg-title" style="font-size:.95rem">' + ILYA.esc(name) + '</div>' +
      '</div>' +
      '<div class="gen-wrap">' +
        // Hero
        '<div class="model-hero">' +
          '<img src="' + ILYA.esc(model.img) + '" class="hero-img" alt="' + ILYA.esc(name) + '"' +
               ' id="hero-img" onerror="this.src=\'https://iili.io/B04MxcX.md.jpg\'">' +
          '<div class="hero-name"><i class="fa-solid ' + model.icon + '" style="margin-inline-end:8px"></i>' + ILYA.esc(name) + '</div>' +
          '<div class="hero-desc">' + ILYA.esc(desc) + '</div>' +
        '</div>' +
        // Settings (collapsible)
        (hasSettings ? this._buildSettings(model) : '') +
        // Image input
        (model.type === 'image' || model.type === 'both' ? this._buildImgInput(model) : '') +
        // Text input
        (model.type === 'text' || model.type === 'both' ?
          '<div class="gen-input" id="gen-input-area">' +
            '<textarea id="prompt-input" class="gen-ta" rows="3" placeholder="' + ILYA.t('write_desc') + '"></textarea>' +
            '<div class="gen-foot">' +
              '<span class="gen-hint"><i class="fa-solid fa-lightbulb" style="margin-inline-end:4px;opacity:.5"></i>' +
                (isAr?'كن تفصيلياً للحصول على نتائج أفضل':'Be detailed for better results') + '</span>' +
              '<button class="gen-btn" id="gen-btn"><i class="fa-solid fa-bolt" id="gen-ico"></i><span id="gen-txt">' + ILYA.t('send') + '</span></button>' +
            '</div>' +
          '</div>' :
          '<div style="text-align:center;padding:6px 0">' +
            '<button class="gen-btn" id="gen-btn" style="margin:0 auto"><i class="fa-solid fa-bolt" id="gen-ico"></i><span id="gen-txt">' + ILYA.t('send') + '</span></button>' +
          '</div>') +
        // Results area
        '<div id="gen-results"></div>' +
      '</div>' +
      ILYA.footer() + '</div>';

    document.getElementById('page-model').innerHTML = html;
    ILYA.go('model');

    // Back
    var bb = document.getElementById('back-model');
    if (bb) bb.addEventListener('click', function() { self.showList(); });

    // Hero image lightbox
    var hi = document.getElementById('hero-img');
    if (hi) hi.addEventListener('click', function() { ILYA.openLightbox(model.img); });

    // Settings toggle
    var st = document.getElementById('set-toggle');
    if (st) st.addEventListener('click', function() {
      var sc = document.getElementById('set-card');
      if (sc) sc.classList.toggle('open');
    });

    // Image input bindings
    this._bindImgInput(model);

    // Send button
    var genBtn = document.getElementById('gen-btn');
    if (genBtn) genBtn.addEventListener('click', function() { self._generate(model); });

    // Ctrl+Enter or Enter on textarea
    var ta = document.getElementById('prompt-input');
    if (ta) {
      ta.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          self._generate(model);
        }
      });
    }
  },

  /* ── Build Settings ─────────────────────────── */
  _buildSettings: function(model) {
    var isAr = ILYA.state.lang === 'ar';
    var p    = model.params;

    function sel(id, lbl, icon, opts) {
      return '<div><div class="set-lbl"><i class="fa-solid ' + icon + '"></i>' + lbl + '</div>' +
        '<select id="' + id + '" class="finp">' +
        opts.map(function(o) {
          if (typeof o === 'object') return '<option value="' + ILYA.esc(o.v) + '">' + ILYA.esc(o.l) + '</option>';
          return '<option value="' + ILYA.esc(o) + '">' + ILYA.esc(o) + '</option>';
        }).join('') +
        '</select></div>';
    }

    var inner = '';

    if (model.id === 'v1') {
      inner = '<div class="set-grid">' +
        sel('p-ratio',   ILYA.t('ratio'),   'fa-crop',       p.ratios) +
        sel('p-upscale', ILYA.t('quality'), 'fa-star',       p.upscales) +
        '</div><div class="set-grid full" style="margin-top:10px">' +
        sel('p-count',   ILYA.t('count'),   'fa-copy',       p.counts) +
        '</div>';

    } else if (model.id === 'anime') {
      inner = '<div class="set-grid">' +
        sel('p-ratio',  ILYA.t('ratio'),  'fa-crop',       p.ratios) +
        sel('p-gender', ILYA.t('gender'), 'fa-venus-mars', p.genders) +
        '</div><div class="set-grid full" style="margin-top:10px">' +
        sel('p-style',  ILYA.t('style'),  'fa-palette',    p.styles.map(function(s) { return { v:s, l:s.replace(/_/g,' ') }; })) +
        '</div>';

    } else if (model.id === 'seed') {
      inner = '<div class="set-grid">' +
        sel('p-ratio', ILYA.t('ratio'), 'fa-crop',   p.ratios) +
        sel('p-style', ILYA.t('style'), 'fa-palette',p.styles.map(function(s) { return { v:s, l:s.replace(/_/g,' ') }; })) +
        '</div>' +
        '<div class="note-warn" style="margin-top:10px;font-size:.77rem">' +
          '<i class="fa-solid fa-triangle-exclamation" style="margin-inline-end:6px"></i>' +
          (isAr ? 'يجب كتابة الوصف باللغة الإنجليزية لهذا النموذج' : 'Description must be in English for this model') +
        '</div>';

    } else if (model.id === 'pfoto') {
      var gOpts = p.genders.map(function(g) {
        return { v:g, l: g === 'male' ? (isAr?'ذكر':'Male') : (isAr?'أنثى':'Female') };
      });
      inner = '<div class="set-grid">' +
        sel('p-ratio',  ILYA.t('ratio'),  'fa-crop',       p.ratios) +
        sel('p-gender', ILYA.t('gender'), 'fa-venus-mars', gOpts) +
        '</div><div class="set-grid full" style="margin-top:10px">' +
        sel('p-style',  ILYA.t('style'),  'fa-palette',    p.styles.map(function(s) { return { v:s, l:s.replace(/_/g,' ') }; })) +
        '</div>';

    } else if (model.id === 'flux') {
      inner = '<div class="set-grid full">' +
        sel('p-ratio', ILYA.t('ratio'), 'fa-crop', p.ratios) +
        '</div>';

    } else if (model.id === 'nbp') {
      inner = '<div class="set-grid">' +
        sel('p-ratio', ILYA.t('ratio'),      'fa-crop',   p.ratios) +
        sel('p-res',   ILYA.t('resolution'), 'fa-expand', p.resolutions) +
        '</div>';
    }

    return '<div class="set-card" id="set-card">' +
      '<div class="set-toggle" id="set-toggle">' +
        '<span><i class="fa-solid fa-sliders" style="margin-inline-end:8px;color:var(--t4)"></i>' + ILYA.t('settings') + '</span>' +
        '<i class="fa-solid fa-chevron-down arr"></i>' +
      '</div>' +
      '<div class="set-body"><div class="set-inner">' + inner + '</div></div>' +
      '</div>';
  },

  /* ── Build Image Input ───────────────────────── */
  _buildImgInput: function(model) {
    var isAr = ILYA.state.lang === 'ar';
    return '<div class="glass glass-p" id="img-input-wrap">' +
      '<div class="set-lbl"><i class="fa-solid fa-image"></i>' + (isAr?'الصورة المدخلة':'Input Image') + '</div>' +
      '<div class="img-tabs">' +
        '<button class="img-tab active" id="img-tab-file"><i class="fa-solid fa-upload" style="margin-inline-end:5px"></i>' + ILYA.t('from_device') + '</button>' +
        '<button class="img-tab" id="img-tab-url"><i class="fa-solid fa-link" style="margin-inline-end:5px"></i>' + ILYA.t('from_url') + '</button>' +
      '</div>' +
      '<div id="img-file-pnl">' +
        '<div class="upload-zone" id="img-zone">' +
          '<input type="file" id="img-file" accept="image/png,image/jpeg,image/webp">' +
          '<span class="up-ico"><i class="fa-solid fa-cloud-arrow-up"></i></span>' +
          '<div class="up-txt">' + ILYA.t('drag_drop') + '</div>' +
          '<div class="up-sub">' + ILYA.t('drag_drop_sub') + '</div>' +
        '</div>' +
        '<div class="up-preview" id="img-preview"><img src="" id="img-prev-src" alt="Preview"><button class="up-clear" id="img-clear"><i class="fa-solid fa-xmark"></i></button></div>' +
        '<div class="up-prog" id="img-prog"><i class="fa-solid fa-circle-notch fa-spin" style="color:var(--neon)"></i><div class="up-pb"><div class="up-pf" id="img-prog-fill" style="width:0%"></div></div><span id="img-prog-txt">0%</span></div>' +
      '</div>' +
      '<div id="img-url-pnl" style="display:none">' +
        '<input id="img-url-inp" type="url" class="finp" placeholder="https://...">' +
      '</div>' +
      // Send button for pure image models
      (model.type === 'image' ?
        '<div style="text-align:center;margin-top:12px">' +
          '<button class="gen-btn" id="gen-btn" style="margin:0 auto"><i class="fa-solid fa-bolt" id="gen-ico"></i><span id="gen-txt">' + ILYA.t('send') + '</span></button>' +
        '</div>' : '') +
      '</div>';
  },

  /* ── Bind Image Input ───────────────────────── */
  _bindImgInput: function(model) {
    var self = this;
    if (model.type !== 'image' && model.type !== 'both') return;
    this._uploadedUrl = '';

    var isAr    = ILYA.state.lang === 'ar';
    var tabFile = document.getElementById('img-tab-file');
    var tabUrl  = document.getElementById('img-tab-url');
    var filePnl = document.getElementById('img-file-pnl');
    var urlPnl  = document.getElementById('img-url-pnl');
    var fileInp = document.getElementById('img-file');
    var preview = document.getElementById('img-preview');
    var prevSrc = document.getElementById('img-prev-src');
    var clearBtn= document.getElementById('img-clear');
    var prog    = document.getElementById('img-prog');
    var fill    = document.getElementById('img-prog-fill');
    var pTxt    = document.getElementById('img-prog-txt');

    if (tabFile) tabFile.addEventListener('click', function() {
      tabFile.classList.add('active'); tabUrl.classList.remove('active');
      filePnl.style.display = 'block'; urlPnl.style.display = 'none';
    });
    if (tabUrl) tabUrl.addEventListener('click', function() {
      tabUrl.classList.add('active'); tabFile.classList.remove('active');
      urlPnl.style.display = 'block'; filePnl.style.display = 'none';
    });

    if (fileInp) {
      fileInp.addEventListener('change', function(e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
          ILYA.toast(isAr ? 'الحجم يتجاوز 10MB' : 'File exceeds 10MB', 'error');
          return;
        }
        IMG_UPLOADER.toDataURL(file).then(function(dataUrl) {
          if (prevSrc) prevSrc.src = dataUrl;
          if (preview) preview.classList.add('show');
          if (prog)    prog.classList.add('show');

          IMG_UPLOADER.upload(file, function(pct) {
            if (fill) fill.style.width = pct + '%';
            if (pTxt) pTxt.textContent  = pct + '%';
          }).then(function(url) {
            self._uploadedUrl = url;
            if (prog) prog.classList.remove('show');
            ILYA.toast(ILYA.t('upload_done'), 'success');
          }).catch(function() {
            if (prog) prog.classList.remove('show');
            self._uploadedUrl = dataUrl;
            ILYA.toast(isAr ? 'رفع محلي — قد لا يعمل مع بعض النماذج' : 'Local upload — may not work with all models', 'warn');
          });
        });
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        if (preview) preview.classList.remove('show');
        if (fileInp) fileInp.value = '';
        self._uploadedUrl = '';
      });
    }

    // Drag & drop
    var zone = document.getElementById('img-zone');
    if (zone && fileInp) {
      zone.addEventListener('dragover', function(e) { e.preventDefault(); zone.classList.add('dv'); });
      zone.addEventListener('dragleave', function() { zone.classList.remove('dv'); });
      zone.addEventListener('drop', function(e) {
        e.preventDefault(); zone.classList.remove('dv');
        var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) {
          try {
            var dt = new DataTransfer();
            dt.items.add(file);
            fileInp.files = dt.files;
            fileInp.dispatchEvent(new Event('change'));
          } catch(err) {
            // DataTransfer not supported, do nothing
          }
        }
      });
    }
  },

  /* ── Get image URL from widget ──────────────── */
  _getImgUrl: function() {
    var tabUrl = document.getElementById('img-tab-url');
    if (tabUrl && tabUrl.classList.contains('active')) {
      var inp = document.getElementById('img-url-inp');
      return (inp && inp.value.trim()) || '';
    }
    return this._uploadedUrl || '';
  },

  /* ── Get select value ───────────────────────── */
  _v: function(id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
  },

  /* ── Generate ───────────────────────────────── */
  _generate: function(model) {
    var self  = this;
    var isAr  = ILYA.state.lang === 'ar';
    var btn   = document.getElementById('gen-btn');
    var ico   = document.getElementById('gen-ico');
    var txt   = document.getElementById('gen-txt');

    // Collect inputs
    var prompt = '';
    var imgUrl = '';

    if (model.type === 'text') {
      prompt = (document.getElementById('prompt-input') && document.getElementById('prompt-input').value.trim()) || '';
      if (!prompt) { ILYA.toast(ILYA.t('err_no_prompt'), 'error'); return; }
    } else if (model.type === 'image') {
      imgUrl = this._getImgUrl();
      if (!imgUrl) { ILYA.toast(ILYA.t('err_no_img'), 'error'); return; }
      prompt = imgUrl;
    } else { // both
      prompt = (document.getElementById('prompt-input') && document.getElementById('prompt-input').value.trim()) || '';
      imgUrl = this._getImgUrl();
      if (!prompt) { ILYA.toast(ILYA.t('err_no_prompt'), 'error'); return; }
    }

    // Disable button
    if (btn) { btn.disabled = true; }
    if (ico) { ico.className = 'fa-solid fa-spinner fa-spin'; }
    if (txt) { txt.textContent = ILYA.t('generating'); }

    var results = document.getElementById('gen-results');

    // Loading card
    var loadCard = document.createElement('div');
    loadCard.className = 'gen-loading';
    loadCard.innerHTML =
      '<div class="gen-dots"><div class="gen-dot"></div><div class="gen-dot"></div><div class="gen-dot"></div></div>' +
      '<div class="gen-loading-txt">' + ILYA.t('generating') + '</div>' +
      '<div class="gen-loading-sub" id="load-sub">' + (isAr ? 'النموذج: ' + (isAr ? model.nameAr : model.nameEn) : 'Model: ' + model.nameEn) + '</div>';
    results.insertBefore(loadCard, results.firstChild);
    loadCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Retry loop
    var attempt = 0;
    var maxRetries = 3;

    function tryGenerate() {
      attempt++;
      if (attempt > 1) {
        var subEl = document.getElementById('load-sub');
        if (subEl) {
          subEl.innerHTML = '<span class="retry-badge"><i class="fa-solid fa-rotate-right"></i>' +
            (isAr ? 'محاولة ' + attempt + '/' + maxRetries : 'Attempt ' + attempt + '/' + maxRetries) + '</span>';
        }
      }

      self._callModel(model, prompt, imgUrl).then(function(images) {
        if (loadCard.parentNode) loadCard.parentNode.removeChild(loadCard);

        if (images && images.length > 0) {
          self._showResults(results, model, images, prompt);
          DB.logActivity(ILYA.state.user && ILYA.state.user.id, isAr ? model.nameAr : model.nameEn, prompt, images[0]);
        } else {
          throw new Error('empty');
        }
      }).catch(function(err) {
        if (attempt < maxRetries) {
          setTimeout(tryGenerate, 1400 * attempt);
        } else {
          if (loadCard.parentNode) loadCard.parentNode.removeChild(loadCard);
          var errCard = document.createElement('div');
          errCard.className = 'gen-loading';
          errCard.style.borderColor = 'rgba(255,50,50,.3)';
          errCard.innerHTML =
            '<div style="font-size:2rem;margin-bottom:10px;opacity:.6"><i class="fa-solid fa-circle-exclamation" style="color:#ff6688"></i></div>' +
            '<div class="gen-loading-txt" style="color:#ff8899">' + ILYA.t('error_final') + '</div>' +
            '<div class="gen-loading-sub" style="margin-top:8px">' + ILYA.esc(err.message || '') + '</div>' +
            '<button class="btn btn-sm btn-danger" style="margin-top:14px" id="retry-now">' +
              '<i class="fa-solid fa-rotate-right"></i> ' + ILYA.t('retry') +
            '</button>';
          results.insertBefore(errCard, results.firstChild);

          var retryBtn = document.getElementById('retry-now');
          if (retryBtn) {
            retryBtn.addEventListener('click', function() {
              if (errCard.parentNode) errCard.parentNode.removeChild(errCard);
              self._generate(model);
            });
          }
        }
      }).finally(function() {
        if (attempt >= maxRetries || (results.querySelector('.result-card'))) {
          if (btn) { btn.disabled = false; }
          if (ico) { ico.className = 'fa-solid fa-bolt'; }
          if (txt) { txt.textContent = ILYA.t('send'); }
          var pi = document.getElementById('prompt-input');
          if (pi) pi.value = '';
        }
      });
    }

    // Polyfill .finally for older browsers
    if (!Promise.prototype.finally) {
      Promise.prototype.finally = function(fn) {
        return this.then(function(v) { fn(); return v; }, function(e) { fn(); throw e; });
      };
    }

    tryGenerate();
  },

  /* ── Show Results ───────────────────────────── */
  _showResults: function(container, model, images, prompt) {
    var self  = this;
    var isAr  = ILYA.state.lang === 'ar';
    var name  = isAr ? model.nameAr : model.nameEn;
    var count = images.length;

    var cardId  = 'rc-' + Date.now();
    var card    = document.createElement('div');
    card.className = 'result-card';
    card.id        = cardId;

    var imgsHtml = images.map(function(url) {
      var safeUrl = ILYA.esc(url);
      return '<div class="result-img-w">' +
        '<img src="' + safeUrl + '" class="result-img" loading="lazy"' +
             ' onclick="ILYA.openLightbox(\'' + safeUrl + '\')"' +
             ' onerror="this.parentElement.innerHTML=\'<div style=padding:20px;text-align:center;font-size:.78rem;color:var(--t4)>' + (isAr?'تعذّر التحميل':'Load error') + '</div>\'">' +
        '<div class="result-acts">' +
          '<a href="' + safeUrl + '" download class="btn btn-sm btn-success" style="padding:6px 10px;min-height:auto"><i class="fa-solid fa-download"></i></a>' +
          '<button class="btn btn-sm btn-info" style="padding:6px 10px;min-height:auto" onclick="ILYA.copyToClipboard(\'' + safeUrl + '\',this)"><i class="fa-solid fa-copy"></i></button>' +
          '<a href="' + safeUrl + '" target="_blank" rel="noopener" class="btn btn-sm btn-glass" style="padding:6px 10px;min-height:auto"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>' +
        '</div>' +
        '</div>';
    }).join('');

    var clearBtnId = 'clr-' + Date.now();

    card.innerHTML =
      '<div class="result-hdr">' +
        '<i class="fa-solid fa-circle-check ok"></i>' +
        '<span>' + ILYA.t('result_ready') + '</span>' +
        '<span style="margin-inline-start:auto;font-size:.7rem;color:var(--t4)">' + ILYA.esc(name) + '</span>' +
        '<button class="btn-icon" style="width:26px;height:26px;font-size:.72rem;margin-inline-start:6px" id="' + clearBtnId + '" title="' + ILYA.t('clear_res') + '">' +
          '<i class="fa-solid fa-xmark"></i></button>' +
      '</div>' +
      '<div class="result-imgs c' + Math.min(count, 3) + '" style="grid-template-columns:repeat(' + Math.min(count, 3) + ',1fr)">' +
        imgsHtml +
      '</div>' +
      (prompt && model.type !== 'image' ?
        '<div style="padding:10px 12px;border-top:1px solid var(--gb);font-size:.74rem;color:var(--t3);word-break:break-word">' +
          '<i class="fa-solid fa-quote-right" style="margin-inline-end:5px;opacity:.4"></i>' +
          ILYA.esc(prompt.slice(0, 160)) + (prompt.length > 160 ? '...' : '') +
        '</div>' : '');

    container.insertBefore(card, container.firstChild);

    var clrBtn = document.getElementById(clearBtnId);
    if (clrBtn) {
      clrBtn.addEventListener('click', function() {
        if (card.parentNode) card.parentNode.removeChild(card);
      });
    }

    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  /* ── Call API for Each Model ────────────────── */
  _callModel: function(model, prompt, imgUrl) {
    var self = this;
    var v    = function(id) { var el = document.getElementById(id); return el ? el.value : ''; };

    // All return Promise<string[]> or throw
    if (model.id === 'v1') {
      var ratio   = v('p-ratio')   || '1:1';
      var upscale = v('p-upscale') || '4';
      var count   = v('p-count')   || '1';
      var url = 'https://viscodev.x10.mx/v-gen/api.php?prompt=' + encodeURIComponent(prompt) +
                '&ratio=' + ratio + '&count=' + count + '&upscale=' + upscale;
      return fetchAPI(url, {}, 3, 50000).then(function(r) {
        if (r.ok && r.data && r.data.success && r.data.images && r.data.images.length) return r.data.images;
        throw new Error(r.data && r.data.error ? r.data.error : 'API error');
      });
    }

    if (model.id === 'anime') {
      var ratio  = v('p-ratio')  || 'auto';
      var gender = v('p-gender') || 'Female';
      var style  = v('p-style')  || 'manga';
      var url = 'https://viscodev.x10.mx/image-an/api.php?links=' + encodeURIComponent(imgUrl) +
                '&gender=' + gender + '&style=' + style + '&ratio=' + ratio;
      return fetchAPI(url, {}, 3, 55000).then(function(r) {
        if (r.ok && r.data && r.data.success && r.data.image_url) return [r.data.image_url];
        throw new Error(r.data && r.data.error ? r.data.error : 'API error');
      });
    }

    if (model.id === 'seed') {
      var ratio = v('p-ratio') || 'square';
      var style = v('p-style') || 'none';
      var url = 'https://viscodev.x10.mx/SeedReam/api.php?action=generate&prompt=' + encodeURIComponent(prompt) +
                '&style=' + style + '&aspect_ratio=' + ratio;
      return fetchAPI(url, {}, 3, 55000).then(function(r) {
        if (r.ok && r.data && r.data.success && r.data.image_url) return [r.data.image_url];
        throw new Error(r.data && r.data.error ? r.data.error : 'API error');
      });
    }

    if (model.id === 'pfoto') {
      var ratio  = v('p-ratio')  || '1:1';
      var gender = v('p-gender') || 'male';
      var style  = v('p-style')  || 'linkedin_exec';
      var url = 'https://viscodev.x10.mx/maker-ai/api.php?links=' + encodeURIComponent(imgUrl) +
                '&gender=' + gender + '&style=' + style + '&ratio=' + ratio;
      return fetchAPI(url, {}, 3, 55000).then(function(r) {
        if (r.ok && r.data && r.data.success && r.data.image_url) return [r.data.image_url];
        throw new Error(r.data && r.data.error ? r.data.error : 'API error');
      });
    }

    if (model.id === 'flux') {
      var ratio = v('p-ratio') || '1:1';
      var url = 'https://viscodev.x10.mx/Flux-MAX/api.php?prompt=' + encodeURIComponent(prompt) +
                '&aspect_ratio=' + ratio;
      return fetchAPI(url, {}, 3, 60000).then(function(r) {
        if (r.ok && r.data && r.data.success && r.data.image_url) return [r.data.image_url];
        throw new Error(r.data && r.data.error ? r.data.error : 'API error');
      });
    }

    if (model.id === 'nb2') {
      // GET — Nano Banana 2
      var url1 = 'http://de3.bot-hosting.net:21007/kilwa-img?text=' + encodeURIComponent(prompt);
      return fetchAPI(url1, {}, 2, 50000).then(function(r) {
        if (r.ok && r.data && r.data.status === 'success' && r.data.image_url) return [r.data.image_url];
        // Try HTTPS
        var url2 = 'https://de3.bot-hosting.net:21007/kilwa-img?text=' + encodeURIComponent(prompt);
        return fetchAPI(url2, {}, 2, 50000).then(function(r2) {
          if (r2.ok && r2.data && r2.data.status === 'success' && r2.data.image_url) return [r2.data.image_url];
          throw new Error('Nano Banana 2 unavailable');
        });
      });
    }

    if (model.id === 'nbp') {
      // POST — NanoBanana Pro
      var ratio = v('p-ratio') || '1:1';
      var res_q = v('p-res')   || '4K';
      var parts = ['text=' + encodeURIComponent(prompt), 'ratio=' + encodeURIComponent(ratio), 'res=' + encodeURIComponent(res_q)];
      if (imgUrl) parts.push('links=' + encodeURIComponent(imgUrl));
      var body  = parts.join('&');
      var opts  = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
      };
      return fetchAPI('https://zecora0.serv00.net/ai/NanoBanana.php', opts, 3, 65000).then(function(r) {
        if (r.ok && r.data && r.data.success && r.data.url) return [r.data.url];
        throw new Error(r.data && r.data.error ? r.data.error : 'NanoBanana Pro error');
      });
    }

    return Promise.reject(new Error('Unknown model: ' + model.id));
  },
};
