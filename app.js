/* ============================================================
   작업 증빙 리포트 스튜디오 · app.js  v1.0.0
   ------------------------------------------------------------
   core.js(순수 로직)를 화면에 붙인다.
   - 사용자 문자열은 textContent / value 로만 넣는다(innerHTML 은 정적 아이콘만).
   - 입력 중에는 항목 행을 다시 그리지 않는다(포커스 유지). 파생 화면만 갱신.
   - 링크·공유 코드는 항상 core 의 safeUrl / encodeState 를 거친다.
   ============================================================ */
(function () {
  'use strict';

  var C = window.POWCore;
  var D = window.POWData;
  if (!C || !D) return;

  /* ── DOM ──────────────────────────────────────────────── */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = String(text);
    return n;
  }
  function clear(n) { while (n && n.firstChild) n.removeChild(n.firstChild); return n; }

  var ICON = {
    link: '<svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path d="M6.5 9.5l3-3M5.8 7.2l-1 1a2.3 2.3 0 003.3 3.3l1-1M10.2 8.8l1-1a2.3 2.3 0 00-3.3-3.3l-1 1" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    trash: '<svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true"><path d="M4 6h12M8 3.5h4M6.2 6l.6 10h6.4l.6-10M8.4 8.6v5M11.6 8.6v5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    plus: '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    check: '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrow: '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  var GROUPS = [
    { status: 'done', no: '02', title: '완료한 작업', desc: '끝낸 일은 결과로 적습니다. 클라이언트가 돈을 낸 이유가 여기에 있습니다.' },
    { status: 'doing', no: '03', title: '진행 중', desc: '이번 기간에 시작했고 다음 기간에 이어지는 일입니다.' },
    { status: 'next', no: '04', title: '다음 주 계획', desc: '다음에 무엇을 언제까지 할지. 시간은 비워 두어도 됩니다.' },
    { status: 'block', no: '05', title: '확인이 필요한 것', desc: '혼자 풀 수 없는 일은 요청 문장으로 씁니다. 클라이언트가 할 일을 알려 줍니다.' }
  ];
  var GROUP_BY_STATUS = {};
  GROUPS.forEach(function (g) { GROUP_BY_STATUS[g.status] = g; });

  /* ── 상태 ─────────────────────────────────────────────── */
  var storage = (function () {
    try {
      var k = '__powr_probe__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return window.localStorage;
    } catch (e) { return null; }
  })();

  var state = null;
  var shareUrl = '';
  var busy = false;
  var bridge = { tone: 'plain', prompt: '', memo: '' };
  var saveTimer = null;
  var lastSaveAt = null;
  var trash = [];             /* 되돌리기용: [{item, index}] */
  var pro = null;

  /* ── 공통 ─────────────────────────────────────────────── */
  function toast(message, kind, actionLabel, actionFn) {
    var root = $('#toast-root');
    if (!root) return;
    var box = el('div', 'toast' + (kind ? ' is-' + kind : ''));
    box.appendChild(document.createTextNode(message));
    if (actionLabel && typeof actionFn === 'function') {
      var btn = el('button', 'toast-action', actionLabel);
      btn.type = 'button';
      btn.style.cssText = 'margin-left:12px;background:none;border:0;color:#ffe9a8;font:inherit;font-weight:700;text-decoration:underline;cursor:pointer;min-height:0;padding:0';
      btn.addEventListener('click', function () { box.remove(); actionFn(); });
      box.appendChild(btn);
    }
    root.appendChild(box);
    setTimeout(function () { if (box.parentNode) box.remove(); }, actionLabel ? 7000 : 3400);
  }

  function copyText(text) {
    if (!text) return Promise.resolve(false);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', 'readonly');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  function markSaved(text) {
    var n = $('#save-state');
    if (!n) return;
    n.textContent = text;
    n.className = 'save-state ' + (text === '저장 중…' ? 'is-saving' : 'is-saved');
  }

  function saveNow() {
    if (!state) return;
    if (storage) {
      var ok = C.draftSave(storage, state);
      if (state.project || state.items.some(function (i) { return i.title || i.memo; })) {
        var saved = C.historySave(storage, state);
        /* 같은 프로젝트·기간의 기존 이력에 합쳐졌으면 현재 id 를 그쪽으로 맞춘다 */
        if (saved && saved.ok && saved.id && saved.id !== state.id) state.id = saved.id;
      }
      lastSaveAt = new Date();
      markSaved(ok ? '저장됨 ' + pad2(lastSaveAt.getHours()) + ':' + pad2(lastSaveAt.getMinutes()) : '저장 실패(용량)');
    } else {
      markSaved('저장 안 됨(브라우저 설정)');
    }
  }

  function scheduleSave() {
    markSaved('저장 중…');
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { saveTimer = null; saveNow(); }, 450);
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  /* ── 초기 상태 ────────────────────────────────────────── */
  function freshState() {
    var s = C.emptyState();
    var r = C.previousWeekRange(new Date());
    s.start = r.start;
    s.end = r.end;
    s.signature.date = C.toISODateLocal(new Date());
    return s;
  }

  /* ── 탭 ───────────────────────────────────────────────── */
  function setTab(name, focusTab) {
    var tab = $('#tab-' + name);
    var view = $('#view-' + name);
    if (!tab || !view) return;
    $$('.tab').forEach(function (t) {
      var on = t.getAttribute('data-tab') === name;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    $$('.view').forEach(function (v) { v.classList.toggle('is-active', v.id === 'view-' + name); });
    if (name === 'history') renderHistory();
    if (name === 'bridge') refreshPrompt();
    if (name === 'brand') renderBrandPreview();
    if (focusTab) tab.focus();
    var main = $('#main');
    if (main && window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function wireTabs() {
    $$('.tab').forEach(function (t) {
      t.addEventListener('click', function () { setTab(t.getAttribute('data-tab')); });
      t.addEventListener('keydown', function (e) {
        var keys = { ArrowRight: 1, ArrowLeft: -1 };
        if (!keys[e.key]) return;
        e.preventDefault();
        var list = $$('.tab');
        var i = list.indexOf(t);
        var next = list[(i + keys[e.key] + list.length) % list.length];
        setTab(next.getAttribute('data-tab'), true);
      });
    });
    $$('[data-tab-link]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        setTab(a.getAttribute('data-tab-link'));
      });
    });
  }

  /* ── 기본 정보 폼 ─────────────────────────────────────── */
  function fillMeta() {
    $('#f-project').value = state.project || '';
    $('#f-client').value = state.client || '';
    $('#f-start').value = state.start || '';
    $('#f-end').value = state.end || '';
    $('#f-summary').value = state.summary || '';
    $('#f-prev').value = state.compare.prevHours === null ? '' : state.compare.prevHours;
  }

  function wireMeta() {
    $('#f-project').addEventListener('input', function (e) { state.project = e.target.value; onEdit(); });
    $('#f-client').addEventListener('input', function (e) { state.client = e.target.value; onEdit(); });
    $('#f-start').addEventListener('change', function (e) {
      state.start = C.normalizeDate(e.target.value);
      if (!state.signature.date) state.signature.date = state.end || state.start;
      onEdit();
    });
    $('#f-end').addEventListener('change', function (e) {
      state.end = C.normalizeDate(e.target.value);
      if (state.signature.date) state.signature.date = state.end || state.signature.date;
      onEdit();
    });
    $('#f-summary').addEventListener('input', function (e) { state.summary = e.target.value; onEdit(); });
    $('#f-prev').addEventListener('input', function (e) {
      var v = C.num(e.target.value);
      state.compare.prevHours = e.target.value.trim() === '' || v <= 0 ? null : Math.min(v, 9999);
      onEdit();
    });
    $('#btn-auto-summary').addEventListener('click', function () {
      var text = C.autoSummary(state);
      if (!text) { toast('완료 항목이 있어야 요약을 만들 수 있습니다.', 'warn'); return; }
      state.summary = text;
      $('#f-summary').value = text;
      onEdit();
      toast('집계로 요약을 채웠습니다. 문장은 자유롭게 고치세요.');
    });
    $('#btn-to-bridge').addEventListener('click', function () {
      if (!state.summary) {
        var auto = C.autoSummary(state);
        if (auto) { state.summary = auto; $('#f-summary').value = auto; }
      }
      $('#f-memo').value = state.summary || '';
      setTab('bridge');
      $('#f-memo').focus();
    });
  }

  /* ── 항목 그룹 ────────────────────────────────────────── */
  function itemsOf(status) {
    return state.items.filter(function (it) { return it.status === status; });
  }

  function renderItems() {
    var host = $('#item-groups');
    if (!host) return;
    clear(host);
    GROUPS.forEach(function (g) {
      var list = itemsOf(g.status);
      var sum = list.reduce(function (a, it) { return a + (it.hours || 0); }, 0);
      var card = el('section', 'card group');
      card.setAttribute('data-group', g.status);
      card.setAttribute('aria-labelledby', 'group-' + g.status);

      var head = el('div', 'group-head');
      head.appendChild(el('span', 'group-no', g.no));
      var h = el('h2', null, g.title);
      h.id = 'group-' + g.status;
      head.appendChild(h);
      var count = el('span', 'group-count', list.length);
      count.setAttribute('data-count', g.status);
      head.appendChild(count);
      if (sum > 0) {
        var sumEl = el('span', 'group-sum', C.formatHours(sum) + (g.status === 'done' ? ' 완료' : g.status === 'doing' ? ' 진행' : ''));
        sumEl.setAttribute('data-sum', g.status);
        head.appendChild(sumEl);
      }
      var add = el('button', 'btn btn-outline btn-sm');
      add.type = 'button';
      add.setAttribute('data-add', g.status);
      add.innerHTML = ICON.plus + '<span>항목 추가</span>';
      head.appendChild(add);
      card.appendChild(head);
      card.appendChild(el('p', 'group-desc', g.desc));

      var listEl = el('div', 'item-list');
      listEl.setAttribute('data-list', g.status);
      list.forEach(function (it) { listEl.appendChild(itemRow(it, g.status)); });
      card.appendChild(listEl);

      var empty = el('div', 'empty-row');
      empty.setAttribute('data-empty', g.status);
      empty.textContent = g.status === 'done' ? '아직 완료 항목이 없습니다. “항목 추가”로 첫 줄을 넣어 보세요.' : '해당하는 항목이 없습니다.';
      card.appendChild(empty);

      host.appendChild(card);
    });
    autoGrowAll(host);
  }

  function itemRow(it, status) {
    var row = el('div', 'item-row');
    row.setAttribute('data-id', it.id);
    row.setAttribute('data-status', status);

    /* 1행: 제목 · 시간 · 삭제 */
    var title = el('input');
    title.type = 'text';
    title.value = it.title || '';
    title.maxLength = 120;
    title.setAttribute('data-field', 'title');
    title.setAttribute('aria-label', '작업 제목');
    title.setAttribute('placeholder', status === 'done' ? '결과로 적기 (예: 블로그 원고 12편 작성·교정)' : '무엇을 할지 (예: 12월 콘텐츠 캘린더 초안)');
    row.appendChild(title);

    var hw = el('div', 'hours-wrap');
    var hours = el('input');
    hours.type = 'number';
    hours.min = '0';
    hours.max = '999';
    hours.step = '0.5';
    hours.value = it.hours ? it.hours : '';
    hours.setAttribute('data-field', 'hours');
    hours.setAttribute('aria-label', '소요 시간(시간 단위)');
    hours.setAttribute('placeholder', '0');
    hw.appendChild(hours);
    hw.appendChild(el('span', null, 'h'));
    row.appendChild(hw);

    var del = el('button', 'item-del');
    del.type = 'button';
    del.setAttribute('aria-label', (it.title ? '“' + it.title + '” ' : '') + '항목 삭제');
    del.innerHTML = ICON.trash;
    row.appendChild(del);

    /* 2행: 근거 링크 · 분류 */
    var r2 = el('div', 'row-2');
    var evWrap = el('div', 'ev-wrap');
    var ev = el('input');
    ev.type = 'url';
    ev.value = it.evidence || '';
    ev.setAttribute('data-field', 'evidence');
    ev.setAttribute('aria-label', '근거 링크 주소');
    ev.setAttribute('placeholder', '근거 링크 (GitHub · Figma · Notion · 구글 시트)');
    ev.setAttribute('inputmode', 'url');
    evWrap.appendChild(ev);
    var hint = el('span', 'ev-hint');
    evWrap.appendChild(hint);
    r2.appendChild(evWrap);

    var cat = el('select');
    cat.setAttribute('data-field', 'category');
    cat.setAttribute('aria-label', '작업 분류');
    C.CATEGORIES.forEach(function (c) {
      var o = el('option', null, c.label);
      o.value = c.id;
      if (c.id === it.category) o.selected = true;
      cat.appendChild(o);
    });
    r2.appendChild(cat);
    row.appendChild(r2);

    /* 3행: 메모 */
    var r3 = el('div', 'row-3');
    var memo = el('textarea');
    memo.rows = 2;
    memo.value = it.memo || '';
    memo.maxLength = 600;
    memo.setAttribute('data-field', 'memo');
    memo.setAttribute('aria-label', '클라이언트에게 보여 줄 메모');
    memo.setAttribute('placeholder', '클라이언트에게 보여 줄 한두 문장 (선택)');
    r3.appendChild(memo);
    row.appendChild(r3);

    /* 4행: 블로커일 때 요청 */
    if (status === 'block') {
      var r4 = el('div', 'row-4');
      var lab = el('label', null, '클라이언트에게 요청할 일');
      lab.setAttribute('for', 'ask-' + it.id);
      var ask = el('input');
      ask.type = 'text';
      ask.id = 'ask-' + it.id;
      ask.value = it.ask || '';
      ask.maxLength = 240;
      ask.setAttribute('data-field', 'ask');
      ask.setAttribute('aria-label', '클라이언트에게 요청할 일');
      ask.setAttribute('placeholder', '예: 촬영본 3종을 12월 2일까지 전달해 주세요');
      r4.appendChild(lab);
      r4.appendChild(ask);
      row.appendChild(r4);
    }

    updateEvidenceHint(row, it);
    if (!it.hours && status === 'done') hours.classList.add('is-empty');
    return row;
  }

  function updateEvidenceHint(row, it) {
    var hint = $('.ev-hint', row);
    var input = $('[data-field="evidence"]', row);
    if (!hint || !input) return;
    var raw = input.value.trim();
    if (!raw) {
      hint.textContent = '링크를 붙이면 증빙률이 올라갑니다.';
      hint.className = 'ev-hint';
      input.classList.remove('is-invalid');
      return;
    }
    var url = C.safeUrl(raw);
    if (!url) {
      hint.textContent = 'http:// 또는 https:// 주소만 들어갑니다.';
      hint.className = 'ev-hint is-bad';
      input.classList.add('is-invalid');
      return;
    }
    var label = C.hostLabel(url) || C.hostOf(url);
    hint.textContent = label + ' 링크로 들어갑니다';
    hint.className = 'ev-hint is-ok';
    input.classList.remove('is-invalid');
  }

  function autoGrow(ta) {
    if (!ta || ta.tagName !== 'TEXTAREA') return;
    ta.style.height = 'auto';
    var h = Math.max(60, Math.min(200, ta.scrollHeight + 2));
    ta.style.height = h + 'px';
  }

  function autoGrowAll(scope) {
    $$('textarea', scope || document).forEach(autoGrow);
  }

  function itemById(id) {
    for (var i = 0; i < state.items.length; i++) if (state.items[i].id === id) return state.items[i];
    return null;
  }

  function wireItems() {
    var host = $('#item-groups');
    if (!host) return;

    host.addEventListener('input', function (e) {
      var t = e.target;
      var field = t.getAttribute && t.getAttribute('data-field');
      if (!field) return;
      var row = t.closest('.item-row');
      if (!row) return;
      var it = itemById(row.getAttribute('data-id'));
      if (!it) return;
      if (field === 'hours') {
        var v = C.num(t.value);
        it.hours = v < 0 ? 0 : Math.min(v, 999);
        t.classList.toggle('is-empty', !it.hours && it.status === 'done');
      } else if (field === 'evidence') {
        it.evidence = t.value.trim();
        updateEvidenceHint(row, it);
      } else if (field === 'memo') {
        it.memo = t.value;
        autoGrow(t);
      } else if (field === 'title') {
        it.title = t.value;
        var delBtn = $('.item-del', row);
        if (delBtn) delBtn.setAttribute('aria-label', (it.title ? '“' + it.title + '” ' : '') + '항목 삭제');
      } else if (field === 'ask') {
        it.ask = t.value;
      }
      onEdit();
    });

    host.addEventListener('change', function (e) {
      var t = e.target;
      if (!t.getAttribute) return;
      if (t.getAttribute('data-field') !== 'category') return;
      var row = t.closest('.item-row');
      var it = row && itemById(row.getAttribute('data-id'));
      if (!it) return;
      it.category = t.value;
      onEdit();
    });

    host.addEventListener('click', function (e) {
      var addBtn = e.target.closest('[data-add]');
      if (addBtn) {
        addItem(addBtn.getAttribute('data-add'));
        return;
      }
      var del = e.target.closest('.item-del');
      if (!del) return;
      var row = del.closest('.item-row');
      var id = row && row.getAttribute('data-id');
      removeItem(id);
    });
  }

  function addItem(status) {
    var cat = 'etc';
    var last = itemsOf(status).slice(-1)[0];
    if (last) cat = last.category;
    var it = C.emptyItem(status, cat);
    state.items.push(it);
    renderItems();
    updateDerived();
    onEdit();
    var row = $('.item-row[data-id="' + it.id + '"]');
    if (row) {
      var t = $('[data-field="title"]', row);
      if (t) t.focus();
    }
  }

  function removeItem(id) {
    var idx = -1;
    for (var i = 0; i < state.items.length; i++) if (state.items[i].id === id) { idx = i; break; }
    if (idx < 0) return;
    var removed = state.items[idx];
    state.items.splice(idx, 1);
    trash.push({ item: removed, index: idx });
    renderItems();
    updateDerived();
    onEdit();
    toast('항목을 삭제했습니다.', null, '되돌리기', function () {
      var last = trash.pop();
      if (!last) return;
      state.items.splice(Math.min(last.index, state.items.length), 0, last.item);
      renderItems();
      updateDerived();
      onEdit();
      toast('항목을 되돌렸습니다.');
    });
  }

  /* ── 파생 화면(요약·점검·미리보기·인쇄) ──────────────── */
  function onEdit() {
    updateDerived();
    scheduleSave();
  }

  function updateDerived() {
    var t = C.totals(state);
    $('#sum-done').textContent = t.doneCount;
    $('#sum-hours').textContent = C.formatHours(t.totalHours);
    $('#sum-links').textContent = t.evidenceCount;
    $('#sum-coverage').textContent = t.coverage + '%';

    var delta = $('#sum-delta');
    delta.textContent = t.deltaPct === null
      ? '첫 리포트 · 지난 기간 시간을 넣으면 비교합니다'
      : '전기간 대비 ' + C.deltaText(t);
    delta.className = 'delta' + (t.deltaPct === null ? ' is-none' : (t.deltaPct < 0 ? ' is-down' : ''));

    renderCats(t);
    updateGroupCounts();
    renderChecks();
    renderPrivacy();
    updatePeriodView();
    $('#summary-count').textContent = state.summary.length + ' / 800';
    renderReport(state, $('#report-preview'), { mode: 'preview' });
    renderReport(state, $('#print-root'), { mode: 'print' });
    renderBrandPreview();
    refreshPrompt();
  }

  function updateGroupCounts() {
    GROUPS.forEach(function (g) {
      var list = itemsOf(g.status);
      var sum = list.reduce(function (a, it) { return a + (it.hours || 0); }, 0);
      var c = $('[data-count="' + g.status + '"]');
      if (c) c.textContent = list.length;
      var s = $('[data-sum="' + g.status + '"]');
      if (s) {
        s.textContent = C.formatHours(sum) + (g.status === 'done' ? ' 완료' : g.status === 'doing' ? ' 진행' : '');
        s.hidden = sum <= 0;
      }
      var listEl = $('[data-list="' + g.status + '"]');
      if (listEl) listEl.setAttribute('data-empty-shown', list.length ? '0' : '1');
    });
    $$('.empty-row').forEach(function (row) {
      var st = row.getAttribute('data-empty');
      var list = $('[data-list="' + st + '"]');
      row.style.display = list && list.children.length ? 'none' : 'flex';
    });
  }

  function renderCats(t) {
    var host = $('#sum-cats');
    clear(host);
    if (!t.categories.length) return;
    t.categories.slice(0, 4).forEach(function (c) {
      var row = el('div', 'cat-row');
      row.appendChild(el('span', 'cat-name', c.label));
      var bar = el('span', 'cat-bar');
      var fill = el('i');
      fill.style.width = Math.max(2, Math.min(100, c.pct)) + '%';
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(el('span', 'cat-pct', c.pct + '%'));
      host.appendChild(row);
    });
  }

  function renderChecks() {
    var v = C.validate(state);
    var list = $('#check-list');
    var pill = $('#check-count');
    clear(list);
    var issues = v.issues.slice(0, 8);
    pill.textContent = v.issues.length;
    pill.className = 'pill' + (v.errors.length ? ' is-error' : (v.warnings.length ? ' is-warn' : ' is-ok'));

    if (!issues.length) {
      var ok = el('li', 'is-ok');
      ok.appendChild(el('span', 'mark', '✓'));
      ok.appendChild(el('span', null, '공유 준비가 끝났습니다. 링크를 만들어 보세요.'));
      list.appendChild(ok);
      return;
    }
    issues.forEach(function (it) {
      var li = el('li', it.level === 'error' ? 'is-error' : 'is-warn');
      li.appendChild(el('span', 'mark', it.level === 'error' ? '!' : '·'));
      li.appendChild(el('span', null, it.message));
      list.appendChild(li);
    });
    if (v.issues.length > issues.length) {
      var more = el('li', 'is-ok');
      more.appendChild(el('span', 'mark', '+'));
      more.appendChild(el('span', null, '외 ' + (v.issues.length - issues.length) + '건'));
      list.appendChild(more);
    }
  }

  function renderPrivacy() {
    var found = C.privacyScan(state);
    var card = $('#privacy-card');
    var list = $('#privacy-list');
    clear(list);
    if (!found.length) { card.hidden = true; return; }
    card.hidden = false;
    var seen = {};
    found.forEach(function (f) {
      var key = f.where + '|' + f.kind + '|' + f.sample;
      if (seen[key]) return;
      seen[key] = 1;
      var li = el('li');
      li.appendChild(el('b', null, f.label + ' ' + f.sample));
      li.appendChild(el('span', 'where', ' — ' + f.where));
      list.appendChild(li);
    });
  }

  function updatePeriodView() {
    var n = $('#f-period-view');
    var range = C.formatDateRange(state.start, state.end);
    if (!range) { n.textContent = '기간을 넣으면 일수까지 계산합니다'; return; }
    var days = C.periodDays(state.start, state.end);
    n.textContent = range + (days ? ' · ' + days + '일' : '');
    if (days > 31) n.textContent += ' (한 달이 넘습니다)';
  }

  /* ── 리포트 렌더러 ────────────────────────────────────── */
  function renderReport(st, mount, opts) {
    if (!mount) return;
    clear(mount);
    var settings = opts || {};
    mount.className = (mount.className || '').replace(/\s*report-paper\s*/g, ' ').trim();
    mount.classList.add('report-paper');

    var article = el('article', 'report');
    article.style.setProperty('--rc', st.brand.color || '#2f5bff');
    var t = C.totals(st);

    /* 머리말 */
    var head = el('header', 'rep-head');
    var brand = el('div', 'rep-brand');
    var mark = el('span', 'rep-logo-mark', (st.brand.logo || st.brand.company || 'R').slice(0, 1));
    brand.appendChild(mark);
    var bt = el('span', 'rep-brand-text');
    bt.appendChild(el('b', null, st.brand.logo || st.brand.company || '리포트'));
    bt.appendChild(el('small', null, 'WORK REPORT'));
    brand.appendChild(bt);
    head.appendChild(brand);

    var right = el('div', 'rep-head-right');
    right.appendChild(el('b', null, 'PROOF OF WORK'));
    right.appendChild(el('span', null, '발행 ' + (C.formatDate(st.signature.date) || C.formatDate(C.toISODateLocal(new Date())))));
    head.appendChild(right);
    article.appendChild(head);

    /* 제목 */
    var tb = el('div', 'rep-titleblock');
    tb.appendChild(el('p', 'rep-kicker', reportKicker(st, t)));
    var h1 = el('h1', 'rep-title', st.project || '프로젝트명을 입력하세요');
    tb.appendChild(h1);
    var meta = el('div', 'rep-meta');
    if (st.client) meta.appendChild(metaItem(' 클라이언트', st.client));
    var range = C.formatDateRange(st.start, st.end);
    if (range) {
      var days = C.periodDays(st.start, st.end);
      meta.appendChild(metaItem(' 기간', range + (days ? ' · ' + days + '일' : '')));
    }
    if (st.signature.name) meta.appendChild(metaItem(' 담당', [st.signature.name, st.signature.role].filter(Boolean).join(' · ')));
    tb.appendChild(meta);
    article.appendChild(tb);

    /* 요약 숫자 */
    var stats = el('div', 'rep-stats');
    stats.appendChild(statCell(t.doneCount + '건', '완료한 작업'));
    stats.appendChild(statCell(C.formatHours(t.totalHours), '총 소요시간'));
    stats.appendChild(statCell(t.evidenceCount + '개', '근거 링크'));
    stats.appendChild(statCell(t.deltaPct === null ? '—' : (t.deltaPct > 0 ? '+' : '') + t.deltaPct + '%', '지난 기간 대비'));
    article.appendChild(stats);

    /* 요약 문장 */
    if (st.summary) {
      var sum = el('div', 'rep-summary');
      sum.appendChild(el('span', 'label', '이번 기간 요약'));
      sum.appendChild(document.createTextNode(st.summary));
      article.appendChild(sum);
    }

    /* 섹션 */
    var total = 0;
    GROUPS.forEach(function (g) {
      var list = itemsOf2(st, g.status).filter(function (it) { return it.title; });
      if (!list.length) return;
      total += list.length;
      var sec = el('section', 'rep-section');
      sec.setAttribute('data-section', g.status);
      var sh = el('div', 'rep-section-head');
      sh.appendChild(el('span', 'no', g.no));
      sh.appendChild(el('h2', null, g.title));
      var hours = list.reduce(function (a, it) { return a + (it.hours || 0); }, 0);
      var tail = g.status === 'next' ? (hours ? '예정 ' + C.formatHours(hours) : '') : (hours ? C.formatHours(hours) : '');
      sh.appendChild(el('span', 'n', list.length + '건' + (tail ? ' · ' + tail : '')));
      sec.appendChild(sh);

      list.forEach(function (it) {
        var item = el('div', 'rep-item' + (it.status === 'block' ? ' is-block' : ''));
        var h3 = el('h3', null, it.title);
        item.appendChild(h3);
        var hoursText = it.hours ? C.formatHours(it.hours) : (it.status === 'next' ? '예정' : (it.status === 'done' ? '시간 미기록' : ''));
        if (hoursText) item.appendChild(el('span', 'hours' + (it.hours ? '' : ' is-empty'), hoursText));
        if (it.memo) item.appendChild(el('p', 'rep-memo', it.memo));
        var url = C.safeUrl(it.evidence);
        if (url) {
          var links = el('div', 'rep-links');
          var a = el('a', 'rep-link');
          a.href = url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer nofollow';
          a.title = url;
          a.innerHTML = ICON.link;
          a.appendChild(document.createTextNode(C.hostLabel(url) || C.hostOf(url) || '근거 링크'));
          links.appendChild(a);
          item.appendChild(links);
        }
        if (it.ask) {
          var ask = el('p', 'rep-ask');
          ask.appendChild(el('b', null, '요청 · '));
          ask.appendChild(document.createTextNode(it.ask));
          item.appendChild(ask);
        }
        sec.appendChild(item);
      });
      article.appendChild(sec);
    });

    if (!total && !st.summary) {
      article.appendChild(el('p', 'rep-empty', '아직 내용이 없습니다. 작성 탭에서 항목을 넣으면 이 자리에 리포트가 만들어집니다.'));
    }

    /* 서명 */
    var sign = el('div', 'rep-sign');
    var left = el('div', 'rep-sign-left');
    left.appendChild(el('b', null, st.brand.company || ''));
    var contact = [st.brand.email, st.brand.phone].filter(Boolean).join(' · ');
    if (contact) left.appendChild(el('span', null, contact));
    if (st.brand.role) left.appendChild(el('span', null, '담당 ' + [st.signature.name, st.signature.role].filter(Boolean).join(' · ')));
    sign.appendChild(left);

    var box = el('div', 'rep-sign-box');
    var line = el('div', 'rep-sign-line');
    line.appendChild(el('span', null, st.signature.name || ''));
    box.appendChild(line);
    var nm = el('p', 'rep-sign-name');
    nm.appendChild(el('b', null, [st.signature.name, st.signature.role].filter(Boolean).join(' · ')));
    if (st.signature.date) nm.appendChild(document.createTextNode(' · ' + C.formatDate(st.signature.date)));
    box.appendChild(nm);
    sign.appendChild(box);
    article.appendChild(sign);

    /* 꼬리 */
    var foot = el('div', 'rep-foot');
    foot.appendChild(el('span', null, '이 리포트는 서버에 저장되지 않았습니다. 링크 안의 내용을 브라우저가 직접 그립니다.'));
    foot.appendChild(el('span', null, (st.brand.logo || '') + ' · 작업 증빙 리포트'));
    article.appendChild(foot);

    mount.appendChild(article);
    if (settings.mode === 'print') mount.setAttribute('data-print', '1');
  }

  function itemsOf2(st, status) {
    return st.items.filter(function (it) { return it.status === status; });
  }

  function metaItem(label, value) {
    var s = el('span');
    s.appendChild(el('b', null, label));
    s.appendChild(document.createTextNode(value));
    return s;
  }

  function statCell(value, label) {
    var d = el('div', 'rep-stat');
    d.appendChild(el('b', null, value));
    d.appendChild(el('span', null, label));
    return d;
  }

  function reportKicker(st, t) {
    var days = C.periodDays(st.start, st.end);
    if (days >= 6 && days <= 8) return '주간 작업 증빙 리포트';
    if (days >= 27 && days <= 32) return '월간 작업 증빙 리포트';
    if (days > 0) return '작업 증빙 리포트 · ' + days + '일';
    return '작업 증빙 리포트';
  }

  /* ── 공유 ─────────────────────────────────────────────── */
  function baseUrl() {
    var href = location.href.split('#')[0].split('?')[0];
    return href;
  }

  function doShare(opts) {
    var v = C.validate(state);
    if (!v.ok) {
      renderChecks();
      /* 다른 탭에서 눌렀다면 작성 화면으로 데려가 고칠 곳을 보여 준다 */
      var writeView = $('#view-write');
      if (writeView && !writeView.classList.contains('is-active')) setTab('write');
      toast(v.errors[0].message, 'error');
      focusFirstError(v.errors[0]);
      var card = $('.rail-check');
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return null;
    }
    var enc = C.shareLink(state, baseUrl());
    if (!enc.ok) { toast('공유 링크를 만들지 못했습니다.', 'error'); return null; }
    shareUrl = enc.url;
    var input = $('#share-url');
    input.value = enc.url;
    $('#share-size').textContent = '링크 ' + enc.length + '자 · ' + (enc.compressed ? 'DEFLATE 압축' : '비압축')
      + ' · 원본 JSON ' + enc.bytes + '바이트 (키 생략 ' + enc.savingsPct + '% · 링크 길이 ' + enc.linkSavingsPct + '% 감소)';
    $('#share-warn').hidden = !(enc.warn || enc.tooLong);
    if (enc.tooLong) {
      $('#share-warn').hidden = false;
      $('#share-warn').textContent = '링크가 ' + C.MAX_CODE + '자를 넘었습니다. 메신저에서 잘릴 수 있으니 항목을 줄여 주세요.';
    } else if (enc.warn) {
      $('#share-warn').hidden = false;
      $('#share-warn').textContent = '링크가 깁니다(' + enc.length + '자). 일부 메신저에서는 잘릴 수 있습니다.';
    }
    if (!opts || !opts.silent) openModal();
    if (opts && opts.copy) {
      copyText(enc.url).then(function (ok) {
        toast(ok ? '공유 링크를 복사했습니다.' : '복사하지 못했습니다. 링크를 직접 선택해 주세요.', ok ? null : 'warn');
      });
    }
    return enc;
  }

  function focusFirstError(err) {
    if (!err) return;
    var target = null;
    if (err.field === 'project') target = $('#f-project');
    else if (err.field === 'period') target = $('#f-start');
    else if (err.field === 'item-url' && err.index >= 0) {
      var rows = $$('.item-row');
      if (rows[err.index]) target = $('[data-field="evidence"]', rows[err.index]);
    }
    if (target) { target.focus(); target.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }

  function openModal() {
    var m = $('#share-modal');
    m.hidden = false;
    setTimeout(function () { $('#share-url').select(); }, 30);
  }
  function closeModal() { $('#share-modal').hidden = true; }

  function wireShare() {
    $('#btn-share').addEventListener('click', function () { doShare(); });
    $('#btn-share-rail').addEventListener('click', function () { doShare(); });
    $('#btn-client-share').addEventListener('click', function () { doShare({ silent: true, copy: true }); });
    $('#btn-copy-share').addEventListener('click', function () {
      if (!shareUrl) shareUrl = $('#share-url').value;
      copyText(shareUrl).then(function (ok) {
        toast(ok ? '공유 링크를 복사했습니다.' : '복사하지 못했습니다. 링크를 직접 선택해 주세요.', ok ? null : 'warn');
      });
    });
    $('#btn-open-share').addEventListener('click', function () {
      if (!shareUrl) return;
      window.open(shareUrl, '_blank', 'noopener');
    });
    $('#btn-share-close').addEventListener('click', closeModal);
    $$('[data-close-modal]').forEach(function (b) { b.addEventListener('click', closeModal); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !$('#share-modal').hidden) closeModal();
    });
    $('#btn-copy-text').addEventListener('click', function () {
      copyText(C.toPlainText(state)).then(function (ok) {
        toast(ok ? '리포트를 텍스트로 복사했습니다.' : '복사하지 못했습니다.', ok ? null : 'warn');
      });
    });
  }

  /* ── 인쇄 ─────────────────────────────────────────────── */
  function doPrint() {
    renderReport(state, $('#print-root'), { mode: 'print' });
    window.print();
  }

  /* ── 브랜드 ───────────────────────────────────────────── */
  function fillBrand() {
    $('#b-logo').value = state.brand.logo || '';
    $('#b-company').value = state.brand.company || '';
    $('#b-owner').value = state.brand.owner || '';
    $('#b-role').value = state.brand.role || '';
    $('#b-email').value = state.brand.email || '';
    $('#b-phone').value = state.brand.phone || '';
    $('#b-color').value = state.brand.color || '#2f5bff';
    $('#color-code').textContent = state.brand.color || '#2f5bff';
    $('#s-name').value = state.signature.name || '';
    $('#s-role').value = state.signature.role || '';
    $('#s-date').value = state.signature.date || '';
    renderSwatches();
  }

  function renderSwatches() {
    var host = $('#color-swatches');
    clear(host);
    D.BRAND_COLORS.forEach(function (c) {
      var b = el('button', 'swatch' + (state.brand.color.toLowerCase() === c ? ' is-on' : ''));
      b.type = 'button';
      b.style.background = c;
      b.setAttribute('aria-label', '브랜드 컬러 ' + c);
      b.addEventListener('click', function () {
        state.brand.color = c;
        fillBrand();
        onEdit();
      });
      host.appendChild(b);
    });
  }

  function renderBrandPreview() {
    var host = $('#brand-preview');
    if (!host) return;
    clear(host);
    host.style.setProperty('--rc', state.brand.color || '#2f5bff');
    var head = el('div', 'bp-head');
    head.appendChild(el('span', 'bp-mark', (state.brand.logo || 'R').slice(0, 1)));
    var name = el('div');
    name.appendChild(el('div', 'bp-name', state.brand.logo || '로고 텍스트'));
    name.appendChild(el('div', 'bp-sub', 'WORK REPORT'));
    head.appendChild(name);
    host.appendChild(head);

    var body = el('div', 'bp-body');
    body.appendChild(el('div', 'bp-kicker', '주간 작업 증빙 리포트'));
    body.appendChild(el('div', 'bp-title', state.project || '프로젝트명이 여기에 들어갑니다'));
    body.appendChild(el('div', 'bp-line'));
    body.appendChild(el('div', 'bp-line short'));
    var sign = el('div', 'bp-sign');
    var line = el('div', 'line');
    line.appendChild(el('span', null, state.signature.name || ''));
    sign.appendChild(line);
    sign.appendChild(el('span', null, [state.brand.company, state.signature.name].filter(Boolean).join(' · ')));
    body.appendChild(sign);
    host.appendChild(body);
  }

  function wireBrand() {
    function bind(id, fn) {
      var n = $(id);
      if (!n) return;
      n.addEventListener('input', function () { fn(n.value); onEdit(); });
      n.addEventListener('change', function () { fn(n.value); onEdit(); });
    }
    bind('#b-logo', function (v) { state.brand.logo = v; });
    bind('#b-company', function (v) { state.brand.company = v; });
    bind('#b-owner', function (v) {
      var prev = state.brand.owner;
      state.brand.owner = v;
      if (!state.signature.name || state.signature.name === prev) state.signature.name = v;
      $('#s-name').value = state.signature.name || '';
    });
    bind('#b-role', function (v) {
      var prev = state.brand.role;
      state.brand.role = v;
      if (!state.signature.role || state.signature.role === prev) state.signature.role = v;
      $('#s-role').value = state.signature.role || '';
    });
    bind('#b-email', function (v) { state.brand.email = v; });
    bind('#b-phone', function (v) { state.brand.phone = v; });
    $('#b-color').addEventListener('input', function (e) {
      state.brand.color = e.target.value;
      $('#color-code').textContent = e.target.value;
      renderSwatches();
      onEdit();
    });
    bind('#s-name', function (v) { state.signature.name = v; });
    bind('#s-role', function (v) { state.signature.role = v; });
    bind('#s-date', function (v) { state.signature.date = C.normalizeDate(v); });
    $('#btn-brand-reset').addEventListener('click', function () {
      state.brand = C.clone(C.DEFAULT_BRAND);
      state.signature = { name: C.DEFAULT_BRAND.owner, role: C.DEFAULT_BRAND.role, date: state.signature.date };
      fillBrand();
      onEdit();
      toast('브랜드 정보를 기본값(가명)으로 되돌렸습니다.');
    });
    $('#btn-goto-preview').addEventListener('click', function () { setTab('client'); });
  }

  /* ── AI 브리지 ────────────────────────────────────────── */
  function wireBridge() {
    var memo = $('#f-memo');
    memo.addEventListener('input', function () {
      bridge.memo = memo.value;
      refreshPrompt();
    });

    var samples = $('#memo-samples');
    clear(samples);
    D.DEMO_MEMOS.forEach(function (m) {
      var b = el('button', 'chip', m.label);
      b.type = 'button';
      b.addEventListener('click', function () {
        memo.value = m.text;
        bridge.memo = m.text;
        refreshPrompt();
        toast('예시 메모를 넣었습니다. 내 메모로 바꿔도 됩니다.');
      });
      samples.appendChild(b);
    });

    var tones = $('#tone-chips');
    clear(tones);
    D.TONES.forEach(function (t) {
      var b = el('button', 'chip' + (bridge.tone === t.id ? ' is-on' : ''), t.label);
      b.type = 'button';
      b.setAttribute('data-tone', t.id);
      b.title = t.desc;
      b.setAttribute('aria-pressed', bridge.tone === t.id ? 'true' : 'false');
      b.addEventListener('click', function () {
        bridge.tone = t.id;
        $$('#tone-chips .chip').forEach(function (c) {
          var on = c.getAttribute('data-tone') === t.id;
          c.classList.toggle('is-on', on);
          c.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        refreshPrompt();
      });
      tones.appendChild(b);
    });

    $('#btn-build-prompt').addEventListener('click', function () {
      refreshPrompt();
      toast('프롬프트를 다시 만들었습니다.');
    });
    $('#btn-copy-prompt').addEventListener('click', function () {
      copyText(bridge.prompt).then(function (ok) {
        toast(ok ? '프롬프트를 복사했습니다. AI 창에 붙여 넣으세요.' : '복사하지 못했습니다.', ok ? null : 'warn');
      });
    });
    $$('[data-open]').forEach(function (b) {
      b.addEventListener('click', function () { openAI(b.getAttribute('data-open')); });
    });

    $('#btn-apply-result').addEventListener('click', applyResult);
    $('#btn-clear-result').addEventListener('click', function () {
      $('#f-result').value = '';
      setResultState('대기', '');
      toast('결과 칸을 비웠습니다.');
    });
    $('#f-result').addEventListener('input', function () {
      var v = $('#f-result').value.trim();
      if (!v) setResultState('대기', '');
      else setResultState(C.extractJSON(v).ok ? 'JSON' : '문장', C.extractJSON(v).ok ? 'is-ok' : 'is-warn');
    });

    $('#btn-pro-polish').addEventListener('click', runPro);
  }

  function setResultState(text, cls) {
    var p = $('#result-state');
    p.textContent = text;
    p.className = 'pill' + (cls ? ' ' + cls : '');
  }

  function refreshPrompt() {
    var box = $('#prompt-box');
    if (!box) return;
    var built = C.buildBridgePrompt(state, { tone: bridge.tone, memo: bridge.memo });
    bridge.prompt = built.prompt;
    box.textContent = built.prompt;
    $('#prompt-chars').textContent = built.prompt.length + '자';
  }

  function openAI(id) {
    var opener = null;
    D.OPENERS.forEach(function (o) { if (o.id === id) opener = o; });
    if (!opener) return;
    var prompt = bridge.prompt;
    copyText(prompt).then(function () {
      var url = opener.url;
      if (opener.prefill && prompt.length <= 6000) url += encodeURIComponent(prompt);
      var w = window.open(url, '_blank', 'noopener');
      toast(opener.prefill && prompt.length <= 6000
        ? opener.label + '를 열었습니다. 프롬프트가 함께 들어갔습니다.'
        : opener.label + '를 열었습니다. 프롬프트를 붙여 넣으세요(클립보드에 복사됨).');
      if (!w) toast('새 창이 막혔습니다. 팝업을 허용하고 다시 눌러 주세요.', 'warn');
    });
  }

  function applyResult() {
    var raw = $('#f-result').value;
    if (!raw.trim()) { toast('붙여 넣은 문장이 없습니다.', 'warn'); return; }
    var parsed = C.parseBridgeResult(raw);
    if (parsed.ok) {
      var out = C.applyBridgePatch(state, parsed.patch);
      state = out.state;
      fillMeta();
      renderItems();
      updateDerived();
      onEdit();
      setResultState('반영됨', 'is-ok');
      toast('요약 ' + (out.applied.summary ? '1곳, ' : '') + '메모 ' + out.applied.items + '곳을 반영했습니다.');
      $('#apply-note').textContent = '제목이 같은 항목의 메모만 바꿨습니다. 미리보기에서 확인하세요.';
      return;
    }
    /* JSON 이 아니면: 요약 칸에 넣을지 한 번 더 확인 */
    var text = raw.trim();
    if (text.charAt(0) !== '{') {
      if (state.summary && !window.confirm('JSON이 아닙니다. 이 문장을 요약 칸에 넣을까요? (기존 요약은 바뀝니다)')) {
        return;
      }
      state.summary = C.cut(C.oneLine(text), 800);
      fillMeta();
      updateDerived();
      onEdit();
      setResultState('요약 반영', 'is-warn');
      toast('JSON이 아니어서 요약 칸에 넣었습니다.');
      return;
    }
    setResultState('오류', 'is-error');
    toast(parsed.message || '응답을 읽지 못했습니다.', 'error');
  }

  /* ── Pro 연결 ─────────────────────────────────────────── */
  function setupPro() {
    if (!window.ProStudio || !window.ProConnector) return;
    try {
      pro = window.ProStudio.create(window.ProConnector);
      pro.badge('#proBadge');
      pro.sync(document);
      pro.onConnectChange(function () {
        try { pro.sync(document); } catch (e) { /* ignore */ }
      });
    } catch (e) { pro = null; }
  }

  function runPro() {
    if (!pro || !pro.engineReady()) {
      toast('Pro 연결 엔진을 불러오지 못했습니다. 새로고침해 주세요.', 'error');
      return;
    }
    if (!pro.connected()) {
      pro.openConnect();
      return;
    }
    if (busy) return;
    var btn = $('#btn-pro-polish');
    var label = btn.textContent;
    busy = true;
    btn.disabled = true;
    btn.textContent = '다듬는 중…';
    var req = C.buildProRequest(state, { tone: bridge.tone });
    if (bridge.memo) req.prompt += '\n\n[거친 작업 메모]\n' + C.cut(bridge.memo, 2000);
    var pending;
    try { pending = pro.engine.generate(req); } catch (e) {
      pending = Promise.resolve({ ok: false, message: e && e.message });
    }
    Promise.resolve(pending).then(function (res) {
      busy = false;
      btn.disabled = false;
      btn.textContent = label;
      if (!res || !res.ok) {
        toast((res && res.message) || 'Pro 응답을 받지 못했습니다.', 'error');
        return;
      }
      $('#f-result').value = res.text || '';
      var parsed = C.parseBridgeResult(res.text || '');
      if (!parsed.ok) {
        setResultState('오류', 'is-error');
        toast(parsed.message || '응답을 JSON으로 읽지 못했습니다.', 'warn');
        return;
      }
      var out = C.applyBridgePatch(state, parsed.patch);
      state = out.state;
      fillMeta();
      renderItems();
      updateDerived();
      onEdit();
      setResultState('Pro 반영', 'is-ok');
      toast('Pro가 요약과 메모 ' + out.applied.items + '곳을 다듬었습니다.');
    }, function (err) {
      busy = false;
      btn.disabled = false;
      btn.textContent = label;
      toast((err && err.message) || 'Pro 응답 중 문제가 생겼습니다.', 'error');
    });
  }

  /* ── 이력 ─────────────────────────────────────────────── */
  function renderHistory() {
    var host = $('#history-list');
    if (!host) return;
    clear(host);
    var list = C.historyList(storage);
    var empty = $('#history-empty');
    if (!list.length) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    list.forEach(function (entry) {
      var st = entry.state;
      var t = C.totals(st);
      var card = el('div', 'history-card' + (entry.id === state.id ? ' is-current' : ''));
      var main = el('div', 'hc-main');
      main.appendChild(el('h3', null, entry.project || '제목 없는 리포트'));
      var meta = el('div', 'hc-meta');
      if (entry.client) meta.appendChild(el('span', null, entry.client));
      var range = C.formatDateRange(entry.start, entry.end);
      if (range) meta.appendChild(el('span', null, range));
      if (entry.updatedAt) {
        var d = new Date(entry.updatedAt);
        if (!isNaN(d.getTime())) meta.appendChild(el('span', null, '저장 ' + C.formatDate(C.toISODateLocal(d))));
      }
      main.appendChild(meta);
      var stats = el('div', 'hc-stats');
      stats.appendChild(el('span', null, '완료 ' + t.doneCount + '건'));
      stats.appendChild(el('span', null, '소요 ' + C.formatHours(t.totalHours)));
      stats.appendChild(el('span', null, '근거 ' + t.evidenceCount + '개'));
      if (t.deltaPct !== null) stats.appendChild(el('span', null, (t.deltaPct > 0 ? '+' : '') + t.deltaPct + '%'));
      main.appendChild(stats);
      card.appendChild(main);

      var actions = el('div', 'hc-actions');
      var open = el('button', 'btn btn-outline btn-sm', '불러오기');
      open.type = 'button';
      open.addEventListener('click', function () { loadState(entry.state, true); });
      actions.appendChild(open);
      var dup = el('button', 'btn btn-ghost btn-sm', '복제');
      dup.type = 'button';
      dup.addEventListener('click', function () {
        var copy = C.clone(entry.state);
        copy.id = C.uid('rep');
        copy.project = (copy.project || '리포트') + ' (사본)';
        loadState(copy, true);
        toast('복제했습니다. 기간을 바꿔 다음 달 리포트로 쓰세요.');
      });
      actions.appendChild(dup);
      var del = el('button', 'btn btn-ghost btn-sm', '삭제');
      del.type = 'button';
      del.addEventListener('click', function () {
        C.historyRemove(storage, entry.id);
        renderHistory();
        toast('이력을 삭제했습니다.', null, '되돌리기', function () {
          C.historySave(storage, entry.state);
          renderHistory();
        });
      });
      actions.appendChild(del);
      card.appendChild(actions);
      host.appendChild(card);
    });
  }

  function loadState(next, silent) {
    state = C.normalizeState(next);
    if (!state.signature.date) state.signature.date = state.end || C.toISODateLocal(new Date());
    fillMeta();
    fillBrand();
    renderItems();
    updateDerived();
    setTab('write');
    scheduleSave();
    if (!silent) toast('리포트를 불러왔습니다.');
    else toast('불러왔습니다. 이어서 수정하세요.');
  }

  function wireHistory() {
    $('#btn-new').addEventListener('click', function () {
      var brand = state.brand;
      var sig = state.signature;
      state = freshState();
      state.brand = brand;
      state.signature = { name: sig.name, role: sig.role, date: C.toISODateLocal(new Date()) };
      fillMeta();
      fillBrand();
      renderItems();
      updateDerived();
      onEdit();
      setTab('write');
      toast('새 리포트를 시작했습니다. 이전 리포트는 이력에 남아 있습니다.');
    });

    $('#btn-export-json').addEventListener('click', function () {
      var blob = new Blob([C.toJSON(state)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      var name = (state.project || 'work-report').replace(/[\\/:*?"<>|\s]+/g, '-').slice(0, 40);
      a.download = name + '.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      toast('JSON 파일을 내려받았습니다.');
    });

    $('#import-json').addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var res = C.fromJSON(String(reader.result || ''));
        if (!res.ok) { toast(res.message || '불러오지 못했습니다.', 'error'); return; }
        loadState(res.state, true);
        toast('JSON을 불러왔습니다.');
      };
      reader.onerror = function () { toast('파일을 읽지 못했습니다.', 'error'); };
      reader.readAsText(file);
      e.target.value = '';
    });
  }

  /* ── 프리셋 ───────────────────────────────────────────── */
  function wirePresets() {
    $$('[data-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-preset');
        var preset = null;
        D.PRESETS.forEach(function (p) { if (p.id === id) preset = p; });
        if (!preset) return;
        applyPreset(preset);
      });
    });
    $('#btn-sample').addEventListener('click', function () {
      applyPreset(D.PRESETS[0]);
    });
  }

  function applyPreset(preset) {
    var brand = state.brand;
    var sig = state.signature;
    var next = D.expandPreset(preset, new Date());
    if (!next) return;
    next.brand = brand;
    next.signature = { name: sig.name || brand.owner, role: sig.role || brand.role, date: C.toISODateLocal(new Date()) };
    state = C.normalizeState(next);
    if (!state.items.length) state.items = C.normalizeState(next).items;
    fillMeta();
    fillBrand();
    renderItems();
    updateDerived();
    onEdit();
    toast('“' + preset.label + '” 예시를 채웠습니다. 그대로 공유 링크를 만들어 보세요.');
    var card = $('.hero-ledger');
    if (card && window.innerWidth > 1080) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ── 읽기 뷰 ──────────────────────────────────────────── */
  function bootRead(code) {
    var shell = $('#read-shell');
    var app = $('#app-shell');
    if (!shell || !app) return false;
    app.hidden = true;
    shell.hidden = false;
    document.body.classList.add('is-read');
    document.documentElement.setAttribute('data-mode', 'read');

    var res = C.decodeState(code);
    var reportHost = $('#read-report');
    var errBox = $('#read-error');
    if (!res.ok) {
      reportHost.hidden = true;
      errBox.hidden = false;
      $('#read-error-text').textContent = res.message || '링크를 읽지 못했습니다.';
      document.title = '리포트를 열 수 없습니다 · 작업 증빙 리포트';
      return true;
    }
    var readState = res.state;
    document.title = (readState.project || '작업 증빙 리포트') + ' · 작업 증빙 리포트';
    renderReport(readState, reportHost, { mode: 'read' });
    renderReport(readState, $('#print-root'), { mode: 'print' });
    $('#read-print').addEventListener('click', function () { window.print(); });
    $('#read-copy').addEventListener('click', function () {
      copyText(location.href).then(function (ok) {
        toast(ok ? '이 리포트 링크를 복사했습니다.' : '복사하지 못했습니다.', ok ? null : 'warn');
      });
    });
    $('#read-import').addEventListener('click', function () {
      if (!storage) { toast('이 브라우저에서는 저장이 막혀 있습니다.', 'warn'); return; }
      C.draftSave(storage, readState);
      window.location.href = baseUrl();
    });
    return true;
  }

  /* ── 시작 ─────────────────────────────────────────────── */
  function init() {
    var code = C.readShareParam(location.search) || C.readShareParam(location.hash);
    if (code) {
      if (bootRead(code)) return;
    }

    state = (storage && C.draftLoad(storage)) || freshState();
    if (!state.items.length) state.items = [C.emptyItem('done', 'content')];
    if (!state.signature.date) state.signature.date = state.end || C.toISODateLocal(new Date());

    wireTabs();
    wireMeta();
    wireItems();
    wireShare();
    wireBrand();
    wireBridge();
    wireHistory();
    wirePresets();
    setupPro();

    fillMeta();
    fillBrand();
    renderItems();
    updateDerived();
    markSaved('자동 저장');

    /* 히어로 CTA — 예시 채우기 · 공유 링크 */
    $$('[data-demo-start]').forEach(function (b) {
      b.addEventListener('click', function () { applyPreset(D.PRESETS[0]); });
    });
    $$('[data-share-cta]').forEach(function (b) {
      b.addEventListener('click', function () { doShare(); });
    });

    $('#btn-print').addEventListener('click', doPrint);
    $('#btn-print-rail').addEventListener('click', doPrint);
    $('#btn-client-print').addEventListener('click', doPrint);

    window.addEventListener('beforeprint', function () {
      if (state) renderReport(state, $('#print-root'), { mode: 'print' });
    });
    window.addEventListener('pagehide', function () { if (state) saveNow(); });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden' && state) saveNow();
    });
    window.addEventListener('storage', function (e) {
      if (e.key === C.DRAFT_KEY && e.newValue === null && state) {
        toast('다른 탭에서 초안이 지워졌습니다.', 'warn');
      }
    });

    if (!storage) markSaved('저장 안 됨(브라우저 설정)');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
