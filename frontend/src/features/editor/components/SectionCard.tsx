import { motion } from 'framer-motion';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-[rgba(0,0,0,0.1)] p-6 shadow-sm"
    >
      <div className="mb-0.5">
        <h2 className="text-lg font-semibold text-[rgba(0,0,0,0.95)] tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-warm-500 mt-1 leading-relaxed">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}
