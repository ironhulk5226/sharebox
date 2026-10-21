import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Files, Share2, Download, HardDrive, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase.js';
import { formatBytes, formatDate, getFileIcon } from '../utils/format.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ files: [], shares: [] });
  useEffect(() => {
    Promise.all([
      getDocs(query(collection(db, 'users', user.uid, 'files'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'users', user.uid, 'shares'), orderBy('createdAt', 'desc'))),
    ]).then(([filesSnapshot, sharesSnapshot]) => setData({
      files: filesSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
      shares: sharesSnapshot.docs.map((item) => item.data()),
    }));
  }, [user.uid]);
  const { files, shares } = data;
  const stats = { totalFiles: files.length, activeShareLinks: shares.filter((share) => !share.revoked && share.expiresAt?.toDate() > new Date()).length, totalDownloads: 0, usedBytes: files.reduce((sum, file) => sum + file.size, 0), quotaBytes: 5 * 1024 * 1024 * 1024 };
  const recentFiles = files.slice(0, 5);
  const usagePct = Math.min(100, Math.round((stats.usedBytes / stats.quotaBytes) * 100));

  const statCards = [
    { icon: Files, label: 'Total Files', value: stats.totalFiles, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Share2, label: 'Active Links', value: stats.activeShareLinks, color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Download, label: 'Total Downloads', value: stats.totalDownloads, color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: HardDrive, label: 'Storage Used', value: formatBytes(stats.usedBytes), color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.displayName || user?.email}!</h1>
          <p className="text-gray-500 text-sm mt-1">Here&apos;s an overview of your ShareBox</p>
        </div>
        <Link
          to="/files"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Upload size={16} />
          Upload File
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={color} size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Storage Quota</span>
          <span className="text-sm text-gray-500">{formatBytes(stats.usedBytes)} / {formatBytes(stats.quotaBytes)}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${usagePct > 80 ? 'bg-red-500' : 'bg-indigo-600'}`}
            style={{ width: `${usagePct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{usagePct}% used</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Files</h2>
          <Link to="/files" className="text-sm text-indigo-600 hover:underline">View all</Link>
        </div>
        {recentFiles.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Files size={40} className="mx-auto mb-2 opacity-40" />
            <p>No files uploaded yet</p>
            <Link to="/files" className="text-indigo-600 text-sm hover:underline mt-1 inline-block">Upload your first file</Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentFiles.map((f) => (
              <li key={f.id} className="px-5 py-3 flex items-center gap-3">
                <span className="text-xl">{getFileIcon(f.extension)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{f.fileName}</p>
                  <p className="text-xs text-gray-400">{formatBytes(f.size)} · {formatDate(f.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
