/**
 * Footer Component
 * Simple site footer with navigation links and copyright notice.
 * Matches the design's minimal bottom footer.
 */
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="text-center py-6 pb-24 px-4">
      <div className="flex items-center justify-center gap-4 mb-2 flex-wrap">
        <button
          onClick={() => handleNavigation('/')}
          className="text-gray-500 hover:text-[#7C3AED] dark:hover:text-[#A78BFA] text-xs transition-colors font-medium"
        >
          Home
        </button>
        <button
          onClick={() => handleNavigation('/about')}
          className="text-gray-500 hover:text-[#7C3AED] dark:hover:text-[#A78BFA] text-xs transition-colors font-medium"
        >
          About
        </button>
        <a
          href="/privacy"
          className="text-gray-500 hover:text-[#7C3AED] dark:hover:text-[#A78BFA] text-xs transition-colors font-medium"
        >
          Privacy
        </a>
        <a
          href="/terms"
          className="text-gray-500 hover:text-[#7C3AED] dark:hover:text-[#A78BFA] text-xs transition-colors font-medium"
        >
          Terms
        </a>
      </div>
      <p className="text-gray-700 dark:text-gray-400 text-[10px]">
        Copyright © {currentYear} CogniSphere. All rights reserved.
      </p>
    </footer>
  );
}