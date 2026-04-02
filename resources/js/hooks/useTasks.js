// resources/js/hooks/useTasks.js
import { useEffect, useState } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, query, orderBy
} from 'firebase/firestore';
import { db } from '@/firebase';

export function useTasks(uid) {
  const [tasks, setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const tasksRef = collection(db, 'users', uid, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return unsubscribe;
  }, [uid]);

  const addTask = (title, dueDate = null) =>
    addDoc(collection(db, 'users', uid, 'tasks'), {
      title, done: false, dueDate, createdAt: serverTimestamp(),
    });

  const toggleTask = (taskId, done) =>
    updateDoc(doc(db, 'users', uid, 'tasks', taskId), { done: !done });

  const deleteTask = (taskId) =>
    deleteDoc(doc(db, 'users', uid, 'tasks', taskId));

  return { tasks, loading, addTask, toggleTask, deleteTask };
}