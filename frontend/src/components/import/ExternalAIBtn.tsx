import { FaExternalLinkAlt } from 'react-icons/fa';

interface ExternalAIBtnProps {
  name: string;
  url: string;
  color: string;
  active: boolean;
}

export function ExternalAIBtn({ name, url, color, active }: ExternalAIBtnProps) {
  return (
    <li>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-between p-3 rounded-xl border transition-all group ${
          active
            ? 'bg-white border-[rgba(0,0,0,0.1)] shadow-sm hover:border-[#0075de] hover:shadow-md'
            : 'bg-warm-50/50 border-transparent opacity-60 grayscale cursor-not-allowed pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${active ? 'bg-[#2a9d99] animate-pulse' : 'bg-warm-300'}`}
          />
          <span
            className={`text-[11px] font-bold ${active ? 'text-[rgba(0,0,0,0.8)]' : 'text-warm-400'}`}
          >
            {name}
          </span>
        </div>
        <FaExternalLinkAlt
          className={`text-[10px] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${active ? color : 'text-warm-300'}`}
        />
      </a>
    </li>
  );
}
