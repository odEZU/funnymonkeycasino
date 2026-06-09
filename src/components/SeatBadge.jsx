import { Baby, Armchair, Sofa, ShieldCheck } from 'lucide-react';

export const SEAT_META = {
  '0+': { icon: Baby, short: 'Автолюлька 0+' },
  1: { icon: Armchair, short: 'Кресло гр. 1' },
  2: { icon: Armchair, short: 'Кресло гр. 2' },
  3: { icon: Sofa, short: 'Бустер' },
};

export function seatShortName(group) {
  return group == null ? 'Без кресла' : SEAT_META[group].short;
}

export default function SeatBadge({ group, muted = false }) {
  const meta = group != null ? SEAT_META[group] : null;
  const Icon = meta ? meta.icon : ShieldCheck;
  const text = meta ? meta.short : 'Кресло не требуется';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        muted
          ? 'bg-card-2 text-zinc-400'
          : 'bg-mint-dim text-mint'
      }`}
    >
      <Icon size={14} strokeWidth={2} />
      {text}
    </span>
  );
}
