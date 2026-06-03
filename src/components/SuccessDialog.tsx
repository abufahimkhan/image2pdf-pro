import { useEffect, useState, CSSProperties, MouseEvent } from 'react';
import { CheckCircle2, Download, ExternalLink, FileText, Sparkles, FolderIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePDFStore } from '../store';
import confetti from 'canvas-confetti';

interface SuccessDialogProps {
  onClose: () => void;
  filename: string;
  size: number;
  pageCount: number;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function SuccessDialog({ onClose, filename, size, pageCount }: SuccessDialogProps) {
  const { lastGeneratedPdfUrl, clearImages, images, settings } = usePDFStore();
  const [currentPage, setCurrentPage] = useState(0);

  // Safely get current image
  const currentImage = images[currentPage] || images[0];

  useEffect(() => {
    // Reset page if bounds shifted
    if (currentPage >= images.length) {
      setCurrentPage(0);
    }
  }, [images, currentPage]);

  const goToNextPage = (e: MouseEvent) => {
    e.stopPropagation();
    if (currentPage < images.length - 1) {
      setCurrentPage(prev => prev + 1);
    } else {
      setCurrentPage(0);
    }
  };

  const goToPrevPage = (e: MouseEvent) => {
    e.stopPropagation();
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    } else {
      setCurrentPage(images.length - 1);
    }
  };

  // Simulated styles from settings
  const { pageSize, orientation, marginType, customMargin, scaling, watermark } = settings;

  // Determine if page orientation is landscape or determined automatically from picture dimensions
  const isLandscape = 
    orientation === 'Landscape' || 
    (orientation === 'Auto' && currentImage && currentImage.width > currentImage.height);

  const pageAspectClass = isLandscape ? 'aspect-[1.414/1]' : 'aspect-[1/1.414]';

  // Proportional miniature styles mapping for custom padding boundaries
  let paddingStyle: CSSProperties = {};
  if (marginType === 'Small') {
    paddingStyle = { padding: '8px' };
  } else if (marginType === 'Medium') {
    paddingStyle = { padding: '16px' };
  } else if (marginType === 'Large') {
    paddingStyle = { padding: '24px' };
  } else if (marginType === 'Custom' && customMargin) {
    paddingStyle = {
      paddingTop: `${Math.max(2, Math.min(30, customMargin.top / 4))}px`,
      paddingBottom: `${Math.max(2, Math.min(30, customMargin.bottom / 4))}px`,
      paddingLeft: `${Math.max(2, Math.min(30, customMargin.left / 4))}px`,
      paddingRight: `${Math.max(2, Math.min(30, customMargin.right / 4))}px`,
    };
  } else {
    paddingStyle = { padding: '0px' };
  }

  // Adjust display object styling to mirror selected fit option
  let imgClass = 'w-full h-full';
  if (scaling === 'Fit') {
    imgClass = 'w-full h-full object-contain';
  } else if (scaling === 'Fill') {
    imgClass = 'w-full h-full object-cover';
  } else if (scaling === 'Stretch') {
    imgClass = 'w-full h-full';
  } else if (scaling === 'Original') {
    imgClass = 'w-full h-full object-contain max-w-full max-h-full m-auto';
  }

  // Visual text overlay watermark settings math
  let watermarkStyle: CSSProperties = {};
  if (watermark && watermark.enabled && watermark.text) {
    watermarkStyle = {
      transform: `translate(-50%, -50%) rotate(${watermark.rotation}deg)`,
      color: watermark.color,
      opacity: watermark.opacity,
      fontSize: `${Math.max(10, Math.min(18, watermark.fontSize / 1.5))}px`,
    };
  }

  // Burst confetti upon mount
  useEffect(() => {
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const handleDownload = () => {
    if (!lastGeneratedPdfUrl) return;
    const a = document.createElement('a');
    a.href = lastGeneratedPdfUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenPdf = () => {
    if (!lastGeneratedPdfUrl) return;
    window.open(lastGeneratedPdfUrl, '_blank');
  };

  const handleCreateAnother = () => {
    clearImages();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto select-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-905/75 dark:bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Main Success Container */}
      <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] shadow-2xl rounded-3xl max-w-2xl w-full relative z-10 overflow-hidden flex flex-col md:flex-row animate-scale-up">
        
        {/* Left Side: Real PDF Preview simulated high fidelity design view to avoid iframe browser blocks */}
        <div className="w-full md:w-1/2 bg-slate-50 dark:bg-[#121214] p-6 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-205 dark:border-[#27272a] relative min-h-[280px] md:min-h-0">
          <div className="text-[10px] font-mono font-bold text-slate-450 dark:text-[#71717a] uppercase tracking-widest text-center mb-3 flex items-center justify-center gap-1.5 selection:bg-transparent">
            <Sparkles className="w-3 h-3 text-[#3b82f6] animate-pulse" />
            <span>Document Preview</span>
          </div>
          
          {currentImage ? (
            <div className="flex-1 flex flex-col justify-center items-center py-2 relative">
              {/* Outer Page Card representation */}
              <div 
                className={`w-full max-w-[210px] ${pageAspectClass} bg-white rounded-lg shadow-lg border border-slate-200 dark:border-[#27272a] overflow-hidden relative transition-all duration-300 flex items-center justify-center`}
                style={paddingStyle}
              >
                {/* Visual Image page */}
                <img 
                  src={currentImage.previewUrl} 
                  alt={`Page ${currentPage + 1}`}
                  className={imgClass}
                  referrerPolicy="no-referrer"
                />

                {/* Simulated Watermark Layer */}
                {watermark && watermark.enabled && watermark.text && (
                  <div 
                    style={watermarkStyle}
                    className="absolute top-1/2 left-1/2 select-none pointer-events-none font-sans font-extrabold whitespace-nowrap z-10 text-center uppercase tracking-wide"
                  >
                    {watermark.text}
                  </div>
                )}
              </div>

              {/* Navigation overlay indicators */}
              {images.length > 1 && (
                <div className="flex items-center gap-4 mt-4 select-none">
                  <button
                    onClick={goToPrevPage}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-white dark:bg-[#18181b] hover:bg-slate-100 dark:hover:bg-[#27272a] text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#fafafa] border border-slate-200 dark:border-[#27272a] shadow-sm transition-all focus:outline-none cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-[#a1a1aa]">
                    Page {currentPage + 1} of {images.length}
                  </span>
                  <button
                    onClick={goToNextPage}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-white dark:bg-[#18181b] hover:bg-slate-100 dark:hover:bg-[#27272a] text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#fafafa] border border-slate-200 dark:border-[#27272a] shadow-sm transition-all focus:outline-none cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-250 dark:border-[#27272a] rounded-xl">
              <FileText className="w-8 h-8 text-slate-300 dark:text-slate-705 animate-bounce" />
              <span className="text-xs text-slate-450 mt-2">Loading preview...</span>
            </div>
          )}
        </div>

        {/* Right Side: Dialog Details & Actions */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-white dark:bg-[#09090b]">
          <div className="flex flex-col items-center md:items-start select-none">
            {/* Checked Sticker badge */}
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-650 dark:text-[#10b981] rounded-2xl flex items-center justify-center shadow-inner mb-4 animate-bounce">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-800 dark:text-[#fafafa] text-center md:text-left leading-tight">
              PDF Generated Successfully!
            </h3>
            
            <p className="text-xs text-slate-505 dark:text-[#a1a1aa] mt-2 text-center md:text-left">
              Your source images were formatted and compiled.
            </p>

            {/* Document Attributes List */}
            <div className="w-full mt-5 space-y-2 bg-slate-50 dark:bg-[#18181b]/50 border border-slate-150 dark:border-[#27272a] rounded-2xl p-4 select-none">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-405 dark:text-[#71717a] font-medium font-sans">Filename</span>
                <span className="text-slate-800 dark:text-[#fafafa] font-semibold text-[11px] truncate max-w-[150px]" title={filename}>
                  {filename}
                </span>
              </div>
              <div className="h-[1px] bg-slate-150 dark:bg-[#27272a]" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-405 dark:text-[#71717a] font-medium">Page Count</span>
                <span className="text-slate-800 dark:text-[#fafafa] font-bold font-mono text-[11px]">
                  {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                </span>
              </div>
              <div className="h-[1px] bg-slate-150 dark:bg-[#27272a]" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-405 dark:text-[#71717a] font-medium">Output Size</span>
                <span className="text-slate-800 dark:text-[#fafafa] font-bold font-mono text-[11px]">
                  {formatBytes(size)}
                </span>
              </div>
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div className="mt-7 space-y-2 select-none w-full">
            <button
              onClick={handleDownload}
              className="w-full py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-xs md:text-sm rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] focus:outline-none"
            >
              <Download className="w-4 h-4" />
              <span>Save / Download PDF</span>
            </button>

            <button
              onClick={handleOpenPdf}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-150 dark:bg-[#18181b] dark:hover:bg-[#27272a] text-slate-750 dark:text-[#fafafa] border border-slate-200/50 dark:border-[#27272a] font-bold text-xs md:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer focus:outline-none"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in New Browser Tab</span>
            </button>

            <div className="pt-2 text-center">
              <button
                onClick={handleCreateAnother}
                className="py-1.5 text-xs text-[#3b82f6] dark:text-[#3b82f6] font-bold hover:underline cursor-pointer"
              >
                Create Another PDF File
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
