/* ============================================================
   작업 증빙 리포트 스튜디오 · core.js  v1.0.0
   ------------------------------------------------------------
   화면과 분리된 순수 로직. 브라우저에서는 window.POWCore,
   node 에서는 require('./core.js').
   DOM·localStorage·fetch 를 직접 만지지 않는다(저장소는 인자로 받는다).

   담당
   1) 상태 정규화·검증(공유 링크로 들어온 남의 데이터도 안전하게)
   2) 배열 압축 + base64url 인코딩 → ?d= 공유 코드
   3) 집계(완료 건수·소요시간·증빙률·전기간 대비)
   4) 클라이언트용 문장(요약·메모) 프롬프트와 응답 파싱
   5) 텍스트/마크다운 내보내기, 이력 저장소 어댑터

   원칙
   - 어떤 입력이 와도 throw 하지 않는다. 실패는 { ok:false, reason }.
   - 사용자 문자열은 자르기만 하고 지어내지 않는다.
   - 근거 URL 은 http/https 만 통과시킨다(javascript: 차단).
   ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(root);
  else root.POWCore = factory(root);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  var VERSION = '1.0.0';
  var PAYLOAD_VERSION = 1;
  var MARKER = 'pwr';           /* 남의 base64 를 리포트로 오해하지 않게 하는 표식 */
  var COMPRESS_PREFIX = 'z1';   /* DEFLATE 압축 코드 표식(z1 + base64url). 기존 코드는 'eyJ…'로 시작한다 */
  var MAX_CODE = 8000;          /* 이 길이를 넘으면 링크가 잘릴 수 있다 */
  var WARN_CODE = 6000;
  var MAX_ITEMS = 60;
  var MAX_HOURS = 999;
  var HISTORY_KEY = 'powr:v1:history';
  var DRAFT_KEY = 'powr:v1:draft';
  var HISTORY_LIMIT = 20;
  var MAX_SHOTS = 3;            /* 항목당 증빙 캡처 */
  var MAX_LOGO_CHARS = 160000;  /* 로고 data URL 상한(≈120KB) — 공유 링크에 담기므로 작게 */
  var MAX_SHOT_CHARS = 260000;  /* 캡처 1장 data URL 상한(≈195KB, 압축 후) */

  var STATUS_ORDER = ['done', 'doing', 'next', 'block'];
  var STATUS_META = {
    done: { id: 'done', label: '완료한 작업', short: '완료', code: 'd', section: '01' },
    doing: { id: 'doing', label: '진행 중', short: '진행 중', code: 'o', section: '02' },
    next: { id: 'next', label: '다음 주 계획', short: '다음 주', code: 'n', section: '03' },
    block: { id: 'block', label: '확인이 필요한 것', short: '블로커', code: 'b', section: '04' }
  };
  var CODE_TO_STATUS = { d: 'done', o: 'doing', n: 'next', b: 'block' };

  var CATEGORIES = [
    { id: 'content', label: '콘텐츠' },
    { id: 'dev', label: '개발' },
    { id: 'design', label: '디자인' },
    { id: 'ops', label: '운영' },
    { id: 'meeting', label: '미팅' },
    { id: 'etc', label: '기타' }
  ];
  var CATEGORY_IDS = CATEGORIES.map(function (c) { return c.id; });

  var DEFAULT_BRAND = {
    logo: '온빛기획',
    company: '온빛기획',
    color: '#2f5bff',
    owner: '김민수',
    role: '퍼포먼스 마케터',
    email: 'contact@example.com',
    phone: '',
    logoImg: ''
  };

  /* 업로드 이미지는 이 앱이 캔버스로 다시 그린 래스터(PNG/JPEG/WEBP)만 받는다.
     SVG 를 그대로 두면 공유 링크·붙여넣기 JSON 을 통해 스크립트가 들어올 수 있어
     상태에는 벡터 원본을 저장하지 않는다(화면에서는 항상 <img> 로만 그린다). */
  var IMG_DATA_RE = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

  function safeImage(v, maxChars) {
    var t = trim(v);
    if (!t) return '';
    if (t.length > (maxChars || MAX_SHOT_CHARS)) return '';
    if (!IMG_DATA_RE.test(t)) return '';
    return t;
  }

  function normalizeShots(list) {
    var out = [];
    if (!Array.isArray(list)) return out;
    for (var i = 0; i < list.length && out.length < MAX_SHOTS; i++) {
      var raw = list[i];
      var src = raw && typeof raw === 'object' ? raw.src : raw;
      var s = safeImage(src, MAX_SHOT_CHARS);
      if (!s || contains(out, s)) continue;
      out.push(s);
    }
    return out;
  }

  /* ── 기본 유틸 ─────────────────────────────────────────── */

  function str(v) { return v === null || v === undefined ? '' : String(v); }
  function trim(v) { return str(v).replace(/^\s+|\s+$/g, ''); }
  function oneLine(v) { return trim(v).replace(/\s*\n+\s*/g, ' ').replace(/\s{2,}/g, ' '); }
  function cut(v, n) { var t = trim(v); return t.length > n ? t.slice(0, n) : t; }
  function num(v) {
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    var t = trim(v).replace(/,/g, '');
    if (!t) return 0;
    var n = Number(t);
    return isFinite(n) ? n : 0;
  }
  function round1(n) { return Math.round(num(n) * 10) / 10; }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function uid(prefix) {
    var base = (prefix || 'it') + '_';
    var rand = '';
    if (root && root.crypto && typeof root.crypto.getRandomValues === 'function') {
      var buf = new Uint8Array(6);
      root.crypto.getRandomValues(buf);
      for (var i = 0; i < buf.length; i++) rand += ('0' + buf[i].toString(16)).slice(-2);
    } else {
      rand = Math.random().toString(16).slice(2, 14);
    }
    return base + Date.now().toString(36) + rand.slice(0, 6);
  }
  function indexOf(arr, v) { for (var i = 0; i < arr.length; i++) if (arr[i] === v) return i; return -1; }
  function contains(arr, v) { return indexOf(arr, v) >= 0; }

  /* ── 날짜 ─────────────────────────────────────────────── */

  function toISODateLocal(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  /** 'YYYY-MM-DD' | 'YYYY.MM.DD' | 'YYYY/MM/DD' | Date → 'YYYY-MM-DD' (실재하는 날짜만) */
  function normalizeDate(v) {
    if (v instanceof Date && !isNaN(v.getTime())) return toISODateLocal(v);
    var t = trim(v);
    if (!t) return '';
    var m = /^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/.exec(t);
    if (!m) return '';
    var y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return '';
    var dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return '';
    return y + '-' + pad2(mo) + '-' + pad2(d);
  }

  function dateFromISO(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trim(iso));
    if (!m) return null;
    var dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return isNaN(dt.getTime()) ? null : dt;
  }

  function formatDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trim(iso));
    return m ? m[1] + '.' + m[2] + '.' + m[3] : '';
  }

  function formatDateRange(start, end) {
    var a = normalizeDate(start), b = normalizeDate(end);
    if (!a && !b) return '';
    if (a && !b) return formatDate(a);
    if (!a && b) return formatDate(b);
    var ya = a.slice(0, 4), yb = b.slice(0, 4);
    if (ya === yb) return formatDate(a) + ' – ' + b.slice(5, 7) + '.' + b.slice(8, 10);
    return formatDate(a) + ' – ' + formatDate(b);
  }

  function periodDays(start, end) {
    var a = dateFromISO(normalizeDate(start)), b = dateFromISO(normalizeDate(end));
    if (!a || !b) return 0;
    var diff = Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
    return diff > 0 ? diff : 0;
  }

  var WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
  function weekdayKo(iso) {
    var d = dateFromISO(iso);
    return d ? WEEKDAYS[d.getDay()] : '';
  }

  /** 기준일이 속한 주의 '직전 주' 월~일 (월요일 시작) */
  function previousWeekRange(now) {
    var base = now instanceof Date ? now : new Date();
    var d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    var dow = (d.getDay() + 6) % 7;                 /* 월=0 */
    var thisMon = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow);
    var prevMon = new Date(thisMon.getFullYear(), thisMon.getMonth(), thisMon.getDate() - 7);
    var prevSun = new Date(thisMon.getFullYear(), thisMon.getMonth(), thisMon.getDate() - 1);
    return { start: toISODateLocal(prevMon), end: toISODateLocal(prevSun) };
  }

  /* ── 상태 ─────────────────────────────────────────────── */

  function emptyItem(status, category) {
    return {
      id: uid('it'),
      title: '',
      hours: 0,
      evidence: '',
      memo: '',
      ask: '',
      category: contains(CATEGORY_IDS, category) ? category : 'etc',
      status: contains(STATUS_ORDER, status) ? status : 'done'
    };
  }

  function emptyState() {
    return {
      id: uid('rep'),
      project: '',
      client: '',
      start: '',
      end: '',
      summary: '',
      compare: { prevHours: null },
      items: [emptyItem('done', 'content')],
      brand: clone(DEFAULT_BRAND),
      signature: { name: DEFAULT_BRAND.owner, role: DEFAULT_BRAND.role, date: '' },
      updatedAt: ''
    };
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function normalizeBrand(raw) {
    var b = raw && typeof raw === 'object' ? raw : {};
    var color = trim(b.color).toLowerCase();
    if (!/^#[0-9a-f]{6}$/.test(color)) color = DEFAULT_BRAND.color;
    return {
      logo: cut(b.logo, 40) || DEFAULT_BRAND.logo,
      company: cut(b.company, 60) || DEFAULT_BRAND.company,
      color: color,
      owner: cut(b.owner, 40) || DEFAULT_BRAND.owner,
      role: cut(b.role, 40),
      email: cut(b.email, 80),
      phone: cut(b.phone, 30),
      logoImg: safeImage(b.logoImg, MAX_LOGO_CHARS)
    };
  }

  function normalizeItem(raw, i, fallbackStatus) {
    var o = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    if (Array.isArray(raw)) {
      /* 배열 압축 형식: [title, hours, evidence, memo, category, code, ask, shots?] */
      o = {
        title: raw[0], hours: raw[1], evidence: raw[2], memo: raw[3],
        category: raw[4], status: CODE_TO_STATUS[str(raw[5])] || '', ask: raw[6],
        shots: raw[7]
      };
    }
    var status = contains(STATUS_ORDER, o.status) ? o.status : (fallbackStatus || 'done');
    var cat = contains(CATEGORY_IDS, o.category) ? o.category : 'etc';
    var hours = round1(o.hours);
    if (!isFinite(hours) || hours < 0) hours = 0;
    if (hours > MAX_HOURS) hours = MAX_HOURS;
    return {
      id: cut(o.id, 40) || uid('it') + i,
      title: cut(o.title, 120),
      hours: hours,
      evidence: cut(o.evidence, 300),
      memo: cut(o.memo, 600),
      ask: cut(o.ask, 240),
      category: cat,
      status: status,
      shots: normalizeShots(o.shots)
    };
  }

  function normalizeItemList(list, max) {
    var out = [];
    if (!Array.isArray(list)) return out;
    for (var i = 0; i < list.length && out.length < (max || MAX_ITEMS); i++) {
      var it = normalizeItem(list[i], i);
      /* 완전히 빈 항목은 버린다(빈 줄이 리포트에 남지 않게). 캡처만 있어도 증빙이라 남긴다. */
      if (!it.title && !it.memo && !it.evidence && !it.hours && !(it.shots && it.shots.length)) continue;
      out.push(it);
    }
    return out;
  }

  function normalizeState(raw) {
    var o = raw && typeof raw === 'object' ? raw : {};
    var brand = normalizeBrand(o.brand);
    var start = normalizeDate(o.start);
    var end = normalizeDate(o.end);
    var sigRaw = o.signature && typeof o.signature === 'object' ? o.signature : {};
    var prev = o.compare && typeof o.compare === 'object' ? o.compare.prevHours : null;
    prev = prev === null || prev === undefined || prev === '' ? null : round1(prev);
    if (prev !== null && (!isFinite(prev) || prev <= 0)) prev = null;
    return {
      id: cut(o.id, 60) || uid('rep'),
      project: cut(o.project, 100),
      client: cut(o.client, 80),
      start: start,
      end: end,
      summary: cut(o.summary, 800),
      compare: { prevHours: prev === null ? null : Math.min(prev, 9999) },
      items: normalizeItemList(o.items, MAX_ITEMS),
      brand: brand,
      signature: {
        name: cut(sigRaw.name, 40) || brand.owner,
        role: cut(sigRaw.role, 40) || brand.role,
        date: normalizeDate(sigRaw.date) || end || ''
      },
      updatedAt: cut(o.updatedAt, 40)
    };
  }

  /* ── URL ──────────────────────────────────────────────── */

  function safeUrl(v) {
    var t = trim(v);
    if (!t) return '';
    if (/^[\w.\-]+\.[a-z]{2,}(\/|$)/i.test(t) && !/^[a-z][a-z0-9+.\-]*:/i.test(t)) t = 'https://' + t;
    try {
      var u = new URL(t);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
      return u.href;
    } catch (e) {
      return '';
    }
  }

  var HOST_LABEL = {
    'github.com': 'GitHub',
    'www.github.com': 'GitHub',
    'gist.github.com': 'Gist',
    'notion.so': 'Notion',
    'www.notion.so': 'Notion',
    'notion.site': 'Notion',
    'figma.com': 'Figma',
    'www.figma.com': 'Figma',
    'docs.google.com': 'Google 문서',
    'sheets.google.com': 'Google 시트',
    'drive.google.com': 'Google 드라이브',
    'slides.google.com': 'Google 슬라이드',
    'trello.com': 'Trello',
    'asana.com': 'Asana',
    'linear.app': 'Linear',
    'slack.com': 'Slack',
    'youtube.com': 'YouTube',
    'www.youtube.com': 'YouTube',
    'blog.naver.com': '네이버 블로그',
    'instagram.com': 'Instagram',
    'www.instagram.com': 'Instagram',
    'vercel.com': 'Vercel',
    'netlify.com': 'Netlify'
  };

  function hostLabel(url) {
    var u = safeUrl(url);
    if (!u) return '';
    try {
      var parsed = new URL(u);
      var h = parsed.hostname.toLowerCase();
      if (h === 'docs.google.com') {
        var path = parsed.pathname || '';
        if (path.indexOf('/spreadsheets') === 0) return 'Google 시트';
        if (path.indexOf('/presentation') === 0) return 'Google 슬라이드';
        if (path.indexOf('/forms') === 0) return 'Google 설문';
        if (path.indexOf('/document') === 0) return 'Google 문서';
        return 'Google 문서';
      }
      if (HOST_LABEL[h]) return HOST_LABEL[h];
      var parts = h.replace(/^www\./, '').split('.');
      if (parts.length >= 2) return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      return h;
    } catch (e) { return ''; }
  }

  function hostOf(url) {
    var u = safeUrl(url);
    if (!u) return '';
    try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
  }

  /* ── base64url ────────────────────────────────────────── */

  function utf8Encode(s) {
    if (typeof TextEncoder !== 'undefined') {
      var bytes = new TextEncoder().encode(s);
      var out = '';
      for (var i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
      return out;
    }
    if (typeof Buffer !== 'undefined') return Buffer.from(s, 'utf8').toString('binary');
    return unescape(encodeURIComponent(s));
  }

  function utf8Decode(bin) {
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) & 0xff;
    if (typeof TextDecoder !== 'undefined') return new TextDecoder('utf-8').decode(bytes);
    if (typeof Buffer !== 'undefined') return Buffer.from(bin, 'binary').toString('utf8');
    return decodeURIComponent(escape(bin));
  }

  function b64encode(s) {
    var bin = utf8Encode(s);
    if (typeof btoa === 'function') return btoa(bin);
    if (typeof Buffer !== 'undefined') return Buffer.from(bin, 'binary').toString('base64');
    throw new Error('no base64');
  }

  function b64decode(b64) {
    if (typeof atob === 'function') return atob(b64);
    if (typeof Buffer !== 'undefined') return Buffer.from(b64, 'base64').toString('binary');
    throw new Error('no base64');
  }

  function toBase64Url(s) {
    return b64encode(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  /** 이미 UTF-8 바이트인 문자열(바이너리 문자열)을 그대로 base64url 로 — 재인코딩 금지 */
  function binToBase64Url(bin) {
    var b64;
    if (typeof btoa === 'function') b64 = btoa(bin);
    else if (typeof Buffer !== 'undefined') b64 = Buffer.from(bin, 'binary').toString('base64');
    else throw new Error('no base64');
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  /* ── DEFLATE 압축 (nodeca/pako, MIT) ────────────────────
     ?d= 공유 코드를 압축해 메신저에서 잘리는 길이를 줄인다.
     pako 가 없으면 압축 없이 예전 방식으로 내보낸다(조용한 실패 금지). */
  function pakoLib() {
    try {
      if (root && root.pako && typeof root.pako.deflateRaw === 'function') return root.pako;
    } catch (e) { /* 아래 전역 확인 */ }
    try {
      if (typeof pako !== 'undefined' && pako && typeof pako.deflateRaw === 'function') return pako;
    } catch (e2) { /* 없음 */ }
    return null;
  }

  function bytesToBinary(bytes) {
    var out = '';
    for (var i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
    return out;
  }

  function binaryToBytes(bin) {
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) & 0xff;
    return bytes;
  }

  function utf8Bytes(s) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s);
    return binaryToBytes(utf8Encode(s));
  }

  /** 압축 코드(z1 + base64url)인지 */
  function isCompressedCode(code) {
    return typeof code === 'string' && code.indexOf(COMPRESS_PREFIX) === 0 && code.length > COMPRESS_PREFIX.length;
  }

  function deflateCode(json) {
    var pk = pakoLib();
    if (!pk) return null;
    try {
      var raw = pk.deflateRaw(utf8Bytes(json), { level: 9 });
      return COMPRESS_PREFIX + binToBase64Url(bytesToBinary(raw));
    } catch (e) {
      return null;
    }
  }

  function inflateCode(code) {
    var pk = pakoLib();
    if (!pk) return null;
    var body = code.slice(COMPRESS_PREFIX.length);
    var bin = fromBase64Url(body);
    var raw = pk.inflateRaw(binaryToBytes(bin));
    return utf8Decode(bytesToBinary(raw));
  }

  function fromBase64Url(code) {
    var t = trim(code).replace(/-/g, '+').replace(/_/g, '/');
    while (t.length % 4) t += '=';
    return b64decode(t);
  }

  function byteLength(s) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s).length;
    return Buffer.byteLength(s, 'utf8');
  }

  /* ── 압축(키 생략 배열) + 인코딩 ──────────────────────── */

  function packState(state) {
    var s = normalizeState(state);
    return {
      v: PAYLOAD_VERSION,
      k: MARKER,
      p: s.project,
      c: s.client,
      s: s.start,
      e: s.end,
      m: s.summary,
      b: [s.brand.logo, s.brand.company, s.brand.color, s.brand.owner, s.brand.role, s.brand.email, s.brand.phone, s.brand.logoImg],
      g: [s.signature.name, s.signature.role, s.signature.date],
      h: s.compare.prevHours === null ? 0 : s.compare.prevHours,
      i: s.items.map(function (it) {
        var row = [it.title, it.hours, it.evidence, it.memo, it.category, STATUS_META[it.status].code, it.ask];
        /* 캡처가 없으면 배열을 7칸으로 유지해 링크 길이를 아낀다 */
        if (it.shots && it.shots.length) row.push(it.shots);
        return row;
      })
    };
  }

  function unpackState(packed) {
    if (!packed || typeof packed !== 'object') return null;
    if (packed.k !== MARKER) return null;
    var b = Array.isArray(packed.b) ? packed.b : [];
    var g = Array.isArray(packed.g) ? packed.g : [];
    var items = (Array.isArray(packed.i) ? packed.i : []).map(function (row) {
      if (!Array.isArray(row)) return row;
      return {
        title: row[0], hours: row[1], evidence: row[2], memo: row[3],
        category: row[4], status: CODE_TO_STATUS[str(row[5])] || '', ask: row[6],
        shots: row[7]
      };
    });
    return normalizeState({
      project: packed.p, client: packed.c, start: packed.s, end: packed.e,
      summary: packed.m,
      brand: { logo: b[0], company: b[1], color: b[2], owner: b[3], role: b[4], email: b[5], phone: b[6], logoImg: b[7] },
      signature: { name: g[0], role: g[1], date: g[2] },
      compare: { prevHours: num(packed.h) > 0 ? num(packed.h) : null },
      items: items
    });
  }

  /**
   * encodeState(state, opts) → { ok, code, length, bytes, plainBytes, savingsPct, rawLength, compressed, tooLong, warn }
   * 사람이 읽는 JSON 에서 키를 걷어내 배열로 바꾼 뒤 DEFLATE 압축 + base64url.
   * opts.compress === false 이면 예전(비압축) 방식으로 내보낸다 — 구버전 수신자용.
   */
  function encodeState(state, opts) {
    var o = opts || {};
    var s = normalizeState(state);
    var packed = packState(s);
    var json = JSON.stringify(packed);
    var plain = JSON.stringify(s);
    try {
      var legacy = toBase64Url(json);
      var compressedCode = o.compress === false ? null : deflateCode(json);
      var compressed = !!(compressedCode && compressedCode.length < legacy.length);
      var code = compressed ? compressedCode : legacy;
      var bytes = byteLength(json);
      var plainBytes = byteLength(plain);
      return {
        ok: true,
        code: code,
        length: code.length,
        rawLength: legacy.length,
        compressed: compressed,
        bytes: bytes,
        plainBytes: plainBytes,
        savingsPct: plainBytes ? Math.round((1 - bytes / plainBytes) * 1000) / 10 : 0,
        linkSavingsPct: legacy.length ? Math.round((1 - code.length / legacy.length) * 1000) / 10 : 0,
        tooLong: code.length > MAX_CODE,
        warn: code.length > WARN_CODE,
        state: s
      };
    } catch (e) {
      return { ok: false, reason: 'encode_failed', message: '공유 코드를 만들지 못했습니다.', code: '' };
    }
  }

  /** 공유 코드/URL/?d=… 무엇이 들어와도 코드만 뽑아낸다 */
  function extractCode(input) {
    var t = trim(input);
    if (!t) return '';
    if (/^https?:\/\//i.test(t) || t.indexOf('?') >= 0 || t.indexOf('#') >= 0) {
      try {
        var u = new URL(t, 'https://local.invalid/');
        var q = u.searchParams.get('d') || u.searchParams.get('r') || '';
        if (q) return trim(q);
        var m = /[?&#]d=([^&#]+)/.exec(t);
        if (m) return decodeURIComponent(m[1]);
      } catch (e) { /* 아래 정규식으로 */ }
      var m2 = /[?&#]d=([^&#]+)/.exec(t);
      if (m2) {
        try { return decodeURIComponent(m2[1]); } catch (e2) { return m2[1]; }
      }
    }
    return t.replace(/\s+/g, '');
  }

  /**
   * decodeState(codeOrUrl) → { ok, state, reason, message }
   * reason: empty | bad_base64 | bad_json | bad_marker | bad_version | bad_state
   */
  function decodeState(input) {
    var code = extractCode(input);
    if (!code) return { ok: false, reason: 'empty', message: '공유 코드가 비어 있습니다.' };
    var json;
    if (isCompressedCode(code)) {
      if (!pakoLib()) {
        return { ok: false, reason: 'need_inflate', message: '압축된 링크를 풀 라이브러리를 불러오지 못했습니다. 앱을 새로고침해 주세요.' };
      }
      try { json = inflateCode(code); } catch (e) {
        return { ok: false, reason: 'bad_inflate', message: '공유 링크가 손상되었습니다(주소가 잘렸을 수 있습니다).' };
      }
    } else {
      var raw;
      try { raw = fromBase64Url(code); } catch (e) {
        return { ok: false, reason: 'bad_base64', message: '공유 링크가 손상되었습니다(주소가 잘렸을 수 있습니다).' };
      }
      try { json = utf8Decode(raw); } catch (e) {
        return { ok: false, reason: 'bad_base64', message: '공유 링크를 읽지 못했습니다.' };
      }
    }
    var packed;
    try { packed = JSON.parse(json); } catch (e) {
      return { ok: false, reason: 'bad_json', message: '공유 링크의 내용을 해석하지 못했습니다.' };
    }
    if (!packed || typeof packed !== 'object' || packed.k !== MARKER) {
      return { ok: false, reason: 'bad_marker', message: '이 앱의 리포트 링크가 아닙니다.' };
    }
    if (num(packed.v) > PAYLOAD_VERSION) {
      return { ok: false, reason: 'bad_version', message: '더 새로운 버전에서 만든 링크입니다. 앱을 새로고침해 주세요.' };
    }
    var state = unpackState(packed);
    if (!state) return { ok: false, reason: 'bad_state', message: '리포트 내용이 비어 있습니다.' };
    if (!state.project && !state.items.length) {
      return { ok: false, reason: 'bad_state', message: '리포트 내용이 비어 있습니다.' };
    }
    return { ok: true, state: state, reason: '' };
  }

  function readShareParam(search) {
    var t = trim(search);
    if (!t) return '';
    if (t.charAt(0) === '?') t = t.slice(1);
    var parts = t.split('&');
    for (var i = 0; i < parts.length; i++) {
      var kv = parts[i].split('=');
      if (kv[0] === 'd' || kv[0] === 'r') {
        try { return decodeURIComponent(kv.slice(1).join('=') || ''); } catch (e) { return kv.slice(1).join('='); }
      }
    }
    return '';
  }

  function buildShareUrl(base, code) {
    var b = trim(base);
    if (!b) return '';
    var hashIdx = b.indexOf('#');
    var hash = hashIdx >= 0 ? b.slice(hashIdx) : '';
    if (hashIdx >= 0) b = b.slice(0, hashIdx);
    var qIdx = b.indexOf('?');
    if (qIdx >= 0) b = b.slice(0, qIdx);
    if (!b) return '';
    return b + '?d=' + trim(code) + hash;
  }

  /** base(현재 index.html 주소)에서 공유 URL 까지 한 번에 */
  function shareLink(state, base) {
    var enc = encodeState(state);
    if (!enc.ok) return enc;
    enc.url = buildShareUrl(base, enc.code);
    return enc;
  }

  /* ── 업로드 이미지 도우미 ────────────────────────────── */

  function shotCount(state) {
    var s = state && typeof state === 'object' ? state : {};
    var list = Array.isArray(s.items) ? s.items : [];
    var n = 0;
    for (var i = 0; i < list.length; i++) {
      if (list && list[i] && Array.isArray(list[i].shots)) n += list[i].shots.length;
    }
    return n;
  }

  /** 상태에 들어 있는 이미지 data URL 의 문자 수 합(저장·링크 용량 확인용) */
  function imageChars(state) {
    var s = state && typeof state === 'object' ? state : {};
    var n = 0;
    if (s.brand && typeof s.brand.logoImg === 'string') n += s.brand.logoImg.length;
    var list = Array.isArray(s.items) ? s.items : [];
    for (var i = 0; i < list.length; i++) {
      var shots = list[i] && Array.isArray(list[i].shots) ? list[i].shots : [];
      for (var j = 0; j < shots.length; j++) n += String(shots[j] || '').length;
    }
    return n;
  }

  /** 공유 링크가 너무 길 때 캡처만 빼고 다시 만드는 용도 */
  function stripShots(state) {
    var s = normalizeState(state);
    s.items.forEach(function (it) { it.shots = []; });
    return s;
  }

  /* ── 집계 ─────────────────────────────────────────────── */

  function hoursOf(items) {
    var h = 0;
    for (var i = 0; i < items.length; i++) {
      if (items[i] && typeof items[i] === 'object') h += num(items[i].hours);
    }
    return round1(h);
  }

  function totals(state) {
    var s = state && typeof state === 'object' ? state : {};
    var src = Array.isArray(s.items) ? s.items : [];
    var items = [];
    for (var i = 0; i < src.length; i++) {
      var row = src[i];
      if (!row || typeof row !== 'object') continue;
      /* 아직 아무것도 적지 않은 빈 줄은 집계에서 뺀다(화면의 “완료 1” 오해 방지) */
      if (!trim(row.title) && !trim(row.memo) && !trim(row.evidence) && !num(row.hours)) continue;
      items.push(row);
    }
    var by = { done: [], doing: [], next: [], block: [] };
    items.forEach(function (it) {
      var key = contains(STATUS_ORDER, it.status) ? it.status : 'done';
      by[key].push(it);
    });

    var doneHours = hoursOf(by.done);
    var doingHours = hoursOf(by.doing);
    var totalHours = round1(doneHours + doingHours);

    var linked = by.done.concat(by.doing).filter(function (it) { return !!safeUrl(it.evidence); });
    var linkedHours = hoursOf(linked);

    var catMap = {};
    by.done.concat(by.doing).forEach(function (it) {
      var cat = contains(CATEGORY_IDS, it.category) ? it.category : 'etc';
      if (!catMap[cat]) catMap[cat] = { id: cat, hours: 0, count: 0 };
      catMap[cat].hours = round1(catMap[cat].hours + (num(it.hours) || 0));
      catMap[cat].count += 1;
    });
    var categories = CATEGORIES.map(function (c) {
      var row = catMap[c.id] || { hours: 0, count: 0 };
      return {
        id: c.id, label: c.label, hours: row.hours, count: row.count,
        pct: totalHours ? Math.round((row.hours / totalHours) * 100) : 0
      };
    }).filter(function (c) { return c.count > 0; });
    categories.sort(function (a, b) { return b.hours - a.hours; });

    var prev = s.compare && typeof s.compare === 'object' ? round1(s.compare.prevHours) : null;
    if (!prev || !isFinite(prev) || prev <= 0) prev = null;
    var deltaPct = prev ? Math.round(((totalHours - prev) / prev) * 1000) / 10 : null;

    return {
      doneCount: by.done.length,
      doingCount: by.doing.length,
      nextCount: by.next.length,
      blockCount: by.block.length,
      doneHours: doneHours,
      doingHours: doingHours,
      totalHours: totalHours,
      nextHours: hoursOf(by.next),
      evidenceCount: linked.length,
      evidenceHours: linkedHours,
      coverage: totalHours > 0 ? Math.round((linkedHours / totalHours) * 100) : (linked.length ? 100 : 0),
      categories: categories,
      topCategory: categories.length ? categories[0] : null,
      prevHours: prev,
      deltaPct: deltaPct,
      itemCount: items.length,
      shotCount: shotCount(s)
    };
  }

  function deltaText(t) {
    var tt = t && typeof t === 'object' && 'deltaPct' in t ? t : totals(t);
    if (tt.deltaPct === null || tt.deltaPct === undefined) return '첫 리포트';
    var sign = tt.deltaPct > 0 ? '+' : '';
    var body = sign + (Math.round(tt.deltaPct * 10) / 10) + '%';
    return tt.prevHours ? body + ' (지난 기간 ' + formatHours(tt.prevHours) + ')' : body;
  }

  function autoSummary(state) {
    var s = normalizeState(state);
    var t = totals(s);
    if (!t.doneCount && !t.doingCount) return '';
    var parts = [];
    parts.push('이번 기간 완료한 작업은 ' + t.doneCount + '건, 총 ' + formatHours(t.totalHours) + '입니다.');
    if (t.topCategory && t.totalHours > 0) {
      parts.push(t.topCategory.label + ' 작업이 ' + t.topCategory.pct + '%로 가장 많았습니다.');
    }
    if (t.doingCount) parts.push(t.doingCount + '건은 이어서 진행 중입니다.');
    if (t.blockCount) parts.push('확인이 필요한 항목이 ' + t.blockCount + '건 있습니다.');
    if (t.evidenceCount) parts.push('근거 링크 ' + t.evidenceCount + '개를 함께 정리했습니다.');
    return parts.join(' ');
  }

  function formatHours(h) {
    var n = round1(h);
    if (!n) return '0h';
    return (Number.isInteger(n) ? String(n) : String(n)) + 'h';
  }

  function formatHoursKo(h) {
    var n = round1(h);
    if (!n) return '0시간';
    var whole = Math.floor(n);
    var mins = Math.round((n - whole) * 60);
    if (!mins) return whole + '시간';
    return whole + '시간 ' + mins + '분';
  }

  /* ── 검증 ─────────────────────────────────────────────── */

  function issue(level, field, message, index) {
    return { level: level, field: field, message: message, index: typeof index === 'number' ? index : -1 };
  }

  /** validate(state) → { ok, errors, warnings, issues } */
  function validate(state) {
    var s = normalizeState(state);
    var issues = [];
    if (!s.project) issues.push(issue('error', 'project', '프로젝트명을 넣어 주세요.'));
    if (!s.client) issues.push(issue('warn', 'client', '클라이언트명이 비어 있습니다. 받는 사람이 누구인지 적어 두세요.'));
    if (!s.start || !s.end) issues.push(issue('error', 'period', '보고 기간(시작·종료)을 넣어 주세요.'));
    else if (s.start > s.end) issues.push(issue('error', 'period', '시작일이 종료일보다 늦습니다.'));

    var done = s.items.filter(function (it) { return it.status === 'done' && trim(it.title); });
    if (!done.length) issues.push(issue('error', 'items', '완료한 작업이 0건입니다. 최소 1건이 있어야 증빙이 됩니다.'));

    s.items.forEach(function (it, i) {
      var label = it.title ? '“' + it.title + '”' : (i + 1) + '번째 항목';
      if (!it.title && it.status === 'done') {
        issues.push(issue('warn', 'item-title', label + '의 제목이 비어 리포트에서 빠집니다.', i));
      }
      if (it.evidence && !safeUrl(it.evidence)) {
        issues.push(issue('error', 'item-url', label + '의 근거 주소는 http/https 주소만 됩니다.', i));
      }
      if (it.title && it.status === 'done' && !it.hours) {
        issues.push(issue('warn', 'item-hours', label + '의 소요시간이 0입니다.', i));
      }
    });

    var withUrl = s.items.filter(function (it) { return it.evidence && !safeUrl(it.evidence); });
    if (withUrl.length) { /* 위에서 이미 개별 오류로 잡았다 */ }

    var t = totals(s);
    if (t.coverage < 50 && (t.doneCount + t.doingCount) > 1) {
      issues.push(issue('warn', 'coverage', '근거 링크가 붙은 시간이 ' + t.coverage + '%뿐입니다. 링크가 있는 항목이 클라이언트를 설득합니다.'));
    }
    if (s.summary.length > 400) issues.push(issue('warn', 'summary', '한 줄 요약이 깁니다(400자 이내 권장).'));

    var errors = issues.filter(function (x) { return x.level === 'error'; });
    var warnings = issues.filter(function (x) { return x.level === 'warn'; });
    return { ok: errors.length === 0, errors: errors, warnings: warnings, issues: issues, totals: t };
  }

  /* ── 개인정보 점검 ─────────────────────────────────────
     공유 링크는 로그인이 없으므로, 주소를 아는 사람은 누구나 본다.
     리포트에 실수로 들어간 연락처·식별번호를 공유 전에 알린다. */

  var PRIVATE_PATTERNS = [
    { kind: 'rrn', label: '주민등록번호 형태', re: /\b\d{6}[-\s]?[1-4]\d{6}\b/g },
    { kind: 'phone', label: '전화번호', re: /\b0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}\b/g },
    { kind: 'email', label: '이메일 주소', re: /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g },
    { kind: 'account', label: '계좌·카드 형태 숫자', re: /\b\d{2,6}[-\s]\d{2,6}[-\s]\d{2,8}(?:[-\s]\d{2,4})?\b/g }
  ];

  /** 날짜·전화번호는 계좌로 오인하지 않는다. */
  function looksLikeAccount(text) {
    var digits = text.replace(/\D/g, '');
    if (digits.length < 9) return false;
    if (/^0/.test(digits)) return false;                       /* 휴대폰·유선 */
    if (/^(19|20)\d{2}[-.\/]\d{1,2}[-.\/]\d{1,2}$/.test(text)) return false; /* 날짜 */
    if (/^\d{4}[-.\/]\d{1,2}[-.\/]\d{1,2}$/.test(text)) return false;
    return true;
  }

  function maskSample(text) {
    var t = str(text);
    if (t.length <= 4) return '••••';
    return t.slice(0, 3) + '•'.repeat(Math.max(2, t.length - 5)) + t.slice(-2);
  }

  /** privacyScan(state) → [{ kind, label, where, sample }] */
  function privacyScan(state) {
    var s = normalizeState(state);
    var found = [];
    var fields = [];
    if (s.summary) fields.push({ where: '한 줄 요약', text: s.summary });
    s.items.forEach(function (it, i) {
      var name = it.title || (i + 1) + '번째 항목';
      if (it.memo) fields.push({ where: name + ' 메모', text: it.memo });
      if (it.ask) fields.push({ where: name + ' 요청', text: it.ask });
      if (it.title) fields.push({ where: name + ' 제목', text: it.title });
    });
    fields.forEach(function (f) {
      PRIVATE_PATTERNS.forEach(function (p) {
        p.re.lastIndex = 0;
        var m;
        while ((m = p.re.exec(f.text)) !== null) {
          if (p.kind === 'account' && !looksLikeAccount(m[0])) continue;
          found.push({ kind: p.kind, label: p.label, where: f.where, sample: maskSample(m[0]) });
          if (found.length > 12) return;
        }
      });
    });
    return found.slice(0, 12);
  }

  /* ── 텍스트 내보내기 ──────────────────────────────────── */

  function sectionItems(s, status) {
    return s.items.filter(function (it) { return it.status === status && it.title; });
  }

  function toPlainText(state) {
    var s = normalizeState(state);
    var t = totals(s);
    var lines = [];
    lines.push('[작업 증빙 리포트] ' + (s.project || '제목 없음'));
    if (s.client) lines.push('클라이언트: ' + s.client);
    var period = formatDateRange(s.start, s.end);
    if (period) lines.push('기간: ' + period + (periodDays(s.start, s.end) ? ' (' + periodDays(s.start, s.end) + '일)' : ''));
    lines.push('요약: 완료 ' + t.doneCount + '건 · 총 ' + formatHours(t.totalHours) + ' · 근거 ' + t.evidenceCount + '개 · ' + deltaText(t));
    if (s.summary) { lines.push(''); lines.push(s.summary); }
    STATUS_ORDER.forEach(function (st) {
      var list = sectionItems(s, st);
      if (!list.length) return;
      lines.push('');
      lines.push('■ ' + STATUS_META[st].label + ' (' + list.length + ')');
      list.forEach(function (it, i) {
        var tail = [];
        if (it.hours) tail.push(formatHours(it.hours));
        if (it.evidence) tail.push('근거 ' + safeUrl(it.evidence));
        lines.push((i + 1) + '. ' + it.title + (tail.length ? ' — ' + tail.join(' · ') : ''));
        if (it.memo) lines.push('   ' + it.memo);
        if (it.ask) lines.push('   요청: ' + it.ask);
      });
    });
    lines.push('');
    lines.push('— ' + [s.signature.name, s.signature.role, s.brand.company].filter(Boolean).join(' · '));
    if (s.signature.date) lines.push('작성일 ' + formatDate(s.signature.date));
    return lines.join('\n');
  }

  function toMarkdown(state) {
    var s = normalizeState(state);
    var t = totals(s);
    var md = [];
    md.push('# ' + (s.project || '작업 증빙 리포트'));
    md.push('');
    var meta = [];
    if (s.client) meta.push('**클라이언트** ' + s.client);
    var period = formatDateRange(s.start, s.end);
    if (period) meta.push('**기간** ' + period);
    meta.push('**요약** 완료 ' + t.doneCount + '건 · 총 ' + formatHours(t.totalHours) + ' · 근거 ' + t.evidenceCount + '개 · ' + deltaText(t));
    md.push(meta.join('  \n'));
    if (s.summary) { md.push(''); md.push('> ' + s.summary); }
    STATUS_ORDER.forEach(function (st) {
      var list = sectionItems(s, st);
      if (!list.length) return;
      md.push('');
      md.push('## ' + STATUS_META[st].label + ' (' + list.length + ')');
      list.forEach(function (it) {
        var head = '- **' + it.title + '**';
        if (it.hours) head += ' · ' + formatHours(it.hours);
        if (it.evidence) head += ' · [' + (hostLabel(it.evidence) || '근거') + '](' + safeUrl(it.evidence) + ')';
        md.push(head);
        if (it.memo) md.push('  ' + it.memo);
        if (it.ask) md.push('  - 요청: ' + it.ask);
      });
    });
    md.push('');
    md.push('---');
    md.push([s.signature.name, s.signature.role, s.brand.company].filter(Boolean).join(' · '));
    return md.join('\n');
  }

  /* ── 브리지 프롬프트 ──────────────────────────────────── */

  var TONE_HINT = {
    plain: '담백하게. 성과는 입력에 있는 숫자만, 과장 없이.',
    result: '성과를 문장 앞에 두되, 입력에 없는 숫자는 절대 만들지 않는다.',
    short: '항목마다 딱 한 문장. 80자 이내.'
  };

  function itemsBlock(s, status) {
    var list = s.items.filter(function (it) { return it.status === status; });
    if (!list.length) return '(없음)';
    return list.map(function (it, i) {
      var bits = [];
      bits.push((i + 1) + ') ' + (it.title || '(제목 없음)'));
      if (it.hours) bits.push('소요 ' + formatHours(it.hours));
      bits.push('분류 ' + categoryLabel(it.category));
      if (it.evidence) bits.push('근거 ' + safeUrl(it.evidence));
      if (it.memo) bits.push('메모: ' + it.memo);
      if (it.ask) bits.push('요청: ' + it.ask);
      return bits.join(' / ');
    }).join('\n');
  }

  function categoryLabel(id) {
    for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].id === id) return CATEGORIES[i].label;
    return '기타';
  }

  /** buildBridgePrompt(state, { tone }) → { system, prompt, rules } */
  function buildBridgePrompt(state, opts) {
    var s = normalizeState(state);
    var o = opts || {};
    var tone = TONE_HINT[o.tone] || TONE_HINT.plain;
    var t = totals(s);
    var period = formatDateRange(s.start, s.end) || '(기간 없음)';

    var system = [
      '너는 프리랜서·1인 대행사의 작업 증빙 리포트를 클라이언트가 읽기 좋게 다듬는 한국어 에디터다.',
      '주어진 사실만 쓴다. 없는 숫자·성과·원인을 만들지 않는다.',
      '결과는 설명 없이 JSON 하나만 낸다.'
    ].join(' ');

    var prompt = [
      '[이번 리포트]',
      '프로젝트: ' + (s.project || '(없음)'),
      '클라이언트: ' + (s.client || '(없음)'),
      '기간: ' + period,
      '집계: 완료 ' + t.doneCount + '건 · 총 ' + formatHours(t.totalHours) + ' · 근거 링크 ' + t.evidenceCount + '개 · 증빙률 ' + t.coverage + '%',
      '',
      '[내가 쓴 초안 요약]',
      s.summary || '(없음)',
      '',
      '[거친 작업 메모]',
      o.memo ? cut(o.memo, 2000) : '(없음)',
      '',
      '[완료한 작업]',
      itemsBlock(s, 'done'),
      '',
      '[진행 중]',
      itemsBlock(s, 'doing'),
      '',
      '[다음 주 계획]',
      itemsBlock(s, 'next'),
      '',
      '[확인이 필요한 것]',
      itemsBlock(s, 'block'),
      '',
      '[다듬는 규칙]',
      '1. 숫자·기간·링크는 위에 있는 것만 쓴다. 조회수·매출·순위·전환율을 새로 만들지 않는다.',
      '2. 확인되지 않은 원인이나 약속을 단정하지 않는다. 모르면 "확인 중"이라고 쓴다.',
      '3. 상투구 금지: "최선을 다하겠습니다", "소중한", "함께 성장", "더 나은 내일".',
      '4. 클라이언트가 다음에 할 일(블로커)은 요청 문장으로 분명히 쓴다.',
      '5. 합니다체. 이모지·감탄 부호 없이. 메모는 1~2문장, 120자 이내.',
      '6. 제목은 원문 그대로 둔다(항목 매칭에 쓴다).',
      '7. 톤: ' + tone,
      '',
      '[출력 — JSON만, 코드펜스 없이]',
      '{"summary":"이번 기간을 3문장 이내로",',
      ' "items":[{"title":"원래 제목 그대로","memo":"클라이언트용 1~2문장"}],',
      ' "next":[{"title":"원래 제목 그대로","memo":"무엇을 언제까지"}],',
      ' "blockers":[{"title":"원래 제목 그대로","memo":"상황","ask":"클라이언트가 해줄 일"}]}'
    ].join('\n');

    return {
      system: system,
      prompt: prompt,
      memo: o.memo || '',
      tone: o.tone || 'plain',
      chars: prompt.length,
      label: '작업 증빙 리포트 다듬기'
    };
  }

  /** Pro 엔진(generic)에 넣을 요청 묶음 */
  function buildProRequest(state, opts) {
    var b = buildBridgePrompt(state, opts);
    return {
      task: 'text',
      prompt: b.prompt,
      system: b.system,
      options: { temperature: 0.4, maxTokens: 1600 }
    };
  }

  function extractJSON(text) {
    var raw = trim(text);
    if (!raw) return { ok: false, reason: 'empty', value: null };
    var body = raw;
    var fence = /```(?:json|JSON)?\s*([\s\S]*?)```/.exec(raw);
    if (fence && trim(fence[1])) body = trim(fence[1]);
    function tryParse(x) { try { return { ok: true, value: JSON.parse(x) }; } catch (e) { return null; } }
    var direct = tryParse(body);
    if (direct) return direct;
    var start = body.indexOf('{'), end = body.lastIndexOf('}');
    if (start >= 0 && end > start) {
      var sliced = body.slice(start, end + 1);
      var second = tryParse(sliced);
      if (second) return second;
      var cleaned = sliced.replace(/,\s*([}\]])/g, '$1');
      var third = tryParse(cleaned);
      if (third) return third;
    }
    return { ok: false, reason: 'not_json', value: null };
  }

  function normTitle(v) {
    return trim(v).toLowerCase().replace(/[\s\u00a0]+/g, '').replace(/[“”"'`.,:;!?·…\-–—()\[\]]/g, '');
  }

  /**
   * parseBridgeResult(text) → { ok, patch:{ summary, memos:{정규화제목:memo}, asks:{...} }, reason }
   * 모델이 제목을 살짝 바꿔도 붙일 수 있게 정규화 제목으로 맞춘다.
   */
  function parseBridgeResult(text) {
    var parsed = extractJSON(text);
    if (!parsed.ok) {
      return { ok: false, reason: parsed.reason, message: '응답을 JSON으로 읽지 못했습니다. 다시 시도해 주세요.', patch: null };
    }
    var v = parsed.value;
    if (!v || typeof v !== 'object') {
      return { ok: false, reason: 'bad_shape', message: '응답 형식이 예상과 다릅니다.', patch: null };
    }
    var patch = { summary: '', memos: {}, asks: {} };
    if (typeof v.summary === 'string') patch.summary = cut(oneLine(v.summary), 600);
    if (typeof v.summary === 'object' && v.summary && typeof v.summary.text === 'string') {
      patch.summary = cut(oneLine(v.summary.text), 600);
    }
    function take(list, withAsk) {
      if (!Array.isArray(list)) return 0;
      var n = 0;
      list.forEach(function (row) {
        if (!row || typeof row !== 'object') return;
        var key = normTitle(row.title);
        var memo = cut(oneLine(row.memo || row.text || row.note || ''), 400);
        if (!key || !memo) return;
        patch.memos[key] = memo;
        if (withAsk) {
          var ask = cut(oneLine(row.ask || row.request || row.needed || ''), 240);
          if (ask) patch.asks[key] = ask;
        }
        n += 1;
      });
      return n;
    }
    var n = 0;
    n += take(v.items, false);
    n += take(v.next, false);
    n += take(v.blockers, true);
    if (!patch.summary && !n) {
      return { ok: false, reason: 'empty_patch', message: '응답에 반영할 문장이 없습니다.', patch: null };
    }
    patch.count = n;
    return { ok: true, patch: patch, reason: '' };
  }

  /** applyBridgePatch(state, patch) → { state, applied:{summary:bool, items:n} } */
  function applyBridgePatch(state, patch) {
    var s = normalizeState(state);
    if (!patch) return { state: s, applied: { summary: false, items: 0 } };
    var applied = { summary: false, items: 0 };
    var memos = patch.memos && typeof patch.memos === 'object' ? patch.memos : {};
    var asks = patch.asks && typeof patch.asks === 'object' ? patch.asks : {};
    if (patch.summary) { s.summary = cut(patch.summary, 800); applied.summary = true; }
    s.items.forEach(function (it) {
      var key = normTitle(it.title);
      if (!key) return;
      if (memos[key]) { it.memo = cut(memos[key], 600); applied.items += 1; }
      if (asks[key]) it.ask = cut(asks[key], 240);
    });
    return { state: s, applied: applied };
  }

  /* ── 저장소 어댑터 ────────────────────────────────────── */

  function historyList(storage) {
    if (!storage) return [];
    var raw = '';
    try { raw = storage.getItem(HISTORY_KEY) || ''; } catch (e) { return []; }
    if (!raw) return [];
    var list;
    try { list = JSON.parse(raw); } catch (e) { return []; }
    if (!Array.isArray(list)) return [];
    return list.filter(function (e) { return e && typeof e === 'object' && e.state; });
  }

  function totalsBrief(state) {
    var t = totals(state);
    return {
      doneCount: t.doneCount, totalHours: t.totalHours,
      evidenceCount: t.evidenceCount, coverage: t.coverage, deltaPct: t.deltaPct
    };
  }

  function historySave(storage, state, now) {
    if (!storage) return { ok: false, reason: 'no_storage', list: [] };
    var s = normalizeState(state);
    var stamp = now instanceof Date ? now.toISOString() : (typeof now === 'string' && now ? now : new Date().toISOString());
    s.updatedAt = stamp;
    var list = historyList(storage);
    /* 이력에는 캡처 이미지를 쌓지 않는다(로컬 저장소 5MB 보호).
       가장 최근 1건만 이미지를 품고, 오래된 이력에서는 걷어낸다.
       초안(draft)에는 항상 전부 남으므로 지금 작업 중인 화면은 그대로다. */
    list.forEach(function (e) {
      if (!e || !e.state || !Array.isArray(e.state.items)) return;
      e.state.items.forEach(function (it) { if (it) it.shots = []; });
    });
    var entry = {
      id: s.id,
      project: s.project,
      client: s.client,
      start: s.start,
      end: s.end,
      updatedAt: stamp,
      totals: totalsBrief(s),
      state: s
    };
    var idx = -1;
    for (var i = 0; i < list.length; i++) if (list[i].id === s.id) { idx = i; break; }
    if (idx < 0 && (s.project || s.client)) {
      /* 같은 프로젝트·클라이언트·기간이면 같은 리포트로 본다(프리셋을 다시 눌러도 중복 이력이 쌓이지 않게) */
      var key = [s.project, s.client, s.start, s.end].join('|');
      for (var j = 0; j < list.length; j++) {
        if ([list[j].project, list[j].client, list[j].start, list[j].end].join('|') === key) { idx = j; break; }
      }
      if (idx >= 0) entry.id = list[idx].id;
    }
    if (idx >= 0) list.splice(idx, 1);
    list.unshift(entry);
    if (list.length > HISTORY_LIMIT) list = list.slice(0, HISTORY_LIMIT);
    try {
      storage.setItem(HISTORY_KEY, JSON.stringify(list));
    } catch (e) {
      /* 용량 초과: 오래된 것부터 버리고 한 번 더 */
      try {
        list = list.slice(0, Math.max(1, Math.floor(list.length / 2)));
        storage.setItem(HISTORY_KEY, JSON.stringify(list));
      } catch (e2) {
        return { ok: false, reason: 'quota', list: list };
      }
    }
    return { ok: true, list: list, id: entry.id, entry: entry };
  }

  function historyRemove(storage, id) {
    if (!storage) return { ok: false, list: [] };
    var list = historyList(storage).filter(function (e) { return e.id !== id; });
    try { storage.setItem(HISTORY_KEY, JSON.stringify(list)); } catch (e) { return { ok: false, list: list }; }
    return { ok: true, list: list };
  }

  function historyGet(storage, id) {
    var list = historyList(storage);
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function draftSave(storage, state) {
    if (!storage) return false;
    try { storage.setItem(DRAFT_KEY, JSON.stringify(normalizeState(state))); return true; }
    catch (e) { return false; }
  }

  function draftLoad(storage) {
    if (!storage) return null;
    try {
      var raw = storage.getItem(DRAFT_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || typeof obj !== 'object') return null;
      return normalizeState(obj);
    } catch (e) { return null; }
  }

  function draftClear(storage) {
    if (!storage) return false;
    try { storage.removeItem(DRAFT_KEY); return true; } catch (e) { return false; }
  }

  /* ── 내보내기/가져오기(JSON) ──────────────────────────── */

  function toJSON(state) {
    return JSON.stringify({ app: 'proof-of-work-report', v: PAYLOAD_VERSION, state: normalizeState(state) }, null, 2);
  }

  function fromJSON(text) {
    var parsed;
    try { parsed = JSON.parse(trim(text)); } catch (e) {
      return { ok: false, reason: 'bad_json', message: 'JSON 파일을 읽지 못했습니다.' };
    }
    var raw = parsed && parsed.state ? parsed.state : parsed;
    if (!raw || typeof raw !== 'object') {
      return { ok: false, reason: 'bad_shape', message: '리포트 JSON 형식이 아닙니다.' };
    }
    var s = normalizeState(raw);
    if (!s.project && !s.items.length) {
      return { ok: false, reason: 'empty', message: '리포트 내용이 비어 있습니다.' };
    }
    return { ok: true, state: s };
  }

  return {
    VERSION: VERSION,
    PAYLOAD_VERSION: PAYLOAD_VERSION,
    HISTORY_KEY: HISTORY_KEY,
    DRAFT_KEY: DRAFT_KEY,
    MAX_CODE: MAX_CODE,
    COMPRESS_PREFIX: COMPRESS_PREFIX,
    isCompressedCode: isCompressedCode,
    hasCompressor: function () { return !!pakoLib(); },
    WARN_CODE: WARN_CODE,
    MAX_ITEMS: MAX_ITEMS,
    MAX_SHOTS: MAX_SHOTS,
    MAX_LOGO_CHARS: MAX_LOGO_CHARS,
    MAX_SHOT_CHARS: MAX_SHOT_CHARS,
    normalizeShots: normalizeShots,
    safeImage: safeImage,
    shotCount: shotCount,
    imageChars: imageChars,
    stripShots: stripShots,
    STATUS_ORDER: STATUS_ORDER,
    STATUS_META: STATUS_META,
    CATEGORIES: CATEGORIES,
    DEFAULT_BRAND: DEFAULT_BRAND,

    /* 기본 */
    str: str, trim: trim, oneLine: oneLine, cut: cut, num: num, round1: round1, uid: uid,
    clone: clone,

    /* 날짜 */
    normalizeDate: normalizeDate,
    formatDate: formatDate,
    formatDateRange: formatDateRange,
    periodDays: periodDays,
    weekdayKo: weekdayKo,
    previousWeekRange: previousWeekRange,
    toISODateLocal: toISODateLocal,

    /* 상태 */
    emptyState: emptyState,
    emptyItem: emptyItem,
    normalizeState: normalizeState,
    normalizeItem: normalizeItem,

    /* URL */
    safeUrl: safeUrl,
    hostLabel: hostLabel,
    hostOf: hostOf,
    extractCode: extractCode,

    /* 공유 코드 */
    encodeState: encodeState,
    decodeState: decodeState,
    packState: packState,
    unpackState: unpackState,
    readShareParam: readShareParam,
    buildShareUrl: buildShareUrl,
    shareLink: shareLink,

    /* 집계·검증 */
    totals: totals,
    totalsBrief: totalsBrief,
    deltaText: deltaText,
    autoSummary: autoSummary,
    validate: validate,
    privacyScan: privacyScan,
    formatHours: formatHours,
    formatHoursKo: formatHoursKo,
    categoryLabel: categoryLabel,

    /* 내보내기 */
    toPlainText: toPlainText,
    toMarkdown: toMarkdown,
    toJSON: toJSON,
    fromJSON: fromJSON,

    /* 브리지 */
    buildBridgePrompt: buildBridgePrompt,
    buildProRequest: buildProRequest,
    parseBridgeResult: parseBridgeResult,
    applyBridgePatch: applyBridgePatch,
    extractJSON: extractJSON,
    normTitle: normTitle,

    /* 저장소 */
    historyList: historyList,
    historySave: historySave,
    historyRemove: historyRemove,
    historyGet: historyGet,
    draftSave: draftSave,
    draftLoad: draftLoad,
    draftClear: draftClear
  };
});
