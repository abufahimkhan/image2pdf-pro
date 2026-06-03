import { usePDFStore } from '../store';
import { FileText, Download, Trash2, Clock, Calendar, CheckSquare, Plus, RefreshCcw } from 'lucide-react';

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function RecentFiles({ onClose }: { onClose: () => void }) {
  const { recentConversions, clearRecentConversions } = usePDFStore();

  const handleDownload = (downloadUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full pl-10 flex">
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-white dark:bg-[#09090b] shadow-xl border-l border-slate-200 dark:border-[#27272a]">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-[#27272a] flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-800 dark:text-[#fafafa]">
                  Recent Document Conversions
                </h2>
                <p className="text-xs text-slate-450 dark:text-[#71717a] mt-0.5">
                  Your local document generation log
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:text-[#a1a1aa] dark:hover:text-[#fafafa] p-2 rounded-lg hover:bg-slate-5 p-1 hover:dark:bg-[#18181b] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {recentConversions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[350px] text-center max-w-xs mx-auto select-none pointer-events-none">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] flex items-center justify-center text-slate-400 dark:text-[#71717a] mb-4 shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-[#fafafa]">
                    No recent conversions
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-[#71717a] mt-1">
                    Once you convert images, they will appear here for easy access during your active session.
                  </p>
                </div>
              ) : (
                recentConversions.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200/80 dark:border-[#27272a] bg-slate-50/50 dark:bg-[#18181b]/50 hover:border-slate-350 dark:hover:border-[#3f3f46] hover:shadow-sm transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-[#18181b] border border-indigo-100/50 dark:border-[#27272a] flex items-center justify-center text-indigo-255 dark:text-[#a1a1aa] shrink-0 shadow-sm">
                        <FileText className="w-5 h-5 text-[#3b82f6]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-slate-800 dark:text-[#fafafa] truncate pr-4" title={item.filename}>
                          {item.filename}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 select-none text-[10px] text-slate-450 dark:text-[#71717a] font-mono">
                          <span>{item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}</span>
                          <span>•</span>
                          <span>{formatBytes(item.size)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-[#27272a] pt-3 text-[10px] text-slate-450 dark:text-[#71717a]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(item.timestamp)}
                      </span>
                      <button
                        onClick={() => handleDownload(item.downloadUrl, item.filename)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-[10px] rounded-lg border border-transparent shadow-sm transition-all cursor-pointer focus:outline-none"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Clear Logs Button */}
            {recentConversions.length > 0 && (
              <div className="p-6 border-t border-slate-100 dark:border-[#27272a]">
                <button
                  onClick={clearRecentConversions}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-[#ef4444] dark:hover:bg-red-600 text-rose-650 dark:text-white font-semibold text-xs rounded-xl border border-rose-150/30 dark:border-transparent transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Entire History</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
