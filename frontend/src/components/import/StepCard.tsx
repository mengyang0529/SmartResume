import { motion } from 'framer-motion';

interface StepCardProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function StepCard({ number, icon, title, description, children }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (number - 1) * 0.1 }}
      className="bg-white rounded-2xl p-5 border border-[rgba(0,0,0,0.1)] shadow-sm flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.05)] text-[rgba(0,0,0,0.95)] flex items-center justify-center text-sm font-bold">
          {number}
        </div>
        <div className="text-lg">{icon}</div>
      </div>
      <h3 className="font-bold text-[rgba(0,0,0,0.95)] text-sm mb-1">{title}</h3>
      <p className="text-warm-500 text-[11px] leading-relaxed flex-1">{description}</p>
      {children}
    </motion.div>
  );
}
