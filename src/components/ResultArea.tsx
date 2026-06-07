import React, { useState, useEffect, MouseEvent } from 'react';
import { Copy, Check, Clipboard, ArrowDownToLine, RefreshCw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ResultAreaProps {
  randomizedItems: string[];
  onReRoll: () => void;
  loading: boolean;
}

interface IndividualResultCardProps {
  item: string;
  index: number;
  key?: string | number;
}

function IndividualResultCard({ item, index }: IndividualResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopySingle = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item);
      setCopied(true);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = item;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
      } catch (e) {
        console.error('Không thể sao chép ô này: ', e);
      }
      document.body.removeChild(textarea);
    }
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <motion.div
      layout
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.96, opacity: 0 }}
      transition={{ duration: 0.18, delay: index * 0.015 }}
      className="p-3.5 bg-white hover:bg-slate-50/80 rounded-xl border border-slate-150 flex items-start gap-3.5 shadow-2xs hover:shadow-xs transition-all relative group"
    >
      <div className="w-5.5 h-5.5 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 text-[10px] font-mono font-bold text-indigo-700 mt-0.5">
        {index + 1}
      </div>
      <p className="text-xs text-slate-700 font-medium leading-relaxed break-words flex-1 pr-6">
        {item}
      </p>

      {/* Mini copy button embedded in the item */}
      <button
        type="button"
        onClick={handleCopySingle}
        className={`absolute right-2 top-2.5 p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
          copied
            ? 'bg-emerald-50 border-emerald-300 text-emerald-600 shadow-sm shadow-emerald-50 scale-105'
            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300'
        }`}
        title="Sao chép nội dung ô này"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 animate-scaleIn" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </motion.div>
  );
}

export default function ResultArea({ randomizedItems, onReRoll, loading }: ResultAreaProps) {
  const [copied, setCopied] = useState(false);

  // Generate numbered text representation
  const formattedText = randomizedItems
    .map((item, index) => `${index + 1}. ${item}`)
    .join('\n\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
    } catch (err) {
      // Fallback for older browsers or restricted environments
      const textarea = document.createElement('textarea');
      textarea.value = formattedText;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
      } catch (e) {
        console.error('Không thể tự động sao chép: ', e);
      }
      document.body.removeChild(textarea);
    }
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (randomizedItems.length === 0) return null;

  // Handler to export text file
  const handleDownload = () => {
    const blob = new Blob([formattedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Google-Sheets-Random-Sample-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5 md:p-6 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
            <span>Kết quả bốc mẫu ({randomizedItems.length})</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">Danh sách đã được xáo trộn ngẫu nhiên không trùng lặp</p>
        </div>

        <div className="flex gap-2 self-end sm:self-auto">
          {/* Re-roll button */}
          <button
            type="button"
            onClick={onReRoll}
            disabled={loading}
            className="px-3.5 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-250 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Bốc ngẫu nhiên lại từ tập dữ liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Bốc lại</span>
          </button>

          {/* Download Text button */}
          <button
            type="button"
            onClick={handleDownload}
            className="px-3.5 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-250 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Tải văn bản đính kèm (.txt)"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-slate-500" />
            <span>Tải về .TXT</span>
          </button>
        </div>
      </div>

      {/* Visual bento box/list of items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-2.5 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
        <AnimatePresence mode="popLayout">
          {randomizedItems.map((item, index) => (
            <IndividualResultCard key={`${item}-${index}`} item={item} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {/* Structured Textarea to Copy */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Clipboard className="w-3.5 h-3.5 text-slate-400" />
          <span>Văn bản sao chép hoàn chỉnh</span>
        </label>
        
        <div className="relative group">
          <textarea
            readOnly
            value={formattedText}
            className="w-full h-44 p-4 rounded-2xl border border-slate-250 outline-none bg-slate-50 text-xs font-mono leading-relaxed text-slate-700 select-all focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all scrollbar-hide"
            placeholder="Kết quả ngẫu nhiên sẽ xuất hiện tại đây..."
          />
          <div className="absolute right-3.5 bottom-3.5">
            <button
              type="button"
              onClick={handleCopy}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 shadow-md cursor-pointer ${
                copied
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-50'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 hover:scale-[1.02]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-100" />
                  <span>Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Sao chép vào bộ nhớ tạm</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
