import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { auth, db } from '../services/firebase.js';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { formatDate } from '../utils/format.js';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error('Name must be at least 2 characters');
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { displayName: name.trim(), updatedAt: serverTimestamp() });
      await updateProfile(user, { displayName: name.trim() });
      toast.success('Profile updated');
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Delete your account? All your files and share links will be permanently removed. This cannot be undone.'
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      await signOut(auth);
      toast.success('Account deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Account Details</h2>
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-1">Email</p>
          <p className="text-sm text-gray-700">{user?.email}</p>
        </div>
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-1">Member since</p>
          <p className="text-sm text-gray-700">{user?.createdAt ? formatDate(user.createdAt) : '—'}</p>
        </div>
        <form onSubmit={handleUpdate}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
          />
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
        <h2 className="font-semibold text-red-700 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          Deleting your account will permanently remove all your files from cloud storage and revoke all share links.
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {deleting ? 'Deleting...' : 'Delete Account'}
        </button>
      </div>
    </div>
  );
}
