import { useState, useRef } from 'react';
import { Upload, X, FileUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase.js';
import { uploadToCloudinary, validateFile } from '../services/cloudinary.js';
import { formatBytes } from '../utils/format.js';

export default function UploadZone({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();
  const { user } = useAuth();

  const selectFile = (f) => {
    if (!f) return;
    const validationError = validateFile(f);
    if (validationError) return toast.error(validationError);
    setFile(f);
    setProgress(0);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    selectFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    try {
      const result = await uploadToCloudinary(file, setProgress);
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      const savedFile = {
        ownerUid: user.uid,
        fileName: file.name,
        extension,
        size: result.bytes || file.size,
        contentType: file.type,
        cloudinaryPublicId: result.public_id,
        resourceType: result.resource_type,
        cloudinaryUrl: result.secure_url,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const saved = await addDoc(collection(db, 'users', user.uid, 'files'), savedFile);
      toast.success('File uploaded!');
      setFile(null);
      setProgress(0);
      onUploaded?.({ id: saved.id, ...savedFile });
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileUp size={18} className="text-indigo-600" />
        Upload File
      </h2>

      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
            dragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
          }`}
        >
          <Upload className="mx-auto text-gray-400 mb-3" size={36} />
          <p className="text-sm font-medium text-gray-700">Drag & drop a file here, or click to browse</p>
          <p className="text-xs text-gray-400 mt-1">JPG, JPEG, PNG · Max 10 MB</p>
          <input ref={inputRef} type="file" className="hidden" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={(e) => selectFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
            </div>
            {!uploading && (
              <button onClick={() => setFile(null)} className="text-gray-400 hover:text-gray-600 ml-2">
                <X size={18} />
              </button>
            )}
          </div>
          {uploading && (
            <div className="mb-3">
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{progress}%</p>
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}
    </div>
  );
}
