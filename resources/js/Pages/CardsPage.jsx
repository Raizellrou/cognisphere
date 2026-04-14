/**
 * CardsPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Flashcard study system with:
 *  - 3D CSS flip animation (perspective transform)
 *  - Next / Previous navigation
 *  - Shuffle deck
 *  - Add card via AddCardModal
 *  - Delete card
 *  - Firestore real-time sync via useCards
 *  - Progress indicator (card X of N)
 *  - Empty state with clear onboarding CTA
 *  - Desktop layout support
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth }    from '@/context/AuthContext';
import { useCards }   from '@/hooks/useCards';
import DesktopLayout  from '@/Layouts/DesktopLayout';
import AddCardModal   from '@/components/cards/AddCardModal';
import BottomNav      from '@/components/layout/BottomNav';

// ── Desktop breakpoint hook ─────────────────────────────────────────────────
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  });

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isDesktop;
}

export default function CardsPage() {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;
  const isDesktop = useIsDesktop();

  const { cards, loading, error, addCard, deleteCard, shuffle } = useCards(uid);

  // ── Deck state ────────────────────────────────────────────────────────────
  const [deck, setDeck]           = useState(null);      // null = use cards directly
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped]     = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting]   = useState(false);

  // Active deck is either the shuffled copy or the original Firestore array
  const activeDeck = deck ?? cards;
  const currentCard = activeDeck[currentIdx] ?? null;
  const total = activeDeck.length;

  // ── Navigation ────────────────────────────────────────────────────────────
  const goNext = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIdx(i => Math.min(i + 1, total - 1)), 150);
  };

  const goPrev = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIdx(i => Math.max(i - 1, 0)), 150);
  };

  const handleShuffle = () => {
    setFlipped(false);
    setCurrentIdx(0);
    setDeck(shuffle(cards));
  };

  const handleReset = () => {
    setFlipped(false);
    setCurrentIdx(0);
    setDeck(null);
  };

  // ── Delete current card ───────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!currentCard) return;
    setDeleting(true);
    try {
      await deleteCard(currentCard.id);
      // Move to previous card if we were at the end
      setCurrentIdx(i => Math.max(0, i - (i >= total - 1 ? 1 : 0)));
      setFlipped(false);
      setDeck(null); // reset shuffle when card is deleted
    } catch {
      /* handle silently */
    } finally {
      setDeleting(false);
    }
  };

  // ── After adding a card, jump to it ──────────────────────────────────────
  const handleAddCard = async (data) => {
    await addCard(data);
    setDeck(null);
    setCurrentIdx(0);
    setFlipped(false);
  };

  // ─────────────────────────────────────────────────────────────────────────

  // Desktop layout
  if (isDesktop) {
    return (
      <DesktopLayout>
        <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 overflow-y-auto">
          <CardContent
            loading={loading}
            cards={cards}
            total={total}
            currentIdx={currentIdx}
            currentCard={currentCard}
            flipped={flipped}
            deleting={deleting}
            deck={deck}
            showModal={showModal}
            setShowModal={setShowModal}
            setFlipped={setFlipped}
            goNext={goNext}
            goPrev={goPrev}
            handleShuffle={handleShuffle}
            handleReset={handleReset}
            handleDelete={handleDelete}
            onAddCard={handleAddCard}
            setCurrentIdx={setCurrentIdx}
            />
        </div>
      </DesktopLayout>
    );
  }

  // Mobile layout
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <main className="flex-1 max-w-sm mx-auto w-full px-4 pt-6 pb-28
                       flex flex-col">
        <CardContent
          loading={loading}
          cards={cards}
          total={total}
          currentIdx={currentIdx}
          currentCard={currentCard}
          flipped={flipped}
          deleting={deleting}
          deck={deck}
          showModal={showModal}
          setShowModal={setShowModal}
          setFlipped={setFlipped}
          goNext={goNext}
          goPrev={goPrev}
          handleShuffle={handleShuffle}
          handleReset={handleReset}
          handleDelete={handleDelete}
          onAddCard={handleAddCard}
          setCurrentIdx={setCurrentIdx}
        />
      </main>

      {showModal && (
        <AddCardModal
          onSave={handleAddCard}
          onClose={() => setShowModal(false)}
        />
      )}

      <BottomNav />
    </div>
  );
}

// ── CardContent (shared between desktop & mobile) ────────────────────────────

function CardContent({
  loading,
  total,
  currentIdx,
  currentCard,
  flipped,
  deleting,
  deck,
  showModal,
  setShowModal,
  setFlipped,
  goNext,
  goPrev,
  handleShuffle,
  handleReset,
  handleDelete,
  onAddCard,
  setCurrentIdx,
}) {
  return (
    <>
      {/* ── Header ────────────────────────────────────────────────– */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-xl font-black tracking-tight">
            Flashcards
          </h1>
          <p className="text-gray-600 text-xs mt-0.5">
            {loading ? '…' : `${total} card${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Shuffle button */}
          {total > 1 && (
            <button
              onClick={deck ? handleReset : handleShuffle}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                         border transition-colors
                         ${deck
                           ? 'border-white/20 text-white bg-white/10'
                           : 'border-[#2a2a2a] text-gray-500 hover:text-white'}`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0
                  0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              {deck ? 'Reset' : 'Shuffle'}
            </button>
          )}
          {/* Add card button */}
          <button
            onClick={() => setShowModal(true)}
            className="w-8 h-8 bg-white text-black rounded-xl flex items-center
                       justify-center hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M12 4v16m8-8H4"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Loading ───────────────────────────────────────────────– */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#2a2a2a] border-t-white/40
                          rounded-full animate-spin"/>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────– */}
      {!loading && total === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center
                        px-4">
          <div className="w-16 h-16 bg-[#111] border border-[#2a2a2a] rounded-2xl
                          flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2
                0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0
                012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <p className="text-white text-base font-semibold mb-1">No cards yet</p>
          <p className="text-gray-500 text-sm mb-6">
            Create your first flashcard to start studying.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-black text-sm font-bold px-6 py-3 rounded-xl
                       hover:bg-gray-100 transition-colors"
          >
            + Create First Card
          </button>
        </div>
      )}

      {/* ── Flashcard ─────────────────────────────────────────────– */}
      {!loading && currentCard && (
        <>
          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-white/40 rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
              />
            </div>
            <span className="text-gray-600 text-xs tabular-nums">
              {currentIdx + 1} / {total}
            </span>
          </div>

          {/* 3D Flip Card */}
          <FlipCard
            card={currentCard}
            flipped={flipped}
            onClick={() => setFlipped(f => !f)}
          />

          {/* Flip hint */}
          <p className="text-gray-700 text-xs text-center mt-3 mb-5">
            {flipped ? 'Showing answer' : 'Tap card to reveal answer'}
          </p>

          {/* Navigation controls */}
          <div className="flex items-center gap-3">
            {/* Previous */}
            <button
              onClick={goPrev}
              disabled={currentIdx === 0}
              className="w-12 h-12 bg-[#111] border border-[#1e1e1e] rounded-2xl
                         flex items-center justify-center text-gray-500
                         hover:text-white hover:border-[#2a2a2a] transition-all
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 19l-7-7 7-7"/>
              </svg>
            </button>

            {/* Flip (center) */}
            <button
              onClick={() => setFlipped(f => !f)}
              className="flex-1 h-12 bg-[#111] border border-[#1e1e1e] rounded-2xl
                         text-gray-400 text-sm font-medium hover:text-white
                         hover:border-[#2a2a2a] transition-all flex items-center
                         justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
              Flip
            </button>

            {/* Next */}
            <button
              onClick={goNext}
              disabled={currentIdx === total - 1}
              className="w-12 h-12 bg-[#111] border border-[#1e1e1e] rounded-2xl
                         flex items-center justify-center text-gray-500
                         hover:text-white hover:border-[#2a2a2a] transition-all
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {/* Delete card */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="mt-4 mx-auto flex items-center gap-1.5 text-gray-700
                       hover:text-red-400 text-xs transition-colors
                       disabled:opacity-50"
          >
            {deleting
              ? <span className="w-3 h-3 border border-current border-t-transparent
                                 rounded-full animate-spin"/>
              : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor"
                     viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858
                    L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
            }
            Delete this card
          </button>

          {/* All cards list (compact, scrollable) */}
          {total > 1 && (
            <CardDots
              total={total}
              current={currentIdx}
              onSelect={(i) => { setFlipped(false); setCurrentIdx(i); }}
            />
          )}
        </>
      )}

      {showModal && (
        <AddCardModal
          onSave={onAddCard}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

// ── FlipCard ─────────────────────────────────────────────────────────────────

/**
 * 3D flip card using CSS perspective transforms.
 * We use inline styles for the 3D properties since Tailwind doesn't include
 * perspective or backface-visibility utilities by default.
 */
function FlipCard({ card, flipped, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ perspective: '1200px', cursor: 'pointer' }}
      className="w-full"
    >
      {/* Inner — rotates on flip */}
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition:  'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          minHeight: '220px',
        }}
      >
        {/* FRONT FACE */}
        <div
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          className="absolute inset-0 bg-[#111] border border-[#1e1e1e] rounded-2xl
                     flex flex-col items-center justify-center p-8 text-center"
        >
          <span className="text-gray-600 text-xs uppercase tracking-widest
                           font-semibold mb-4">Question</span>
          <p className="text-white text-lg font-semibold leading-relaxed">
            {card.front}
          </p>
          {/* Corner indicator */}
          <div className="absolute top-4 right-4 w-6 h-6 rounded-lg bg-[#1a1a1a]
                          flex items-center justify-center">
            <span className="text-gray-600 text-xs">Q</span>
          </div>
        </div>

        {/* BACK FACE */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          className="absolute inset-0 bg-[#0f1a12] border border-emerald-900/40
                     rounded-2xl flex flex-col items-center justify-center p-8
                     text-center"
        >
          <span className="text-emerald-600 text-xs uppercase tracking-widest
                           font-semibold mb-4">Answer</span>
          <p className="text-white text-lg font-semibold leading-relaxed">
            {card.back}
          </p>
          <div className="absolute top-4 right-4 w-6 h-6 rounded-lg bg-emerald-950/60
                          border border-emerald-900/40 flex items-center justify-center">
            <span className="text-emerald-600 text-xs">A</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CardDots ─────────────────────────────────────────────────────────────────

function CardDots({ total, current, onSelect }) {
  // Show max 7 dots; if more, show a compact number pill
  const maxDots = 7;
  if (total <= maxDots) {
    return (
      <div className="flex items-center justify-center gap-1.5 mt-5">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`rounded-full transition-all duration-200
              ${i === current
                ? 'w-4 h-1.5 bg-white'
                : 'w-1.5 h-1.5 bg-[#2a2a2a] hover:bg-[#3a3a3a]'}`}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center gap-3 mt-5 text-xs text-gray-600">
      <button onClick={() => onSelect(0)}
              className="hover:text-white transition-colors">First</button>
      <span>·</span>
      <span>{current + 1} of {total}</span>
      <span>·</span>
      <button onClick={() => onSelect(total - 1)}
              className="hover:text-white transition-colors">Last</button>
    </div>
  );
}