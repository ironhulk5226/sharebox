import { useEffect, useState } from 'react';
import { ExternalLink, XCircle, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { collection, getDocs, orderBy, query, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase.js';
import { formatDateTime, getFileIcon } from '../utils/format.js';

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700',
  expired: 'bg-yellow-100 text-yellow-700',
  revoked: 'bg-red-100 text-red-700',
};

export default function SharedLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLinks = async () => {
    const snapshot = await getDocs(query(collection(db, 'users', user.uid, 'shares'), orderBy('createdAt', 'desc')));
    setLinks(snapshot.docs.map((document) => {
      const link = { id: document.id, ...document.data() };
      return { ...link, status: link.revoked ? 'revoked' : link.expiresAt.toDate() < new Date() ? 'expired' : 'active', fileId: { extension: link.extension, originalName: link.fileName } };
    }));
    setLoading(false);
  };

  useEffect(() => { fetchLinks(); }, [user.email]);

  const handleRevoke = async (link) => {
    if (!window.confirm('Revoke this link? Recipients will no longer be able to download.')) return;
    await updateDoc(doc(db, 'users', user.uid, 'shares', link.id), { revoked: true });
    await updateDoc(doc(db, 'shares', link.id), { revoked: true });
    toast.success('Link revoked');
    fetchLinks();
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shared Links</h1>

      {links.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <Share2 size={40} className="mx-auto mb-2 opacity-40" />
          <p>No share links created yet</p>
          <p className="text-sm mt-1">Go to My Files and click the share icon on any file</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">File</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">Password</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {links.map((link) => {
                const file = link.fileId;
                return (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{getFileIcon(file?.extension)}</span>
                        <span className="font-medium text-gray-900 truncate max-w-40">{file?.originalName || 'Deleted file'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDateTime(link.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDateTime(link.expiresAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${link.isPasswordProtected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                        {link.isPasswordProtected ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[link.status]}`}>
                        {link.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/share/${link.id}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View shared link"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                        >
                          <ExternalLink size={16} />
                          <span>View</span>
                        </a>
                        {link.status === 'active' && (
                          <button
                            onClick={() => handleRevoke(link)}
                            title="Revoke"
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
