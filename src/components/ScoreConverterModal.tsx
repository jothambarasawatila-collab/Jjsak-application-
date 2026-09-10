import React, { useState } from 'react';
import {
  X,
  Calculator,
  ArrowRight,
  Sparkles,
  Check,
  Percent,
  Copy,
  BookOpen,
} from 'lucide-react';
import {
  calculateGrade,
  convertRawScoreToPercentage,
  POPULAR_SCORE_BASES,
} from '../data/mockData';

interface ScoreConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScore?: (percentageScore: number) => void;
  initialOutOf?: number;
}

export const ScoreConverterModal: React.FC<ScoreConverterModalProps> = ({
  isOpen,
  onClose,
  onApplyScore,
  initialOutOf = 50,
}) => {
  const [selectedBase, setSelectedBase] = useState<number | 'custom'>(initialOutOf);
  const [customBase, setCustomBase] = useState<string>('40');
  const [rawScore, setRawScore] = useState<string>('33');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentOutOf = selectedBase === 'custom' ? parseFloat(customBase) || 100 : selectedBase;
  const rawNum = parseFloat(rawScore);
  const percentage = isNaN(rawNum) ? null : convertRawScoreToPercentage(rawNum, currentOutOf);
  const gradeInfo = calculateGrade(percentage);

  const handleCopy = () => {
    if (percentage !== null) {
      navigator.clipboard.writeText(`${percentage}%`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sampleRaws = selectedBase === 30 
    ? [30, 27, 24, 21, 18, 15, 12, 9, 6, 3]
    : selectedBase === 50 
    ? [50, 45, 40, 35, 33, 29, 25, 20, 15, 10, 5]
    : selectedBase === 80 
    ? [80, 72, 64, 56, 48, 40, 32, 24, 16, 8]
    : [100, 90, 80, 75, 60, 50, 40, 30, 20, 10];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in select-none">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
        {/* Header */}
        <div className="bg-[#C51E28] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Calculator className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">Score to 100% Converter</h3>
              <p className="text-[10px] text-red-100">
                Convert x/50, x/30, x/80 or custom marks to standard percentage (%)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 text-xs overflow-y-auto">
          {/* Step 1: Pick Total Marks / Base (Denominator) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>1. Select Assessment Total (Out of / Base):</span>
              <span className="text-[10px] font-medium text-[#C51E28]">
                Denominator: /{currentOutOf}
              </span>
            </label>

            <div className="grid grid-cols-5 gap-1.5">
              {POPULAR_SCORE_BASES.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => setSelectedBase(b.value)}
                  className={`py-1.5 px-1 rounded-xl text-center font-bold text-xs transition border cursor-pointer ${
                    selectedBase === b.value
                      ? 'bg-[#C51E28] text-white border-[#C51E28] shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <span>{b.shortLabel}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => setSelectedBase('custom')}
                className={`py-1.5 px-1 rounded-xl text-center font-bold text-xs transition border cursor-pointer ${
                  selectedBase === 'custom'
                    ? 'bg-[#C51E28] text-white border-[#C51E28] shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <span>Custom</span>
              </button>
            </div>

            {selectedBase === 'custom' && (
              <div className="mt-2 flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="text-slate-600 font-semibold">Custom Total Marks: /</span>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={customBase}
                  onChange={(e) => setCustomBase(e.target.value)}
                  placeholder="e.g. 40, 60, 70"
                  className="w-24 px-2 py-1 bg-white border border-slate-300 rounded-lg font-bold text-center text-slate-900 focus:border-[#C51E28] focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">e.g. 40, 60, 70, 120</span>
              </div>
            )}
          </div>

          {/* Step 2: Enter Raw Score (X) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-[11px] font-bold text-slate-700">
              2. Enter Student's Raw Mark (X):
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  max={currentOutOf}
                  value={rawScore}
                  onChange={(e) => setRawScore(e.target.value)}
                  placeholder="e.g. 33"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 font-extrabold text-base text-slate-900 focus:border-[#C51E28] focus:ring-1 focus:ring-[#C51E28] focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 font-bold text-slate-400 text-xs">
                  / {currentOutOf}
                </span>
              </div>

              {/* Quick Quick Increment / Decrement or Presets */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setRawScore(String(Math.max(0, (parseFloat(rawScore) || 0) - 1)))}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 font-bold hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => setRawScore(String(Math.min(currentOutOf, (parseFloat(rawScore) || 0) + 1)))}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 font-bold hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Quick Chips for Current Base */}
            <div className="flex flex-wrap items-center gap-1 pt-1">
              <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick:</span>
              {sampleRaws.slice(0, 7).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRawScore(String(val))}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-red-50 hover:text-[#C51E28] hover:border-red-200 transition cursor-pointer"
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Conversion Output Result Card */}
          <div className="bg-gradient-to-br from-red-50 via-white to-amber-50/40 p-3.5 rounded-2xl border border-red-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 font-bold text-[10px] uppercase tracking-wider">
              <span>Conversion Calculation</span>
              <span className="text-[#C51E28] font-black flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                ({rawScore || 0} ÷ {currentOutOf}) × 100
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              {/* Raw Score */}
              <div className="text-center flex-1 bg-white p-2 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold block">RAW SCORE</span>
                <span className="text-lg font-black text-slate-800">
                  {rawScore || 0} <span className="text-xs font-semibold text-slate-400">/{currentOutOf}</span>
                </span>
              </div>

              <ArrowRight className="w-4 h-4 text-[#C51E28] shrink-0" />

              {/* Converted 100% Score */}
              <div className="text-center flex-1 bg-red-50 p-2 rounded-xl border border-red-200">
                <span className="text-[10px] text-red-600 font-bold block">CONVERTED (100%)</span>
                <span className="text-xl font-black text-[#C51E28]">
                  {percentage !== null ? `${percentage}%` : '-'}
                </span>
              </div>

              {/* CBC Grade & Remarks */}
              <div className="text-center flex-1 bg-white p-2 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold block">CBC GRADE</span>
                <span className="text-sm font-black text-[#C51E28] block">
                  {gradeInfo.grade}
                </span>
                <span className="text-[9px] text-slate-500 font-semibold truncate block leading-tight">
                  {gradeInfo.remarks}
                </span>
              </div>
            </div>

            <div className="text-center text-[10px] font-medium text-slate-500 pt-1">
              Performance Level: <b className="text-slate-800">{gradeInfo.level}</b>
            </div>
          </div>

          {/* Quick Formula & Conversion Reference Guide */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[10px] space-y-1 text-slate-600">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-[#C51E28]" />
              <span>Standard Conversion Formula:</span>
            </div>
            <p className="font-mono bg-white p-1 rounded border border-slate-200 text-slate-800 font-semibold">
              Percentage Score = (Raw Score / Total Marks) × 100
            </p>
            <div className="grid grid-cols-2 gap-1 pt-1 text-[9px]">
              <div>• <b>25/30</b> = (25÷30)×100 = <span className="font-bold text-[#C51E28]">83% (EE2)</span></div>
              <div>• <b>33/50</b> = (33÷50)×100 = <span className="font-bold text-[#C51E28]">66% (ME1)</span></div>
              <div>• <b>10/50</b> = (10÷50)×100 = <span className="font-bold text-[#C51E28]">20% (BE1)</span></div>
              <div>• <b>64/80</b> = (64÷80)×100 = <span className="font-bold text-[#C51E28]">80% (EE2)</span></div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied {percentage}%!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Percentage</span>
              </>
            )}
          </button>

          {onApplyScore && (
            <button
              type="button"
              onClick={() => {
                if (percentage !== null) {
                  onApplyScore(percentage);
                  onClose();
                }
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#C51E28] hover:bg-[#B31821] text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Apply Score ({percentage}%)</span>
            </button>
          )}

          {!onApplyScore && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#C51E28] hover:bg-[#B31821] text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
