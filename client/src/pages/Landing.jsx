import { Link } from 'react-router-dom';
import { Cloud, Lock, Share2, BarChart3, Shield, Clock } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

const features = [
  { icon: Cloud, title: 'Cloud Storage', desc: 'Files stored securely on Cloudinary, not on any single server.' },
  { icon: Lock, title: 'Password Protection', desc: 'Protect shared links with a password before sending.' },
  { icon: Clock, title: 'Expiring Links', desc: 'Set links to expire in 1 hour, 24 hours, 7 days, or 30 days.' },
  { icon: Share2, title: 'Instant Sharing', desc: 'Generate a shareable link for any uploaded file in one click.' },
  { icon: BarChart3, title: 'Download Tracking', desc: 'See how many times your shared files have been downloaded.' },
  { icon: Shield, title: 'Revoke Anytime', desc: 'Revoke a share link immediately to stop all future access.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="text-indigo-600" size={28} />
            <span className="text-2xl font-bold text-gray-900">ShareBox</span>
          </div>
          <div className="flex gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
              Login
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Secure Cloud File Sharing,{' '}
          <span className="text-indigo-600">Simplified</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Upload JPG and PNG images to the cloud. Share them with expiring, password-protected links. Track every download.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            Start for Free
          </Link>
          <Link to="/login" className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
            Sign In
          </Link>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Everything you need to share files securely</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="text-indigo-600" size={20} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Upload', desc: 'Drag and drop or select a file. It gets stored securely in the cloud.' },
            { step: '2', title: 'Share', desc: 'Create a link with optional password and expiry. Copy and send it.' },
            { step: '3', title: 'Track', desc: 'See download counts and revoke access whenever you want.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        <p>ShareBox — Cloud Computing Lab Mini Project &copy; {CURRENT_YEAR}</p>
      </footer>
    </div>
  );
}
