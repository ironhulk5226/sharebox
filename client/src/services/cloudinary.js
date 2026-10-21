const CLOUD_NAME = 'ddexahqz5';
const UPLOAD_PRESET = 'sharebox_unsigned';

const ALLOWED = new Set(['.jpg', '.jpeg', '.png']);

export function validateFile(file) {
  const extension = `.${file.name.split('.').pop().toLowerCase()}`;
  if (!ALLOWED.has(extension)) return 'File type is not allowed.';
  if (file.size > 10 * 1024 * 1024) return 'File exceeds the 10 MB limit.';
  return null;
}

export function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    const resourceType = 'image';
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', UPLOAD_PRESET);
    form.append('folder', 'sharebox_uploads');
    const request = new XMLHttpRequest();
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve(JSON.parse(request.responseText));
      else {
        let message = `Cloudinary upload failed (${request.status}).`;
        try {
          const response = JSON.parse(request.responseText);
          message = response.error?.message || message;
        } catch {
          // Keep the status message when Cloudinary returns a non-JSON response.
        }

        reject(new Error(message));
      }
    };
    request.onerror = () => reject(new Error('Network error while uploading to Cloudinary.'));
    request.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`);
    request.send(form);
  });
}

export async function downloadCloudinaryFile(cloudinaryUrl, fileName) {
  if (!cloudinaryUrl) throw new Error('Download URL is not available.');
  const response = await fetch(cloudinaryUrl);
  if (!response.ok) throw new Error(`Download failed (${response.status}).`);
  const blobUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}
