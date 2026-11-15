(() => {
  'use strict';

  const PLAN = window.PLAN;
  const KEY = 'ai-study-tracker:v1';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- dates (local, timezone-safe) ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
  const toDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const fromDate = (d) => iso(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (s, n) => { const d = toDate(s); d.setDate(d.getDate() + n); return fromDate(d); };
  const todayISO = () => fromDate(new Date());
  const dayDiff = (a, b) => Math.round((toDate(b) - toDate(a)) / 864e5);
  const fmt = (s, o) => new Intl.DateTimeFormat('en-GB', o).format(toDate(s));
  const fmtLong = (s) => fmt(s, { weekday: 'long', day: 'numeric', month: 'long' });
  const fmtShort = (s) => fmt(s, { weekday: 'short', day: 'numeric', month: 'short' });
  const TOTAL_DAYS = dayDiff(PLAN.start, PLAN.end) + 1;

  /* ---------- build the schedule ---------- */
  const holidays = new Set(PLAN.holidays);
  const sessions = [];
  const byDate = new Map();
  const tasksById = new Map();

  PLAN.months.forEach((mo, mi) => {
    const [y, m] = mo.ym;
    const last = new Date(y, m + 1, 0).getDate();
    const slots = [];
    for (let d = 1; d <= last; d++) {
      const wd = new Date(y, m, d).getDay();
      const ds = iso(y, m, d);
      if (PLAN.schedule[wd] != null && !holidays.has(ds)) slots.push({ date: ds, wd });
    }
    if (mo.sessions.length > slots.length) console.warn(`${mo.name}: ${mo.sessions.length} sessions but ${slots.length} study days`);
    mo.list = [];
    slots.forEach((slot, si) => {
      const src = mo.sessions[si];
      const id = src ? `${mi}-${si}` : `${mi}-b${si}`;
      const s = {
        id, mi, si, date: slot.date, wd: slot.wd, mins: PLAN.schedule[slot.wd],
        title: src ? src.t : 'Catch-up and review',
        badge: src ? src.badge : null,
        buffer: !src,
        tasks: (src ? src.tasks : [['Catch up on anything unfinished this month']]).map(([text, url], ti) => ({ id: `${id}-${ti}`, text, url, sid: id })),
      };
      s.tasks.forEach((t) => tasksById.set(t.id, t));
      sessions.push(s); byDate.set(s.date, s); mo.list.push(s);
    });
  });
  const counted = sessions.filter((s) => !s.buffer);
  const sessionById = new Map(sessions.map((s) => [s.id, s]));
  const monthOf = (date) => PLAN.months.findIndex((mo) => date.startsWith(`${mo.ym[0]}-${pad(mo.ym[1] + 1)}`));

  /* ---------- state ---------- */
  const blank = () => ({ v: 1, done: {}, check: {}, notes: {} });
  let state = load();
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (raw && raw.v === 1) return { ...blank(), ...raw };
    } catch (_) { /* ignore */ }
    return blank();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (_) { toast('Couldn’t save. Storage may be full or blocked.'); }
  }

  /* ---------- derived numbers ---------- */
  const doneIn = (s) => s.tasks.reduce((n, t) => n + (state.done[t.id] ? 1 : 0), 0);
  const isComplete = (s) => doneIn(s) === s.tasks.length;
  function tally(list) {
    let total = 0, done = 0, mins = 0, doneMins = 0;
    for (const s of list) {
      if (s.buffer) continue;
      const d = doneIn(s);
      total += s.tasks.length; done += d; mins += s.mins; doneMins += s.mins * (d / s.tasks.length);
    }
    return { total, done, pct: total ? done / total : 0, mins, doneMins };
  }
  function metric(key) {
    if (key === 'all') return tally(sessions);
    if (key.startsWith('m:')) return tally(PLAN.months[+key.slice(2)].list);
    const s = sessionById.get(key.slice(2));
    const d = doneIn(s);
    return { total: s.tasks.length, done: d, pct: d / s.tasks.length };
  }
  function streaks() {
    const today = todayISO();
    const past = counted.filter((s) => s.date <= today);
    let best = 0, run = 0;
    for (const s of past) {
      if (isComplete(s)) { run++; best = Math.max(best, run); }
      else if (s.date !== today) run = 0;
    }
    let current = 0;
    for (let i = past.length - 1; i >= 0; i--) {
      const s = past[i];
      if (isComplete(s)) current++;
      else if (s.date === today) continue; // today isn't over yet
      else break;
    }
    return { current, best, sessionsDone: counted.filter(isComplete).length };
  }
  const hours = (m) => { const h = m / 60; return h % 1 === 0 ? String(h) : h.toFixed(1); };

  /* ---------- small templates ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const C = 2 * Math.PI * 15.5;
  const ring = (key, size = 'sm') => {
    const p = metric(key).pct;
    return `<svg class="ring ring-${size}" viewBox="0 0 36 36" aria-hidden="true">
      <circle class="ring-track" cx="18" cy="18" r="15.5"/>
      <circle class="ring-fill" cx="18" cy="18" r="15.5" data-ring="${key}" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C * (1 - p)).toFixed(2)}" style="opacity:${p > 0 ? 1 : 0}"/>
      <path class="ring-check" d="M12.5 18.5l3.6 3.6 7.4-7.6"/>
    </svg>`;
  };
  const bar = (key) => `<div class="bar" role="presentation"><i data-bar="${key}" style="transform:translateX(${((metric(key).pct - 1) * 100).toFixed(2)}%)"></i></div>`;
  const I = {
    ext: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5h6.5V10M12.5 3.5 4 12"/></svg>',
    left: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg>',
    right: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg>',
    chev: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>',
    flame: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5c.6 2.3 3.5 3.6 3.5 7.1A3.5 3.5 0 0 1 8 12.1a3.5 3.5 0 0 1-3.5-3.5c0-1.4.6-2.3 1.4-3.1.1 1 .6 1.7 1.3 2C7 5.6 7.3 3.4 8 1.5Z"/></svg>',
  };

  const taskRow = (t) => `
    <li class="task">
      <label class="task-main">
        <input type="checkbox" data-task="${t.id}" ${state.done[t.id] ? 'checked' : ''}>
        <span class="box" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-6.5"/></svg></span>
        <span class="task-text">${esc(t.text)}</span>
      </label>
      ${t.url ? `<a class="task-link" href="${esc(t.url)}" target="_blank" rel="noopener" aria-label="Open resource: ${esc(t.text)}">${I.ext}</a>` : ''}
    </li>`;

  const sessionMeta = (s) => `${hours(s.mins)} h · ${s.wd === 6 || s.wd === 0 ? 'Weekend' : 'Evening'} session`;

  /* ---------- views ---------- */
  const view = $('#view');

  function renderToday(date) {
    const today = todayISO();
    if (!date) date = today < PLAN.start ? PLAN.start : today > PLAN.end ? PLAN.end : today;
    const s = byDate.get(date);
    const mi = monthOf(date);
    const mo = PLAN.months[mi];
    const dayN = dayDiff(PLAN.start, date) + 1;
    const inRange = dayN >= 1 && dayN <= TOTAL_DAYS;
    const prev = addDays(date, -1), next = addDays(date, 1);
    const canPrev = prev >= PLAN.start, canNext = next <= PLAN.end;

    let eyebrow = inRange ? `Day ${dayN} of ${TOTAL_DAYS} · ${mo.name}: ${esc(mo.title)}` : '';
    let banner = '';
    if (today < PLAN.start) {
      const n = dayDiff(today, PLAN.start);
      banner = `<div class="banner card"><strong>Starts ${fmtLong(PLAN.start)}</strong><span>${n} day${n === 1 ? '' : 's'} to go. You can browse ahead or start early; ticks are saved either way.</span></div>`;
    }

    let main;
    if (s) {
      main = `
        <article class="session card m${s.mi}" data-session="${s.id}">
          <div class="session-top">
            <div class="session-ring">${ring('s:' + s.id, 'lg')}</div>
            <div>
              <div class="meta">${sessionMeta(s)}${s.badge ? ` <span class="badge">${s.badge}</span>` : ''}</div>
              <h2 class="session-title">${esc(s.title)}</h2>
              <div class="meta"><span data-count="s:${s.id}">${doneIn(s)}/${s.tasks.length}</span> done</div>
            </div>
          </div>
          <ul class="tasks">${s.tasks.map(taskRow).join('')}</ul>
          <details class="notes" ${state.notes[s.id] ? 'open' : ''}>
            <summary>${I.chev}<span>Notes</span></summary>
            <textarea data-notes="${s.id}" rows="3" placeholder="What did you learn? What’s still fuzzy?"></textarea>
          </details>
        </article>`;
    } else {
      const nx = sessions.find((x) => x.date > date);
      main = `
        <article class="rest card">
          <h2 class="session-title">Rest day</h2>
          <p class="muted">No session today. Recovery is part of the plan: rest days keep 8 hours a week sustainable for six months.</p>
          ${nx ? `<a class="next-link m${nx.mi}" href="#/today/${nx.date}"><span class="dot"></span><span><small>Next: ${fmtShort(nx.date)}</small>${esc(nx.title)}</span>${I.right}</a>` : ''}
        </article>`;
    }

    // catch-up: unfinished tasks from earlier sessions (only once the plan has started)
    const lagging = counted.filter((x) => x.date < today && x.date >= PLAN.start && !isComplete(x) && x.date !== date);
    const catchup = lagging.length ? `
      <section class="catchup">
        <details class="card" ${lagging.length <= 2 ? 'open' : ''}>
          <summary class="section-summary">${I.chev}<span>Catch up</span><span class="pill">${lagging.reduce((n, x) => n + x.tasks.length - doneIn(x), 0)} tasks</span></summary>
          ${lagging.slice(-5).reverse().map((x) => `
            <div class="catchup-group m${x.mi}" data-session="${x.id}">
              <a class="catchup-head" href="#/today/${x.date}">${fmtShort(x.date)} · ${esc(x.title)}</a>
              <ul class="tasks">${x.tasks.filter((t) => !state.done[t.id]).map(taskRow).join('')}</ul>
            </div>`).join('')}
          ${lagging.length > 5 ? `<a class="more" href="#/plan/${lagging[0].mi}">${lagging.length - 5} more sessions in the plan</a>` : ''}
        </details>
      </section>` : '';

    const upcoming = sessions.filter((x) => x.date > date).slice(0, 3);
    const later = upcoming.length ? `
      <section>
        <h3 class="section-title">Coming up</h3>
        <div class="card list">
          ${upcoming.map((x) => `
            <a class="list-row m${x.mi}" href="#/today/${x.date}" data-session="${x.id}">
              <span class="date-chip"><b>${fmt(x.date, { day: 'numeric' })}</b><small>${fmt(x.date, { weekday: 'short' })}</small></span>
              <span class="list-main"><span class="list-title">${esc(x.title)}</span><span class="meta">${hours(x.mins)} h · ${x.tasks.length} task${x.tasks.length > 1 ? 's' : ''}</span></span>
              ${ring('s:' + x.id)}
            </a>`).join('')}
        </div>
      </section>` : '';

    view.innerHTML = `
      ${banner}
      <header class="page-head">
        <div class="eyebrow">${eyebrow}</div>
        <div class="daynav">
          <a class="icon-btn" ${canPrev ? `href="#/today/${prev}"` : 'aria-disabled="true"'} aria-label="Previous day">${I.left}</a>
          <h1>${fmtLong(date)}</h1>
          <a class="icon-btn" ${canNext ? `href="#/today/${next}"` : 'aria-disabled="true"'} aria-label="Next day">${I.right}</a>
        </div>
        ${date !== today && today >= PLAN.start && today <= PLAN.end ? `<a class="today-link" href="#/today">Back to today</a>` : ''}
      </header>
      ${main}
      ${date === today || (today < PLAN.start && date === PLAN.start) ? catchup : ''}
      ${later}`;

    const ta = $('[data-notes]', view);
    if (ta) ta.value = state.notes[ta.dataset.notes] || '';
  }

  function renderPlan(mi) {
    const today = todayISO();
    if (mi == null || isNaN(mi)) { const t = monthOf(today); mi = t >= 0 ? t : 0; }
    const mo = PLAN.months[mi];
    // group by week (Mon–Sun)
    const weeks = [];
    for (const s of mo.list) {
      const wd = (toDate(s.date).getDay() + 6) % 7;
      const monday = addDays(s.date, -wd);
      let w = weeks[weeks.length - 1];
      if (!w || w.monday !== monday) { w = { monday, items: [] }; weeks.push(w); }
      w.items.push(s);
    }
    const m = metric('m:' + mi);
    view.innerHTML = `
      <header class="page-head">
        <div class="eyebrow">${fmt(PLAN.start, { day: 'numeric', month: 'short', year: 'numeric' })} – ${fmt(PLAN.end, { day: 'numeric', month: 'short', year: 'numeric' })} · 8 h a week</div>
        <h1>The plan</h1>
      </header>
      <nav class="month-tabs" role="tablist" aria-label="Months">
        ${PLAN.months.map((x, i) => `
          <a role="tab" class="month-tab m${i}" href="#/plan/${i}" aria-selected="${i === mi}">
            <span>${x.short}</span>${bar('m:' + i)}
          </a>`).join('')}
      </nav>
      <section class="card month-head m${mi}">
        <div class="eyebrow">Month ${mi + 1} · ${mo.name}</div>
        <h2>${esc(mo.title)}</h2>
        <p class="muted">${esc(mo.outcome)}</p>
        <div class="month-progress">${bar('m:' + mi)}<span class="num"><span data-pct="m:${mi}">${Math.round(m.pct * 100)}%</span></span></div>
      </section>
      ${weeks.map((w, wi) => `
        <section class="week">
          <h3 class="section-title">Week ${wi + 1} <span>· ${fmt(w.items[0].date, { day: 'numeric', month: 'short' })}${w.items.length > 1 ? ' – ' + fmt(w.items[w.items.length - 1].date, { day: 'numeric', month: 'short' }) : ''}</span></h3>
          <div class="card list">
            ${w.items.map((s) => `
              <details class="srow m${s.mi} ${s.date === today ? 'is-today' : ''}" data-session="${s.id}" ${s.date === today ? 'open' : ''}>
                <summary class="list-row">
                  <span class="date-chip"><b>${fmt(s.date, { day: 'numeric' })}</b><small>${fmt(s.date, { weekday: 'short' })}</small></span>
                  <span class="list-main">
                    <span class="list-title">${esc(s.title)}${s.badge ? ` <span class="badge">${s.badge}</span>` : ''}</span>
                    <span class="meta">${hours(s.mins)} h · <span data-count="s:${s.id}">${doneIn(s)}/${s.tasks.length}</span></span>
                  </span>
                  ${ring('s:' + s.id)}
                </summary>
                <div class="srow-body">
                  <ul class="tasks">${s.tasks.map(taskRow).join('')}</ul>
                  <a class="more" href="#/today/${s.date}">Open this day${I.right}</a>
                </div>
              </details>`).join('')}
          </div>
        </section>`).join('')}`;
    const sel = $('.month-tab[aria-selected="true"]', view);
    if (sel) sel.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  function renderProgress() {
    const all = metric('all');
    const st = streaks();
    const today = todayISO();
    const checkDone = PLAN.checklist.filter((_, i) => state.check[i]).length;
    view.innerHTML = `
      <header class="page-head">
        <div class="eyebrow">${today < PLAN.start ? `Starts in ${dayDiff(today, PLAN.start)} days` : today > PLAN.end ? 'Plan complete' : `Day ${dayDiff(PLAN.start, today) + 1} of ${TOTAL_DAYS}`}</div>
        <h1>Progress</h1>
      </header>
      <section class="card overall">
        <div class="overall-ring">${ring('all', 'xl')}<div class="overall-num"><span class="num" data-pct="all">${Math.round(all.pct * 100)}%</span><small>overall</small></div></div>
        <div class="overall-copy">
          <p><span class="num" data-count="all">${all.done}/${all.total}</span> tasks done</p>
          <p class="muted"><span class="num" data-stat="hours">${hours(Math.round(all.doneMins / 6) * 6)}</span> of ${hours(all.mins)} hours of study</p>
        </div>
      </section>
      <div class="tiles">
        <div class="tile card"><small>Current streak</small><span class="num big"><span data-stat="streak">${st.current}</span></span><small>sessions in a row</small></div>
        <div class="tile card"><small>Best streak</small><span class="num big" data-stat="best">${st.best}</span><small>sessions</small></div>
        <div class="tile card"><small>Sessions done</small><span class="num big" data-stat="sessions">${st.sessionsDone}</span><small>of ${counted.length}</small></div>
      </div>
      <section>
        <h3 class="section-title">By month</h3>
        <div class="card list">
          ${PLAN.months.map((mo, i) => `
            <a class="list-row m${i}" href="#/plan/${i}">
              <span class="list-main">
                <span class="list-title">${mo.name} <span class="muted">· ${esc(mo.title)}</span></span>
                ${bar('m:' + i)}
              </span>
              <span class="num pct" data-pct="m:${i}">${Math.round(metric('m:' + i).pct * 100)}%</span>
            </a>`).join('')}
        </div>
      </section>
      <section>
        <h3 class="section-title">Calendar</h3>
        <div class="card cal-wrap">
          <div class="cal-grid">${PLAN.months.map(calendar).join('')}</div>
          <div class="cal-legend" aria-hidden="true"><span><i class="c-rest"></i>Rest</span><span><i class="c-none"></i>Not started</span><span><i class="c-part"></i>Partly done</span><span><i class="c-full"></i>Done</span></div>
        </div>
      </section>
      <section>
        <h3 class="section-title">Freelance-ready checklist <span data-checkcount>· ${checkDone}/${PLAN.checklist.length}</span></h3>
        <div class="card"><ul class="tasks">
          ${PLAN.checklist.map((c, i) => `
            <li class="task"><label class="task-main">
              <input type="checkbox" data-check="${i}" ${state.check[i] ? 'checked' : ''}>
              <span class="box" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-6.5"/></svg></span>
              <span class="task-text">${esc(c)}</span>
            </label></li>`).join('')}
        </ul></div>
      </section>
      <section>
        <h3 class="section-title">Your data</h3>
        <div class="card data">
          <p class="muted">Progress is saved in this browser only. Export a backup now and then, or to move it to another device.</p>
          <div class="btn-row">
            <button class="btn" data-action="export">Export backup</button>
            <label class="btn">Import<input type="file" accept="application/json,.json" data-action="import" hidden></label>
            <button class="btn btn-quiet" data-action="reset">Reset</button>
            ${deferredInstall ? '<button class="btn btn-primary" data-action="install">Install app</button>' : ''}
          </div>
          ${isIOS && !standalone ? '<p class="muted small">On iPhone: tap Share, then “Add to Home Screen” to install.</p>' : ''}
        </div>
      </section>`;
  }

  function calendar(mo, mi) {
    const [y, m] = mo.ym;
    const last = new Date(y, m + 1, 0).getDate();
    const lead = (new Date(y, m, 1).getDay() + 6) % 7;
    const today = todayISO();
    let cells = '<span class="cal-pad"></span>'.repeat(lead);
    for (let d = 1; d <= last; d++) {
      const ds = iso(y, m, d);
      const s = byDate.get(ds);
      let cls = 'c-rest', label = `${fmtShort(ds)}: rest day`;
      if (s && !s.buffer) {
        const p = doneIn(s) / s.tasks.length;
        cls = p === 1 ? 'c-full' : p > 0 ? 'c-part' : 'c-none';
        label = `${fmtShort(ds)}: ${s.title}, ${doneIn(s)} of ${s.tasks.length} done`;
      }
      cells += `<a class="cal-day ${cls} ${ds === today ? 'is-today' : ''}" href="#/today/${ds}" data-cal="${s ? s.id : ''}" title="${esc(label)}" aria-label="${esc(label)}"></a>`;
    }
    return `<div class="cal m${mi}"><div class="cal-name">${mo.short}</div><div class="cal-days">${cells}</div></div>`;
  }

  /* ---------- live updates (no re-render, so transitions can play) ---------- */
  function paint() {
    for (const el of $$('[data-ring]')) {
      const p = metric(el.dataset.ring).pct;
      el.style.strokeDashoffset = (C * (1 - p)).toFixed(2);
      el.style.opacity = p > 0 ? 1 : 0;
    }
    for (const el of $$('[data-bar]')) el.style.transform = `translateX(${((metric(el.dataset.bar).pct - 1) * 100).toFixed(2)}%)`;
    for (const el of $$('[data-pct]')) el.textContent = Math.round(metric(el.dataset.pct).pct * 100) + '%';
    for (const el of $$('[data-count]')) { const x = metric(el.dataset.count); el.textContent = `${x.done}/${x.total}`; }
    for (const el of $$('[data-session]')) {
      const s = sessionById.get(el.dataset.session);
      if (s) el.classList.toggle('is-complete', isComplete(s));
    }
    for (const el of $$('[data-cal]')) {
      const s = sessionById.get(el.dataset.cal);
      if (!s || s.buffer) continue;
      const p = doneIn(s) / s.tasks.length;
      el.classList.remove('c-full', 'c-part', 'c-none');
      el.classList.add(p === 1 ? 'c-full' : p > 0 ? 'c-part' : 'c-none');
    }
    const st = streaks();
    const set = (k, v) => $$(`[data-stat="${k}"]`).forEach((el) => { el.textContent = v; });
    set('streak', st.current); set('best', st.best); set('sessions', st.sessionsDone);
    set('hours', hours(Math.round(metric('all').doneMins / 6) * 6));
    const cc = $('[data-checkcount]');
    if (cc) cc.textContent = `· ${PLAN.checklist.filter((_, i) => state.check[i]).length}/${PLAN.checklist.length}`;
    $('#side-pct').textContent = Math.round(metric('all').pct * 100) + '%';
  }

  /* ---------- toast ---------- */
  const toaster = $('#toaster');
  function toast(msg, icon = '') {
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.innerHTML = `${icon}<span>${esc(msg)}</span>`;
    toaster.replaceChildren(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.setAttribute('data-show', '')));
    const hide = () => { el.removeAttribute('data-show'); el.setAttribute('data-leaving', ''); setTimeout(() => el.remove(), 250); };
    let timer = setTimeout(hide, 2800);
    document.addEventListener('visibilitychange', function onVis() {
      if (!el.isConnected) return document.removeEventListener('visibilitychange', onVis);
      clearTimeout(timer);
      if (!document.hidden) timer = setTimeout(hide, 2000);
    });
  }

  /* ---------- events ---------- */
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('[data-task]')) {
      const task = tasksById.get(t.dataset.task);
      const s = sessionById.get(task.sid);
      const was = isComplete(s);
      if (t.checked) state.done[task.id] = new Date().toISOString(); else delete state.done[task.id];
      // keep duplicate checkboxes for the same task (catch-up + main) in sync
      $$(`[data-task="${task.id}"]`).forEach((x) => { x.checked = t.checked; });
      save(); paint();
      if (!was && isComplete(s) && !s.buffer) {
        const st = streaks();
        toast(st.current > 1 ? `Session done · ${st.current}-session streak` : 'Session done. Nice work.', I.flame);
      }
    } else if (t.matches('[data-check]')) {
      if (t.checked) state.check[t.dataset.check] = true; else delete state.check[t.dataset.check];
      save(); paint();
    } else if (t.matches('[data-action="import"]')) {
      const f = t.files[0];
      if (!f) return;
      f.text().then((txt) => {
        const data = JSON.parse(txt);
        if (!data || data.v !== 1 || typeof data.done !== 'object') throw new Error('bad');
        state = { ...blank(), ...data }; save(); route(); toast('Backup imported');
      }).catch(() => toast('That file isn’t a tracker backup'));
    }
  });

  let noteTimer;
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (!t.matches('[data-notes]')) return;
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => {
      const v = t.value.trim();
      if (v) state.notes[t.dataset.notes] = t.value; else delete state.notes[t.dataset.notes];
      save();
    }, 300);
  });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    const act = a.dataset.action;
    if (act === 'export') {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = Object.assign(document.createElement('a'), { href: url, download: `ai-study-tracker-${todayISO()}.json` });
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else if (act === 'reset') {
      if (confirm('Clear all ticks, notes and checklist items in this browser? Export a backup first if you might want them back.')) {
        state = blank(); save(); route(); toast('Progress cleared');
      }
    } else if (act === 'install' && deferredInstall) {
      deferredInstall.prompt();
      deferredInstall.userChoice.finally(() => { deferredInstall = null; route(); });
    }
  });

  // ←/→ move between days on the Today view (no animation: keyboard actions stay instant)
  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.metaKey || e.ctrlKey || e.target.closest('input, textarea, select')) return;
    if (!location.hash.startsWith('#/today') && location.hash !== '' && location.hash !== '#/') return;
    const dir = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
    if (!dir) return;
    const link = $$('.daynav .icon-btn')[dir < 0 ? 0 : 1];
    if (link && link.getAttribute('href')) location.hash = link.getAttribute('href');
  });

  /* ---------- routing ---------- */
  function route() {
    const [, name = 'today', arg] = (location.hash || '#/today').split('/');
    const tab = ['today', 'plan', 'progress'].includes(name) ? name : 'today';
    if (tab === 'today') renderToday(/^\d{4}-\d{2}-\d{2}$/.test(arg || '') ? arg : null);
    else if (tab === 'plan') renderPlan(arg != null ? Math.max(0, Math.min(5, parseInt(arg, 10))) : null);
    else renderProgress();
    for (const el of $$('[data-tab]')) el.setAttribute('aria-current', el.dataset.tab === tab ? 'page' : 'false');
    document.title = { today: 'Today', plan: 'Plan', progress: 'Progress' }[tab] + ' · AI Engineer Plan';
    $('#side-pct').textContent = Math.round(metric('all').pct * 100) + '%';
    paint();
  }
  let lastHash = location.hash;
  window.addEventListener('hashchange', () => {
    const sameTab = (lastHash.split('/')[1] || 'today') === (location.hash.split('/')[1] || 'today');
    lastHash = location.hash;
    route();
    if (!sameTab) window.scrollTo(0, 0);
  });

  // refresh "today" if the app stays open past midnight
  let lastDay = todayISO();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && todayISO() !== lastDay) { lastDay = todayISO(); route(); }
  });

  /* ---------- install / offline ---------- */
  let deferredInstall = null;
  const isIOS = /iP(hone|ad|od)/.test(navigator.platform) || (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredInstall = e;
    if ((location.hash.split('/')[1] || '') === 'progress') route();
  });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }

  route();
})();
