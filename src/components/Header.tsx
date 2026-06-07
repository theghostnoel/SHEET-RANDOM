import { TableProperties, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function Header() {
  return (
    <header className="text-center py-6 md:py-8 border-b border-slate-100 bg-white/50 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/80 mb-4"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span>Sheet Randomizer Pro</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-3 mb-2"
        >
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
            <TableProperties className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight text-slate-900 text-left">
              Sheet Randomizer Pro
            </h1>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm text-slate-500 max-w-xl leading-relaxed font-sans mt-1 text-center"
        >
          Công cụ trích xuất và bốc thăm ngẫu nhiên thông minh từ dữ liệu Google Sheets
        </motion.p>
      </div>
    </header>
  );
}
