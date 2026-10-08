/* app.js — JSON Lens core.
 *
 * PRIVACY NOTE / "ZERO NETWORK" IMPLEMENTATION:
 * This file contains no fetch(), no XMLHttpRequest, no WebSocket, no <img>,
 * no external <script>/<link>, and no analytics of any kind. All parsing,
 * rendering, searching and copying happens in this tab's JavaScript engine.
 * The extension's manifest requests only "clipboardRead" (to read your
 * clipboard when YOU press the Paste button) and "storage" (to remember
 * your last input on this device). There is nowhere for your data to go.
 */
'use strict';

const $ = (id) => document.getElementById(id);
const input = $('input');
const errorBox = $('error-box');
const treeOutput = $('tree-output');
const textOutput = $('text-output');
const textCode = $('text-code');
const emptyState = $('empty-state');
const searchInput = $('search');
const searchCount = $('search-count');
const statusValid = $('status-valid');
const statusSize = $('status-size');
const inputStats = $('input-stats');

const MAX_RENDER_CHARS = 500_000; // guard against pathological inputs
let lastValue = null;             // last successfully parsed value
let lastValid = false;            // whether the current input is valid JSON
let lastPretty = '';              // last formatted text
let searchMatches = [];           // [element, ...]
let searchIndex = -1;
let debounceTimer = null;

/* ---------- parsing & error location ---------- */

// Minimal recursive-descent JSON parser whose only job is to report WHERE
// the first syntax error is (line/col). Used when the engine's own error
// message doesn't carry a position (newer V8 versions don't).
function findJsonError(text) {
  let i = 0, line = 1, col = 1;
  const fail = (msg) => ({ message: msg, line, col });
  const peek = () => text[i];
  const next = () => { const ch = text[i++]; if (ch === '\n') { line++; col = 1; } else { col++; } return ch; };
  const skipWs = () => { while (i < text.length && /\s/.test(text[i])) next(); };
  const advance = (n) => { for (let k = 0; k < n; k++) next(); };

  function parseString() {
    next(); // opening quote
    while (i < text.length) {
      const ch = next();
      if (ch === '"') return;
      if (ch === '\\') {
        const e = next();
        if (!'"\\/bfnrtu'.includes(e)) throw fail(`Bad escape '\\${e}' in string`);
        if (e === 'u') {
          for (let k = 0; k < 4; k++) {
            if (!/[0-9a-fA-F]/.test(peek() || '')) throw fail('Bad unicode escape in string');
            next();
          }
        }
      } else if (ch === '\n') {
        throw fail('Unterminated string');
      }
    }
    throw fail('Unterminated string');
  }

  function parseNumber() {
    if (peek() === '-') next();
    if (peek() === '0') { next(); }
    else if (/[1-9]/.test(peek() || '')) { while (/[0-9]/.test(peek() || '')) next(); }
    else throw fail(`Unexpected token '${peek() || 'end of input'}'`);
    if (peek() === '.') { next(); if (!/[0-9]/.test(peek() || '')) throw fail("Expected digit after '.'"); while (/[0-9]/.test(peek() || '')) next(); }
    if (peek() === 'e' || peek() === 'E') {
      next();
      if (peek() === '+' || peek() === '-') next();
      if (!/[0-9]/.test(peek() || '')) throw fail('Expected digit in exponent');
      while (/[0-9]/.test(peek() || '')) next();
    }
  }

  function parseArray() {
    next(); skipWs(); // [
    if (peek() === ']') { next(); return; }
    while (true) {
      parseValue();
      skipWs();
      const ch = peek();
      if (ch === ',') { next(); skipWs(); continue; }
      if (ch === ']') { next(); return; }
      throw fail(`Expected ',' or ']' but found '${ch || 'end of input'}'`);
    }
  }

  function parseObject() {
    next(); skipWs(); // {
    if (peek() === '}') { next(); return; }
    while (true) {
      skipWs();
      if (peek() !== '"') throw fail(`Expected string key but found '${peek() || 'end of input'}'`);
      parseString();
      skipWs();
      if (peek() !== ':') throw fail(`Expected ':' but found '${peek() || 'end of input'}'`);
      next();
      parseValue();
      skipWs();
      const ch = peek();
      if (ch === ',') { next(); continue; }
      if (ch === '}') { next(); return; }
      throw fail(`Expected ',' or '}' but found '${ch || 'end of input'}'`);
    }
  }

  function parseValue() {
    skipWs();
    const ch = peek();
    if (ch === '{') return parseObject();
    if (ch === '[') return parseArray();
    if (ch === '"') return parseString();
    if (ch === '-' || (ch >= '0' && ch <= '9')) return parseNumber();
    if (text.startsWith('true', i)) return advance(4);
    if (text.startsWith('false', i)) return advance(5);
    if (text.startsWith('null', i)) return advance(4);
    throw fail(`Unexpected token '${ch === undefined ? 'end of input' : ch}'`);
  }

  try {
    if (!text.trim()) throw fail('Empty input');
    parseValue();
    skipWs();
    if (i < text.length) throw fail(`Unexpected trailing content '${text.slice(i, i + 12)}…'`);
    return null; // valid — shouldn't happen on this path
  } catch (e) {
    if (e && typeof e.line === 'number') return e;
    throw e;
  }
}

function parseWithPosition(text) {
  try {
    return { value: JSON.parse(text), error: null };
  } catch (e) {
    // Older V8 messages include "at position N" — use it when present.
    const m = /at position (\d+)/.exec(e.message);
    let line = 1, col = 1;
    if (m) {
      const before = text.slice(0, Number(m[1]));
      line = before.split('\n').length;
      col = Number(m[1]) - before.lastIndexOf('\n');
    } else {
      // Newer V8 dropped the position — locate it ourselves.
      const located = findJsonError(text);
      if (located) { line = located.line; col = located.col; }
    }
    return { value: null, error: { message: e.message, line, col } };
  }
}

function showError(err, text) {
  errorBox.classList.remove('hidden');
  const where = err.line > 1 || err.col > 1 ? ` (line ${err.line}, column ${err.col})` : '';
  errorBox.textContent = `Invalid JSON${where}: ${err.message}`;
  statusValid.textContent = '✗ Invalid JSON';
  statusValid.classList.add('invalid');
  statusValid.classList.remove('valid');
}

function hideError() {
  errorBox.classList.add('hidden');
  statusValid.textContent = '✓ Valid JSON';
  statusValid.classList.add('valid');
  statusValid.classList.remove('invalid');
}

/* ---------- syntax highlighting (text view) ---------- */

const TOKEN_RE = /("(\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?([eE][+-]?\d+)?/g;

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightJson(json) {
  return escapeHtml(json).replace(TOKEN_RE, (match, str, _e, colon, keyword, _d, _f, _g) => {
    if (str !== undefined) {
      return colon
        ? `<span class="tok-key">${str}</span>${escapeHtml(colon)}`
        : `<span class="tok-str">${str}</span>`;
    }
    if (keyword !== undefined) return `<span class="tok-kw">${keyword}</span>`;
    return `<span class="tok-num">${match}</span>`;
  });
}

/* ---------- tree view ---------- */

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

function renderPrimitive(value) {
  const t = value === null ? 'null' : typeof value;
  const map = { string: 'str', number: 'num', boolean: 'bool', null: 'null' };
  return el('span', 'tok-' + (map[t] || 'str'), t === 'string' ? JSON.stringify(value) : String(value));
}

function childCount(value) {
  return Array.isArray(value) ? value.length : Object.keys(value).length;
}

function renderNode(value, key /* string|null */, isLast) {
  const wrap = el('div', 'node');

  if (value !== null && typeof value === 'object') {
    const isArr = Array.isArray(value);
    const count = childCount(value);
    const header = el('div', 'node-header');
    const toggle = el('span', 'toggle', '▾');
    header.appendChild(toggle);
    if (key !== null) {
      header.appendChild(el('span', 'tok-key', JSON.stringify(key)));
      header.appendChild(el('span', 'punct', ': '));
    }
    const bracket = el('span', 'punct', isArr ? '[' : '{');
    header.appendChild(bracket);
    const summary = el('span', 'summary muted', count === 0 ? (isArr ? ']' : '}') + (isLast ? '' : ',') : ` … ${count} ${isArr ? 'item' + (count === 1 ? '' : 's') : 'key' + (count === 1 ? '' : 's')}`);
    header.appendChild(summary);

    const children = el('div', 'node-children');
    const entries = isArr ? value.map((v, i) => [null, v, i]) : Object.entries(value).map(([k, v], i) => [k, v, i]);
    for (const [k, v, i] of entries) {
      children.appendChild(renderNode(v, isArr ? null : k, i === entries.length - 1));
    }
    const closer = el('div', 'node-closer punct', (isArr ? ']' : '}') + (isLast ? '' : ','));
    children.appendChild(closer);

    if (count === 0) {
      wrap.appendChild(header); // empty: header already shows closed brackets
    } else {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.node-children')) return;
        const collapsed = wrap.classList.toggle('collapsed');
        toggle.textContent = collapsed ? '▸' : '▾';
      });
      wrap.appendChild(header);
      wrap.appendChild(children);
    }
  } else {
    const leaf = el('div', 'node-leaf');
    if (key !== null) {
      leaf.appendChild(el('span', 'tok-key', JSON.stringify(key)));
      leaf.appendChild(el('span', 'punct', ': '));
    }
    leaf.appendChild(renderPrimitive(value));
    leaf.appendChild(el('span', 'punct', isLast ? '' : ','));
    wrap.appendChild(leaf);
  }
  return wrap;
}

/* ---------- main render pipeline ---------- */

function render() {
  const text = input.value;
  inputStats.textContent = text ? `${text.length.toLocaleString()} chars` : '';
  statusSize.textContent = text ? `${new Blob([text]).size.toLocaleString()} bytes` : '';

  if (!text.trim()) {
    lastValue = null; lastValid = false; lastPretty = '';
    treeOutput.innerHTML = ''; textCode.innerHTML = '';
    emptyState.classList.remove('hidden');
    statusValid.textContent = '—';
    statusValid.classList.remove('valid', 'invalid');
    hideErrorSilent();
    clearSearch();
    return;
  }
  emptyState.classList.add('hidden');

  if (text.length > MAX_RENDER_CHARS) {
    showTooLarge();
    return;
  }

  const { value, error } = parseWithPosition(text);
  if (error) {
    showError(error, text);
    lastValue = null; lastValid = false; lastPretty = '';
    treeOutput.innerHTML = ''; textCode.innerHTML = '';
    clearSearch();
    return;
  }

  hideError();
  lastValue = value;
  lastValid = true;
  lastPretty = JSON.stringify(value, null, 2);

  // Tree view
  treeOutput.innerHTML = '';
  treeOutput.appendChild(renderNode(value, null, true));

  // Text view (highlighted)
  textCode.innerHTML = highlightJson(lastPretty);

  runSearch(); // re-apply active search term
  persist(text);
}

function hideErrorSilent() { errorBox.classList.add('hidden'); }

function showTooLarge() {
  errorBox.classList.remove('hidden');
  errorBox.textContent = `Input is larger than ${(MAX_RENDER_CHARS / 1000).toLocaleString()}k characters — rendering is disabled to keep the tab responsive. (Pro will support huge files.)`;
  treeOutput.innerHTML = ''; textCode.innerHTML = '';
}

/* ---------- search ---------- */

function clearSearch() {
  searchMatches = []; searchIndex = -1;
  searchCount.textContent = '';
}

function runSearch() {
  clearSearch();
  const q = searchInput.value.trim();
  if (!q || !lastPretty) return;
  const lower = q.toLowerCase();

  const activeEl = !textOutput.classList.contains('hidden') ? textCode : treeOutput;

  // Wrap every match in <mark class="search-hit"> by splitting text nodes.
  const walker = document.createTreeWalker(activeEl, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const text = node.nodeValue;
    const li = text.toLowerCase();
    let idx = li.indexOf(lower);
    if (idx === -1) continue;
    const frag = document.createDocumentFragment();
    let cursor = 0;
    while (idx !== -1) {
      frag.append(document.createTextNode(text.slice(cursor, idx)));
      const mark = document.createElement('mark');
      mark.className = 'search-hit';
      mark.textContent = text.slice(idx, idx + q.length);
      frag.append(mark);
      searchMatches.push(mark);
      cursor = idx + q.length;
      idx = li.indexOf(lower, cursor);
    }
    frag.append(document.createTextNode(text.slice(cursor)));
    node.parentNode.replaceChild(frag, node);
  }

  if (searchMatches.length) {
    searchCount.textContent = `${searchMatches.length} match${searchMatches.length === 1 ? '' : 'es'}`;
    goToMatch(0);
  } else {
    searchCount.textContent = 'no matches';
  }
}

function goToMatch(i) {
  if (!searchMatches.length) return;
  searchMatches.forEach((m) => m.classList.remove('current'));
  searchIndex = (i + searchMatches.length) % searchMatches.length;
  const m = searchMatches[searchIndex];
  m.classList.add('current');
  if (typeof m.scrollIntoView === 'function') m.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  searchCount.textContent = `${searchIndex + 1} / ${searchMatches.length}`;
}

/* ---------- actions ---------- */

function scheduleRender() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(render, 250);
}

function persist(text) {
  // Remember the input on THIS DEVICE ONLY. No sync, no server.
  try { chrome.storage.local.set({ lastInput: text.slice(0, 200_000) }); } catch (_) {}
}

function restore() {
  try {
    chrome.storage.local.get('lastInput', (r) => {
      if (r.lastInput) { input.value = r.lastInput; render(); }
    });
  } catch (_) {}
}

async function copyText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    flash(btn, 'Copied!');
  } catch (_) {
    // Fallback for older contexts
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    flash(btn, 'Copied!');
  }
}

function flash(btn, msg) {
  const orig = btn.textContent;
  btn.textContent = msg;
  setTimeout(() => { btn.textContent = orig; }, 1200);
}

/* ---------- wiring ---------- */

input.addEventListener('input', scheduleRender);

$('btn-sample').addEventListener('click', () => {
  input.value = JSON.stringify({
    product: 'JSON Lens',
    tagline: 'The JSON formatter that never phones home.',
    version: '0.1.0',
    privacy: { networkRequests: 0, tracking: false, ads: false, account: null },
    features: ['format', 'highlight', 'tree-view', 'search', 'validate'],
    pricing: { free: 'everything', pro: 4.99 }
  }, null, 2);
  render();
});

$('btn-paste').addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) { input.value = text; render(); }
    else flash($('btn-paste'), 'Clipboard empty');
  } catch (_) {
    flash($('btn-paste'), 'Clipboard blocked');
  }
});

$('file-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader(); // local file read — never uploaded anywhere
  reader.onload = () => { input.value = String(reader.result); render(); };
  reader.readAsText(file);
  e.target.value = '';
});

$('btn-clear').addEventListener('click', () => {
  input.value = '';
  try { chrome.storage.local.remove('lastInput'); } catch (_) {}
  render();
  input.focus();
});

// View tabs
$('tab-tree').addEventListener('click', () => {
  $('tab-tree').classList.add('active');
  $('tab-text').classList.remove('active');
  treeOutput.classList.remove('hidden');
  textOutput.classList.add('hidden');
  document.querySelectorAll('.tree-only').forEach((b) => b.disabled = false);
  runSearch();
});
$('tab-text').addEventListener('click', () => {
  $('tab-text').classList.add('active');
  $('tab-tree').classList.remove('active');
  textOutput.classList.remove('hidden');
  treeOutput.classList.add('hidden');
  document.querySelectorAll('.tree-only').forEach((b) => b.disabled = true);
  runSearch();
});

// Copy buttons
$('btn-copy-pretty').addEventListener('click', (e) => {
  if (!lastPretty) return flash(e.currentTarget, 'Nothing to copy');
  copyText(lastPretty, e.currentTarget);
});
$('btn-copy-min').addEventListener('click', (e) => {
  if (!lastValid) return flash(e.currentTarget, 'Nothing to copy');
  copyText(JSON.stringify(lastValue), e.currentTarget);
});

// Expand / collapse all
$('btn-expand-all').addEventListener('click', () => {
  treeOutput.querySelectorAll('.node.collapsed').forEach((n) => {
    n.classList.remove('collapsed');
    const t = n.querySelector(':scope > .node-header > .toggle');
    if (t) t.textContent = '▾';
  });
});
$('btn-collapse-all').addEventListener('click', () => {
  treeOutput.querySelectorAll('.node > .node-children').forEach((c) => {
    const n = c.parentElement;
    if (n.querySelector(':scope > .node-header')) {
      n.classList.add('collapsed');
      const t = n.querySelector(':scope > .node-header > .toggle');
      if (t) t.textContent = '▸';
    }
  });
});

// Search
searchInput.addEventListener('input', () => { render(); }); // render() re-applies search
$('search-next').addEventListener('click', () => goToMatch(searchIndex + 1));
$('search-prev').addEventListener('click', () => goToMatch(searchIndex - 1));
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') goToMatch(searchIndex + (e.shiftKey ? -1 : 1));
});

// Initial
restore();
