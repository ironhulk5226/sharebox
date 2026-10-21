import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { collection, doc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase.js';

export default function ShareLinkModal({ file, onClose }) {
  const [expiry, setExpiry] = useState('24h');
  const [password, setPassword] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const handleCreate = async () => {
    setLoading(true);
    try {
      const durations = { '1h': 60 * 60 * 1000, '24h': 24 * 60 * 60 * 1000, '7d': 7 * 24 * 60 * 60 * 1000, '30d': 30 * 24 * 60 * 60 * 1000 };
      const shareRef = doc(collection(db, 'users', user.uid, 'shares'));
      const expiresAt = Timestamp.fromDate(new Date(Date.now() + durations[expiry]));
      const share = { ownerUid: user.uid, fileId: file.id, fileName: file.fileName, extension: file.extension, size: file.size, cloudinaryUrl: file.cloudinaryUrl, createdAt: serverTimestamp(), expiresAt, password: usePassword ? password : '', isPasswordProtected: usePassword, revoked: false };
      await setDoc(shareRef, share);
      const publicShare = { ...share };
      await setDoc(doc(db, 'shares', shareRef.id), publicShare);
      setShareUrl(`${window.location.origin}/share/${shareRef.id}`);
      toast.success('Share link created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Create Share Link</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <p className="text-sm text-gray-600 mb-4 truncate">
          <span className="font-medium">File:</span> {file.fileName}
        </p>

        {!shareUrl ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
              <select
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1h">1 Hour</option>
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" checked={usePassword} onChange={(e) => setUsePassword(e.target.checked)} className="rounded" />
                Password protect this link
              </label>
              {usePassword && (
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 4 characters"
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>

            <button
              onClick={handleCreate}
              disabled={loading || (usePassword && password.length < 4)}
              className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Create Link'}
            </button>
          </>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-2">Share this link:</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 truncate"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <button onClick={onClose} className="mt-4 w-full py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
