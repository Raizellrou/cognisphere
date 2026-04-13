/**
 * ChatPage.jsx
 * resources/js/Pages/ChatPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Full AI chat implementation replacing the UI-only stub.
 *
 * LAYOUT (mobile-first):
 *  ┌────────────────────────────┐
 *  │ Header (chat title + menu) │
 *  ├────────────────────────────┤
 *  │ Context bar (attached files│
 *  ├────────────────────────────┤
 *  │                            │
 *  │     Messages area          │
 *  │     (scrollable)           │
 *  │                            │
 *  ├────────────────────────────┤
 *  │ Input bar (+ file upload)  │
 *  └────────────────────────────┘
 *
 * Sidebar is a bottom sheet on mobile, left panel on tablet+.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth }    from '@/context/AuthContext';
import { useChat }    from '@/hooks/useChat';
import BottomNav      from '@/components/layout/BottomNav';

export default function ChatPage() {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;

  const {
    chats, activeChatId, activeChat,
    messages, files, attachedFiles, hasContext,
    loading, error,
    newChat, selectChat, deleteChat,
    sendMessage, uploadFile, detachFile,
  } = useChat(uid);

  const [input, setInput]           = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showFilePanel, setShowFilePanel] = useState(false);
  const [dragOver, setDragOver]     = useState(false);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom when messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading.sending]);

  // ── Send ───────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading.sending) return;

    // If no chat exists yet, create one first
    let chatId = activeChatId;
    if (!chatId) {
      try {
        const chat = await newChat();
        chatId = chat.id;
      } catch { return; }
    }

    setInput('');
    inputRef.current?.focus();
    await sendMessage(text);
  }, [input, loading.sending, activeChatId, newChat, sendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── File upload ────────────────────────────────────────────────────────────
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    // Create chat first if needed
    if (!activeChatId) await newChat();

    try { await uploadFile(file); }
    catch { /* error shown via hook */ }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!activeChatId) await newChat();
    try { await uploadFile(file); }
    catch { /* error shown via hook */ }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen bg-white text-black dark:bg-black dark:text-white flex"
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* ── Sidebar overlay (mobile) ───────────────────────────────── */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 w-72 bg-[#0a0a0a]
                    border-r border-[#1a1a1a] flex flex-col transition-transform
                    duration-300 ease-in-out
                    ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
                    lg:relative lg:translate-x-0 lg:flex`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-4
                        border-b border-[#1a1a1a] flex-shrink-0">
          <p className="text-white text-sm font-bold">Conversations</p>
          <button
            onClick={() => { newChat(); setShowSidebar(false); }}
            className="w-7 h-7 bg-white text-black rounded-lg flex items-center
                       justify-center hover:bg-gray-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M12 4v16m8-8H4"/>
            </svg>
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto py-2">
          {loading.chats ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-[#2a2a2a] border-t-white/30
                              rounded-full animate-spin"/>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-gray-600 text-xs">No conversations yet.</p>
              <p className="text-gray-700 text-xs mt-1">Start a new chat above.</p>
            </div>
          ) : (
            chats.map(chat => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === activeChatId}
                onSelect={() => { selectChat(chat.id); setShowSidebar(false); }}
                onDelete={() => deleteChat(chat.id)}
              />
            ))
          )}
        </div>

        {/* Sidebar footer — file library */}
        <div className="border-t border-[#1a1a1a] p-3 flex-shrink-0">
          <button
            onClick={() => setShowFilePanel(true)}
            className="w-full flex items-center gap-2 text-gray-500
                       hover:text-white text-xs py-2 px-3 rounded-lg
                       hover:bg-[#1a1a1a] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
            </svg>
            Study Files ({files.length})
          </button>
        </div>
      </aside>

      {/* ── Main chat area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 max-w-2xl mx-auto w-full
                      lg:max-w-none">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex-shrink-0 bg-[#0a0a0a] border-b border-[#1a1a1a]
                        px-4 py-3 flex items-center gap-3">
          {/* Sidebar toggle (mobile) */}
          <button
            onClick={() => setShowSidebar(true)}
            className="lg:hidden text-gray-500 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          {/* Bot avatar */}
          <div className="w-8 h-8 bg-white rounded-xl flex items-center
                          justify-center flex-shrink-0">
            <span className="text-black font-black text-sm">C</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {activeChat?.title || 'Cognisphere AI'}
            </p>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${
                loading.sending ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}/>
              <p className="text-gray-500 text-xs">
                {loading.sending ? 'Thinking…' : hasContext ? 'Context loaded' : 'No context'}
              </p>
            </div>
          </div>

          {/* New chat button */}
          <button
            onClick={newChat}
            className="text-gray-600 hover:text-white transition-colors p-1"
            title="New conversation"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2
                2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
        </div>

        {/* ── Attached files context bar ───────────────────────────── */}
        {attachedFiles.length > 0 && (
          <div className="flex-shrink-0 bg-[#0d1a0e] border-b border-emerald-900/30
                          px-4 py-2 flex items-center gap-2 overflow-x-auto">
            <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none"
                 stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0
                00.707-.293l5.414-5.414A1 1 0 0019 0v14a2 2 0 01-2 2z"/>
            </svg>
            <span className="text-emerald-500 text-xs font-medium flex-shrink-0">
              Context:
            </span>
            {attachedFiles.map(f => (
              <FileChip
                key={f.id}
                name={f.originalName}
                onRemove={() => detachFile(f.id)}
              />
            ))}
          </div>
        )}

        {/* ── No context warning ────────────────────────────────────── */}
        {!hasContext && messages.length === 0 && activeChatId && (
          <NoContextBanner onUpload={() => fileInputRef.current?.click()} />
        )}

        {/* ── Messages ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

          {/* Empty state */}
          {!activeChatId && !loading.chats && (
            <EmptyState onNew={newChat} />
          )}

          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Sending indicator */}
          {loading.sending && <TypingIndicator />}

          {/* Error */}
          {error && (
            <div className="flex justify-center">
              <p className="text-red-400 text-xs bg-red-950/30 border border-red-900/40
                            rounded-xl px-4 py-2">
                {error}
              </p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Input bar ─────────────────────────────────────────────── */}
        <div className="flex-shrink-0 px-4 pb-24 pt-3 bg-black
                        border-t border-[#0f0f0f]">
          {/* Drag overlay */}
          {dragOver && (
            <div className="absolute inset-0 z-10 bg-emerald-950/50 border-2
                            border-dashed border-emerald-500 rounded-2xl
                            flex items-center justify-center pointer-events-none">
              <p className="text-emerald-400 text-sm font-medium">
                Drop file to upload
              </p>
            </div>
          )}

          {/* Upload progress */}
          {loading.uploading && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 mb-2">
              <span className="w-3 h-3 border border-emerald-500 border-t-transparent
                               rounded-full animate-spin"/>
              Extracting and attaching file…
            </div>
          )}

          <div className="flex items-end gap-2 relative">
            {/* File upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading.uploading}
              className="w-11 h-11 bg-[#111] border border-[#1e1e1e] rounded-2xl
                         flex items-center justify-center text-gray-600
                         hover:text-white hover:border-[#2a2a2a] transition-all
                         flex-shrink-0 disabled:opacity-50"
              title="Upload study file (PDF, TXT, DOCX)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4
                  0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
              </svg>
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md,.docx,.doc"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Text input */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                hasContext
                  ? "Ask a question about your study materials…"
                  : "Upload a file first, then ask questions about it…"
              }
              rows={1}
              disabled={loading.sending}
              className="flex-1 bg-[#111] border border-[#1e1e1e] text-white text-sm
                         rounded-2xl px-4 py-3 outline-none resize-none
                         placeholder-gray-600 focus:border-[#2a2a2a] transition-colors
                         max-h-32 overflow-y-auto disabled:opacity-60"
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading.sending}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center
                         flex-shrink-0 transition-all duration-150
                         ${input.trim() && !loading.sending
                           ? 'bg-white text-black hover:bg-gray-100 active:scale-95'
                           : 'bg-[#1a1a1a] text-gray-700 cursor-not-allowed'}`}
            >
              {loading.sending ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent
                                 rounded-full animate-spin"/>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                        d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              )}
            </button>
          </div>

          <p className="text-gray-800 text-xs text-center mt-2">
            AI answers only from your uploaded study materials
          </p>
        </div>
      </div>

      {/* ── File panel modal ──────────────────────────────────────────── */}
      {showFilePanel && (
        <FilePanelModal
          files={files}
          attachedFileIds={attachedFiles.map(f => f.id)}
          onClose={() => setShowFilePanel(false)}
          onUpload={() => fileInputRef.current?.click()}
        />
      )}

      <BottomNav />
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function ChatListItem({ chat, isActive, onSelect, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const title = chat.title || 'New Chat';
  const fileCount = (chat.fileIds ?? []).length;

  return (
    <div
      className={`flex items-start gap-2 px-3 py-2.5 mx-2 rounded-xl cursor-pointer
                  group transition-all
                  ${isActive
                    ? 'bg-[#1a1a1a] text-white'
                    : 'text-gray-400 hover:bg-[#111] hover:text-white'}`}
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-xs font-medium truncate">{title}</p>
        {fileCount > 0 && (
          <p className="text-gray-700 text-[10px] mt-0.5">
            {fileCount} file{fileCount > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Delete button */}
      {confirmDelete ? (
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={onDelete}
            className="text-red-400 text-[10px] hover:text-red-300"
          >
            Delete
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="text-gray-600 text-[10px] hover:text-gray-400"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
          className="opacity-0 group-hover:opacity-100 text-gray-700
                     hover:text-red-400 transition-all flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5
              4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      )}
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  const timeStr = message.timestamp instanceof Date
    ? message.timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true,
      })
    : '';

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-7 h-7 bg-white rounded-full flex items-center
                        justify-center flex-shrink-0 mb-0.5">
          <span className="text-black font-black text-xs">C</span>
        </div>
      )}
      <div className={`flex flex-col max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
          ${isUser
            ? 'bg-white text-black rounded-br-md'
            : isError
            ? 'bg-red-950/40 border border-red-900/40 text-red-300 rounded-bl-md'
            : 'bg-[#1a1a1a] border border-[#252525] text-gray-200 rounded-bl-md'
          }`}
        >
          {message.content}
        </div>
        <p className="text-gray-700 text-[10px] mt-1 px-1">{timeStr}</p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 bg-white rounded-full flex items-center
                      justify-center flex-shrink-0">
        <span className="text-black font-black text-xs">C</span>
      </div>
      <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl
                      rounded-bl-md px-4 py-3 flex items-center gap-1">
        {[0,1,2].map(i => (
          <span key={i}
                className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}/>
        ))}
      </div>
    </div>
  );
}

function FileChip({ name, onRemove }) {
  return (
    <div className="flex items-center gap-1.5 bg-emerald-950/60 border
                    border-emerald-900/40 rounded-lg px-2 py-1 flex-shrink-0">
      <span className="text-emerald-400 text-xs max-w-[120px] truncate">{name}</span>
      <button
        onClick={onRemove}
        className="text-emerald-700 hover:text-emerald-400 transition-colors"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  );
}

function NoContextBanner({ onUpload }) {
  return (
    <div className="mx-4 mt-2 bg-amber-950/20 border border-amber-900/30
                    rounded-xl px-4 py-3 flex items-start gap-3">
      <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none"
           stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
      <div>
        <p className="text-amber-300 text-xs font-medium">No study materials attached</p>
        <p className="text-amber-500/70 text-xs mt-0.5">
          The AI can only answer questions from your documents.{' '}
          <button onClick={onUpload} className="underline hover:text-amber-300">
            Upload a file to start.
          </button>
        </p>
      </div>
    </div>
  );
}

function EmptyState({ onNew }) {
  return (
    <div className="flex flex-col items-center justify-center h-full
                    min-h-[50vh] text-center px-6">
      <div className="w-14 h-14 bg-[#111] border border-[#1e1e1e] rounded-2xl
                      flex items-center justify-center mb-4">
        <span className="text-white font-black text-xl">C</span>
      </div>
      <p className="text-white text-base font-semibold mb-1">
        Cognisphere Study AI
      </p>
      <p className="text-gray-500 text-sm mb-6 max-w-xs">
        Upload your study materials and ask questions.
        The AI answers only from your documents.
      </p>
      <button
        onClick={onNew}
        className="bg-white text-black text-sm font-bold px-5 py-2.5
                   rounded-xl hover:bg-gray-100 transition-colors"
      >
        Start New Chat
      </button>
    </div>
  );
}

function FilePanelModal({ files, attachedFileIds, onClose, onUpload }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                    bg-black/70 backdrop-blur-sm"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full sm:max-w-sm bg-[#111] border border-[#1e1e1e]
                      rounded-t-3xl sm:rounded-2xl p-5 max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-white font-bold text-sm">Study Files</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {files.length === 0 ? (
            <p className="text-gray-600 text-xs text-center py-6">
              No files uploaded yet.
            </p>
          ) : (
            files.map(f => (
              <div key={f.id}
                   className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl px-4 py-3">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  attachedFileIds.includes(f.id) ? 'bg-emerald-500' : 'bg-gray-700'
                }`}/>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">
                    {f.originalName}
                  </p>
                  <p className="text-gray-600 text-[10px] mt-0.5">
                    {f.charCount?.toLocaleString() ?? '?'} chars extracted
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={() => { onUpload(); onClose(); }}
          className="w-full bg-white text-black text-sm font-bold py-3 rounded-xl
                     hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          + Upload New File
        </button>
      </div>
    </div>
  );
}