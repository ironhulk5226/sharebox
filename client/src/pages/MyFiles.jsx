import { useEffect, useState, useCallback } from 'react';
import { Search, Download, Share2, Trash2, Files } from 'lucide-react';
import toast from 'react-hot-toast';
import { collection, deleteDoc, doc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase.js';
import { downloadCloudinaryFile } from '../services/cloudinary.js';
import { formatBytes, formatDate, getFileIcon } from '../utils/format.js';
import UploadZone from '../components/UploadZone.jsx';
import ShareLinkModal from '../components/ShareLinkModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function MyFiles() {
  const [files, setFiles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [shareTarget, setShareTarget] = useState(null);
  const { user } = useAuth();

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, 'users', user.uid, 'files'), orderBy('createdAt', 'desc')));
      let result = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
      if (search) result = result.filter((file) => file.fileName.toLowerCase().includes(search.toLowerCase()));
      if (type) result = result.filter((file) => file.extension === type);
      result.sort((a, b) => sort === 'name' ? a.fileName.localeCompare(b.fileName) : sort === 'oldest' ? (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0) : (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setFiles(result);
      setTotal(result.length);
      setPages(1);
    } catch {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [search, type, sort, page, user.uid]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleDownload = async (file) => {
    try {
      await downloadCloudinaryFile(file.cloudinaryUrl, file.fileName);
    } catch (error) {
      toast.error(error.message || 'Download failed');
    }
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Delete "${file.fileName}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'files', file.id));
      toast.success('File deleted');
      fetchFiles();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Files</h1>

      <div className="mb-6">
        <UploadZone onUploaded={() => { setPage(1); fetchFiles(); }} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search files..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All types</option>
            {['.jpg', '.jpeg', '.png'].map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : files.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Files size={40} className="mx-auto mb-2 opacity-40" />
            <p>No files found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Size</th>
                    <th className="px-4 py-3 font-medium">Uploaded</th>
                    <th className="px-4 py-3 font-medium">Downloads</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {files.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>{getFileIcon(f.extension)}</span>
                          <span className="font-medium text-gray-900 truncate max-w-48">{f.fileName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{f.extension}</td>
                      <td className="px-4 py-3 text-gray-500">{formatBytes(f.size)}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(f.createdAt)}</td>
                      <td className="px-4 py-3 text-gray-500">{f.downloads}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleDownload(f)} title="Download" className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                            <Download size={16} />
                          </button>
                          <button onClick={() => setShareTarget(f)} title="Share" className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
                            <Share2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(f)} title="Delete" className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <span>{total} files total</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50">Prev</button>
                  <span className="px-3 py-1">{page} / {pages}</span>
                  <button disabled={page === pages} onClick={() => setPage(page + 1)} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {shareTarget && <ShareLinkModal file={shareTarget} onClose={() => setShareTarget(null)} />}
    </div>
  );
}
