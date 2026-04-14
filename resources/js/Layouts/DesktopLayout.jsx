/**
 * DesktopLayout.jsx
 * Desktop shell with left sidebar + main content area
 * Accepts optional sidebarProps to pass to Sidebar (visibleCards, toggleCard, etc)
 */

import Sidebar from '@/components/layout/Sidebar';

export default function DesktopLayout({ children, sidebarProps = {} }) {
  return (
    <div className="hidden lg:flex h-screen overflow-hidden bg-[#f8fafc] dark:bg-[#0a0a0a]">
      {/* ─ Sidebar (left, ~240-260px) ─ */}
      <Sidebar {...sidebarProps} />

      {/* ─ Main content area (scrollable) ─ */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
