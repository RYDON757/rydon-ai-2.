(() => {
  'use strict';
  const KEY = 'rydon_ai_conversations_v1';
  const $ = (id) => document.getElementById(id);
  const read = () => {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(value) ? value.filter(c => c && typeof c.id === 'string' && Array.isArray(c.messages)) : [];
    } catch (_) { return []; }
  };
  const download = (name, content, type) => {
    const url = URL.createObjectURL(new Blob([content], {type}));
    const a = document.createElement('a'); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const safeName = (value) => String(value || 'rydon-chat').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '').slice(0, 50) || 'rydon-chat';
  const current = () => {
    const row = document.querySelector('.chat-item.active');
    const chats = read();
    return row?.dataset.chatId ? chats.find(c => c.id === row.dataset.chatId) : null;
  };
  const transcript = (chat) => '# ' + (chat.title || 'RYDON conversation') + '\n\n' +
    (chat.messages || []).filter(m => m && ['user','assistant'].includes(m.role) && typeof m.content === 'string')
      .map(m => '**' + (m.role === 'user' ? 'You' : 'RYDON AI') + '**\n\n' + m.content).join('\n\n---\n\n') +
    '\n\n---\nExported from RYDON AI 2.0\n';
  const style = document.createElement('style');
  style.textContent = `
    .chat-tools-backdrop{position:fixed;inset:0;z-index:11000;display:grid;place-items:center;padding:16px;background:#000a;backdrop-filter:blur(5px)}
    .chat-tools-backdrop[hidden]{display:none!important}
    .chat-tools-dialog{width:min(520px,100%);max-height:90dvh;overflow:auto;background:#202020;color:#f5f5f5;border:1px solid #444;border-radius:18px;padding:22px;box-shadow:0 24px 80px #0009}
    .chat-tools-head{display:flex;justify-content:space-between;align-items:center;gap:12px}
    .chat-tools-head h2{font-size:1.25rem;margin:0}
    .chat-tools-dialog p{color:#aaa;font-size:.88rem;line-height:1.5}
    .chat-tools-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:18px}
    .chat-tools-grid button,.chat-tools-close{min-height:42px;padding:10px 12px;border:1px solid #444;border-radius:10px;background:#2b2b2b;color:#f5f5f5;cursor:pointer;font:inherit;font-size:.87rem}
    .chat-tools-grid button:hover,.chat-tools-close:hover{background:#393939}
    .chat-tools-grid button:disabled{opacity:.45;cursor:not-allowed}
    .chat-tools-grid .wide{grid-column:1/-1}
    .chat-tools-status{min-height:1.4em;color:#9edfc9;font-size:.83rem;margin-top:12px}
    .chat-tools-dialog button:focus-visible{outline:2px solid #10a37f;outline-offset:2px}
    @media(max-width:480px){.chat-tools-grid{grid-template-columns:1fr}.chat-tools-grid .wide{grid-column:auto}}
  `;
  document.head.appendChild(style);
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'icon-btn'; button.id = 'chatToolsButton';
  button.textContent = '⋯'; button.title = 'Conversation tools'; button.setAttribute('aria-label', 'Conversation tools');
  const clear = $('clear');
  if (!clear || $('chatToolsButton')) return;
  clear.insertAdjacentElement('beforebegin', button);
  const backdrop = document.createElement('div');
  backdrop.className = 'chat-tools-backdrop'; backdrop.hidden = true;
  backdrop.innerHTML = `
    <section class="chat-tools-dialog" role="dialog" aria-modal="true" aria-labelledby="chatToolsTitle">
      <div class="chat-tools-head"><h2 id="chatToolsTitle">Conversation tools</h2><button type="button" class="chat-tools-close" id="chatToolsClose" aria-label="Close">✕</button></div>
      <p>Export or back up conversations saved in this browser. Backups may contain private information; keep them somewhere safe.</p>
      <div class="chat-tools-grid">
        <button type="button" id="chatExportCurrent">Export current chat (.md)</button>
        <button type="button" id="chatCopyCurrent">Copy current chat</button>
        <button type="button" id="chatExportAll">Back up all chats (.json)</button>
        <button type="button" id="chatImportOpen">Restore chat backup</button>
        <input id="chatImportFile" type="file" accept="application/json,.json" hidden>
        <button type="button" class="wide" id="chatExportMemory">Export saved memory (.json)</button>
      </div>
      <div id="chatToolsStatus" class="chat-tools-status" role="status" aria-live="polite"></div>
      <p>Keyboard shortcuts: <kbd>Ctrl</kbd> + <kbd>K</kbd> search chats · <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>O</kbd> new chat · <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>E</kbd> export current chat.</p>
    </section>`;
  document.body.appendChild(backdrop);
  const status = $('chatToolsStatus');
  const setStatus = (text) => { status.textContent = text; };
  const setCurrentButtons = () => {
    const has = !!current();
    $('chatExportCurrent').disabled = !has;
    $('chatCopyCurrent').disabled = !has;
  };
  const open = () => { backdrop.hidden = false; setCurrentButtons(); $('chatToolsClose').focus(); };
  const close = () => { backdrop.hidden = true; button.focus(); };
  button.addEventListener('click', open);
  $('chatToolsClose').addEventListener('click', close);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !backdrop.hidden) { close(); return; }
    if (e.altKey || e.metaKey && !e.ctrlKey) return;
    if (e.ctrlKey && e.key.toLowerCase() === 'k') { e.preventDefault(); $('searchChats')?.focus(); }
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'o') { e.preventDefault(); $('newChat')?.click(); }
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') { e.preventDefault(); exportCurrent(); }
  });
  function exportCurrent() {
    const chat = current();
    if (!chat) { setStatus('Open a saved conversation first.'); return; }
    download(safeName(chat.title) + '.md', transcript(chat), 'text/markdown;charset=utf-8');
    setStatus('Current conversation exported.');
  }
  $('chatExportCurrent').addEventListener('click', exportCurrent);
  $('chatCopyCurrent').addEventListener('click', async () => {
    const chat = current(); if (!chat) return;
    try { await navigator.clipboard.writeText(transcript(chat)); setStatus('Conversation copied to clipboard.'); }
    catch (_) { setStatus('Clipboard unavailable. Export the chat as a Markdown file instead.'); }
  });
  $('chatExportAll').addEventListener('click', () => {
    const chats = read();
    download('rydon-conversations-' + new Date().toISOString().slice(0,10) + '.json',
      JSON.stringify({format:'rydon-conversations-v1', exportedAt:new Date().toISOString(), conversations:chats}, null, 2),
      'application/json;charset=utf-8');
    setStatus('Backup exported (' + chats.length + ' conversations).');
  });
  $('chatExportMemory').addEventListener('click', () => {
    let memory = [];
    try { const parsed = JSON.parse(localStorage.getItem('rydon_ai_saved_memory_v1') || '[]'); if (Array.isArray(parsed)) memory = parsed.filter(x => typeof x === 'string'); } catch (_) {}
    download('rydon-memory-' + new Date().toISOString().slice(0,10) + '.json',
      JSON.stringify({format:'rydon-memory-v1', exportedAt:new Date().toISOString(), memories:memory}, null, 2),
      'application/json;charset=utf-8');
    setStatus('Saved memory exported (' + memory.length + ' items).');
  });
  $('chatImportOpen').addEventListener('click', () => $('chatImportFile').click());
  $('chatImportFile').addEventListener('change', async e => {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('Backup is too large (5 MB maximum).');
      const payload = JSON.parse(await file.text());
      const incoming = Array.isArray(payload) ? payload : payload.conversations;
      if (!Array.isArray(incoming)) throw new Error('This file is not a RYDON conversations backup.');
      const valid = incoming.filter(c => c && typeof c.title === 'string' && Array.isArray(c.messages))
        .map(c => ({id: typeof c.id === 'string' ? c.id : 'import-' + Math.random().toString(36).slice(2),
          title:c.title.slice(0,120), updated:Number(c.updated)||Date.now(),
          messages:c.messages.filter(m => m && ['user','assistant'].includes(m.role) && typeof m.content === 'string')
            .slice(-60).map(m => ({role:m.role, content:m.content.slice(0,20000)}))}))
        .filter(c => c.messages.length);
      if (!valid.length) throw new Error('No valid conversations were found in this backup.');
      if (!confirm('Restore ' + valid.length + ' conversations? Existing chats with the same ID will be replaced.')) return;
      const existing = read();
      const map = new Map(existing.map(c => [c.id,c]));
      valid.forEach(c => map.set(c.id,c));
      const merged = Array.from(map.values()).sort((a,b)=>(b.updated||0)-(a.updated||0)).slice(0,60);
      localStorage.setItem(KEY, JSON.stringify(merged));
      setStatus('Restored ' + valid.length + ' conversations. Reload the page to refresh the chat list.');
    } catch (err) { setStatus(err.message || 'Could not restore this backup.'); }
    finally { e.target.value = ''; }
  });
  const observer = new MutationObserver(setCurrentButtons);
  const chatList = $('chatList');
  if (chatList) observer.observe(chatList, {childList:true, subtree:true, attributes:true});
  setCurrentButtons();
})();