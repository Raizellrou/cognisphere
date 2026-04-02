// resources/js/components/layout/BottomNav.jsx
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/',         label: 'Home',     icon: '/icons/home-icon/Property 1=bold.png' },
  { to: '/calendar', label: 'Calendar', icon: '/icons/calendar-icon/Property 1=bold.png' },
  { to: '/chat',     label: 'Chat',     icon: '/icons/message-icon/Property 1=bold.png' },
  { to: '/cards',    label: 'Cards',    icon: '/icons/book-icon/Property 1=bold.png' },
  { to: '/account',  label: 'Account',  icon: '/icons/profile-icon/Property 1=bold.png' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#111]
                    border-t border-[#2a2a2a]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-3 px-3
               flex-1 transition-colors duration-150 text-xs font-medium
               ${isActive ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`
            }
          >
            {/* ✅ FIXED HERE */}
            <img
              src={icon}
              alt={label}
              className="w-5 h-5 object-contain"
            />

            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}