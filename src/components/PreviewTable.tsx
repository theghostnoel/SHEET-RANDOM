import { Database, Eye } from 'lucide-react';

interface PreviewTableProps {
  items: string[];
  mode: 'rows' | 'cells';
  sourceId: string | null;
}

export default function PreviewTable({ items, mode, sourceId }: PreviewTableProps) {
  if (items.length === 0) return null;

  // Let's preview up to 6 items securely
  const previewItems = items.slice(0, 6);
  const remainingCount = items.length - previewItems.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm animate-fadeIn">
      <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-400" />
          <span>Dữ liệu nguồn đã tải</span>
        </h3>
        <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-tighter">
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          {items.length} {mode === 'rows' ? 'dòng' : 'ô'}
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-3">
        Mẫu xem trước của Google Sheet{' '}
        <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60 text-slate-600">
          ID: {sourceId ? `${sourceId.substring(0, 12)}...` : ''}
        </span>
        :
      </p>

      <div className="overflow-hidden border border-slate-150 rounded-xl bg-slate-50/50">
        <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
          {previewItems.map((item, index) => (
            <div
              key={index}
              className="px-4 py-2 text-xs font-sans text-slate-600 hover:bg-slate-50/80 transition-colors flex items-start gap-2.5"
            >
              <span className="text-slate-400 font-mono w-4 text-right flex-shrink-0">{index + 1}.</span>
              <span className="truncate flex-1 font-medium">{item}</span>
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="px-4 py-2.5 bg-slate-50 text-center text-[11px] font-bold text-slate-400 border-t border-slate-100 uppercase tracking-wider">
              Và {remainingCount} mục khác đang đợi bốc mẫu...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
