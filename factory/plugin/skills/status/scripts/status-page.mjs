#!/usr/bin/env node
// Factory status page: reads roadmap.md (origin/main), design specs, job files, branches and PRs,
// and writes a static overview to .factory/status.html. No dependencies; read-only except that file.
//
//   node status-page.mjs [--open] [--json] [--quiet] [--no-fetch] [--local] [--watch [seconds]]
//   --local reads roadmap.md from the current checkout instead of origin/main (for previews).
//   --watch rebuilds the page every N seconds (default 10) until Ctrl+C; the open page reloads itself.

import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const args = new Set(argv);

if (args.has('--watch')) {
  const n = Number(argv[argv.indexOf('--watch') + 1]);
  const seconds = Number.isFinite(n) && n >= 2 ? n : 10;
  const pass = argv.filter((a, i) => a !== '--watch' && a !== '--open' && !(i === argv.indexOf('--watch') + 1 && Number.isFinite(Number(a))));
  const self = fileURLToPath(import.meta.url);
  const build = (extra = []) => {
    try {
      execFileSync(process.execPath, [self, ...pass, '--quiet', '--live', String(seconds), ...extra], { stdio: 'inherit' });
    } catch {
      // keep watching; the next run may succeed
    }
  };
  build(args.has('--open') ? ['--open'] : []);
  console.log(`factory status: rebuilding every ${seconds}s (Ctrl+C to stop)`);
  setInterval(build, seconds * 1000);
} else {
const sh = (cmd, a, opts = {}) => {
  try {
    return execFileSync(cmd, a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 32 << 20, ...opts });
  } catch {
    return undefined;
  }
};

const common = sh('git', ['rev-parse', '--path-format=absolute', '--git-common-dir']);
if (!common) {
  console.error('Not inside a git repository.');
  process.exit(1);
}
const ROOT = path.dirname(common.trim());
const git = (...a) => sh('git', a, { cwd: ROOT });

if (!args.has('--no-fetch')) {
  git('fetch', '-q', 'origin', 'main');
  git('fetch', '-q', 'origin', '+refs/heads/feat/*:refs/remotes/origin/feat/*', '+refs/heads/chore/*:refs/remotes/origin/chore/*');
}

// ── roadmap ──────────────────────────────────────────────────────────────
const TASK = /^- \[( |~|x)\] \*\*(DS-\d+) (.+?)\*\*\s?(.*)$/;
function parseRoadmap(text) {
  const tasks = [];
  let epic = '';
  let inDone = false;
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const e = /^### Epic: (.+?)\s*$/.exec(line);
    if (e) {
      epic = e[1];
      continue;
    }
    if (/^## /.test(line)) {
      inDone = /^## Done\b/.test(line);
      continue;
    }
    const m = TASK.exec(line);
    if (!m) continue;
    const meta = {};
    const doneWhen = [];
    let j = i + 1;
    for (; j < lines.length; j++) {
      const l = lines[j];
      if (/^ {2}- done_when:\s*$/.test(l)) {
        while (/^ {4}- /.test(lines[j + 1] ?? '')) doneWhen.push(lines[++j].replace(/^ {4}- /, ''));
        continue;
      }
      const mm = /^ {2}- ([a-z_]+: .*)$/.exec(l);
      if (!mm) break;
      for (const part of mm[1].split(' · ')) {
        const k = part.indexOf(':');
        if (k > 0) meta[part.slice(0, k).trim()] = part.slice(k + 1).trim();
      }
    }
    i = j - 1;
    const type = meta.type || 'build';
    tasks.push({
      id: m[2],
      title: m[3].replace(/\.$/, ''),
      description: m[4],
      epic: inDone ? '' : epic,
      type,
      line: type === 'design' ? 'design' : 'build',
      hasUi: /^(yes|true)$/i.test(meta.has_ui ?? (type === 'design' ? 'yes' : 'no')),
      needsHuman: /^(yes|true)$/i.test(meta.needs_human ?? 'no'),
      dependsOn: (meta.depends_on ?? '').split(/[,\s]+/).filter((d) => /^DS-\d+$/.test(d)),
      roadmapStatus: inDone || m[1] === 'x' ? 'done' : meta.status || (m[1] === '~' ? 'in-progress' : 'todo'),
      blockedReason: meta.blocked_reason,
      doneWhen,
    });
  }
  return tasks;
}

// ── job files ────────────────────────────────────────────────────────────
function parseJob(text, source) {
  const fm = /^---\n([\s\S]*?)\n---/.exec(text);
  const job = { source, timeline: [], notes: '' };
  if (fm) {
    for (const l of fm[1].split('\n')) {
      const m = /^([a-z_]+):\s*(.*?)\s*(#.*)?$/.exec(l);
      if (m) job[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
    }
  }
  const tl = /## Timeline\n([\s\S]*?)(\n## |$)/.exec(text);
  if (tl) job.timeline = tl[1].split('\n').filter((l) => l.startsWith('- ')).map((l) => l.slice(2));
  const notes = /## Notes\n([\s\S]*?)(\n## |$)/.exec(text);
  if (notes) job.notes = notes[1].trim();
  return job;
}

function loadJobs(branches) {
  const jobs = new Map();
  const put = (job) => {
    if (job.task && /^DS-\d+$/.test(job.task) && !jobs.has(job.task)) jobs.set(job.task, job);
  };
  // 1. live: local worktrees
  const wtDir = path.join(ROOT, '.worktrees');
  for (const wt of fs.existsSync(wtDir) ? fs.readdirSync(wtDir) : []) {
    const dir = path.join(wtDir, wt, 'factory', 'jobs');
    if (!fs.existsSync(dir)) continue;
    const m = /DS-\d+/.exec(wt);
    for (const f of fs.readdirSync(dir).filter((x) => /^DS-\d+\.md$/.test(x))) {
      if (m && f !== `${m[0]}.md`) continue;
      put(parseJob(fs.readFileSync(path.join(dir, f), 'utf8'), 'worktree'));
    }
  }
  // 2. task branches on origin
  for (const b of branches.filter((x) => /^feat\/DS-\d+-/.test(x))) {
    const id = /DS-\d+/.exec(b)[0];
    const text = git('show', `origin/${b}:factory/jobs/${id}.md`);
    if (text) put(parseJob(text, 'branch'));
  }
  // 3. history on main
  for (const f of (git('ls-tree', '--name-only', 'origin/main:factory/jobs') ?? '').split('\n').filter((x) => /^DS-\d+\.md$/.test(x))) {
    const text = git('show', `origin/main:factory/jobs/${f}`);
    if (text) put(parseJob(text, 'main'));
  }
  return jobs;
}

// ── specs ────────────────────────────────────────────────────────────────
function approvedSpecs() {
  const out = new Set();
  for (const f of (git('ls-tree', '--name-only', 'origin/main:docs/specs') ?? '').split('\n').filter((x) => x.endsWith('.md'))) {
    const text = git('show', `origin/main:docs/specs/${f}`) ?? '';
    const task = /^- task:\s*(DS-\d+)/m.exec(text)?.[1];
    if (task && /^- approved:\s*yes\s*$/m.test(text)) out.add(task);
  }
  return out;
}

// ── assemble ─────────────────────────────────────────────────────────────
const localRoadmap = path.join(sh('git', ['rev-parse', '--show-toplevel'])?.trim() ?? ROOT, 'roadmap.md');
const roadmapText = (args.has('--local') && fs.existsSync(localRoadmap) ? fs.readFileSync(localRoadmap, 'utf8') : undefined) ?? git('show', 'origin/main:roadmap.md') ?? (fs.existsSync(path.join(ROOT, 'roadmap.md')) ? fs.readFileSync(path.join(ROOT, 'roadmap.md'), 'utf8') : '');
const tasks = parseRoadmap(roadmapText);
const branches = (git('ls-remote', '--heads', 'origin') ?? '').split('\n').map((l) => l.split('\t')[1]?.replace('refs/heads/', '')).filter(Boolean);
const prsRaw = sh('gh', ['pr', 'list', '--state', 'open', '--limit', '100', '--json', 'number,title,headRefName,isDraft,labels,url'], { cwd: ROOT });
const prs = prsRaw ? JSON.parse(prsRaw) : [];
const jobs = loadJobs(branches);
const specs = approvedSpecs();
const byId = new Map(tasks.map((t) => [t.id, t]));

for (const t of tasks) {
  t.job = jobs.get(t.id);
  t.branch = branches.find((b) => b.startsWith(`feat/${t.id}-`));
  const pr = prs.find((p) => p.headRefName === t.branch);
  t.pr = pr ? { number: pr.number, url: pr.url, draft: pr.isDraft, labels: pr.labels.map((l) => l.name) } : undefined;
  t.waitingOn = t.dependsOn.filter((d) => byId.get(d)?.roadmapStatus !== 'done').map((d) => `${d} not done`);
  const design = t.dependsOn.map((d) => byId.get(d)).find((d) => d?.type === 'design');
  if (t.type === 'build' && t.hasUi && !(design && specs.has(design.id))) t.waitingOn.push(design ? `approved spec from ${design.id}` : 'a design task');

  if (t.roadmapStatus === 'done') t.status = 'done';
  else if (t.job?.status === 'blocked' || t.pr?.labels.includes('factory:blocked')) t.status = 'blocked';
  else if (t.job?.status === 'waiting' || t.job?.status === 'merged' || t.pr) t.status = 'review';
  else if (t.job || t.branch) t.status = 'in-progress';
  else if (t.roadmapStatus === 'blocked') t.status = 'blocked';
  else t.status = t.waitingOn.length ? 'todo' : 'ready';
}

const needsYou = [];
for (const t of tasks) {
  if (t.status === 'done') continue;
  if (t.status === 'blocked') needsYou.push({ task: t.id, kind: 'blocked', text: t.job?.blocked_reason || t.blockedReason || 'blocked', action: t.job?.needs_you || `/factory:retry ${t.id}`, url: t.pr?.url });
  else if (t.job?.needs_you) needsYou.push({ task: t.id, kind: t.type === 'design' ? 'approve design' : 'needs you', text: t.job.needs_you, action: '', url: t.pr?.url, canvas: t.job.canvas_url });
  else if (t.pr?.labels.includes('factory:needs-approval')) needsYou.push({ task: t.id, kind: 'approve', text: 'PR needs your approval', action: `/factory:approve ${t.id}`, url: t.pr.url });
}
for (const p of prs.filter((x) => x.headRefName.startsWith('chore/roadmap-'))) {
  needsYou.push({ task: p.headRefName, kind: 'roadmap PR', text: p.title, action: 'merges when checks are green, or merge it yourself', url: p.url });
}
const running = tasks.filter((t) => t.status === 'in-progress' || (t.status === 'review' && t.job && t.job.status !== 'waiting'));
const runnable = tasks.filter((t) => t.status === 'ready');
const epics = [...new Set(tasks.map((t) => t.epic).filter(Boolean))].map((epic) => {
  const list = tasks.filter((t) => t.epic === epic);
  return { epic, done: list.filter((t) => t.status === 'done').length, total: list.length };
});
const data = { generatedAt: new Date().toISOString(), needsYou, running, runnable, epics, tasks };

if (args.has('--json')) {
  console.log(JSON.stringify(data, null, 2));
}

// ── HTML ─────────────────────────────────────────────────────────────────
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const link = (url, label) => (url && /^https?:\/\//.test(url) ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>` : '');
const tokensFile = path.join(ROOT, 'src', 'styles', 'tokens.css');
const tokens = fs.existsSync(tokensFile) ? fs.readFileSync(tokensFile, 'utf8') : '';
const STATUSES = ['todo', 'ready', 'in-progress', 'review', 'blocked', 'done'];

const badge = (text, tone = '') => `<span class="badge" data-tone="${esc(tone)}">${esc(text)}</span>`;
const badges = (t) => `${badge(t.line, t.line)}${t.hasUi ? badge('ui') : ''}${t.needsHuman ? badge('human', 'human') : ''}${t.job?.stage && t.status !== 'done' ? badge(t.job.stage) : ''}`;
// Compact card on the board; details open in a dialog (see the script at the end of the page).
const taskCard = (t) => `<button type="button" class="task" data-task="${esc(t.id)}" aria-haspopup="dialog"><span><strong class="mono">${esc(t.id)}</strong> ${esc(t.title)}</span><span class="row">${badges(t)}</span></button>`;
const taskDetail = (t) => `<template id="detail-${esc(t.id)}">
<h3 id="detail-title"><span class="mono">${esc(t.id)}</span> ${esc(t.title)}</h3>
<div class="row">${badge(t.status, t.status === 'blocked' ? 'error' : '')}${badges(t)}</div>
${t.description ? `<p>${esc(t.description)}</p>` : ''}
<dl>
<dt>Epic</dt><dd>${esc(t.epic || '–')}</dd>
<dt>Depends on</dt><dd>${esc(t.dependsOn.join(', ') || '–')}</dd>
${t.waitingOn.length && t.status !== 'done' ? `<dt>Waiting on</dt><dd>${esc(t.waitingOn.join('; '))}</dd>` : ''}
<dt>Done when</dt><dd><ul>${t.doneWhen.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></dd>
${t.branch ? `<dt>Branch</dt><dd class="mono">${esc(t.branch)}</dd>` : ''}
${t.pr ? `<dt>PR</dt><dd>${link(t.pr.url, `#${t.pr.number}`)}${t.pr.draft ? ' (draft)' : ''}</dd>` : ''}
${t.job?.canvas_url ? `<dt>Canvas</dt><dd>${link(t.job.canvas_url, 'open canvas')}</dd>` : ''}
${t.job?.storybook_url ? `<dt>Storybook</dt><dd>${link(t.job.storybook_url, t.job.storybook_url)}</dd>` : ''}
${t.job ? `<dt>Job</dt><dd class="mono">${esc(t.job.status)} · ${esc(t.job.stage)} · model ${esc(t.job.model || 'default')} · loops ${esc(t.job.loops || '')} (from ${esc(t.job.source)})</dd>` : ''}
${t.job?.blocked_reason ? `<dt>Blocked</dt><dd>${esc(t.job.blocked_reason)}</dd>` : ''}
${t.job?.needs_you ? `<dt>Needs you</dt><dd>${esc(t.job.needs_you)}</dd>` : ''}
</dl>
${t.status === 'ready' ? `<p class="mono">Start: /factory:${esc(t.line)} ${esc(t.id)}</p>` : ''}
${t.job?.timeline?.length ? `<h4>Timeline</h4><ul class="timeline">${t.job.timeline.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
${t.job?.notes ? `<h4>Notes</h4><pre>${esc(t.job.notes)}</pre>` : ''}
</template>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Factory status</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Red+Hat+Mono:wght@400;500&family=Red+Hat+Text:wght@400;500&display=swap">
<style>
${tokens}
*{box-sizing:border-box}
body{margin:0;font-family:var(--ds-font-text, system-ui);color:var(--ds-color-text, #404040);background:var(--ds-color-background, #fff);font-size:15px;line-height:1.5}
header{display:flex;flex-wrap:wrap;justify-content:space-between;gap:var(--ds-space-3, 12px);padding:var(--ds-space-4, 16px) var(--ds-space-6, 24px);border-bottom:var(--ds-border-width, 1px) solid var(--ds-color-ink, #000);font-family:var(--ds-font-mono, monospace);font-size:13px;text-transform:uppercase;letter-spacing:.08em}
main{max-width:1440px;margin:0 auto;padding:var(--ds-space-6, 24px);display:grid;gap:var(--ds-space-8, 32px)}
h2{font-family:var(--ds-font-mono, monospace);font-size:12px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--ds-color-text-muted, #595959);margin:0 0 var(--ds-space-3, 12px)}
h4{font-family:var(--ds-font-mono, monospace);font-size:11px;text-transform:uppercase;margin:var(--ds-space-3, 12px) 0 var(--ds-space-1, 4px);color:var(--ds-color-text-muted, #595959)}
a{color:var(--ds-color-ink, #000)}
.mono{font-family:var(--ds-font-mono, monospace);font-size:13px}
.needs{border:2px solid var(--ds-color-ink, #000);padding:var(--ds-space-4, 16px);background:var(--ds-color-surface-subtle, #f7f7f7)}
.needs ul,.runnable,.epics{list-style:none;margin:0;padding:0;display:grid;gap:var(--ds-space-2, 8px)}
.need{background:var(--ds-color-surface, #fff);border:var(--ds-border-width, 1px) solid var(--ds-color-border, #c7c7c7);padding:var(--ds-space-3, 12px)}
.need[data-kind="blocked"]{border-color:var(--ds-color-error-border, #e3aaa6)}
.need .act{font-family:var(--ds-font-mono, monospace);font-size:13px;color:var(--ds-color-text-muted, #595959)}
.empty{color:var(--ds-color-text-muted, #595959);margin:0}
.badge{font-family:var(--ds-font-mono, monospace);font-size:11px;text-transform:uppercase;padding:0 6px;border:var(--ds-border-width, 1px) solid var(--ds-color-border, #c7c7c7);color:var(--ds-color-text-muted, #595959);white-space:nowrap}
.badge[data-tone="design"]{border-style:dashed}
.badge[data-tone="human"]{color:var(--ds-color-info, #404040);background:var(--ds-color-info-bg, #f7f7f7)}
.badge[data-tone="error"]{color:var(--ds-color-error, #a3302b);border-color:var(--ds-color-error-border, #e3aaa6);background:var(--ds-color-error-bg, #fbedec)}
.board{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:var(--ds-space-3, 12px)}
@media (max-width:1100px){.board{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:640px){.board{grid-template-columns:1fr}main{padding:var(--ds-space-4, 16px)}header{padding:var(--ds-space-3, 12px) var(--ds-space-4, 16px)}}
.col{background:var(--ds-color-surface-subtle, #f7f7f7);padding:var(--ds-space-2, 8px);display:grid;align-content:start;gap:var(--ds-space-2, 8px);min-height:100px}
.col[data-status="blocked"]{background:var(--ds-color-error-bg, #fbedec)}
.col h3{font-family:var(--ds-font-mono, monospace);font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin:0;display:flex;justify-content:space-between;color:var(--ds-color-text-muted, #595959)}
.task{display:grid;gap:4px;width:100%;text-align:left;font:inherit;font-size:14px;color:inherit;cursor:pointer;background:var(--ds-color-surface, #fff);border:var(--ds-border-width, 1px) solid var(--ds-color-border, #c7c7c7);border-radius:var(--ds-radius, 0);padding:var(--ds-space-2, 8px)}
.task:hover{border-color:var(--ds-color-ink, #000)}
.task:focus-visible,.detail button:focus-visible{outline:var(--ds-focus-width, 2px) solid var(--ds-color-ink, #000);outline-offset:var(--ds-focus-offset, 2px)}
.row{display:flex;flex-wrap:wrap;gap:4px}
.detail{width:min(720px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;padding:var(--ds-space-6, 24px);border:2px solid var(--ds-color-ink, #000);border-radius:var(--ds-radius, 0);background:var(--ds-color-background, #fff);color:var(--ds-color-text, #404040)}
.detail::backdrop{background:color-mix(in srgb, var(--ds-color-black, #000) 40%, transparent)}
.detail-close{float:right;font-family:var(--ds-font-mono, monospace);font-size:12px;text-transform:uppercase;min-height:32px;padding:0 var(--ds-space-3, 12px);background:var(--ds-color-surface, #fff);color:var(--ds-color-ink, #000);border:var(--ds-border-width, 1px) solid var(--ds-color-ink, #000);border-radius:var(--ds-radius, 0);cursor:pointer}
.detail h3{font-family:var(--ds-font-mono, monospace);font-weight:500;font-size:18px;margin:0 0 var(--ds-space-2, 8px)}
.detail dl{display:grid;grid-template-columns:110px minmax(0,1fr);gap:4px 12px;font-size:14px;margin:var(--ds-space-4, 16px) 0}
.detail dt{font-family:var(--ds-font-mono, monospace);font-size:11px;text-transform:uppercase;color:var(--ds-color-text-muted, #595959);padding-top:2px}
.detail dd{margin:0;overflow-wrap:anywhere}.detail dd ul{margin:0;padding-left:16px}
@media (max-width:640px){.detail{padding:var(--ds-space-4, 16px)}.detail dl{grid-template-columns:1fr}}
.timeline{margin:0;padding-left:16px;font-family:var(--ds-font-mono, monospace);font-size:12px}
pre{white-space:pre-wrap;font-size:12px;background:var(--ds-color-surface-subtle, #f7f7f7);padding:var(--ds-space-2, 8px);margin:0}
.split{display:grid;grid-template-columns:1fr 1fr;gap:var(--ds-space-8, 32px)}@media (max-width:760px){.split{grid-template-columns:1fr}}
.runnable li{display:flex;justify-content:space-between;gap:var(--ds-space-3, 12px);border-bottom:var(--ds-border-width, 1px) solid var(--ds-color-divider, #e0e0e0);padding:var(--ds-space-2, 8px) 0}
.epic{display:grid;grid-template-columns:140px minmax(0,1fr) 48px;gap:var(--ds-space-3, 12px);align-items:center}
.bar{height:8px;background:var(--ds-color-fill, #eee);border:var(--ds-border-width, 1px) solid var(--ds-color-border, #c7c7c7)}.bar span{display:block;height:100%;background:var(--ds-color-ink, #000)}
.card{border:var(--ds-border-width, 1px) solid var(--ds-color-ink, #000);padding:var(--ds-space-3, 12px)}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:var(--ds-space-3, 12px)}
</style></head><body>
<header><span>Design system — Factory status</span><span>Generated ${esc(new Date().toLocaleString())} · ${args.has('--live') ? 'live: refreshes every ' + esc(Math.max(2, Number(argv[argv.indexOf('--live') + 1]) || 10)) + 's' : 'snapshot: npm run factory:status for live'}</span></header>
<main>
<section class="needs" aria-labelledby="h-needs"><h2 id="h-needs">Needs you (${needsYou.length})</h2>
${needsYou.length ? `<ul>${needsYou.map((n) => `<li class="need" data-kind="${esc(n.kind)}"><strong class="mono">${esc(n.task)}</strong> ${badge(n.kind, n.kind === 'blocked' ? 'error' : 'human')}<div>${esc(n.text)}</div>${n.action ? `<div class="act">${esc(n.action)}</div>` : ''}<div>${link(n.url, 'PR')} ${link(n.canvas, 'Canvas')}</div></li>`).join('')}</ul>` : '<p class="empty">Nothing needs you right now.</p>'}
</section>
<section aria-labelledby="h-run"><h2 id="h-run">In progress</h2>
${running.length ? `<div class="cards">${running.map((t) => `<div class="card"><strong class="mono">${esc(t.id)}</strong> ${esc(t.title)} ${badge(t.line, t.line)}<div class="mono">${esc(t.job?.stage ?? 'claimed')} · ${esc(t.job?.status ?? 'in progress')}${t.job?.updated ? ` · updated ${esc(t.job.updated)}` : ''}</div>${t.job?.timeline?.length ? `<ul class="timeline">${t.job.timeline.slice(-5).map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}<div>${link(t.pr?.url, 'PR')} ${link(t.job?.storybook_url, 'Storybook')}</div></div>`).join('')}</div>` : '<p class="empty">Nothing in progress.</p>'}
</section>
<div class="split">
<section aria-labelledby="h-ready"><h2 id="h-ready">Runnable now</h2>
${runnable.length ? `<ul class="runnable">${runnable.map((t) => `<li><span><strong class="mono">${esc(t.id)}</strong> ${esc(t.title)} ${t.needsHuman ? badge('needs human', 'human') : ''}</span><code class="mono">/factory:${esc(t.line)} ${esc(t.id)}</code></li>`).join('')}</ul>` : '<p class="empty">Nothing is ready.</p>'}
</section>
<section aria-labelledby="h-epics"><h2 id="h-epics">Epics</h2>
<ul class="epics">${epics.map((e) => `<li class="epic"><span>${esc(e.epic)}</span><div class="bar" role="progressbar" aria-label="${esc(e.epic)}" aria-valuenow="${e.total ? Math.round((e.done / e.total) * 100) : 0}" aria-valuemin="0" aria-valuemax="100"><span style="width:${e.total ? (e.done / e.total) * 100 : 0}%"></span></div><span class="mono">${e.done}/${e.total}</span></li>`).join('')}</ul>
</section>
</div>
<section aria-labelledby="h-board"><h2 id="h-board">Board</h2>
<div class="board">${STATUSES.map((s) => {
  const list = tasks.filter((t) => t.status === s);
  return `<div class="col" data-status="${s}"><h3><span>${s}</span><span>${list.length}</span></h3>${list.map(taskCard).join('')}</div>`;
}).join('')}</div>
</section>
</main>
<dialog id="detail" class="detail" aria-labelledby="detail-title">
<form method="dialog"><button class="detail-close" aria-label="Close details">Close</button></form>
<div id="detail-body"></div>
</dialog>
${tasks.map(taskDetail).join('\n')}
<script>
(() => {
  const dialog = document.getElementById('detail');
  const body = document.getElementById('detail-body');
  let opener;
  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-task]');
    if (card) {
      const tpl = document.getElementById('detail-' + card.dataset.task);
      if (!tpl) return;
      opener = card;
      body.replaceChildren(tpl.content.cloneNode(true));
      dialog.showModal();
    } else if (e.target === dialog) {
      // only clicks on the backdrop (outside the box) close it
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
    }
  });
  dialog.addEventListener('close', () => opener?.focus());
  const live = ${args.has('--live') ? Math.max(2, Number(argv[argv.indexOf('--live') + 1]) || 10) : 0};
  // reload to pick up the rebuilt file, but not while a task dialog is open
  if (live) setInterval(() => { if (!dialog.open) location.reload(); }, live * 1000);
})();
</script>
</body></html>
`;

const outDir = path.join(ROOT, '.factory');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'status.html');
fs.writeFileSync(outFile, html);

if (!args.has('--quiet')) {
  const lines = [
    `factory ▸ ${running.length} in progress · ${runnable.length} ready · ${needsYou.length} need you`,
    ...needsYou.map((n) => `  ! ${n.task}: ${n.text}${n.action ? ` → ${n.action}` : ''}${n.url ? ` (${n.url})` : ''}`),
    ...running.map((t) => `  ▸ ${t.id} ${t.title}: ${t.job?.stage ?? 'claimed'} (${t.job?.status ?? 'in progress'})`),
    `  ready: ${runnable.map((t) => `${t.id}${t.needsHuman ? '*' : ''}`).join(', ') || 'none'}`,
    `  page: ${outFile}`,
  ];
  console.log(lines.join('\n'));
}
if (args.has('--open') && process.platform === 'darwin') spawn('open', [outFile], { stdio: 'ignore', detached: true }).unref();
}
