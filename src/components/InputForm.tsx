import React, { useState } from 'react';
import { Link2, Sparkles, HelpCircle, FileText, LayoutGrid, CheckCircle2, AlertCircle } from 'lucide-react';
import { extractSheetInfo, DEMO_SHEET_URL } from '../utils';

interface InputFormProps {
  sheetUrl: string;
  setSheetUrl: (url: string) => void;
  sampleSize: number;
  setSampleSize: (size: number) => void;
  extractionMode: 'rows' | 'cells';
  setExtractionMode: (mode: 'rows' | 'cells') => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  totalRecordsFetched: number | null;
}

export default function InputForm({
  sheetUrl,
  setSheetUrl,
  sampleSize,
  setSampleSize,
  extractionMode,
  setExtractionMode,
  onSubmit,
  loading,
  totalRecordsFetched,
}: InputFormProps) {
  const [showHelp, setShowHelp] = useState(false);
  const sheetInfo = extractSheetInfo(sheetUrl);
  const isValidUrl = sheetInfo !== null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5 md:p-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
          Cấu hình trích xuất mẫu
        </h2>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Hướng dẫn</span>
        </button>
      </div>

      {showHelp && (
        <div className="mb-5 p-4 bg-indigo-50 border border-indigo-100/70 rounded-xl text-xs text-indigo-700 space-y-2 animate-fadeIn">
          <p className="font-bold text-indigo-800">Các bước chuẩn bị Google Sheets:</p>
          <ol className="list-decimal pl-4 space-y-1 font-medium">
            <li>Mở bảng tính Google Sheets của bạn.</li>
            <li>Nhấn nút <strong>Chia sẻ (Share)</strong> ở góc trên bên phải.</li>
            <li>Chuyển quyền truy cập chung thành <strong>"Bất kỳ ai có liên kết đều có thể xem" (Anyone with the link can view)</strong>.</li>
            <li>Sao chép đường liên kết dán vào ô bên dưới.</li>
          </ol>
          <p className="text-indigo-500/90 text-[11px]">Hệ thống sẽ tự động chuyển đổi link sang dạng CSV để đọc trực tiếp mà không cần cài đặt API phức tạp.</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Google Sheets URL input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
            <span>Đường dẫn Google Sheets</span>
            <button
              type="button"
              onClick={() => setSheetUrl(DEMO_SHEET_URL)}
              className="text-xs text-indigo-600 font-bold hover:text-indigo-700 transition-colors cursor-pointer hover:underline normal-case"
            >
              Dùng thử link mẫu
            </button>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Link2 className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className={`w-full pl-10 pr-10 py-3 rounded-xl border font-sans text-sm outline-none transition-all duration-200 bg-white placeholder:text-slate-400 ${
                sheetUrl
                  ? isValidUrl
                    ? 'border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 bg-white'
                    : 'border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/15 bg-white'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15'
              }`}
            />
            {sheetUrl && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {isValidUrl ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            )}
          </div>
          {sheetUrl && !isValidUrl && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span>Link không đúng định dạng. Mẫu chuẩn: https://docs.google.com/spreadsheets/d/...</span>
            </p>
          )}
        </div>

        {/* Dynamic options row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sample input: size */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
              <span>Số lượng kết quả</span>
              {totalRecordsFetched !== null && (
                <span className="text-xs text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded-full font-bold">
                  Khớp: {totalRecordsFetched} mục
                </span>
              )}
            </label>
            <input
              type="number"
              min="1"
              max="100000"
              value={sampleSize}
              onChange={(e) => setSampleSize(Math.max(1, parseInt(e.target.value) || 20))}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all font-mono text-sm bg-white"
            />
          </div>

          {/* Mode toggle */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cách lấy dữ liệu</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
              <button
                type="button"
                onClick={() => setExtractionMode('rows')}
                className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  extractionMode === 'rows'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Theo dòng</span>
              </button>
              <button
                type="button"
                onClick={() => setExtractionMode('cells')}
                className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  extractionMode === 'cells'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Theo ô</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit action button */}
        <button
          type="submit"
          disabled={loading || !sheetUrl || !isValidUrl}
          className={`w-full py-4 rounded-xl text-sm font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 select-none shadow-lg cursor-pointer ${
            loading || !sheetUrl || !isValidUrl
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-100'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Đang lấy dữ liệu...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4.5 h-4.5 text-indigo-200" />
              <span>Tạo Danh Sách Ngẫu Nhiên</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
