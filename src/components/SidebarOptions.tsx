import { ChangeEvent } from 'react';
import { usePDFStore } from '../store';
import { 
  FileText, Layout, Expand, Activity, Shield, Percent, 
  Settings2, Palette, Sliders, Type, HelpCircle, Sparkles
} from 'lucide-react';
import { PageSize, Orientation, MarginType, ImageScaling, CompressionType } from '../types';

export default function SidebarOptions({ onConvert }: { onConvert: () => void }) {
  const { images, settings, updateSettings, updateCustomMargin } = usePDFStore();
  const { pageSize, orientation, marginType, customMargin, scaling, compression, watermark } = settings;

  const handlePageSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ pageSize: e.target.value as PageSize });
  };

  const handleOrientationChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ orientation: e.target.value as Orientation });
  };

  const handleMarginTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ marginType: e.target.value as MarginType });
  };

  const handleScalingChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ scaling: e.target.value as ImageScaling });
  };

  const handleCompressionChange = (type: CompressionType) => {
    updateSettings({ compression: type });
  };

  const toggleWatermark = (e: ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      watermark: { ...watermark, enabled: e.target.checked },
    });
  };

  const updateWatermarkText = (e: ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      watermark: { ...watermark, text: e.target.value },
    });
  };

  const updateWatermarkColor = (e: ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      watermark: { ...watermark, color: e.target.value },
    });
  };

  const updateWatermarkOpacity = (e: ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      watermark: { ...watermark, opacity: parseFloat(e.target.value) },
    });
  };

  const updateWatermarkFontSize = (e: ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      watermark: { ...watermark, fontSize: parseInt(e.target.value) || 20 },
    });
  };

  const updateWatermarkRotation = (e: ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      watermark: { ...watermark, rotation: parseInt(e.target.value) || 0 },
    });
  };

  return (
    <div className="w-full lg:w-[320px] bg-white dark:bg-[#09090b] border border-slate-203/80 dark:border-[#27272a] rounded-2xl p-5 shadow-sm flex flex-col justify-between h-auto lg:h-full select-none">
      <div className="space-y-6 overflow-y-auto pr-1 flex-1">
        {/* Section Header */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#27272a] pb-3">
          <Settings2 className="w-4 h-4 text-[#3b82f6]" />
          <h2 className="text-sm font-semibold text-slate-800 dark:text-[#fafafa] uppercase tracking-wider">
            PDF Document Parameters
          </h2>
        </div>

        {/* 1. Page Presets */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-600 dark:text-[#71717a] uppercase tracking-wider block">Page Size</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="w-full text-xs bg-slate-50 dark:bg-[#18181b] hover:bg-slate-100/50 dark:hover:bg-[#27272a] text-slate-800 dark:text-[#fafafa] border border-slate-200 dark:border-[#27272a] rounded-lg p-2.5 outline-none transition-all focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
              >
                <option value="A4">A4 Presets</option>
                <option value="A3">A3 Size</option>
                <option value="A5">A5 Booklet</option>
                <option value="Letter">Letter US</option>
                <option value="Legal">Legal US</option>
                <option value="Original">Original Size</option>
              </select>
            </div>
            <div>
              <select
                value={orientation}
                disabled={pageSize === 'Original'}
                onChange={handleOrientationChange}
                className="w-full text-xs bg-slate-50 dark:bg-[#18181b] hover:bg-slate-100/50 dark:hover:bg-[#27272a] text-slate-800 dark:text-[#fafafa] border border-slate-200 dark:border-[#27272a] rounded-lg p-2.5 outline-none transition-all focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] disabled:opacity-50"
                title={pageSize === 'Original' ? 'Disabled for Original source sizes' : ''}
              >
                <option value="Auto">Auto Rotate</option>
                <option value="Portrait">Portrait</option>
                <option value="Landscape">Landscape</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Margin Options */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-600 dark:text-[#71717a] uppercase tracking-wider block">Margins Layout</label>
          <select
            value={marginType}
            onChange={handleMarginTypeChange}
            className="w-full text-xs bg-slate-50 dark:bg-[#18181b] text-slate-800 dark:text-[#fafafa] border border-slate-205 dark:border-[#27272a] rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
          >
            <option value="None">None (Full Bleed)</option>
            <option value="Small">Slim (12pt)</option>
            <option value="Medium">Standard (24pt)</option>
            <option value="Large">Wide (36pt)</option>
            <option value="Custom">Custom margins...</option>
          </select>

          {/* Conditional Custom Margin Box */}
          {marginType === 'Custom' && (
            <div className="grid grid-cols-4 gap-1.5 p-2.5 rounded-lg bg-slate-105/50 dark:bg-[#18181b]/55 border border-slate-200 dark:border-[#27272a] animate-slide-down">
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 dark:text-[#71717a] uppercase block font-bold text-center">Top</span>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={customMargin.top}
                  onChange={(e) => updateCustomMargin({ top: parseInt(e.target.value) || 0 })}
                  className="w-full text-center text-xs font-mono bg-white dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] p-1.5 rounded outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 dark:text-[#71717a] uppercase block font-bold text-center">Bottom</span>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={customMargin.bottom}
                  onChange={(e) => updateCustomMargin({ bottom: parseInt(e.target.value) || 0 })}
                  className="w-full text-center text-xs font-mono bg-white dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] p-1.5 rounded outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 dark:text-[#71717a] uppercase block font-bold text-center">Left</span>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={customMargin.left}
                  onChange={(e) => updateCustomMargin({ left: parseInt(e.target.value) || 0 })}
                  className="w-full text-center text-xs font-mono bg-white dark:bg-[#09090b] border border-[#27272a] p-1.5 rounded outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 dark:text-[#71717a] uppercase block font-bold text-center">Right</span>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={customMargin.right}
                  onChange={(e) => updateCustomMargin({ right: parseInt(e.target.value) || 0 })}
                  className="w-full text-center text-xs font-mono bg-white dark:bg-[#09090b] border border-[#27272a] p-1.5 rounded outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. Image Scaling */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-600 dark:text-[#71717a] uppercase tracking-wider block">Image Placement</label>
          <select
            value={scaling}
            onChange={handleScalingChange}
            className="w-full text-xs bg-slate-50 dark:bg-[#18181b] text-slate-800 dark:text-[#fafafa] border border-slate-200 dark:border-[#27272a] rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
          >
            <option value="Fit">Fit Proportionally</option>
            <option value="Fill">Fill Entire Page (Crop)</option>
            <option value="Stretch">Stretch to Corners</option>
            <option value="Original">Keep Original size (Centred)</option>
          </select>
        </div>

        {/* 4. Compression Engine */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-350 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-slate-400" />
            <span>File-Size Optimization</span>
          </label>
          <div className="space-y-1.5 bg-slate-50 dark:bg-[#18181b] p-1.5 rounded-xl border border-slate-150 dark:border-[#27272a]">
            {[
              { type: 'High', label: 'Maximum Quality', desc: 'No optimization loss' },
              { type: 'Balanced', label: 'Balanced Fit', desc: 'Ideal quality & storage ratio' },
              { type: 'Small', label: 'Max Compression', desc: 'Dramatically reduced sizes' },
            ].map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => handleCompressionChange(opt.type as CompressionType)}
                className={`w-full flex flex-col items-start p-2.5 rounded-lg transition-all text-left cursor-pointer ${
                  compression === opt.type
                    ? 'bg-white dark:bg-[#27272a]/70 border border-[#3b82f6] shadow-sm text-slate-800 dark:text-[#fafafa]'
                    : 'border border-transparent text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#fafafa] hover:bg-slate-100/50 dark:hover:bg-[#27272a]/30'
                }`}
              >
                <span className="text-xs font-semibold">{opt.label}</span>
                <span className="text-[10px] text-slate-400 dark:text-[#71717a] mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Custom Watermarks */}
        <div className="space-y-3 border-t border-slate-100 dark:border-[#27272a] pt-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600 dark:text-[#71717a] uppercase tracking-wider block">Apply Watermark</label>
            <input
              type="checkbox"
              checked={watermark.enabled}
              onChange={toggleWatermark}
              className="w-4 h-4 text-[#3b82f6] dark:border-[#27272a] dark:bg-[#18181b] focus:ring-[#3b82f6] cursor-pointer"
            />
          </div>

          {watermark.enabled && (
            <div className="space-y-3 p-3 bg-slate-50 dark:bg-[#18181b]/50 border border-slate-150 dark:border-[#27272a] rounded-xl animate-slide-down">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-[#71717a] block mb-1">Watermark Text</span>
                <input
                  type="text"
                  value={watermark.text}
                  onChange={updateWatermarkText}
                  placeholder="Watermark Text..."
                  className="w-full text-xs bg-white dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] text-slate-800 dark:text-[#fafafa]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-[#71717a] block mb-1">Text Size</span>
                  <input
                    type="number"
                    min="8"
                    max="100"
                    value={watermark.fontSize}
                    onChange={updateWatermarkFontSize}
                    className="w-full text-xs bg-white dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] p-2 rounded-lg outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] text-slate-800 dark:text-[#fafafa]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-[#71717a] block mb-1">Color Picker</span>
                  <div className="flex items-center gap-1.5 border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#09090b] rounded-lg p-1.5">
                    <input
                      type="color"
                      value={watermark.color}
                      onChange={updateWatermarkColor}
                      className="w-7 h-7 border-0 p-0 outline-none cursor-pointer rounded-sm bg-transparent"
                    />
                    <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-[#a1a1aa]">
                      {watermark.color.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-[#71717a] mb-1">
                  <span>Transparency</span>
                  <span>{Math.round(watermark.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={watermark.opacity}
                  onChange={updateWatermarkOpacity}
                  className="w-full h-1 bg-slate-200 dark:bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-[#71717a] mb-1">
                  <span>Angle Layout Rotation</span>
                  <span>{watermark.rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  step="5"
                  value={watermark.rotation}
                  onChange={updateWatermarkRotation}
                  className="w-full h-1 bg-slate-200 dark:bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Convert Trigger CTA */}
      <div className="border-t border-slate-100 dark:border-[#27272a] pt-4 mt-4 bg-white dark:bg-[#09090b] sticky bottom-0">
        <button
          onClick={onConvert}
          disabled={images.length === 0}
          className="w-full flex items-center justify-center gap-2 select-none cursor-pointer px-4 py-3.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-350 disabled:opacity-50 disabled:pointer-events-none md:text-sm active:scale-[0.98] group"
        >
          <Sparkles className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
          <span>Generate PDF Document</span>
        </button>
        <p className="text-[10px] text-center text-slate-400 dark:text-[#52525b] mt-2.5">
          Processed securely directly in your browser.
        </p>
      </div>
    </div>
  );
}
