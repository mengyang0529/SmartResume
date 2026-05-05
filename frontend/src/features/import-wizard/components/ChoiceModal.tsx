import { motion, AnimatePresence } from 'framer-motion';
import { FaFileImport, FaEdit, FaArrowRight } from 'react-icons/fa';

interface ChoiceModalProps {
  show: boolean;
  onClose: () => void;
  onSelectImport: () => void;
  onSelectScratch: () => void;
  onGoBack: () => void;
}

export function ChoiceModal({
  show,
  onClose,
  onSelectImport,
  onSelectScratch,
  onGoBack,
}: ChoiceModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl border border-[rgba(0,0,0,0.1)] p-8 md:p-12 overflow-hidden"
          >
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0075de]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />

            <div className="relative z-10 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-[rgba(0,0,0,0.95)] mb-4">
                How would you like to start?
              </h2>
              <p className="text-warm-500 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
                Choose between our AI-powered import or start with a fresh, empty template.
              </p>

              <div className="grid gap-4">
                <button
                  onClick={onSelectImport}
                  className="group w-full p-6 bg-white border-2 border-[#0075de]/10 rounded-2xl text-left hover:border-[#0075de] hover:bg-[#0075de]/[0.02] transition-all flex items-center gap-6"
                >
                  <div className="w-14 h-14 rounded-xl bg-[rgba(0,117,222,0.08)] border border-[rgba(0,117,222,0.1)] text-[#0075de] flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                    <FaFileImport />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[rgba(0,0,0,0.95)] text-lg">
                      Import from Existing Resume
                    </h3>
                    <p className="text-warm-400 text-xs mt-1">
                      Convert your current PDF or Image using AI assistance.
                    </p>
                  </div>
                  <FaArrowRight className="text-warm-200 group-hover:text-[#0075de] transition-colors" />
                </button>

                <button
                  onClick={onSelectScratch}
                  className="group w-full p-6 bg-white border-2 border-[rgba(0,0,0,0.05)] rounded-2xl text-left hover:border-[rgba(0,0,0,0.2)] hover:bg-[rgba(0,0,0,0.02)] transition-all flex items-center gap-6"
                >
                  <div className="w-14 h-14 rounded-xl bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.05)] text-warm-500 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                    <FaEdit />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[rgba(0,0,0,0.95)] text-lg">
                      Start from Scratch
                    </h3>
                    <p className="text-warm-400 text-xs mt-1">
                      Begin with a clean template and edit manually.
                    </p>
                  </div>
                  <FaArrowRight className="text-warm-200 group-hover:text-warm-600 transition-colors" />
                </button>
              </div>

              <div className="mt-8">
                <button
                  onClick={onGoBack}
                  className="text-warm-400 text-xs hover:text-[#0075de] font-medium transition-colors"
                >
                  Changed my mind? Go back to templates
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
