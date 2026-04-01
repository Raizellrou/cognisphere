// Import Tailwind CSS and bootstrap JS (loads Inertia)
import '../css/app.css';
import './bootstrap';

import React from 'react';
import { createRoot } from 'react-dom/client';

// Import your Dashboard component from Components folder
import Dashboard from './Components/Dashboard/Dashboard';

// -----------------------------
// Mount React manually without Inertia page resolution
// -----------------------------
const el = document.getElementById('app'); // The div in your Blade file
if (el) {
    const root = createRoot(el);
    root.render(
        // Render the Dashboard component directly
        <React.StrictMode>
            <Dashboard />
        </React.StrictMode>
    );
}

// -----------------------------
// Comments / Explanation:
// -----------------------------
// 1. import '../css/app.css'; -> Loads Tailwind CSS classes
// 2. import './bootstrap'; -> Loads Laravel + Inertia + React bootstrap scripts
// 3. import Dashboard -> Import your new Dashboard component
// 4. createRoot(el).render(...) -> Mounts React to <div id="app"> in Blade
// 5. <Dashboard /> -> This will render your menu + main content
// 6. No longer using Welcome.jsx or resolvePageComponent
//    because we want a SPA-like dashboard starting point