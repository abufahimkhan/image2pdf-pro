import { useState, useRef, useEffect } from 'react';
import { usePDFStore } from './store';
import { generatePDF } from './utils/pdfGenerator';
import TitleBar from './components/TitleBar';
import ImageDropzone from './components/ImageDropzone';
import ImageGrid from './components/ImageGrid';
import SidebarOptions from './components/SidebarOptions';
import SuccessDialog from './components/SuccessDialog';
import RecentFiles from './components/RecentFiles';
import AboutDialog from './components/AboutDialog';
import ConversionOverlay from './components/ConversionOverlay';
import { Sparkles, LayoutGrid, Sliders, Layers } from 'lucide-react';

export default function App() {
  const {
    images,
    settings,
    progress,
    setProgress,
    resetProgress,
    lastGeneratedPdfUrl,
    setLastGeneratedPdfUrl,
    addRecentConversion
  } = usePDFStore();

  const [showSuccess, setShowSuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // Track metadata for the generated file
  const [generatedMeta, setGeneratedMeta] = useState({
    filename: '',
    size: 0,
    pageCount: 0,
  });

  // Safe ref to track user cancel signals
  const isCancelledRef = useRef(false);

  // Close overlays on Escape keypress
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSuccess(false);
        setShowHistory(false);
        setShowAbout(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  const handleCancelConversion = () => {
    isCancelledRef.current = true;
    setProgress({ status: 'cancelled', message: 'Conversion cancelled by user.' });
    setTimeout(() => {
      resetProgress();
    }, 1200);
  };

  const handleConvert = async () => {
    if (images.length === 0) return;

    isCancelledRef.current = false;
    setProgress({
      status: 'preparing',
      currentStep: 0,
      totalSteps: images.length,
      message: 'Bootstrapping compilation buffers...',
      percentage: 5,
    });

    try {
      const bytes = await generatePDF({
        images,
        settings,
        onProgress: (phase, step, total, msg) => {
          let pct = 10;
          if (phase === 'preparing') pct = 15;
          else if (phase === 'compressing') {
            pct = 15 + Math.round((step / total) * 50);
          } else if (phase === 'compiling') {
            pct = 65 + Math.round((step / total) * 25);
          } else if (phase === 'saving') {
            pct = 95;
          }

          setProgress({
            status: phase,
            currentStep: step,
            totalSteps: total,
            message: msg,
            percentage: pct,
          });
        },
        getIsCancelled: () => isCancelledRef.current,
      });

      if (bytes && !isCancelledRef.current) {
        // Build Local Session Blob URL
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        setLastGeneratedPdfUrl(url);

        const bytesLength = bytes.length;
        const count = images.length;

        // Human-friendly unique timestamped filename
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
        const filename = `Compiled_Photos_${dateStr}_${timeStr}.pdf`;

        const meta = {
          filename,
          size: bytesLength,
          pageCount: count,
        };

        setGeneratedMeta(meta);

        // Add index log to Recent persistence
        addRecentConversion({
          filename,
          size: bytesLength,
          pageCount: count,
          downloadUrl: url,
        });

        setProgress({
          status: 'complete',
          currentStep: count,
          totalSteps: count,
          message: 'Document saved successfully.',
          percentage: 100,
        });

        // Trigger Success view dialogue
        setShowSuccess(true);
      } else {
        resetProgress();
      }
    } catch (err: any) {
      console.error(err);
      setProgress({
        status: 'error',
        message: err.message || 'An unexpected compilation error arose.',
        percentage: 0,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-800 dark:text-[#fafafa] flex flex-col font-sans transition-colors duration-300">

      {/* 1. Title bar */}
      <TitleBar
        onShowAbout={() => setShowAbout(true)}
        onShowHistory={() => setShowHistory(true)}
      />

      {/* 2. Primary Workspace Body */}
      <main className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 max-w-7xl w-full mx-auto overflow-visible lg:overflow-hidden">
        {images.length === 0 ? (
          /* Landing Stage - Zero Uploaded files */
          <div className="flex-1 flex flex-col justify-center max-w-3xl w-full mx-auto py-6 sm:py-10 animate-fade-in select-none">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-[#18181b] text-indigo-650 dark:text-[#a1a1aa] border border-indigo-100/50 dark:border-[#27272a] text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#3b82f6]" />
                <span>Professional desktop PDF converter</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#fafafa] tracking-tight sm:text-4xl">
                Convert Images to Polished PDFs
              </h1>
              <p className="text-sm text-slate-500 dark:text-[#a1a1aa] mt-2.5 max-w-lg mx-auto leading-relaxed">
                Reorder pages, tune margins and compression, add optional watermarks, and export clean PDFs with a fast local workflow.
              </p>
            </div>

            {/* Massive Dropzone center stage */}
            <ImageDropzone />

            {/* Specs Grid Feature showcase */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-white dark:bg-[#18181b]/40 rounded-xl border border-slate-200/80 dark:border-[#27272a] hover:dark:border-[#3f3f46] transition-all shadow-sm flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#3b82f6]/10 text-[#3b82f6] shrink-0">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-850 dark:text-[#fafafa]">Batch Assembly</h4>
                  <p className="text-[10px] text-slate-450 dark:text-[#a1a1aa] mt-1">
                    Sort images with drag and drop, keyboard shortcuts, and instant preview updates.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-[#18181b]/40 rounded-xl border border-slate-200/80 dark:border-[#27272a] hover:dark:border-[#3f3f46] transition-all shadow-sm flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#3b82f6]/10 text-[#3b82f6] shrink-0">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-850 dark:text-[#fafafa]">Layout Controls</h4>
                  <p className="text-[10px] text-slate-450 dark:text-[#a1a1aa] mt-1">
                    Choose page sizes, orientation, margins, scaling, and compression in one place.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-[#18181b]/40 rounded-xl border border-slate-200/80 dark:border-[#27272a] hover:dark:border-[#3f3f46] transition-all shadow-sm flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#3b82f6]/10 text-[#3b82f6] shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-850 dark:text-[#fafafa]">Privacy First</h4>
                  <p className="text-[10px] text-slate-450 dark:text-[#a1a1aa] mt-1">
                    Process files locally with optional watermarking and no server upload flow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Active Stage - Drag Workspace layout dashboard with grid list & Settings control bar */
          <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 overflow-visible lg:overflow-hidden min-h-0 animate-fade-in select-none">

            {/* Left/Center primary Grid Assembly area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Secondary Helper drag and drop area for compounding items */}
              <div className="mb-4">
                <ImageDropzone />
              </div>

              <div className="flex-1 min-h-0">
                <ImageGrid />
              </div>
            </div>

            {/* Right sidebar configurations options panel */}
            <SidebarOptions onConvert={handleConvert} />
          </div>
        )}
      </main>

      {/* 3. Conversion Overlay loader drawer */}
      <ConversionOverlay onCancel={handleCancelConversion} />

      {/* 4. Success Overlay */}
      {showSuccess && (
        <SuccessDialog
          onClose={() => setShowSuccess(false)}
          filename={generatedMeta.filename}
          size={generatedMeta.size}
          pageCount={generatedMeta.pageCount}
        />
      )}

      {/* 5. Recent Conversions drawer */}
      {showHistory && (
        <RecentFiles onClose={() => setShowHistory(false)} />
      )}

      {/* 6. Help/Shortcuts About dialog */}
      {showAbout && (
        <AboutDialog onClose={() => setShowAbout(false)} />
      )}
    </div>
  );
}
