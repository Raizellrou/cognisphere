/**
 * useChat.js
 * resources/js/hooks/useChat.js
 * ─────────────────────────────────────────────────────────────────────────────
 * FIX: All Firestore operations are now handled here directly using the
 *      Firebase JS SDK — no Laravel backend calls for chat management.
 *
 * WHAT CHANGED vs the broken version:
 *  ✗ REMOVED: createChat(), fetchChats(), deleteChat() API calls to Laravel
 *  ✓ ADDED:   Direct Firestore writes for chats and messages
 *  ✓ CHANGED: askAI() now sends history from local state (no backend Firestore read)
 *  ✓ KEPT:    onSnapshot for real-time message updates
 *  ✓ KEPT:    File upload via Laravel API (backend handles extraction)
 *
 * DATA FLOW:
 *   User sends message
 *   → Write user message to Firestore directly (JS SDK)
 *   → POST /api/ai/ask with { message, fileIds, history }
 *   → Laravel calls Gemini → returns reply
 *   → Write AI reply to Firestore directly (JS SDK)
 *   → onSnapshot fires → messages update → UI re-renders
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection, doc, addDoc, setDoc, deleteDoc,
  query, orderBy, onSnapshot, serverTimestamp,
  getDocs, writeBatch,
} from 'firebase/firestore';
import { db }         from '@/firebase';
import { askAI, uploadFile as apiUploadFile, fetchFiles, deleteFile as apiDeleteFile }
  from '@/services/chatApiService';

// ─────────────────────────────────────────────────────────────────────────────

export function useChat(uid) {
  const [chats, setChats]               = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages]         = useState([]);
  const [files, setFiles]               = useState([]);
  const [attachedFileIds, setAttachedFileIds] = useState([]);

  const [loading, setLoading] = useState({
    chats: true, messages: false, sending: false, uploading: false,
  });
  const [error, setError] = useState(null);

  const unsubMessagesRef = useRef(null);
  const unsubChatsRef    = useRef(null);

  // ── Mount: subscribe to chats list + load files ───────────────────────────
  useEffect(() => {
    if (!uid) return;

    // Real-time listener for the user's chats list
    const chatsRef = collection(db, 'users', uid, 'chats');
    const q        = query(chatsRef, orderBy('updatedAt', 'desc'));

    unsubChatsRef.current = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        // Convert Firestore Timestamps for display
        createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
        updatedAt: d.data().updatedAt?.toDate?.() ?? new Date(),
      }));
      setChats(list);
      setLoading(l => ({ ...l, chats: false }));

      // Auto-select the first chat if none is selected
      if (list.length > 0 && !activeChatId) {
        setActiveChatId(list[0].id);
        setAttachedFileIds(list[0].fileIds ?? []);
      }
    }, () => {
      setLoading(l => ({ ...l, chats: false }));
    });

    loadFiles();

    return () => {
      unsubChatsRef.current?.();
      unsubMessagesRef.current?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // ── Subscribe to messages for active chat ─────────────────────────────────
  useEffect(() => {
    if (!uid || !activeChatId) {
      setMessages([]);
      return;
    }

    setLoading(l => ({ ...l, messages: true }));
    unsubMessagesRef.current?.();

    const q = query(
      collection(db, 'users', uid, 'chats', activeChatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    unsubMessagesRef.current = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        timestamp: d.data().timestamp?.toDate?.() ?? new Date(),
      })));
      setLoading(l => ({ ...l, messages: false }));
    }, () => {
      setLoading(l => ({ ...l, messages: false }));
    });

    return () => unsubMessagesRef.current?.();
  }, [uid, activeChatId]);

  // ── Load files from Laravel API ───────────────────────────────────────────
  const loadFiles = useCallback(async () => {
    try {
      const data = await fetchFiles();
      setFiles(data.files ?? []);
    } catch { /* non-critical */ }
  }, []);

  // ── Create a new chat in Firestore directly ───────────────────────────────
  const newChat = useCallback(async () => {
    if (!uid) return;
    try {
      const chatRef = await addDoc(collection(db, 'users', uid, 'chats'), {
        title:     'New Chat',
        fileIds:   [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setActiveChatId(chatRef.id);
      setAttachedFileIds([]);
      setMessages([]);
      return { id: chatRef.id, title: 'New Chat', fileIds: [] };
    } catch (err) {
      setError('Failed to create conversation.');
      throw err;
    }
  }, [uid]);

  // ── Select a different chat ───────────────────────────────────────────────
  const selectChat = useCallback((chatId) => {
    const chat = chats.find(c => c.id === chatId);
    setActiveChatId(chatId);
    setAttachedFileIds(chat?.fileIds ?? []);
    setError(null);
  }, [chats]);

  // ── Delete a chat and all its messages ───────────────────────────────────
  const deleteChat = useCallback(async (chatId) => {
    if (!uid) return;
    try {
      // Delete all messages in a batch
      const msgSnap = await getDocs(
        collection(db, 'users', uid, 'chats', chatId, 'messages')
      );
      const batch = writeBatch(db);
      msgSnap.docs.forEach(d => batch.delete(d.ref));
      batch.delete(doc(db, 'users', uid, 'chats', chatId));
      await batch.commit();

      // If the deleted chat was active, switch to another
      if (activeChatId === chatId) {
        const remaining = chats.filter(c => c.id !== chatId);
        if (remaining.length > 0) {
          setActiveChatId(remaining[0].id);
          setAttachedFileIds(remaining[0].fileIds ?? []);
        } else {
          setActiveChatId(null);
          setMessages([]);
        }
      }
    } catch {
      setError('Failed to delete conversation.');
    }
  }, [uid, activeChatId, chats]);

  // ── Send a message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading.sending) return;

    let chatId = activeChatId;

    // Create a chat first if none exists
    if (!chatId) {
      try {
        const chat = await newChat();
        chatId = chat.id;
      } catch { return; }
    }

    setLoading(l => ({ ...l, sending: true }));
    setError(null);

    // 1. Write user message to Firestore immediately (user sees it right away)
    await addDoc(collection(db, 'users', uid, 'chats', chatId, 'messages'), {
      role:      'user',
      content:   text.trim(),
      timestamp: serverTimestamp(),
    });

    // Auto-title the chat from the first user message
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.title === 'New Chat') {
      const title = text.length > 50 ? text.slice(0, 50) + '…' : text;
      await setDoc(
        doc(db, 'users', uid, 'chats', chatId),
        { title, updatedAt: serverTimestamp() },
        { merge: true }
      );
    }

    // 2. Build history from local messages state (last 18 for token budget)
    const history = messages.slice(-18).map(m => ({
      role:    m.role,
      content: m.content,
    }));

    // 3. Call Laravel → Gemini
    try {
      const { reply } = await askAI(text.trim(), attachedFileIds, history);

      // 4. Write AI reply to Firestore
      await addDoc(collection(db, 'users', uid, 'chats', chatId, 'messages'), {
        role:      'ai',
        content:   reply,
        timestamp: serverTimestamp(),
      });

      // Update chat updatedAt so it rises to top of list
      await setDoc(
        doc(db, 'users', uid, 'chats', chatId),
        { updatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (err) {
      // Write error message to chat so user sees it inline
      await addDoc(collection(db, 'users', uid, 'chats', chatId, 'messages'), {
        role:      'ai',
        content:   '⚠️ ' + (err.message || 'Something went wrong. Please try again.'),
        isError:   true,
        timestamp: serverTimestamp(),
      });
      setError(err.message || 'Failed to get a response.');
    } finally {
      setLoading(l => ({ ...l, sending: false }));
    }
  }, [uid, activeChatId, chats, messages, attachedFileIds, loading.sending, newChat]);

  // ── Upload a file ─────────────────────────────────────────────────────────
  const uploadFile = useCallback(async (file) => {
    setLoading(l => ({ ...l, uploading: true }));
    setError(null);

    let chatId = activeChatId;
    if (!chatId) {
      try { const c = await newChat(); chatId = c.id; }
      catch { setLoading(l => ({ ...l, uploading: false })); return; }
    }

    try {
      const data    = await apiUploadFile(file);
      const newFile = data.file;

      // Add to local files list
      setFiles(prev => [newFile, ...prev]);

      // Attach to active chat in Firestore
      const newIds = [...attachedFileIds, newFile.id];
      setAttachedFileIds(newIds);
      await setDoc(
        doc(db, 'users', uid, 'chats', chatId),
        { fileIds: newIds, updatedAt: serverTimestamp() },
        { merge: true }
      );

      return newFile;
    } catch (err) {
      setError(err.message || 'Failed to upload file.');
      throw err;
    } finally {
      setLoading(l => ({ ...l, uploading: false }));
    }
  }, [uid, activeChatId, attachedFileIds, newChat]);

  // ── Detach a file from the active chat ───────────────────────────────────
  const detachFile = useCallback(async (fileId) => {
    if (!uid || !activeChatId) return;
    const newIds = attachedFileIds.filter(id => id !== fileId);
    setAttachedFileIds(newIds);
    await setDoc(
      doc(db, 'users', uid, 'chats', activeChatId),
      { fileIds: newIds, updatedAt: serverTimestamp() },
      { merge: true }
    );
  }, [uid, activeChatId, attachedFileIds]);

  // ── Delete a file permanently ─────────────────────────────────────────────
  const deleteFile = useCallback(async (fileId) => {
    try {
      await apiDeleteFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      if (attachedFileIds.includes(fileId)) await detachFile(fileId);
    } catch {
      setError('Failed to delete file.');
    }
  }, [attachedFileIds, detachFile]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeChat    = chats.find(c => c.id === activeChatId) ?? null;
  const attachedFiles = files.filter(f => attachedFileIds.includes(f.id));
  const hasContext    = attachedFileIds.length > 0;

  return {
    chats, activeChatId, activeChat,
    messages, files, attachedFiles, attachedFileIds, hasContext,
    loading, error,
    newChat, selectChat, deleteChat,
    sendMessage, uploadFile, detachFile, deleteFile,
  };
}