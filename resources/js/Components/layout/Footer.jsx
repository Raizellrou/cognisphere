/**
 * Footer Component
 * Simple site footer with navigation links and copyright notice.
 * Matches the design's minimal bottom footer.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-center py-6 pb-24 px-4">
      <div className="flex items-center justify-center gap-4 mb-2">
        {["Home", "About", "Privacy", "Terms"].map((link) => (
          <a
            key={link}
            href="#"
            className="text-gray-500 hover:text-white text-xs transition-colors"
          >
            {link}
          </a>
        ))}
      </div>
      <p className="text-gray-700 text-[10px]">
        Copyright © {currentYear}. All rights reserved.
      </p>
    </footer>
  );
}