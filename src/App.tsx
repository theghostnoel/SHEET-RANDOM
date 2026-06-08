import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, CheckCircle2, ChevronRight, HelpCircle, FileSpreadsheet } from 'lucide-react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import PreviewTable from './components/PreviewTable';
import ResultArea from './components/ResultArea';
import { extractSheetInfo, buildExportUrl, parseCSVToRowsAndCells, shuffle } from './utils';

export default function App() {
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [sampleSize, setSampleSize] = useState<number>(20);
  const [extractionMode, setExtractionMode] = useState<'rows' | 'cells'>('cells');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Storage for fetched state
  const [allFetchedRows, setAllFetchedRows] = useState<string[]>([]);
  const [allFetchedCells, setAllFetchedCells] = useState<string[]>([]);
  const [currentLoadedSheetId, setCurrentLoadedSheetId] = useState<string | null>(null);
  const [randomizedResult, setRandomizedResult] = useState<string[]>([]);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Determine current active item candidates based on selection mode
  const currentItemCandidates = extractionMode === 'rows' ? allFetchedRows : allFetchedCells;

  /**
   * Reset all program states to initial values
   */
  const handleClear = () => {
    setSheetUrl('');
    setSampleSize(20);
    setExtractionMode('cells');
    setError(null);
    setAllFetchedRows([]);
    setAllFetchedCells([]);
    setRandomizedResult([]);
    setCurrentLoadedSheetId(null);
    setWarningMessage(null);
  };

  /**
   * Perform random sampling based on existing candidates
   */
  const performRandomSample = (candidatesList: string[], sizeNeeded: number) => {
    if (candidatesList.length === 0) return;
    
    setWarningMessage(null);
    const shuffledList = shuffle(candidatesList);
    
    if (sizeNeeded > candidatesList.length) {
      // If N > total candidate items, shuffle the list and alert the user
      setRandomizedResult(shuffledList);
      setWarningMessage(
        `Số lượng yêu cầu (${sizeNeeded}) lớn hơn tổng số dữ liệu hiện có (${candidatesList.length}). Hệ thống đã đảo ngẫu nhiên toàn bộ danh sách.`
      );
    } else {
      // Pick the first N items from shuffled array
      setRandomizedResult(shuffledList.slice(0, sizeNeeded));
    }
  };

  /**
   * Submit fetch request to load public list and randomize
   */
  const handleGenerateRandom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetUrl.trim()) {
      setError('Vui lòng cung cấp link liên kết Google Sheets hợp lệ.');
      return;
    }

    const info = extractSheetInfo(sheetUrl);
    if (!info) {
      setError('Đường link Google Sheets không đúng định dạng. Vui lòng kiểm tra lại!');
      return;
    }

    setLoading(true);
    setError(null);
    setWarningMessage(null);

    try {
      const exportUrl = buildExportUrl(info.sheetId, info.gid);
      
      // Fetch public CSV content with a timeout limit
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9500);
      
      const response = await fetch(exportUrl, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Không thể tải file do cấu hình bảo mật hoặc link sai.');
      }

      const csvText = await response.text();
      
      // Parse the CSV to structure the cells and rows
      const { rows, cells } = parseCSVToRowsAndCells(csvText);
      
      // Ensure we parsed valid fields
      if (rows.length === 0 && cells.length === 0) {
        setError('Google Sheets của bạn dường như trống hoặc trang tính bị ẩn. Vui lòng điền nội dung vào ô rồi thử lại nhé!');
        setLoading(false);
        return;
      }

      // Store fetched items
      setAllFetchedRows(rows);
      setAllFetchedCells(cells);
      setCurrentLoadedSheetId(info.sheetId);

      const targetCandidates = extractionMode === 'rows' ? rows : cells;
      
      // Apply randomize selection
      performRandomSample(targetCandidates, sampleSize);

    } catch (err: any) {
      console.error('Fetch error:', err);
      // Specific error requested by user
      setError(
        "Không thể lấy dữ liệu. Vui lòng đảm bảo Google Sheet của bạn đã được bật chế độ 'Bất kỳ ai có liên kết đều có thể xem'."
      );
      // Clean previous records in case of load failure to maintain state security
      setAllFetchedRows([]);
      setAllFetchedCells([]);
      setRandomizedResult([]);
      setCurrentLoadedSheetId(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Action handler when user toggles row/cell mode in active load, or clicks "re-roll"
   */
  const handleReRoll = () => {
    if (currentItemCandidates.length > 0) {
      performRandomSample(currentItemCandidates, sampleSize);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col selection:bg-indigo-100 selection:text-indigo-900 pb-16">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full space-y-6">
        <div id="calculator-card-view" className="grid grid-cols-1 gap-6">
          
          {/* Main Form Input section */}
          <InputForm
            sheetUrl={sheetUrl}
            setSheetUrl={setSheetUrl}
            sampleSize={sampleSize}
            setSampleSize={setSampleSize}
            extractionMode={extractionMode}
            setExtractionMode={(mode) => {
              setExtractionMode(mode);
              // If we already have items loaded, recalculate random on mode swap
              const candidates = mode === 'rows' ? allFetchedRows : allFetchedCells;
              if (candidates.length > 0) {
                performRandomSample(candidates, sampleSize);
              }
            }}
            onSubmit={handleGenerateRandom}
            loading={loading}
            totalRecordsFetched={currentItemCandidates.length > 0 ? currentItemCandidates.length : null}
          />

          {/* Error message card */}
          {error && (
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 bg-red-50 border border-red-150 rounded-2xl flex items-start gap-3.5 text-sm md:text-base text-red-700 shadow-xs"
            >
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Lỗi phần dữ liệu</p>
                <p className="text-xs md:text-sm text-red-600/95 leading-relaxed font-semibold">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Warning messages for size caps */}
          {warningMessage && (
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs md:text-sm text-amber-700 font-semibold shadow-xs"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{warningMessage}</span>
            </motion.div>
          )}

          {/* Loaded sheet layout visual previews */}
          {currentItemCandidates.length > 0 && !error && (
            <PreviewTable
              items={currentItemCandidates}
              mode={extractionMode}
              sourceId={currentLoadedSheetId}
            />
          )}

          {/* Randomized output viewer layout with copiability */}
          {randomizedResult.length > 0 && !error && (
            <ResultArea
              randomizedItems={randomizedResult}
              onReRoll={handleReRoll}
              loading={loading}
            />
          )}

          {/* Reset / Clean up action floating element */}
          {(sheetUrl || randomizedResult.length > 0 || error) && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-5 py-3 rounded-xl border border-slate-200 bg-white shadow-sm text-xs font-bold text-slate-500 hover:text-slate-800 transition-all flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 active:scale-[0.98]"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Xóa làm mới giao diện</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modern minimal footer */}
      <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-100 mt-12">
        <p className="flex items-center justify-center gap-1 font-medium">
          <span>Thiết kế tinh tế • Toàn bộ tác vụ xử lý an toàn ở phía Client</span>
        </p>
      </footer>
    </div>
  );
}
