export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(date) {
  if (date?.toDate) date = date.toDate();
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(date) {
  if (date?.toDate) date = date.toDate();
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function getFileIcon(extension) {
  const map = {
    '.pdf': '📄', '.docx': '📝', '.pptx': '📊',
    '.txt': '📃', '.jpg': '🖼️', '.jpeg': '🖼️', '.png': '🖼️',
  };
  return map[extension?.toLowerCase()] || '📁';
}
