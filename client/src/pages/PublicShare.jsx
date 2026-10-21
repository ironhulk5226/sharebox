import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Lock, Cloud, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase.js';
import { downloadCloudinaryFile } from '../services/cloudinary.js';
import { formatBytes, formatDateTime, getFileIcon } from '../utils/format.js';

export default function PublicShare() {
  const { token } = useParams();
  const [share, setShare] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'shares', token)).then((snapshot) => {
      const found = snapshot.exists() ? snapshot.data() : null;
      if (!found) setError('Link not found');
      else if (found.revoked || found.expiresAt.toDate() < new Date()) setError('This link is unavailable or expired');
      else setShare({ ...found, fileName: found.fileName });
    }).catch(() => setError('Unable to load this share link'));
    setLoading(false);
  }, [token]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifying(true);
    try {
      if (password !== share.password) throw new Error('Incorrect password');
      setVerified(true);
      toast.success('Password verified!');
    } catch {
      toast.error('Incorrect password');
    } finally {
      setVerifying(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadCloudinaryFile(share.cloudinaryUrl, share.fileName);
      toast.success('Download started!');
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Cloud className="text-indigo-600" size={28} />
          <span className="text-2xl font-bold text-gray-900">ShareBox</span>
        </div>

        {loading && <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">Loading...</div>}

        {error && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <AlertCircle className="mx-auto text-red-400 mb-3" size={40} />
            <p className="font-medium text-gray-900 mb-1">Link Unavailable</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        )}

        {share && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="text-center mb-6">
              <span className="text-5xl">{getFileIcon(share.extension)}</span>
              <h1 className="text-lg font-semibold text-gray-900 mt-3 break-all">{share.fileName}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {share.extension?.toUpperCase().replace('.', '')} · {formatBytes(share.size)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Expires: {formatDateTime(share.expiresAt)}</p>
            </div>

            {share.isPasswordProtected && !verified ? (
              <form onSubmit={handleVerify} className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Lock size={16} className="text-indigo-600" />
                  This file is password protected
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={verifying || !password}
                  className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {verifying ? 'Verifying...' : 'Verify Password'}
                </button>
              </form>
            ) : (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={18} />
                {downloading ? 'Preparing download...' : 'Download File'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
