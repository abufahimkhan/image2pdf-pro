import { XCircle, Loader2 } from 'lucide-react';
import { usePDFStore } from '../store';

export default function ConversionOverlay({ onCancel }: { onCancel: () => void }) {
  const { progress } = usePDFStore();
  const { status, currentStep, totalSteps, message, percentage } = progress;

  if (status === 'idle' || status === 'complete' || status === 'error' || status === 'cancelled') {
    return null;
  }

  // Generate readable state labels
  const getPhaseTitle = (s: typeof status) => {
    switch (s) {
      case 'preparing':
        return 'Precompressing Stream...';
      case 'compressing':
        return 'Compressing Image Qualities...';
      case 'compiling':
        return 'Configuring High-Resolution Layouts...';
      case 'saving':
        return 'Drafting Output PDF Document...';
      default:
        return 'Analyzing details...';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Immersive Dark Overlay Backdrop */}
      <div className="absolute inset-0 bg-slate-905/75 dark:bg-black/80 backdrop-blur-md" />

      {/* Floating Panel Card */}
      <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] shadow-2xl rounded-2xl p-6 md:p-8 max-w-md w-full relative z-10 flex flex-col items-center">
        {/* Ring Spinner Loader */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-[#18181b] flex items-center justify-center" />
          <div className="absolute w-16 h-16 rounded-full border-4 border-t-[#3b82f6] border-r-[#3b82f6] border-b-transparent border-l-transparent animate-spin" />
          <Loader2 className="w-6 h-6 text-[#3b82f6] animate-pulse absolute" />
        </div>

        {/* Phase Info */}
        <h3 className="text-base font-bold text-slate-800 dark:text-[#fafafa] text-center uppercase tracking-wide">
          {getPhaseTitle(status)}
        </h3>

        {/* Progress Counters */}
        {totalSteps > 0 && (
          <div className="mt-2 text-xs font-mono font-bold text-[#3b82f6]">
            Step {currentStep + 1} of {totalSteps}
          </div>
        )}

        {/* Outer and Inner Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-[#18181b] rounded-full h-3.5 mt-5 overflow-hidden border border-slate-200/50 dark:border-[#27272a]">
          <div
            className="bg-[#3b82f6] h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Step Percentage Label */}
        <div className="mt-2 text-[10px] font-mono text-slate-400 dark:text-[#71717a] font-bold">
          {percentage}% Optimized
        </div>

        {/* Detail text */}
        <p className="text-xs text-slate-500 dark:text-[#a1a1aa] mt-4 text-center truncate w-full px-2" title={message}>
          {message}
        </p>

        {/* Cancellation Signal Ctrls */}
        <div className="mt-7 w-full border-t border-slate-100 dark:border-[#27272a] pt-4 flex justify-center">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-[#ef4444] dark:hover:bg-red-650 text-rose-650 dark:text-white font-semibold text-xs rounded-xl border border-rose-150/30 dark:border-transparent transition-all cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>Abort Conversion Process</span>
          </button>
        </div>
      </div>
    </div>
  );
}
