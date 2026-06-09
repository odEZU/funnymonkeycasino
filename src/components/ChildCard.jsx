import { Pencil, Trash2, AlertTriangle, Ruler, Weight } from 'lucide-react';
import SeatBadge from './SeatBadge.jsx';
import { getSeatGroup, SEAT_GROUPS } from '../lib/seatGroup.js';
import { ageLabel, totalMonths } from '../lib/format.js';

export default function ChildCard({ child, onEdit, onDelete }) {
  const result = getSeatGroup({
    heightCm: child.heightCm ?? null,
    weightKg: child.weightKg ?? null,
    ageMonths: totalMonths(child),
  });

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-zinc-100">
            {child.name || 'Ребёнок'}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-400">
            <span>{ageLabel(child)}</span>
            {child.heightCm != null && (
              <span className="inline-flex items-center gap-1">
                <Ruler size={13} /> {child.heightCm} см
              </span>
            )}
            {child.weightKg != null && (
              <span className="inline-flex items-center gap-1">
                <Weight size={13} /> {child.weightKg} кг
              </span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          {onEdit && (
            <button
              onClick={onEdit}
              aria-label="Редактировать"
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-card-2 hover:text-zinc-200"
            >
              <Pencil size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              aria-label="Удалить"
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-card-2 hover:text-red-400"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SeatBadge group={result.group} />
        {result.alsoFits && (
          <span className="text-xs text-zinc-500">
            также подойдёт {SEAT_GROUPS[result.alsoFits].name.toLowerCase()}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-zinc-500">{result.label}</p>

      {result.warning && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-400">
          <AlertTriangle size={14} className="mt-px shrink-0" />
          {result.warning}
        </p>
      )}
      {result.hint && (
        <p className="mt-1.5 text-xs text-zinc-500">💡 {result.hint}</p>
      )}
    </div>
  );
}
