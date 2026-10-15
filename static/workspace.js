
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const sidebar = $('sidebar');
  if (!sidebar || $('workspaceDrawer')) return;
  const nav = document.createElement('div');
  nav.className = 'workspace-nav';
  nav.innerHTML = `
    <div class="workspace-divider"></div>
    <button class="side-btn" type="button" data-workspace="images"><span class="glyph">▧</span> Images</button>
    <button class="side-btn" type="button" data-workspace="library"><span class="glyph">▤</span> Library</button>
    <button class="side-btn" type="button" data-workspace="projects"><span class="glyph">▱</span> Projects</button>
    <button class="side-btn" type="button" data-workspace="remote"><span class="glyph">⌘</span> Remote</button>
    <button class="side-btn" type="button" data-workspace="schedule"><span class="glyph">◷</span> Scheduled</button>
    <button class="side-btn" type="button" data-workspace="plugins"><span class="glyph">◎</span> Plugins</button>
    <button class="side-btn" type="button" data-workspace="codex"><span class="glyph">⌘</span> Codex <span class="nav-meta">Code</span></button>
    <button class="side-btn" type="button" data-workspace="schedule"><span class="glyph">◷</span> Schedule</button>
    <button class="side-btn" type="button" data-workspace="library"><span class="glyph">▤</span> Library</button>
    <button class="side-btn" type="button" data-workspace="plugins"><span class="glyph">▦</span> Plugins</button>
    <button class="side-btn" type="button" data-workspace="instructions"><span class="glyph">☷</span> Recent instructions</button>
    <button class="side-btn" type="button" data-workspace="clear"><span class="glyph">⌫</span> Clear app data</button>`;
  const recentLabel = Array.from(sidebar.querySelectorAll('.section-label')).find(x => x.textContent.trim().toLowerCase() === 'recent');
  if (recentLabel) recentLabel.insertAdjacentElement('beforebegin', nav);
  const backdrop = document.createElement('div');
  backdrop.className = 'workspace-drawer-backdrop';
  backdrop.id = 'workspaceDrawer';
  backdrop.hidden = true;
  backdrop.innerHTML = `
    <section class="workspace-drawer" role="dialog" aria-modal="true" aria-labelledby="workspaceTitle">
      <header class="workspace-drawer-head"><div><h2 id="workspaceTitle">Workspace</h2><p id="workspaceDescription">Your RYDON tools.</p></div><button type="button" class="modal-close" id="workspaceClose" aria-label="Close workspace panel">✕</button></header>
      <div class="workspace-drawer-body" id="workspaceBody"></div>
    </section>`;
  document.body.appendChild(backdrop);
  // Keep the workspace windows visually consistent with RYDON's main chat UI.
  const workspaceStyle = document.createElement('style');
  workspaceStyle.id = 'rydon-workspace-redesign';
  workspaceStyle.textContent = `
    .workspace-drawer-backdrop{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:clamp(10px,3vw,32px);background:rgba(0,0,0,.66);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px)}
    .workspace-drawer-backdrop[hidden]{display:none!important}
    .workspace-drawer{width:min(900px,100%);max-height:min(88dvh,900px);overflow:hidden;display:flex;flex-direction:column;background:#202020;border:1px solid #454545;border-radius:22px;box-shadow:0 28px 100px rgba(0,0,0,.55);color:#f5f5f5;animation:rydonWorkspaceIn .18s ease-out}
    .workspace-drawer-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding:25px 28px 21px;border-bottom:1px solid #383838;background:linear-gradient(135deg,rgba(16,163,127,.13),transparent 60%)}
    .workspace-drawer-head h2{margin:0 0 7px;font-size:clamp(1.35rem,3vw,1.8rem);font-weight:720;letter-spacing:-.04em}
    .workspace-drawer-head p{margin:0;color:#aaa;font-size:.92rem;line-height:1.5;max-width:620px}
    #workspaceClose{flex:0 0 38px;width:38px;height:38px;border-radius:12px;border:1px solid #444;background:#2a2a2a;color:#ddd;font-size:18px}
    #workspaceClose:hover{background:#383838;color:white}
    .workspace-drawer-body{padding:24px 28px 30px;overflow:auto;overscroll-behavior:contain;min-height:180px}
    .workspace-drawer-body h3{font-size:1rem;letter-spacing:-.015em;margin:0 0 12px}
    .workspace-card{background:#262626;border:1px solid #3b3b3b;border-radius:16px;padding:17px;margin:0 0 13px;min-width:0}
    .workspace-card p{color:#b9b9b9;line-height:1.55;font-size:.9rem;overflow-wrap:anywhere}
    .workspace-card small{color:#999;line-height:1.5}
    .workspace-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .workspace-row>div{flex:1;min-width:130px}
    .workspace-input,.workspace-textarea{display:block;width:100%;max-width:100%;margin:7px 0 16px;padding:12px 13px;color:#f5f5f5;background:#171717;border:1px solid #454545;border-radius:11px;outline:none}
    .workspace-input:focus,.workspace-textarea:focus{border-color:#10a37f;box-shadow:0 0 0 3px rgba(16,163,127,.15)}
    .workspace-textarea{min-height:105px;resize:vertical;line-height:1.5}
    .workspace-action{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:38px;padding:9px 13px;border:1px solid #484848;border-radius:10px;background:#303030;color:#f4f4f4;text-decoration:none;font-size:.86rem;font-weight:600;transition:background .15s,border-color .15s,transform .15s}
    .workspace-action:hover{background:#3a3a3a;border-color:#606060}
    .workspace-action:active{transform:scale(.985)}
    .workspace-action.primary{background:#10a37f;border-color:#10a37f;color:white}
    .workspace-action.primary:hover{background:#0e916f;border-color:#0e916f}
    .workspace-action:disabled{opacity:.55;cursor:wait}
    .workspace-empty{padding:26px 18px;text-align:center;border:1px dashed #484848;border-radius:14px;color:#aaa;background:rgba(255,255,255,.015)}
    .workspace-note{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6}
    .workspace-nav{display:flex;flex-direction:column;gap:3px}
    .workspace-nav .workspace-divider{height:1px;background:#303030;margin:7px 2px 9px}
    .workspace-nav [data-workspace]{width:100%;min-height:40px;border-radius:10px;font-size:.9rem}
    .workspace-nav [data-workspace]:hover{background:#292929}
    .workspace-nav [data-workspace]:focus-visible,.workspace-action:focus-visible,#workspaceClose:focus-visible{outline:2px solid #10a37f;outline-offset:2px}
    .workspace-nav .glyph{display:inline-grid;place-items:center;width:22px;height:22px;color:#c8c8c8;font-size:1rem}
    .workspace-nav .nav-meta{margin-left:auto;color:#aaa;font-size:.72rem;border:1px solid #414141;border-radius:6px;padding:2px 6px}
    @keyframes rydonWorkspaceIn{from{opacity:0;transform:translateY(8px) scale(.99)}to{opacity:1;transform:translateY(0) scale(1)}}
    @media(max-width:760px){.workspace-drawer-backdrop{padding:0;align-items:flex-end}.workspace-drawer{width:100%;max-height:94dvh;border-radius:20px 20px 0 0;border-bottom:0}.workspace-drawer-head{padding:20px 18px 16px}.workspace-drawer-body{padding:18px 16px calc(22px + env(safe-area-inset-bottom))}.workspace-card{padding:14px}.workspace-row{align-items:flex-start}.workspace-nav [data-workspace]{min-height:43px}}
    @media(prefers-reduced-motion:reduce){.workspace-drawer{animation:none}.workspace-action{transition:none}}
  `;
  document.head.appendChild(workspaceStyle);
  const body = $('workspaceBody');
  const tasksKey = 'rydon_workspace_tasks_v1';
  const notesKey = 'rydon_workspace_library_v1';
  const promptsKey = 'rydon_workspace_recent_instructions_v1';
  let activePanel = '';
  // Browser reminders work while this page is open; they are not server-side jobs.
  function checkTaskReminders() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const tasks = readArray(tasksKey);
    const now = Date.now();
    let changed = false;
    tasks.forEach(task => {
      if (!task || task.done || task.reminded || !task.date || !task.time) return;
      const due = new Date(task.date + 'T' + task.time + ':00').getTime();
      if (!Number.isFinite(due) || now < due) return;
      task.reminded = true;
      changed = true;
      // Avoid a stale notification when the app has been closed for a long time.
      if (now - due <= 2 * 60 * 1000) {
        try { new Notification('RYDON reminder', { body: task.title || 'A scheduled task is due.' }); } catch (_) {}
      }
    });
    if (changed) writeArray(tasksKey, tasks);
  }
  if ('Notification' in window) {
    window.setInterval(checkTaskReminders, 30000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) checkTaskReminders(); });
  }
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const readArray = key => { try { const v=JSON.parse(localStorage.getItem(key)||'[]'); return Array.isArray(v)?v:[]; } catch (_) { return []; } };
  const writeArray = (key, value) => { try { localStorage.setItem(key,JSON.stringify(value)); return true; } catch (_) { return false; } };
  function openPanel(name) {
    activePanel = name; backdrop.hidden = false;
    if (window.matchMedia('(max-width: 760px)').matches) sidebar.classList.remove('mobile-open');
    renderPanel();
    $('workspaceClose').focus();
  }
  function closePanel(){backdrop.hidden=true;activePanel='';}
  function renderPanel() {
    const titles = {
      codex:['Codex','Explore coding assistance for building, reviewing and fixing software.'],
      schedule:['Schedule','Keep a simple list of tasks and planned work in this browser. This does not run background automations or send notifications.'],
      library:['Library','Save short notes and reference text locally in this browser. This is not cloud-synced document storage.'],
      plugins:['Plugins','See available RYDON capabilities and integrations that need to be configured.'],
      instructions:['Recent instructions','Review recent prompts you sent in saved local chat history, and remove the local prompt list if you want.'],
      clear:['Clear app data','Choose exactly what to remove. Local deletion cannot erase account data held by the server.']
    };
    const info=titles[activePanel]||titles.library;
    $('workspaceTitle').textContent=info[0];$('workspaceDescription').textContent=info[1];
    if(activePanel==='codex') {
      body.innerHTML=`
        <div class="workspace-card"><h3>RYDON Code Assistant</h3><p>Ask for code, debugging, explanations, refactors, or tests without leaving RYDON. It uses your configured RYDON AI provider; it does not run code or modify your GitHub repository automatically.</p>
          <form id="workspaceCodeForm"><label for="workspaceCodeTask">What should we build or fix?</label><textarea class="workspace-textarea" id="workspaceCodeTask" maxlength="4000" required placeholder="e.g. Write a Python function to validate email addresses and include tests"></textarea><label for="workspaceCodeContext">Optional code or error message</label><textarea class="workspace-textarea" id="workspaceCodeContext" maxlength="8000" placeholder="Paste code, logs, or an error here"></textarea><button class="workspace-action primary" id="workspaceCodeSend" type="submit">Run coding assistant</button></form>
          <div id="workspaceCodeStatus" role="status" aria-live="polite" style="margin-top:10px;color:#aaa;font-size:.84rem"></div>
          <div id="workspaceCodeResult" class="workspace-card workspace-note" hidden></div>
          <button class="workspace-action" id="workspaceCodeCopy" type="button" hidden>Copy response</button>
        </div>
        <div class="workspace-card"><h3>Repository workflow</h3><p>Use this assistant to prepare patches, tests, and review instructions. Actual repository edits, CI checks, and deployments must still be made through authorized GitHub/hosting workflows.</p><a class="workspace-action" href="https://github.com/RYDON757/rydon-ai-2." target="_blank" rel="noopener noreferrer">View RYDON repository ↗</a></div>`;
      let codeAnswer = '';
      $('workspaceCodeForm').addEventListener('submit', async e => {
        e.preventDefault();
        const task = $('workspaceCodeTask').value.trim();
        const context = $('workspaceCodeContext').value.trim();
        if (!task) return;
        const button = $('workspaceCodeSend');
        const status = $('workspaceCodeStatus');
        const result = $('workspaceCodeResult');
        const copy = $('workspaceCodeCopy');
        button.disabled = true;
        status.textContent = 'RYDON is working on your code…';
        result.hidden = true;
        copy.hidden = true;
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
              mode: 'code',
              message: context ? task + '\n\nRelevant code or error:\n' + context : task,
              history: [],
              web_search: false
            })
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.reply || data.error || 'Coding request failed.');
          codeAnswer = String(data.reply || 'No response received.');
          result.textContent = codeAnswer;
          result.hidden = false;
          copy.hidden = false;
          status.textContent = 'Response ready · ' + (data.source || 'RYDON AI');
        } catch (error) {
          status.textContent = error.message || 'Could not complete the coding request.';
        } finally {
          button.disabled = false;
        }
      });
      $('workspaceCodeCopy').addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(codeAnswer);
          $('workspaceCodeCopy').textContent = 'Copied';
        } catch (_) {
          $('workspaceCodeStatus').textContent = 'Copy is unavailable here; select the response text manually.';
        }
      });
    } else if(activePanel==='schedule') {
      const tasks=readArray(tasksKey);
      body.innerHTML=`<h3>Add a task</h3><form id="workspaceTaskForm"><label for="workspaceTask">Task</label><input class="workspace-input" id="workspaceTask" maxlength="180" required placeholder="e.g. Test Android installation"><div class="workspace-row"><div><label for="workspaceTaskDate">Date</label><input class="workspace-input" id="workspaceTaskDate" type="date"></div><div><label for="workspaceTaskTime">Time</label><input class="workspace-input" id="workspaceTaskTime" type="time"></div></div><button class="workspace-action primary" type="submit">＋ Add task</button></form><div class="workspace-card"><h3>Browser reminders</h3><p>Optional notifications can alert you while RYDON is open in this browser. They are not guaranteed if the tab or browser is closed, and they do not run server-side.</p><button class="workspace-action" id="enableTaskReminders" type="button">Enable browser reminders</button><small id="taskReminderStatus" role="status" aria-live="polite"></small></div><div style="height:12px"></div><h3>Your tasks (${tasks.length})</h3>`+
        (tasks.length?tasks.map((t,i)=>`<div class="workspace-card workspace-row"><div><strong style="${t.done?'text-decoration:line-through;color:#999':''}">${escapeHTML(t.title)}</strong><p>${escapeHTML([t.date,t.time].filter(Boolean).join(' · ')||'No date set')}${t.reminded?' · Reminder sent':''}</p></div><button class="workspace-action" data-task-done="${i}" type="button">${t.done?'Undo':'Done'}</button><button class="workspace-action" data-task-delete="${i}" type="button" aria-label="Delete task">✕</button></div>`).join(''):'<div class="workspace-empty">No tasks yet. Add a task above.</div>')+
        '<p style="color:#999;font-size:.78rem">Tasks are saved locally in this browser. Add both a date and time to a task to schedule a reminder.</p>';
      const reminderButton = $('enableTaskReminders');
      const reminderStatus = $('taskReminderStatus');
      if (!('Notification' in window)) {
        reminderButton.disabled = true;
        reminderStatus.textContent = 'Notifications are not supported by this browser.';
      } else if (Notification.permission === 'granted') {
        reminderButton.textContent = 'Browser reminders enabled';
        reminderStatus.textContent = 'Reminders can appear while this page is open.';
      } else if (Notification.permission === 'denied') {
        reminderButton.textContent = 'Notifications blocked';
        reminderStatus.textContent = 'Allow notifications for this site in your browser settings.';
      }
      reminderButton.addEventListener('click', async () => {
        if (!('Notification' in window)) return;
        try {
          const permission = await Notification.requestPermission();
          reminderStatus.textContent = permission === 'granted' ? 'Browser reminders enabled.' : 'Permission was not granted.';
          reminderButton.textContent = permission === 'granted' ? 'Browser reminders enabled' : 'Enable browser reminders';
          if (permission === 'granted') checkTaskReminders();
        } catch (_) { reminderStatus.textContent = 'Could not request notification permission in this browser.'; }
      });
      $('workspaceTaskForm').addEventListener('submit',e=>{e.preventDefault();const title=$('workspaceTask').value.trim();if(!title)return;const list=readArray(tasksKey);list.unshift({title,date:$('workspaceTaskDate').value,time:$('workspaceTaskTime').value,done:false,reminded:false});if(!writeArray(tasksKey,list.slice(0,100))){alert('Could not save task. Browser storage may be full.');return}renderPanel();});
      body.querySelectorAll('[data-task-done]').forEach(b=>b.addEventListener('click',()=>{const list=readArray(tasksKey),i=Number(b.dataset.taskDone);if(list[i])list[i].done=!list[i].done;writeArray(tasksKey,list);renderPanel()}));
      body.querySelectorAll('[data-task-delete]').forEach(b=>b.addEventListener('click',()=>{const list=readArray(tasksKey);list.splice(Number(b.dataset.taskDelete),1);writeArray(tasksKey,list);renderPanel()}));
    } else if(activePanel==='library') {
      const notes=readArray(notesKey);
      body.innerHTML=`<h3>Save a note</h3><form id="workspaceNoteForm"><label for="workspaceNoteTitle">Title</label><input class="workspace-input" id="workspaceNoteTitle" maxlength="120" required placeholder="Note title"><label for="workspaceNoteText">Text</label><textarea class="workspace-textarea" id="workspaceNoteText" maxlength="12000" required placeholder="Paste notes, ideas or useful text here"></textarea><button class="workspace-action primary" type="submit">＋ Save to library</button></form><div style="height:12px"></div><div class="workspace-row"><h3>Saved notes (${notes.length})</h3><button class="workspace-action" id="exportLibrary" type="button">Export notes</button></div><input class="workspace-input" id="workspaceLibrarySearch" type="search" placeholder="Search your saved notes…" aria-label="Search saved notes">`+
      (notes.length?notes.map((n,i)=>`<div class="workspace-card" data-note-search="${escapeHTML((n.title+' '+n.text).toLowerCase())}"><div class="workspace-row"><strong>${escapeHTML(n.title)}</strong><button class="workspace-action" data-note-delete="${i}" type="button">Delete</button></div><p class="workspace-note">${escapeHTML(n.text)}</p><small>Saved in this browser</small></div>`).join(''):'<div class="workspace-empty">Your saved notes will appear here.</div>');
      $('workspaceNoteForm').addEventListener('submit',e=>{e.preventDefault();const title=$('workspaceNoteTitle').value.trim(),text=$('workspaceNoteText').value.trim();if(!title||!text)return;const list=readArray(notesKey);list.unshift({title,text,created:Date.now()});if(!writeArray(notesKey,list.slice(0,100))){alert('Could not save. Browser storage may be full.');return}renderPanel()});
      body.querySelectorAll('[data-note-delete]').forEach(b=>b.addEventListener('click',()=>{if(!confirm('Delete this saved note?'))return;const list=readArray(notesKey);list.splice(Number(b.dataset.noteDelete),1);writeArray(notesKey,list);renderPanel()}));
      $('workspaceLibrarySearch').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();body.querySelectorAll('[data-note-search]').forEach(card=>{card.hidden=!card.dataset.noteSearch.includes(q)});});
      $('exportLibrary').addEventListener('click',()=>{const payload=JSON.stringify({app:'RYDON AI 2.0',exportedAt:new Date().toISOString(),notes:readArray(notesKey)},null,2);const blob=new Blob([payload],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='rydon-library-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)});
    } else if(activePanel==='plugins') {
      body.innerHTML=`
        <div class="workspace-card"><h3>Web search</h3><p>Available in the chat composer when the web-search control and server-side search provider are configured.</p><small>Availability depends on deployment configuration.</small></div>
        <div class="workspace-card"><h3>Documents</h3><p>The chat interface supports attaching supported text/PDF files where the current backend handles them.</p></div>
        <div class="workspace-card"><h3>Voice</h3><p>Voice input and read-aloud use browser capabilities and may vary by device and browser.</p></div>
        <div class="workspace-card"><h3>Payments</h3><p>Subscription checkout requires valid server-side payment configuration and successful end-to-end testing.</p></div>
        <div class="workspace-card"><h3>External plugins and connectors</h3><p>No external plugin marketplace or connected third-party accounts are being claimed here. Each integration needs its own secure setup and permissions.</p></div>`;
    } else if(activePanel==='instructions') {
      const chats=readArray('rydon_ai_conversations_v1');
      const fromChats=chats.flatMap(c=>(c.messages||[]).filter(m=>m&&m.role==='user'&&typeof m.content==='string').map(m=>({text:m.content,updated:c.updated||0,title:c.title||'Chat'})));
      const saved=readArray(promptsKey).map(p=>({text:p.text||'',updated:p.updated||0,title:'Saved instruction'}));
      const items=[...saved,...fromChats].sort((a,b)=>b.updated-a.updated).slice(0,40);
      body.innerHTML='<p style="color:#aaa;font-size:.84rem">Recent user messages are read from this browser’s saved chat history. They are not a complete server-side instruction audit log.</p>'+
        (items.length?items.map((p,i)=>`<div class="workspace-card"><small>${escapeHTML(p.title)} · ${p.updated?escapeHTML(new Date(p.updated).toLocaleString()):'Saved instruction'}</small><p class="workspace-note">${escapeHTML(p.text)}</p><button class="workspace-action" data-prompt-copy="${i}" type="button">Copy text</button></div>`).join(''):'<div class="workspace-empty">No recent instructions found in local chat history.</div>')+
        '<button class="workspace-action" id="clearInstructionList" type="button">Clear saved instruction list</button>';
      body.querySelectorAll('[data-prompt-copy]').forEach(b=>b.addEventListener('click',async()=>{const p=items[Number(b.dataset.promptCopy)];try{await navigator.clipboard.writeText(p.text);b.textContent='Copied';}catch(_){alert('Copy is unavailable in this browser. You can select the text manually.')}}));
      $('clearInstructionList').addEventListener('click',()=>{if(!confirm('Clear saved instruction entries? This does not delete chat conversations.'))return;localStorage.removeItem(promptsKey);renderPanel()});
    } else if(activePanel==='clear') {
      body.innerHTML=`
        <div class="workspace-card"><h3>Clear current conversation</h3><p>Removes the active conversation from local chat history.</p><button class="workspace-action" id="clearCurrentChat">Clear current chat</button></div>
        <div class="workspace-card"><h3>Clear all recent chats</h3><p>Deletes all conversations saved in this browser. This cannot be undone.</p><button class="workspace-action" id="clearAllChats">Clear chat history</button></div>
        <div class="workspace-card"><h3>Clear local workspace data</h3><p>Deletes local chat history, saved memory, saved library notes, schedule tasks and saved instruction entries. This does not delete server-side account or billing data.</p><button class="workspace-action" id="clearAllLocal" style="border-color:#a44;color:#ffb4b4">Clear all local data</button></div>
        <div class="workspace-card"><h3>Privacy note</h3><p>These actions affect this browser only. To remove account information held by the service, use the service’s account/data deletion process if available.</p></div>`;
      $('clearCurrentChat').addEventListener('click',()=>{closePanel();$('clear').click()});
      $('clearAllChats').addEventListener('click',()=>{if(!confirm('Delete every conversation stored in this browser? This cannot be undone.'))return;localStorage.removeItem('rydon_ai_conversations_v1');localStorage.removeItem('rydon_ai_history_v2');location.reload()});
      $('clearAllLocal').addEventListener('click',()=>{if(!confirm('Delete all local RYDON chats, memory, notes, tasks and saved instruction entries? This cannot be undone.'))return;['rydon_ai_conversations_v1','rydon_ai_chat_history_v1','rydon_ai_saved_memory_v1',tasksKey,notesKey,promptsKey].forEach(k=>localStorage.removeItem(k));location.reload()});
    }
  }
  nav.querySelectorAll('[data-workspace]').forEach(button=>button.addEventListener('click',()=>openPanel(button.dataset.workspace)));
  $('workspaceClose').addEventListener('click',closePanel);
  backdrop.addEventListener('click',e=>{if(e.target===backdrop)closePanel()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!backdrop.hidden)closePanel()});
})();
