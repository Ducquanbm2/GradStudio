#!/usr/bin/env node
// contract-check — send every example in docs/api/*.md to a running API and
// compare each answer with the answer block written under it.
//
// CSC13008 PA#3/PA#4. Node 18 or newer, built-in modules only: no npm install.
//
//   node contract-check.mjs [--base http://localhost:3001] [--repo .]
//                           [--strict-values] [--only <file.md>] [--json <out.json>]
//
// What it reads
//   docs/api/README.md first, then the other docs/api/*.md in alphabetical
//   order; in each file, the examples from top to bottom. State carries over
//   from one example to the next, so start the API fresh before a run.
//   An example is a ```http request block followed by a ```http answer block
//   (`HTTP/1.1 <status> …`). A ```sh block with one `curl` command is a
//   request too (for uploads). `{{token:<name>}}` is replaced by the token of
//   the demo account <name> in the "Demo accounts" table of FRONTEND.md (PA#4:
//   or of BACKEND.md, for the names FRONTEND.md does not have): we
//   sign in through the sign-in example of the contract (a POST to …/login,
//   …/signin, …/sessions or …/tokens) with that account's e-mail or user name
//   and password, and take the first string under a key containing "token".
//
// What it compares
//   - the status code;
//   - the names of the fields in the JSON answer, at every depth. A field the
//     example shows and the answer lacks, or a field the answer has and the
//     example does not show, is a FAIL. In a list, every item is compared with
//     the first item of the example. `…` stands for "anything": as a value it
//     is not compared; as the last item of a list or object (`, …`) it allows
//     more items or fields.
//   - values are reported as NOTE lines and do not fail the run, unless you
//     pass --strict-values.
//   It also lists the endpoints of the README table that have no example, and
//   the examples whose endpoint is not in that table.
//
// Exit code: 0 when nothing failed, 1 otherwise, 2 when it could not run.

import fs from 'node:fs';
import path from 'node:path';

// ------------------------------------------------------------------ arguments

const argv = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : dflt;
};
if (argv.includes('-h') || argv.includes('--help')) {
  const head = fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 33);
  console.log(head.map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(0);
}
const BASE = opt('--base', 'http://localhost:3001').replace(/\/+$/, '');
const REPO = path.resolve(opt('--repo', '.'));
const DOCS = path.join(REPO, 'docs', 'api');
const ONLY = opt('--only', null);
const JSON_OUT = opt('--json', null);
const STRICT = argv.includes('--strict-values');
const TIMEOUT_MS = Number(opt('--timeout', '10000'));
const ANY = Symbol('any');            // a value written …
const OPEN = Symbol('open');          // `, …` at the end of an object or a list

const results = [];
let fails = 0;
const out = (kind, where, msg, details = []) => {
  if (kind === 'FAIL') fails += 1;
  console.log(`${kind.padEnd(4)}  ${where}  ${msg}`);
  for (const d of details) console.log(`        ${d}`);
};

// ------------------------------------------------------------------ markdown

/** Fenced blocks of a markdown file, skipping the ones nested in a longer fence. */
function fencedBlocks(text) {
  const lines = text.split(/\r?\n/);
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)(`{3,}|~{3,})\s*([\w+-]*)/);
    if (!m) continue;
    const fence = m[2];
    const lang = m[3].toLowerCase();
    const body = [];
    let j = i + 1;
    for (; j < lines.length; j++) {
      const c = lines[j].match(/^\s*(`{3,}|~{3,})\s*$/);
      if (c && c[1][0] === fence[0] && c[1].length >= fence.length) break;
      body.push(lines[j]);
    }
    // strip the indentation the block shares (blocks inside a list item)
    const indent = Math.min(...body.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length), 99);
    blocks.push({ lang, line: i + 1, lines: body.map((l) => l.slice(Math.min(indent, l.match(/^\s*/)[0].length))) });
    i = j;
  }
  return blocks;
}

/** One request or answer per block, in order. */
function examplesOf(file) {
  const text = fs.readFileSync(file, 'utf8');
  const name = path.relative(DOCS, file);
  const items = [];
  for (const b of fencedBlocks(text)) {
    const first = b.lines.find((l) => l.trim()) || '';
    if (b.lang === 'http') {
      if (/^HTTP\/\d(\.\d)?\s+\d{3}/.test(first.trim())) items.push({ kind: 'answer', ...b });
      else if (/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+\S+/.test(first.trim())) items.push({ kind: 'request', form: 'http', ...b });
    } else if (['sh', 'bash', 'shell', 'console'].includes(b.lang) && /(^|\s)curl\s/.test(b.lines.join(' '))) {
      items.push({ kind: 'request', form: 'curl', ...b });
    }
  }
  const examples = [];
  for (let k = 0; k < items.length; k++) {
    const it = items[k];
    const where = `${name}:${it.line}`;
    if (it.kind === 'answer') {
      examples.push({ where, error: 'an answer block with no request block before it' });
      continue;
    }
    const next = items[k + 1];
    if (!next || next.kind !== 'answer') {
      examples.push({ where, error: 'a request block with no ```http answer block after it' });
      continue;
    }
    examples.push({ where, file: name, request: it, answer: next });
    k += 1;
  }
  return examples;
}

// ------------------------------------------------------------------ JSON with …

/** Parse a JSON body in which `…` (or `...`) stands for anything. */
function parseLoose(src) {
  let s = '';
  const stack = [];
  let prev = '';            // last significant character outside strings
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '"') {
      let j = i + 1;
      for (; j < src.length; j++) {
        if (src[j] === '\\') { j++; continue; }
        if (src[j] === '"') break;
      }
      s += src.slice(i, j + 1);
      i = j;
      prev = '"';
      continue;
    }
    const dots = ch === '…' ? 1 : src.startsWith('...', i) ? 3 : 0;
    if (dots) {
      const top = stack[stack.length - 1];
      let k = i + dots;
      while (k < src.length && /\s/.test(src[k])) k++;
      const closing = src[k] === '}' || src[k] === ']';
      if (top === '{' && (prev === '{' || prev === ',')) s += '"\\u0000open":true';
      else if (top === '[' && (prev === '[' || prev === ',') && closing) s += '"\\u0000open"';
      else s += '"\\u0000any"';
      i += dots - 1;
      prev = 'v';
      continue;
    }
    if (ch === '{' || ch === '[') stack.push(ch);
    if (ch === '}' || ch === ']') stack.pop();
    if (!/\s/.test(ch)) prev = ch;
    s += ch;
  }
  const v = JSON.parse(s);
  const mark = (x) => {
    if (x === '\u0000any' || x === '…' || x === '...') return ANY;
    if (Array.isArray(x)) {
      const items = x.filter((e) => e !== '\u0000open').map(mark);
      if (items.length !== x.length) items[OPEN] = true;
      return items;
    }
    if (x && typeof x === 'object') {
      const o = {};
      for (const [key, val] of Object.entries(x)) {
        if (key === '\u0000open') o[OPEN] = true;
        else o[key] = mark(val);
      }
      return o;
    }
    return x;
  };
  return mark(v);
}

const kind = (v) => (v === null ? 'null' : Array.isArray(v) ? 'list' : typeof v === 'object' ? 'object' : typeof v);
const show = (v) => (v === ANY ? '…' : JSON.stringify(v)?.slice(0, 60));

/** Compare field names (problems) and values (notes). */
function compare(exp, act, at, problems, notes, namesOnly = false) {
  if (exp === ANY) return;
  const note = (m) => { if (!namesOnly) notes.push(m); };
  const ke = kind(exp);
  const ka = kind(act);
  if (ke === 'object') {
    if (ka !== 'object') { problems.push(`${at}: the example shows an object, the answer has ${ka} ${show(act)}`); return; }
    const ek = Object.keys(exp);
    const ak = Object.keys(act);
    for (const k of ek) if (!(k in act)) problems.push(`${at}.${k}: in the example, missing from the answer`);
    if (!exp[OPEN]) for (const k of ak) if (!(k in exp)) problems.push(`${at}.${k}: in the answer, not in the example`);
    for (const k of ek) if (k in act) compare(exp[k], act[k], `${at}.${k}`, problems, notes, namesOnly);
    return;
  }
  if (ke === 'list') {
    if (ka !== 'list') { problems.push(`${at}: the example shows a list, the answer has ${ka} ${show(act)}`); return; }
    if (exp.length === 0) {
      if (act.length && !exp[OPEN]) note(`${at}: the example shows [], the answer has ${act.length} item(s)`);
      return;
    }
    if (act.length === 0) {
      // nothing to compare names with: a shape problem only when the example's items are objects or lists
      const shaped = exp.some((e) => e !== ANY && (kind(e) === 'object' || kind(e) === 'list'));
      if (shaped && !namesOnly) problems.push(`${at}: the example shows ${exp.length} item(s), the answer is an empty list`);
      else note(`${at}: the example shows ${exp.length} item(s), the answer is an empty list`);
      return;
    }
    if (!exp[OPEN] && act.length !== exp.length) note(`${at}: ${exp.length} item(s) in the example, ${act.length} in the answer`);
    // items past the ones the example shows: field names only
    act.forEach((a, i) => compare(exp[Math.min(i, exp.length - 1)], a, `${at}[${i}]`, problems, notes, namesOnly || i >= exp.length));
    return;
  }
  if (ka === 'object' || ka === 'list') { problems.push(`${at}: the example shows ${ke} ${show(exp)}, the answer has ${ka}`); return; }
  if (exp !== act) note(`${at}: example ${show(exp)}, answer ${show(act)}`);
}

// ------------------------------------------------------------------ requests

function parseHttpRequest(lines) {
  let i = 0;
  while (i < lines.length && !lines[i].trim()) i++;
  const [method, target] = lines[i].trim().split(/\s+/);
  const headers = {};
  for (i += 1; i < lines.length && lines[i].trim(); i++) {
    const m = lines[i].match(/^([\w-]+)\s*:\s*(.*)$/);
    if (m) headers[m[1]] = m[2].trim();
  }
  const body = lines.slice(i + 1).join('\n').trim();
  return { method: method.toUpperCase(), target, headers, body: body || null };
}

/** Split a shell command into words: quotes and backslash-newline only. */
function shellWords(text) {
  const src = text.replace(/\\\r?\n/g, ' ').replace(/^\s*\$\s+/gm, '');
  const words = [];
  let cur = null;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === "'") {
      const j = src.indexOf("'", i + 1);
      cur = (cur || '') + src.slice(i + 1, j < 0 ? src.length : j);
      i = j < 0 ? src.length : j;
    } else if (ch === '"') {
      let j = i + 1;
      let buf = '';
      for (; j < src.length && src[j] !== '"'; j++) {
        if (src[j] === '\\' && j + 1 < src.length) j++;
        buf += src[j];
      }
      cur = (cur || '') + buf;
      i = j;
    } else if (/\s/.test(ch)) {
      if (cur !== null) words.push(cur);
      cur = null;
    } else {
      cur = (cur || '') + ch;
    }
  }
  if (cur !== null) words.push(cur);
  return words;
}

function standIn(name, bytes) {
  const head = /\.pdf$/i.test(name) ? '%PDF-1.4\n%contract-check stand-in\n' : /\.png$/i.test(name) ? '\x89PNG\r\n\x1a\n' : '';
  const buf = Buffer.alloc(Math.max(bytes, head.length), 0x20);
  buf.write(head, 0, 'latin1');
  return buf;
}

function fileFor(spec) {
  // {{file:cv.pdf:6MB}} → a generated file of that size; otherwise a path in the repository
  const g = spec.match(/^\{\{file:([^:}]+)(?::(\d+(?:\.\d+)?)\s*(B|KB|MB))?\}\}$/i);
  if (g) {
    const unit = { B: 1, KB: 1024, MB: 1024 * 1024 }[(g[3] || 'KB').toUpperCase()];
    return { name: g[1], data: standIn(g[1], Math.round(Number(g[2] || 1) * unit)) };
  }
  for (const base of [DOCS, REPO]) {
    const p = path.resolve(base, spec);
    if (p.startsWith(REPO + path.sep) && fs.existsSync(p) && fs.statSync(p).isFile()) return { name: path.basename(p), data: fs.readFileSync(p) };
  }
  return { name: path.basename(spec), data: standIn(spec, 1024), standIn: true };
}

function parseCurl(lines) {
  const words = shellWords(lines.join('\n'));
  const start = words.indexOf('curl');
  const req = { method: null, target: null, headers: {}, body: null, form: null, notes: [] };
  for (let i = start + 1; i < words.length; i++) {
    const w = words[i];
    const next = () => words[++i];
    if (w === '-X' || w === '--request') req.method = next().toUpperCase();
    else if (w === '-H' || w === '--header') {
      const m = next().match(/^([\w-]+)\s*:\s*(.*)$/);
      if (m) req.headers[m[1]] = m[2].trim();
    } else if (w === '-F' || w === '--form') {
      req.form = req.form || [];
      const v = next();
      const eq = v.indexOf('=');
      const field = v.slice(0, eq);
      const rest = v.slice(eq + 1);
      if (rest.startsWith('@')) {
        const [file, ...params] = rest.slice(1).split(';');
        const f = fileFor(file);
        if (f.standIn) req.notes.push(`${file} not found in the repository: sent a 1 KB stand-in`);
        const type = (params.find((p) => p.startsWith('type=')) || '').slice(5) || (/\.pdf$/i.test(f.name) ? 'application/pdf' : 'application/octet-stream');
        const fname = (params.find((p) => p.startsWith('filename=')) || '').slice(9) || f.name;
        req.form.push({ field, file: f.data, type, fname });
      } else req.form.push({ field, value: rest });
    } else if (['-d', '--data', '--data-raw', '--data-binary', '--json'].includes(w)) {
      req.body = next();
      if (w === '--json') {
        req.headers['Content-Type'] = req.headers['Content-Type'] || 'application/json';
        req.headers.Accept = req.headers.Accept || 'application/json';
      }
    } else if (/^https?:\/\//.test(w) || w.startsWith('/')) req.target = w;
    // -i, -s, -v, -S, --fail and other display options change nothing we compare
  }
  if (!req.target) return { error: 'no URL in the curl command' };
  req.method = req.method || (req.form || req.body ? 'POST' : 'GET');
  return req;
}

function pathOf(target) {
  const u = new URL(target, 'http://x');
  return { path: u.pathname, query: u.search };
}

async function send(req) {
  const { path: p, query } = pathOf(req.target);
  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (!/^(host|content-length|connection)$/i.test(k)) headers[k] = v;
  }
  let body;
  if (req.form) {
    body = new FormData();
    for (const f of req.form) {
      if (f.file) body.append(f.field, new Blob([f.file], { type: f.type }), f.fname);
      else body.append(f.field, f.value);
    }
    for (const k of Object.keys(headers)) if (/^content-type$/i.test(k)) delete headers[k];
  } else if (req.body != null && !['GET', 'HEAD'].includes(req.method)) body = req.body;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const t0 = Date.now();
    const r = await fetch(BASE + p + query, { method: req.method, headers, body, signal: ctl.signal, redirect: 'manual' });
    const text = await r.text();
    return { status: r.status, type: r.headers.get('content-type') || '', text, ms: Date.now() - t0 };
  } catch (e) {
    return { error: e.name === 'AbortError' ? `no answer within ${TIMEOUT_MS / 1000} s` : `${e.cause?.code || e.message}` };
  } finally {
    clearTimeout(timer);
  }
}

function parseAnswer(lines) {
  let i = 0;
  while (i < lines.length && !lines[i].trim()) i++;
  const status = Number(lines[i].trim().split(/\s+/)[1]);
  const headers = {};
  for (i += 1; i < lines.length && lines[i].trim(); i++) {
    const m = lines[i].match(/^([\w-]+)\s*:\s*(.*)$/);
    if (m) headers[m[1].toLowerCase()] = m[2].trim();
  }
  return { status, headers, body: lines.slice(i + 1).join('\n').trim() };
}

// ------------------------------------------------------------------ accounts and tokens

function demoAccounts() {
  // PA#3: the table of FRONTEND.md; PA#4 may also (or only) have one in BACKEND.md — both are read,
  // FRONTEND.md first, BACKEND.md adding the names FRONTEND.md does not have
  const accounts = {};
  const errors = [];
  for (const name of ['FRONTEND.md', 'BACKEND.md']) {
    const f = path.join(REPO, name);
    if (!fs.existsSync(f)) continue;
    const sec = fs.readFileSync(f, 'utf8').match(/^#{1,6}\s*(?:\d+\.?\s*)?demo accounts.*$([\s\S]*?)(?=^#{1,6}\s|(?![\s\S]))/im);
    if (!sec) continue;
    const rows = sec[1].split('\n').filter((l) => l.trim().startsWith('|'))
      .map((l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim().replace(/^`(.*)`$/, '$1')))
      .filter((r) => !r.every((c) => /^:?-+:?$/.test(c) || !c));
    if (rows.length < 2) { errors.push(`the Demo accounts table of ${name} has no rows`); continue; }
    const head = rows[0].map((h) => h.toLowerCase());
    const col = (re) => head.findIndex((h) => re.test(h));
    const cName = col(/name in example|example|^name$|key/);
    const cLogin = col(/e-?mail|user ?name|login/);
    const cPass = col(/pass/);
    if (cName < 0 || cLogin < 0 || cPass < 0) {
      errors.push(`the Demo accounts table of ${name} needs columns for the name in examples, the e-mail or user name and the password (found: ${rows[0].join(' | ')})`);
      continue;
    }
    for (const r of rows.slice(1)) {
      const n = (r[cName] || '').replace(/`/g, '');
      if (n && !accounts[n]) accounts[n] = { login: (r[cLogin] || '').replace(/`/g, ''), password: (r[cPass] || '').replace(/`/g, '') };
    }
  }
  if (!Object.keys(accounts).length) return { error: errors[0] || 'no "Demo accounts" section in FRONTEND.md or BACKEND.md' };
  return { accounts };
}

function findToken(v) {
  if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) if (/token/i.test(k) && typeof x === 'string' && x) return x;
    for (const x of Object.values(v)) {
      const t = findToken(x);
      if (t) return t;
    }
  }
  return null;
}

const tokens = {};
async function tokenFor(name, accounts, loginExample) {
  if (tokens[name]) return tokens[name];
  if (!accounts) throw new Error(`{{token:${name}}}: no demo accounts to sign in with`);
  const acc = accounts[name];
  if (!acc) throw new Error(`{{token:${name}}}: "${name}" is not in the Demo accounts table of FRONTEND.md or BACKEND.md`);
  if (!loginExample) throw new Error('no sign-in example (a POST to …/login, …/signin, …/sessions or …/tokens) to sign in with');
  let body;
  try {
    body = JSON.parse(loginExample.body);
  } catch {
    throw new Error(`the sign-in example's body is not JSON: ${loginExample.where}`);
  }
  for (const k of Object.keys(body)) {
    if (/pass/i.test(k)) body[k] = acc.password;
    else if (/mail|user|login|account|name/i.test(k)) body[k] = acc.login;
  }
  const r = await send({ method: 'POST', target: loginExample.target, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (r.error) throw new Error(`signing in as ${name}: ${r.error}`);
  let data = null;
  try { data = JSON.parse(r.text); } catch { /* reported below */ }
  const t = findToken(data);
  if (r.status >= 300 || !t) throw new Error(`signing in as ${name} (${acc.login}) answered ${r.status} with no token: ${r.text.slice(0, 120)}`);
  tokens[name] = t;
  return t;
}

async function fillTokens(str, accounts, loginExample) {
  if (str == null) return str;
  const names = [...new Set([...str.matchAll(/\{\{token:([^}]+)\}\}/g)].map((m) => m[1].trim()))];
  let s = str;
  for (const n of names) s = s.split(new RegExp(`\\{\\{token:\\s*${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`)).join(await tokenFor(n, accounts, loginExample));
  return s;
}

// ------------------------------------------------------------------ the endpoint table

function endpointTable() {
  const f = path.join(DOCS, 'README.md');
  if (!fs.existsSync(f)) return null;
  const rows = [];
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim().replace(/`/g, ''));
    let method = null;
    let p = null;
    for (const c of cells) {
      const both = c.match(/^(GET|POST|PUT|PATCH|DELETE)\s+(\/\S*)$/i);
      if (both) { method = both[1].toUpperCase(); p = both[2]; break; }
      if (!method && /^(GET|POST|PUT|PATCH|DELETE)$/i.test(c)) method = c.toUpperCase();
      else if (!p && /^\/\S*$/.test(c)) p = c;
    }
    if (method && p) rows.push({ method, path: p.split('?')[0], re: templateRe(p.split('?')[0]) });
  }
  return rows;
}

function templateRe(t) {
  const parts = t.replace(/\/+$/, '').split('/').map((seg) =>
    /^(:\w+|\{[^}]+\}|<[^>]+>)$/.test(seg) ? '[^/]+' : seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`^${parts.join('/')}/?$`);
}

// ------------------------------------------------------------------ main

async function main() {
  if (!fs.existsSync(DOCS)) {
    console.log(`docs/api/ not found under ${REPO}`);
    process.exit(2);
  }
  let files = fs.readdirSync(DOCS).filter((f) => f.endsWith('.md')).sort();
  files = [...files.filter((f) => f.toLowerCase() === 'readme.md'), ...files.filter((f) => f.toLowerCase() !== 'readme.md')];
  const all = files.flatMap((f) => examplesOf(path.join(DOCS, f)));
  const acc = demoAccounts();
  if (acc.error) out('INFO', 'FRONTEND.md', `${acc.error}: examples with {{token:…}} cannot be sent`);

  // the sign-in example, found before anything is sent
  let loginExample = null;
  for (const ex of all) {
    if (ex.error || ex.request.form !== 'http') continue;
    const r = parseHttpRequest(ex.request.lines);
    if (r.method === 'POST' && /\/(auth\/)?(log-?in|sign-?in|sessions?|tokens?)\/?$/i.test(pathOf(r.target).path) && r.body && !/\{\{token:/.test(r.body)) {
      loginExample = { ...r, where: ex.where };
      break;
    }
  }

  console.log(`contract-check — ${all.length} example(s) in ${files.length} file(s) of ${(DOCS.startsWith(process.cwd() + path.sep) ? path.relative(process.cwd(), DOCS) : DOCS)}, sent to ${BASE}`);
  console.log(`sign-in example: ${loginExample ? `${loginExample.method} ${loginExample.target} (${loginExample.where})` : 'none found'}\n`);

  const table = endpointTable();
  const covered = new Set();
  for (const ex of all) {
    if (ONLY && ex.file !== ONLY && !ex.where.startsWith(ONLY)) continue;
    if (ex.error) {
      out('FAIL', ex.where, ex.error);
      results.push({ where: ex.where, ok: false, problems: [ex.error] });
      continue;
    }
    let req;
    if (ex.request.form === 'http') req = parseHttpRequest(ex.request.lines);
    else {
      req = parseCurl(ex.request.lines);
      if (req.error) { out('FAIL', ex.where, req.error); results.push({ where: ex.where, ok: false, problems: [req.error] }); continue; }
    }
    const label = `${req.method} ${req.target.replace(/^https?:\/\/[^/]+/, '')}`;
    const ans = parseAnswer(ex.answer.lines);
    const problems = [];
    const notes = [...(req.notes || [])];
    if (req.body && /(^|[^"\w])(…|\.\.\.)([^"\w]|$)/.test(req.body.replace(/"(?:[^"\\]|\\.)*"/g, '""'))) {
      problems.push('the request body has … in it: write a value we can send');
    }
    try {
      for (const k of Object.keys(req.headers)) req.headers[k] = await fillTokens(req.headers[k], acc.accounts, loginExample);
      req.target = await fillTokens(req.target, acc.accounts, loginExample);
      req.body = await fillTokens(req.body, acc.accounts, loginExample);
    } catch (e) {
      problems.push(e.message);
    }
    if (table) {
      const p = pathOf(req.target.replace(/^https?:\/\/[^/]+/, '')).path;
      const row = table.find((t) => t.method === req.method && t.re.test(p));
      if (row) covered.add(`${row.method} ${row.path}`);
      else problems.push(`${req.method} ${p} is not in the endpoint table of docs/api/README.md`);
    }
    let got = null;
    if (!problems.some((p) => /sign|token|…/.test(p))) {
      got = await send(req);
      if (got.error) problems.push(`no answer: ${got.error}`);
      else {
        if (got.status !== ans.status) problems.push(`status: the example shows ${ans.status}, the answer is ${got.status}`);
        if (ans.body) {
          let exp;
          let act;
          try { exp = parseLoose(ans.body); } catch (e) { problems.push(`the answer block's body is not JSON (… allowed): ${e.message}`); }
          try { act = JSON.parse(got.text); } catch { problems.push(`the answer is not JSON: ${got.text.slice(0, 80)}`); }
          if (exp !== undefined && act !== undefined) compare(exp, act, '$', problems, notes);
        } else if (got.text.trim()) notes.push(`the example shows no body, the answer has ${got.text.trim().replace(/\s+/g, ' ').slice(0, 60)}`);
      }
    }
    const valueFails = STRICT ? notes.filter((n) => !/stand-in/.test(n)) : [];
    const ok = problems.length === 0 && valueFails.length === 0;
    out(ok ? 'PASS' : 'FAIL', ex.where, `${label} → ${got && !got.error ? got.status : '—'}${got && got.ms != null ? ` (${got.ms} ms)` : ''}`,
      [...problems, ...notes.map((n) => `${STRICT && !/stand-in/.test(n) ? 'value' : 'note '}: ${n}`)]);
    results.push({ where: ex.where, request: label, expected: ans.status, status: got?.status ?? null, ok, problems, notes });
  }

  console.log('');
  if (!table) out('FAIL', 'README.md', 'docs/api/README.md not found, or it has no endpoint table');
  else if (!table.length) out('FAIL', 'README.md', 'docs/api/README.md has no endpoint table (rows with a method and a path)');
  else if (!ONLY) {
    const missing = table.filter((t) => !covered.has(`${t.method} ${t.path}`));
    out(missing.length ? 'FAIL' : 'PASS', 'README.md', `every endpoint in the table has an example (${table.length - missing.length}/${table.length})`,
      missing.map((t) => `no example: ${t.method} ${t.path}`));
  }
  const n = results.length;
  const passed = results.filter((r) => r.ok).length;
  console.log(`\n${passed}/${n} examples answered as written; ${fails} FAIL line(s)`);
  if (JSON_OUT) {
    fs.writeFileSync(JSON_OUT, JSON.stringify({ base: BASE, examples: results, endpoints: table?.map((t) => `${t.method} ${t.path}`) ?? [],
      covered: [...covered], fails }, null, 1));
  }
  process.exit(fails ? 1 : 0);
}

main().catch((e) => {
  console.log(`contract-check stopped: ${e.stack || e}`);
  process.exit(2);
});
