import { useState, useCallback } from 'react';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import SlideUpModal from './SlideUpModal';

export default function FeedbackModal({ isOpen, onClose }) {
  const { currentUser, userProfile } = useAuth();
  const { isDark } = useTheme();
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState(null);
  const [mood, setMood] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = [
    { id: 'bug', label: 'Bug Report', icon: <BugIcon /> },
    { id: 'suggestion', label: 'Suggestion', icon: <LightbulbIcon /> },
    { id: 'testimonial', label: 'Testimonial', icon: <HeartIcon /> },
    { id: 'question', label: 'Question', icon: <QuestionIcon /> },
  ];

  const moods = [
    { id: 'frustrated', label: 'Frustrated', emoji: '😿' },
    { id: 'meh', label: 'Meh', emoji: '😼' },
    { id: 'loving', label: 'Loving it!', emoji: '😸' },
  ];

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const feedbackRef = collection(db, 'feedback');
      await addDoc(feedbackRef, {
        uid: currentUser?.uid || 'anonymous',
        displayName: currentUser?.displayName || userProfile?.displayName || 'Unknown',
        email: currentUser?.email || 'Unknown',
        message: message.trim(),
        category: category || 'general',
        mood: mood || 'neutral',
        createdAt: serverTimestamp(),
      });

      console.log('Feedback sent successfully');
      setShowSuccess(true);
      setMessage('');
      setCategory(null);
      setMood(null);

      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Firestore feedback write error:', error);
      setSubmitError('Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !showSuccess) {
      setMessage('');
      setCategory(null);
      setMood(null);
      setSubmitError('');
      onClose();
    }
  };

  return (
    <SlideUpModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Share your feedback"
    >
      <div style={{ padding: '20px' }}>
        {/* Message textarea */}
        <label style={{
          display: 'block',
          color: isDark ? '#ffffff' : '#111827',
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 8,
        }}>
          What's on your mind?
        </label>
        <textarea
          value={message}
          onChange={(e) => {
            if (e.target.value.length <= 500) {
              setMessage(e.target.value);
            }
          }}
          placeholder="Share your thoughts, report bugs, or suggest features..."
          disabled={isSubmitting || showSuccess}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e5e7eb',
            background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
            color: isDark ? '#ffffff' : '#111827',
            fontSize: 14,
            fontFamily: 'inherit',
            resize: 'none',
            height: 100,
            marginBottom: 6,
            opacity: isSubmitting || showSuccess ? 0.6 : 1,
          }}
        />
        <div style={{
          fontSize: 12,
          color: isDark ? 'rgba(255,255,255,0.55)' : '#6b7280',
          textAlign: 'right',
          marginBottom: 20,
        }}>
          {message.length}/500
        </div>

        {/* Category */}
        <label style={{
          display: 'block',
          color: isDark ? '#ffffff' : '#111827',
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 10,
        }}>
          Category
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              disabled={isSubmitting || showSuccess}
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                border: category === cat.id
                  ? '1px solid #1C9EF9'
                  : isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e5e7eb',
                background: category === cat.id ? '#1C9EF9' : 'transparent',
                color: category === cat.id ? '#ffffff' : isDark ? '#ffffff' : '#111827',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                transition: 'all 200ms ease',
                opacity: isSubmitting || showSuccess ? 0.6 : 1,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', fontSize: 18 }}>
                {cat.icon}
              </span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Mood */}
        <label style={{
          display: 'block',
          color: isDark ? '#ffffff' : '#111827',
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 10,
        }}>
          How do you feel?
        </label>
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {moods.map((m) => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              disabled={isSubmitting || showSuccess}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: 10,
                border: mood === m.id
                  ? '1px solid #1C9EF9'
                  : isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e5e7eb',
                background: mood === m.id ? '#1C9EF9' : 'transparent',
                color: mood === m.id ? '#ffffff' : isDark ? '#ffffff' : '#111827',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                transition: 'all 200ms ease',
                opacity: isSubmitting || showSuccess ? 0.6 : 1,
              }}
            >
              <span style={{ fontSize: 24 }}>{m.emoji}</span>
              <span style={{ fontSize: 12 }}>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Success message */}
        {showSuccess && (
          <div style={{
            padding: 12,
            borderRadius: 10,
            background: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)',
            color: isDark ? 'rgba(34, 197, 94, 1)' : 'rgb(34, 197, 94)',
            textAlign: 'center',
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 16,
          }}>
            Thanks for your feedback! 🙏
          </div>
        )}

        {/* Error message */}
        {submitError && (
          <div style={{
            padding: 12,
            borderRadius: 10,
            background: isDark ? 'rgba(255, 69, 58, 0.1)' : 'rgba(255, 69, 58, 0.08)',
            color: '#FF453A',
            textAlign: 'center',
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 16,
          }}>
            {submitError}
          </div>
        )}

        {/* Send button */}
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || isSubmitting || showSuccess}
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 12,
            background: !message.trim() || isSubmitting || showSuccess ? 'rgba(255, 148, 114, 0.5)' : '#FF9472',
            color: '#ffffff',
            border: 'none',
            fontSize: 15,
            fontWeight: 700,
            cursor: !message.trim() || isSubmitting || showSuccess ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'background 200ms ease',
          }}
        >
          {isSubmitting ? (
            <>
              <span style={{
                width: 16, height: 16, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid #ffffff',
                display: 'inline-block',
                animation: 'spin 0.7s linear infinite',
              }} />
              Sending...
            </>
          ) : showSuccess ? (
            <>
              <span style={{ fontSize: 18 }}>✓</span>
              Sent!
            </>
          ) : (
            'Send Feedback'
          )}
        </button>

        {/* Bottom safe area */}
        <div style={{ height: 16 }} />
      </div>
    </SlideUpModal>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────

function BugIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1v6m0 6v6"/>
      <path d="M4.22 4.22L9.46 9.46m5.08 5.08l5.24 5.24"/>
      <path d="M1 12h6m6 0h6"/>
      <path d="M4.22 19.78L9.46 14.54m5.08-5.08l5.24-5.24"/>
      <circle cx="12" cy="9" r="2"/>
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5m0 4v2"/>
      <path d="M9 17h6"/>
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v.01M12 12a3 3 0 0 0-3-3 3 3 0 0 0-3 3"/>
    </svg>
  );
}
