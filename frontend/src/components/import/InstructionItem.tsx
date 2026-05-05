interface InstructionItemProps {
  icon: React.ReactNode;
  text: string;
}

export function InstructionItem({ icon, text }: InstructionItemProps) {
  return (
    <li className="flex items-start gap-3 text-[11px] text-warm-600 bg-[rgba(0,0,0,0.02)] p-2.5 rounded-xl border border-[rgba(0,0,0,0.03)]">
      <span className="mt-0.5">{icon}</span>
      <span>{text}</span>
    </li>
  );
}
