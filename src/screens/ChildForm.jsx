import { useState } from 'react';
import { ArrowLeft, AlertTriangle, Check } from 'lucide-react';
import SeatBadge from '../components/SeatBadge.jsx';
import { getSeatGroup, SEAT_GROUPS } from '../lib/seatGroup.js';

function Field({ label, optional, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-1.5 text-sm font-medium text-zinc-300">
        {label}
        {optional && <span className="text-xs font-normal text-zinc-500">необязательно</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  'w-full rounded-xl border border-line bg-card-2 px-3.5 py-3 text-base text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-mint';

export default function ChildForm({ initial, onSave, onBack }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [ageYears, setAgeYears] = useState(initial?.ageYears ?? '');
  const [ageMonths, setAgeMonths] = useState(initial?.ageMonths ?? 0);
  const [heightCm, setHeightCm] = useState(initial?.heightCm ?? '');
  const [weightKg, setWeightKg] = useState(initial?.weightKg ?? '');

  const years = ageYears === '' ? null : Number(ageYears);
  const height = heightCm === '' ? null : Number(heightCm);
  const weight = weightKg === '' ? null : Number(weightKg);
  const months = years == null ? null : years * 12 + Number(ageMonths || 0);

  const errors = [];
  if (years != null && (years < 0 || years > 14)) errors.push('Возраст: от 0 до 14 лет');
  if (height != null && (height < 40 || height > 170)) errors.push('Рост: от 40 до 170 см');
  if (weight != null && (weight < 2 || weight > 60)) errors.push('Вес: от 2 до 60 кг');

  const hasInput = months != null || height != null;
  const result = hasInput && errors.length === 0
    ? getSeatGroup({ heightCm: height, weightKg: weight, ageMonths: months })
    : null;

  const canSave = hasInput && errors.length === 0;

  function handleSave() {
    onSave({
      id: initial?.id ?? `child-${Date.now()}`,
      name: name.trim(),
      ageYears: years ?? 0,
      ageMonths: Number(ageMonths || 0),
      heightCm: height,
      weightKg: weight,
    });
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-6 pt-5">
      <header className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Назад"
          className="rounded-xl bg-card p-2.5 text-zinc-300 transition-colors hover:bg-card-2"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold text-zinc-50">
          {initial ? 'Профиль ребёнка' : 'Добавить ребёнка'}
        </h1>
      </header>

      <div className="flex flex-col gap-4">
        <Field label="Имя" optional>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например, Соня"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Возраст, лет">
            <input
              className={inputCls}
              type="number"
              inputMode="numeric"
              min="0"
              max="14"
              value={ageYears}
              onChange={(e) => setAgeYears(e.target.value)}
              placeholder="3"
            />
          </Field>
          <Field label="+ месяцев">
            <input
              className={`${inputCls} ${years != null && years >= 2 ? 'opacity-40' : ''}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="11"
              disabled={years != null && years >= 2}
              value={ageMonths}
              onChange={(e) =>
                setAgeMonths(Math.max(0, Math.min(11, Number(e.target.value || 0))))
              }
            />
          </Field>
        </div>
        {years != null && years < 2 && (
          <p className="-mt-2 text-xs text-zinc-500">
            Для малышей до 2 лет месяцы важны — от них зависит группа кресла
          </p>
        )}

        <Field label="Рост, см">
          <input
            className={inputCls}
            type="number"
            inputMode="numeric"
            min="40"
            max="170"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            placeholder="98"
          />
          <input
            type="range"
            min="40"
            max="170"
            value={height ?? 95}
            onChange={(e) => setHeightCm(e.target.value)}
            className="mt-2 w-full"
          />
        </Field>

        <Field label="Вес, кг" optional>
          <input
            className={inputCls}
            type="number"
            inputMode="decimal"
            min="2"
            max="60"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            placeholder="14"
          />
        </Field>
      </div>

      {errors.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-3 text-xs text-amber-300">
          {errors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}

      {/* Живой расчёт группы кресла */}
      {result && (
        <div className="rounded-2xl border border-mint-dim bg-card p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Подобранное кресло
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <SeatBadge group={result.group} />
            {result.alsoFits && (
              <span className="text-xs text-zinc-500">
                также подойдёт {SEAT_GROUPS[result.alsoFits].name.toLowerCase()}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-zinc-300">{result.label}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Установка: {result.installation}
          </p>
          {result.warning && (
            <p className="mt-2.5 flex items-start gap-1.5 text-xs text-amber-400">
              <AlertTriangle size={14} className="mt-px shrink-0" />
              {result.warning}
            </p>
          )}
          {result.hint && (
            <p className="mt-1.5 text-xs text-zinc-500">💡 {result.hint}</p>
          )}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!canSave}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-mint px-5 py-4 text-base font-semibold text-night transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Check size={18} />
        Сохранить
      </button>
    </div>
  );
}
