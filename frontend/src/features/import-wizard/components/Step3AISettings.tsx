import { motion } from 'framer-motion';
import { FaImage, FaDownload, FaRobot, FaExternalLinkAlt } from 'react-icons/fa';
import { ExternalAIBtn } from './ExternalAIBtn';
import { InstructionItem } from './InstructionItem';

interface Step3AISettingsProps {
  convertedImages: string[];
}

export function Step3AISettings({ convertedImages }: Step3AISettingsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: convertedImages.length > 0 ? [1, 1.01, 1] : 1,
        boxShadow:
          convertedImages.length > 0
            ? '0 20px 25px -5px rgba(0, 117, 222, 0.1), 0 10px 10px -5px rgba(0, 117, 222, 0.04)'
            : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }}
      transition={{
        delay: 0.2,
        scale: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
      }}
      className={`bg-white rounded-2xl p-6 border transition-colors duration-500 \${
        convertedImages.length > 0
          ? 'border-[#0075de]/30 ring-4 ring-[#0075de]/5'
          : 'border-[rgba(0,0,0,0.1)]'
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold transition-colors \${
              convertedImages.length > 0
                ? 'bg-[#0075de] text-white'
                : 'bg-[rgba(220,53,34,0.08)] text-[#dc3522]'
            }`}
          >
            3
          </div>
          <div>
            <h3 className="font-bold text-[rgba(0,0,0,0.95)]">
              Upload schema and image to GPT or Claude
            </h3>
            <p className="text-warm-400 text-xs">Use ChatGPT or Claude to generate your Markdown.</p>
          </div>
        </div>
        {convertedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-3 py-1 bg-[#0075de]/10 text-[#0075de] text-[10px] font-bold rounded-full flex items-center gap-1.5 animate-pulse"
          >
            <FaExternalLinkAlt /> ACTION REQUIRED
          </motion.div>
        )}
      </div>

      <div className="space-y-4">
        <div
          className={`p-4 rounded-xl border transition-all \${
            convertedImages.length > 0
              ? 'bg-[#0075de]/[0.02] border-[#0075de]/10'
              : 'bg-warm-50/50 border-transparent'
          }`}
        >
          <p className="text-[11px] text-warm-500 leading-relaxed mb-4">
            Now, leave this page briefly and head to your favorite AI assistant:
          </p>
          <ul className="grid sm:grid-cols-2 gap-3">
            <ExternalAIBtn
              name="ChatGPT"
              url="https://chatgpt.com"
              color="text-[#10a37f]"
              active={convertedImages.length > 0}
            />
            <ExternalAIBtn
              name="Claude.ai"
              url="https://claude.ai"
              color="text-[#d97757]"
              active={convertedImages.length > 0}
            />
          </ul>
        </div>

        <div className="space-y-2">
          <InstructionItem
            icon={<FaImage className="text-blue-500" />}
            text="Upload the long image you just saved."
          />
          <InstructionItem
            icon={<FaDownload className="text-green-500" />}
            text="Provide the Schema content from Step 1."
          />
          <InstructionItem
            icon={<FaRobot className="text-purple-500" />}
            text="Instruct the AI: 'Please extract the resume data into the provided Markdown schema'."
          />
        </div>
      </div>
    </motion.div>
  );
}
