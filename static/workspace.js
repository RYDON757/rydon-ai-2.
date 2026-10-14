
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const sidebar = $('sidebar');
  if (!sidebar || $('workspaceDrawer')) return;
  const nav = document.createElement('div');
  nav.className = 'workspace-nav';
  nav.innerHTML = `
    <div class="workspace-divider"></div>
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
  const body = $('workspaceBody');
  const tasksKey = 'rydon_workspace_tasks_v1';
  const notesKey = 'rydon_workspace_library_v1';
  const promptsKey = 'rydon_workspace_recent_instructions_v1';
  let activePanel = '';
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
        <div class="workspace-card"><h3>OpenAI Codex</h3><p>Codex is a coding agent for working on code. RYDON's Codex link opens the official Codex page; it does not mean Codex is already integrated into this app.</p><a class="workspace-action primary" href="https://openai.com/codex/" target="_blank" rel="noopener noreferrer">Open official Codex ↗</a></div>
        <div class="workspace-card"><h3>RYDON AI source code</h3><p>Open the repository to inspect code, issues and pull requests.</p><a class="workspace-action" href="https://github.com/RYDON757/rydon-ai-2." target="_blank" rel="noopener noreferrer">Open GitHub repository ↗</a></div>
        <div class="workspace-card"><h3>What is not connected yet?</h3><p>There is no in-app Codex execution session in this workspace panel. Repository access and a secure coding-agent integration would need separate setup.</p></div>`;
    } else if(activePanel==='schedule') {
      const tasks=readArray(tasksKey);
      body.innerHTML=`<h3>Add a task</h3><form id="workspaceTaskForm"><label for="workspaceTask">Task</label><input class="workspace-input" id="workspaceTask" maxlength="180" required placeholder="e.g. Test Android installation"><label for="workspaceTaskDate">Date (optional)</label><input class="workspace-input" id="workspaceTaskDate" type="date"><button class="workspace-action primary" type="submit">＋ Add task</button></form><div style="height:12px"></div><h3>Your tasks (${tasks.length})</h3>`+
        (tasks.length?tasks.map((t,i)=>`<div class="workspace-card workspace-row"><div><strong style="${t.done?'text-decoration:line-through;color:#999':''}">${escapeHTML(t.title)}</strong><p>${escapeHTML(t.date||'No date set')}</p></div><button class="workspace-action" data-task-done="${i}" type="button">${t.done?'Undo':'Done'}</button><button class="workspace-action" data-task-delete="${i}" type="button" aria-label="Delete task">✕</button></div>`).join(''):'<div class="workspace-empty">No tasks yet. Add a task above.</div>')+
        '<p style="color:#999;font-size:.78rem">Tasks are stored in this browser only. They do not trigger reminders or scheduled AI actions.</p>';
      $('workspaceTaskForm').addEventListener('submit',e=>{e.preventDefault();const title=$('workspaceTask').value.trim();if(!title)return;const list=readArray(tasksKey);list.unshift({title,date:$('workspaceTaskDate').value,done:false});writeArray(tasksKey,list.slice(0,100));renderPanel();});
      body.querySelectorAll('[data-task-done]').forEach(b=>b.addEventListener('click',()=>{const list=readArray(tasksKey),i=Number(b.dataset.taskDone);if(list[i])list[i].done=!list[i].done;writeArray(tasksKey,list);renderPanel()}));
      body.querySelectorAll('[data-task-delete]').forEach(b=>b.addEventListener('click',()=>{const list=readArray(tasksKey);list.splice(Number(b.dataset.taskDelete),1);writeArray(tasksKey,list);renderPanel()}));
    } else if(activePanel==='library') {
      const notes=readArray(notesKey);
      body.innerHTML=`<h3>Save a note</h3><form id="workspaceNoteForm"><label for="workspaceNoteTitle">Title</label><input class="workspace-input" id="workspaceNoteTitle" maxlength="120" required placeholder="Note title"><label for="workspaceNoteText">Text</label><textarea class="workspace-textarea" id="workspaceNoteText" maxlength="12000" required placeholder="Paste notes, ideas or useful text here"></textarea><button class="workspace-action primary" type="submit">＋ Save to library</button></form><div style="height:12px"></div><h3>Saved notes (${notes.length})</h3>`+
      (notes.length?notes.map((n,i)=>`<div class="workspace-card"><div class="workspace-row"><strong>${escapeHTML(n.title)}</strong><button class="workspace-action" data-note-delete="${i}" type="button">Delete</button></div><p class="workspace-note">${escapeHTML(n.text)}</p><small>Saved in this browser</small></div>`).join(''):'<div class="workspace-empty">Your saved notes will appear here.</div>');
      $('workspaceNoteForm').addEventListener('submit',e=>{e.preventDefault();const title=$('workspaceNoteTitle').value.trim(),text=$('workspaceNoteText').value.trim();if(!title||!text)return;const list=readArray(notesKey);list.unshift({title,text,created:Date.now()});if(!writeArray(notesKey,list.slice(0,100))){alert('Could not save. Browser storage may be full.');return}renderPanel()});
      body.querySelectorAll('[data-note-delete]').forEach(b=>b.addEventListener('click',()=>{if(!confirm('Delete this saved note?'))return;const list=readArray(notesKey);list.splice(Number(b.dataset.noteDelete),1);writeArray(notesKey,list);renderPanel()}));
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
