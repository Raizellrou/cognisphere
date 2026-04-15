/**
 * TermsPage.jsx — CogniSphere
 * Terms & Conditions page with clean, document-style layout
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CogniLogo from '@/assets/CogniLogo.png';

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 mb-8 hover:opacity-70 transition-opacity"
          >
            <img
              src={CogniLogo}
              alt="CogniSphere"
              className="w-8 h-8"
            />
            <span className="font-semibold">CogniSphere</span>
          </button>
          <h1 className="text-4xl font-bold mb-4">Terms and Conditions</h1>
          <div className="flex justify-center mb-4">
            <div className="w-10 h-0.5" style={{ backgroundColor: '#1C9EF9' }}></div>
          </div>
          <p className="text-sm text-gray-500">Last updated: April 16, 2026</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-8 py-20">
        {/* Intro */}
        <div className="space-y-6 mb-12 text-gray-700">
          <p>
            Please read these Terms and Conditions ("Terms," "Terms and Conditions") carefully before using the CogniSphere application (the "Service") operated by CogniSphere.
          </p>
          <p>
            Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.
          </p>
          <p>
            By accessing and using CogniSphere, you accept and agree to be bound by and comply with these Terms and Conditions. If you do not agree to abide by the above, please do not use this service.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold mb-4">Accounts</h2>
            <p className="text-gray-700 mb-4">
              When you create an account with CogniSphere, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
            <p className="text-gray-700 mb-4">
              You are responsible for safeguarding the password that you use to access the Service and for all of the activity on your account. You agree to accept responsibility for all activities that occur under your account.
            </p>
            <p className="text-gray-700">
              You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Account Data</h2>
            <p className="text-gray-700 mb-4">The following information is associated with your account:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Email address</li>
              <li>Username (if provided)</li>
              <li>Todo lists and their contents</li>
              <li>Pomodoro session data</li>
              <li>User settings and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Termination</h2>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including if you breach the Terms.
            </p>
            <p className="text-gray-700">
              If you wish to terminate your account, you may simply discontinue using the Service. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
            <p className="text-gray-700">
              In no event shall CogniSphere, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, damages for loss of profits, goodwill, use, data, or other intangible losses (even if we have been advised of the possibility of such damage), resulting from (i) your use of or inability to use the Service; (ii) any unauthorized access to or use of our servers and any personal information stored therein; (iii) any interruption or cessation of transmission to or from our Service; (iv) any errors or omissions in any content or for any loss or damage of any kind incurred as a result of the use of any content posted, emailed, transmitted, or otherwise made available via the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Disclaimer</h2>
            <p className="text-gray-700 mb-4">
              Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
            </p>
            <p className="text-gray-700">
              CogniSphere its subsidiaries and affiliates, and its licensors do not warrant that a) the Service will function uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These Terms and Conditions are governed by and construed in accordance with the laws of the Philippines, without regard to its conflict of law provisions.
            </p>
            <p className="text-gray-700">
              Our failure to enforce any right or provision of these terms will not be considered a waiver of those rights. If any provision of these terms is held to be invalid or unenforceable by a court, the remaining provisions of these terms will remain in effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Changes</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>
            <p className="text-gray-700">
              Your continued use of the Service following the posting of revised Terms means that you accept and agree to the changes. You are expected to check this page from time to time so you are aware of any changes, as they are binding on you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about these Terms and Conditions, please contact us at{' '}
              <a
                href="mailto:hello@cognisphere.app"
                className="text-blue-600 hover:underline"
              >
                hello@cognisphere.app
              </a>
            </p>
          </section>
        </div>

        {/* Return Button */}
        <div className="flex justify-center mt-16 pt-12 border-t border-gray-200">
          <button
            onClick={() => navigate('/')}
            style={{ backgroundColor: '#1C9EF9' }}
            className="hover:opacity-90 text-white px-8 py-3 rounded font-semibold transition-opacity"
          >
            ← Return to Home
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-8 py-12 text-center">
          <div className="flex gap-4 justify-center mb-4 text-xs text-gray-600">
            <a href="/privacy" className="hover:underline hover:text-blue-600 transition-colors">
              Privacy
            </a>
            <span className="text-gray-300">·</span>
            <a href="/terms" className="font-semibold text-black underline">
              Terms
            </a>
          </div>
          <p className="text-xs text-gray-500">
            Created with ♥ for focus. © {currentYear} CogniSphere.
          </p>
        </div>
      </footer>
    </div>
  );
}
