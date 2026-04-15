/**
 * AboutPage.jsx — CogniSphere
 * Marketing landing page inspired by Bentodoro design
 * Clean, minimal layout with hero, brand story, technique, audience, and CTA
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CogniLogo from '@/assets/CogniLogo.png';

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-gray-200 sticky top-0 z-50 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex-shrink-0 flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <img
              src={CogniLogo}
              alt="CogniSphere"
              className="w-8 h-8"
            />
            <span className="hidden sm:inline font-semibold text-lg">CogniSphere</span>
          </button>

          <div className="flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            <a href="/about" className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(28, 158, 249, 0.1)', color: '#1C9EF9' }}>
              About
            </a>
          </div>

          <button
            onClick={() => navigate('/')}
            style={{ backgroundColor: '#1C9EF9' }}
            className="hover:opacity-90 text-white px-6 py-2 rounded text-sm font-semibold transition-opacity"
          >
            Open App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-24">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-6">
            <p className="text-xs font-semibold text-gray-500 mb-8 tracking-wide">— ABOUT</p>
            <h1 className="text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
              A timer that takes focus seriously.
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              CogniSphere is a free, browser-based productivity timer built for board exam reviewers, students, and anyone who does serious focused work.
            </p>
          </div>
        </div>
      </section>

      {/* The Name Section */}
      <section className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-24">
          <p className="text-xs font-semibold text-gray-500 mb-12 tracking-wide">— THE NAME</p>
          <div className="grid grid-cols-12 gap-12">
            <div className="col-span-12 lg:col-span-4">
              <h2 className="text-4xl font-bold mb-2">Cogni</h2>
              <p className="text-base text-gray-600">+ Sphere</p>
            </div>
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div>
                <p className="text-sm font-semibold mb-2">
                  <span className="font-bold">Cogni</span> — From cognition
                </p>
                <p className="text-gray-700">
                  The mental processes of acquiring knowledge, thinking, reasoning, and deep focus. Clarity of mind. Mental sharpness at work.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">
                  <span className="font-bold">Sphere</span> — Wholeness and balance
                </p>
                <p className="text-gray-700">
                  The complete orbit of work and rest. Full-circle thinking. A rhythm that sustains productive momentum while preventing burnout.
                </p>
              </div>
              <div>
                <p className="text-gray-700">
                  Together: A tool that unites deep work blocks with intentional recovery cycles. One complete system for sustainable, focused productivity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Technique Section */}
      <section className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-24">
          <p className="text-xs font-semibold text-gray-500 mb-12 tracking-wide">— THE TECHNIQUE</p>

          {/* Three Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              {
                time: '25 MIN',
                title: 'Deep Work',
                desc: 'Full focus. One task. No multitasking. The timer runs uninterrupted.',
              },
              {
                time: '5 MIN',
                title: 'Short Break',
                desc: 'Step away. Breathe. Recharge. A brief moment to rest before the next sprint.',
              },
              {
                time: '15–30 MIN',
                title: 'Long Break',
                desc: 'Extended recovery. Stretch, find calm, or explore music. Complete mental restoration.',
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="border border-gray-300 bg-white rounded p-6 hover:shadow-md transition-shadow"
              >
                <p style={{ color: '#1C9EF9' }} className="text-xs font-semibold mb-3">
                  {card.time}
                </p>
                <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                <p className="text-sm text-gray-700">{card.desc}</p>
              </div>
            ))}
          </div>

            <div style={{ borderColor: '#1C9EF9', backgroundColor: 'rgba(28, 158, 249, 0.05)' }} className="border rounded-lg p-6 mt-12">
            <p className="text-sm">
              <span style={{ color: '#1C9EF9' }} className="font-bold">Reverse mode:</span>
              {' '}
              CogniSphere supports flipping the sequence. Start with a break, then tackle focused work. Useful when you need a warm-up or want to shift your mindset before jumping in.
            </p>
            </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-24">
          <p className="text-xs font-semibold text-gray-500 mb-12 tracking-wide">— WHO IT'S FOR</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Board Reviewers',
                desc: 'Master complex material in structured sessions. Build consistency. Pass with clarity.',
              },
              {
                title: 'Students',
                desc: 'Study smarter, not longer. Timed sessions improve retention. Better results, less burnout.',
              },
              {
                title: 'Professionals',
                desc: 'Reclaim deep work in a world of notifications. Ship better code, writing, and ideas.',
              },
              {
                title: 'Remote Workers',
                desc: 'Create structure at home. Clear boundaries between focus time and rest. Less context-switching.',
              },
            ].map((audience, idx) => (
              <div key={idx} className="border border-gray-300 bg-white rounded p-6">
                <h3 className="text-lg font-bold mb-3">{audience.title}</h3>
                <p className="text-sm text-gray-700">{audience.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-24 text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to start?</h2>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              style={{ backgroundColor: '#1C9EF9' }}
              className="hover:opacity-90 text-white px-8 py-3 rounded font-semibold transition-opacity inline-flex items-center gap-2"
            >
              Open CogniSphere →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src={CogniLogo}
                alt="CogniSphere"
                className="w-6 h-6"
              />
              <p className="text-xs text-gray-600">
                © {currentYear} CogniSphere. All rights reserved.
              </p>
            </div>
            <div className="flex gap-6 text-xs text-gray-600">
              <a href="/about" className="hover:text-black transition-colors">
                About
              </a>
              <span className="text-gray-300">·</span>
              <a href="/privacy" className="hover:text-black transition-colors">
                Privacy
              </a>
              <span className="text-gray-300">·</span>
              <a href="/terms" className="hover:text-black transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
