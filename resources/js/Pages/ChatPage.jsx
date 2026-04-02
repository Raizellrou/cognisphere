/**
 * ChatPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * UI-ONLY chat interface. No AI/backend calls yet.
 * Local state only — ready for AI plugin-in via a simple service swap.
 *
 * HOW TO PLUG IN AI LATER:
 *   1. Replace simulateBotReply() with a real API call:
 *        const reply = await fetch('/api/ai/ask', { ... })
 *   2. Stream the response by updating the last message incrementally
 *   3. Add conversation history in the request body
 *   The message shape and state structure stays identical.
 *
 * Message shape: { id, role: 'user'|'bot', text, timestamp, loading? }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import BottomNav  from '@/components/layout/BottomNav';

// ── Simulated bot responses ─────────────────────────────────────────────────
// Remove this entire array when real AI is integrated
const BOT_REPLIES = [
  "I'm here to help you study and stay focused. What would you like to work on?",
  "Great question! Let me think about that for a moment.",
  "You're making excellent progress. Keep it up!",
  "I can help you break that topic down into manageable chunks.",
  "That's a complex subject. Want me to explain it step by step?",
  "Focus is key. Try the Pomodoro technique — 25 minutes of work, 5 minute break.",
  "I've noted that. Is there anything else you'd like to explore?",
  "Here's a tip: active recall is more effective than re-reading for memorization.",
];

function getSimulatedReply() {
  return BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
}

// ── Message ID generator ────────────────────────────────────────────────────
let _id = 0;
const nextId = () => `msg-${++_id}`;

// ── Welcome messages ────────────────────────────────────────────────────────
const INITIAL_MESSAGES = [
  {
    id: nextId(),
    role: 'bot',
    text: "Hi! I'm your Cognisphere AI assistant. I'm here to help you study, stay focused, and learn better. What can I help you with today?",
    timestamp: new Date(),
  },
];

export default function ChatPage() {
  const { currentUser, userProfile } = useAuth();
  const displayName = userProfile?.displayName || currentUser?.displayName || 'You';

  // ── State ─────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);  // Bot "typing" indicator

  // ── Refs ──────────────────────────────────────────────────────────────────
  const bottomRef  = useRef(null);   // Scroll anchor
  const inputRef   = useRef(null);   // Auto-focus input

  // ── Auto-scroll to bottom on new messages ─────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || typing) return;

    // 1. Append user message
    const userMsg = { id: nextId(), role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    inputRef.current?.focus();

    // 2. Show typing indicator
    setTyping(true);

    // 3. Simulate bot reply after a realistic delay
    //    REPLACE THIS BLOCK with real API call when AI is ready:
    //    ─────────────────────────────────────────────────────
    //    const response = await fetch('/api/ai/ask', {
    //      method: 'POST',
    //      headers: { 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${await getToken()}` },
    //      body: JSON.stringify({ message: text }),
    //    });
    //    const { reply } = await response.json();
    //    ─────────────────────────────────────────────────────
    const delay = 800 + Math.random() * 800;   // 0.8–1.6s feels natural
    setTimeout(() => {
      const botMsg = {
        id:        nextId(),
        role:      'bot',
        text:      getSimulatedReply(),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
      setTyping(false);
    }, delay);
  }, [input, typing]);

  // ── Handle Enter key ──────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Suggested prompts (shown when chat is empty / initial state) ──────────
  const suggestions = [
    'Help me study for my exam',
    'Explain the Pomodoro method',
    'Give me a focus tip',
    'Quiz me on a topic',
  ];

  const showSuggestions = messages.length === 1; // Only welcome message

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black flex flex-col">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-[#0a0a0a] border-b border-[#1a1a1a]
                      px-4 py-3 max-w-sm w-full mx-auto">
        <div className="flex items-center gap-3">
          {/* Bot avatar */}
          <div className="w-8 h-8 bg-white rounded-xl flex items-center
                          justify-center flex-shrink-0">
            <span className="text-black font-black text-sm">C</span>
          </div>
          <div>
            <p className="text-white text-sm font-semibold">Cognisphere AI</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"/>
              <p className="text-gray-500 text-xs">
                {typing ? 'Typing…' : 'Online'}
              </p>
            </div>
          </div>
          {/* Clear chat button */}
          <button
            onClick={() => setMessages(INITIAL_MESSAGES)}
            className="ml-auto text-gray-700 hover:text-gray-400 transition-colors"
            title="Clear chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858
                L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Messages area ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto max-w-sm w-full mx-auto px-4
                      py-4 pb-2 space-y-3">

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            displayName={displayName}
          />
        ))}

        {/* Typing indicator */}
        {typing && <TypingIndicator />}

        {/* Suggested prompts */}
        {showSuggestions && (
          <div className="pt-2">
            <p className="text-gray-600 text-xs mb-2 text-center">
              Suggested questions
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400
                             hover:text-white hover:border-[#3a3a3a] px-3 py-1.5
                             rounded-full transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ───────────────────────────────────────────────── */}
      <div className="flex-shrink-0 max-w-sm w-full mx-auto px-4 pb-24 pt-3
                      bg-black border-t border-[#0f0f0f]">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Cognisphere anything…"
            rows={1}
            className="flex-1 bg-[#111] border border-[#1e1e1e] text-white text-sm
                       rounded-2xl px-4 py-3 outline-none resize-none
                       placeholder-gray-600 focus:border-[#2a2a2a] transition-colors
                       max-h-32 overflow-y-auto"
            style={{ lineHeight: '1.5' }}
            // Auto-grow textarea
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || typing}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center
                       flex-shrink-0 transition-all duration-150
                       ${input.trim() && !typing
                         ? 'bg-white text-black hover:bg-gray-100 active:scale-95'
                         : 'bg-[#1a1a1a] text-gray-700 cursor-not-allowed'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        <p className="text-gray-800 text-xs text-center mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>

      <BottomNav />
    </div>
  );
}

// ── MessageBubble ────────────────────────────────────────────────────────────

function MessageBubble({ message, displayName }) {
  const isUser = message.role === 'user';

  const timeStr = message.timestamp instanceof Date
    ? message.timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true,
      })
    : '';

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 bg-white rounded-full flex items-center
                        justify-center flex-shrink-0 mb-0.5">
          <span className="text-black font-black text-xs">C</span>
        </div>
      )}

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        {/* Bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
            ${isUser
              ? 'bg-white text-black rounded-br-md'
              : 'bg-[#1a1a1a] border border-[#252525] text-gray-200 rounded-bl-md'
            }`}
        >
          {message.text}
        </div>
        {/* Timestamp */}
        <p className="text-gray-700 text-[10px] mt-1 px-1">{timeStr}</p>
      </div>
    </div>
  );
}

// ── TypingIndicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 bg-white rounded-full flex items-center
                      justify-center flex-shrink-0">
        <span className="text-black font-black text-xs">C</span>
      </div>
      <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl
                      rounded-bl-md px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}