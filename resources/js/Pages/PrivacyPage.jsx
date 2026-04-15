import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CogniLogo from '@/assets/CogniLogo.png';

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-white text-black min-h-screen flex flex-col">
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
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Effective date: April 16, 2026</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-8 py-20">
        {/* Intro */}
        <div className="space-y-6 mb-12 text-gray-700">
          <p>
            CogniSphere ("we," "us," "our," or "Company") operates the CogniSphere application (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal information when you use our Service.
          </p>
          <p>
            We collect information you provide and information about how you use our Service. Your personal information helps us operate and improve CogniSphere to serve you better.
          </p>
          <p>
            By using CogniSphere, you consent to our collection and use of information in accordance with this policy.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold mb-4">Information Collection and Use</h2>
            <p className="text-gray-700 mb-4">
              We collect several different types of information for various purposes to provide and improve our Service to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Types of Data Collected</h2>
            <h3 className="text-lg font-semibold mb-3 mt-6">Personal Data</h3>
            <p className="text-gray-700 mb-3">While using our Service, we may collect:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Email address</li>
              <li>Username (if provided)</li>
              <li>First name and last name</li>
              <li>Cookies and Usage Data</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3">Usage Data</h3>
            <p className="text-gray-700 mb-3">
              We may also collect information on how the Service is accessed and used ("Usage Data"). This may include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Pomodoro session duration and completion patterns</li>
              <li>Todo list details and completion history</li>
              <li>Your device's Internet Protocol address (e.g. IP address)</li>
              <li>Browser type and version of pages visited</li>
              <li>Time spent on these pages and timestamps</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Use of Data</h2>
            <p className="text-gray-700 mb-4">CogniSphere uses the collected data for various purposes:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Transfer of Data</h2>
            <p className="text-gray-700 mb-4">
              Your information, including Personal Data, may be transferred to, and maintained on, computers located outside of your jurisdiction where the data protection laws may differ than those from your jurisdiction.
            </p>
            <p className="text-gray-700 mb-4">
              If you are located outside Philippines and choose to provide information to us, please note that we transfer the data, including Personal Data, to Philippines and process it there.
            </p>
            <p className="text-gray-700">
              Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Disclosure of Data</h2>
            <h3 className="text-lg font-semibold mb-3">Legal Requirements</h3>
            <p className="text-gray-700 mb-3">CogniSphere may disclose your Personal Data in the good faith belief that such action is necessary to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>To comply with a legal obligation</li>
              <li>To protect and defend the rights or property of CogniSphere</li>
              <li>To prevent or investigate possible wrongdoing in connection with the Service</li>
              <li>To protect the personal safety of users of the Service or the public</li>
              <li>To protect against legal liability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Security of Data</h2>
            <p className="text-gray-700">
              The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially reasonable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Service Providers</h2>
            <p className="text-gray-700 mb-4">
              We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used.
            </p>
            <p className="text-gray-700">
              These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Analytics</h2>
            <p className="text-gray-700">
              We may use third-party Service Providers to monitor and analyze the use of our Service to help us improve it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Links to Other Sites</h2>
            <p className="text-gray-700 mb-4">
              Our Service may contain links to other sites that are not operated by us. This Privacy Policy applies only to this website. We strongly advise you to review the Privacy Policy of every site you visit.
            </p>
            <p className="text-gray-700">
              We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our Service does not address anyone under the age of 13 ("Children"). We do not knowingly collect personally identifiable information from anyone under 13.
            </p>
            <p className="text-gray-700">
              If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective date" at the top of this Privacy Policy.
            </p>
            <p className="text-gray-700 mb-4">
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us at hello@cognisphere.app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us:{' '}
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
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-8 py-12 text-center">
          <div className="flex gap-4 justify-center mb-4 text-xs text-gray-600">
            <a href="/privacy" className="font-semibold text-black underline">
              Privacy
            </a>
            <span className="text-gray-300">·</span>
            <a href="/terms" className="hover:underline hover:text-blue-600 transition-colors">
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