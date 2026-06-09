import { useMemo, useState } from 'react';
import {
  ArrowLeft, MapPin, Navigation, Star, Clock, Check, X, Plus, Eye,
} from 'lucide-react';
import { getSeatGroup, carFitsChildren } from '../lib/seatGroup.js';
import { seatShortName } from '../components/SeatBadge.jsx';
import { ageLabel, totalMonths } from '../lib/format.js';
import { MOCK_CARS } from '../data/cars.js';

function childResult(child) {
  return getSeatGroup({
    heightCm: child.heightCm ?? null,
    weightKg: child.weightKg ?? null,
    ageMonths: totalMonths(child),
  });
}

function CarCard({ car, fit, requirementsActive, onPick }) {
  const fits = !requirementsActive || fit.ok;
  const seatsLabel =
    car.seats.length > 0
      ? car.seats.map(seatShortName).join(' + ')
      : 'Без детских кресел';

  return (
    <button
      onClick={() => fits && onPick(car)}
      disabled={!fits}
      className={`w-full rounded-2xl border p-4 text-left transition-colors ${
        fits
          ? 'border-line bg-card hover:border-mint/40'
          : 'cursor-not-allowed border-line/50 bg-card/40 opacity-55'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-zinc-100">{car.driverName}</p>
          <p className="mt-0.5 text-sm text-zinc-400">{car.carModel}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <p className="flex items-center gap-1 text-sm font-medium text-zinc-200">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            {car.rating.toFixed(1)}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
            <Clock size={12} /> {car.etaMin} мин
          </p>
        </div>
      </div>

      <p className="mt-2.5 text-xs text-zinc-500">Кресла: {seatsLabel}</p>

      {requirementsActive && (
        <div className="mt-2.5">
          {fit.ok ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-dim px-2.5 py-1 text-xs font-medium text-mint">
              <Check size={13} />
              Подходящее кресло: {fit.required.map(seatShortName).join(' + ')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card-2 px-2.5 py-1 text-xs font-medium text-zinc-500">
              <X size={13} />
              Нет: {fit.missing.map(seatShortName).join(', ')}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

export default function Ride({ children, onBack, onAddChild, onPickCar }) {
  const [selectedIds, setSelectedIds] = useState(() =>
    children.length === 1 ? [children[0].id] : []
  );
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [showAll, setShowAll] = useState(false);

  const selected = children.filter((c) => selectedIds.includes(c.id));
  const results = useMemo(
    () => selected.map((c) => ({ child: c, result: childResult(c) })),
    [selectedIds, children] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const required = results
    .map((r) => r.result.group)
    .filter((g) => g != null);
  const requirementsActive = required.length > 0;

  const cars = useMemo(() => {
    const evaluated = MOCK_CARS.map((car) => {
      const fit = carFitsChildren(car.seats, results.map((r) => r.result));
      return { car, fit: { ...fit, required } };
    });
    // Подходящие сверху (по времени подачи), неподходящие — внизу.
    return evaluated.sort((a, b) => {
      if (a.fit.ok !== b.fit.ok) return a.fit.ok ? -1 : 1;
      return a.car.etaMin - b.car.etaMin;
    });
  }, [selectedIds, children]); // eslint-disable-line react-hooks/exhaustive-deps

  const fittingCount = cars.filter((c) => c.fit.ok).length;
  const visibleCars =
    requirementsActive && !showAll ? cars.filter((c) => c.fit.ok) : cars;

  function toggleChild(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handlePick(car) {
    onPickCar({
      car,
      children: results,
      from: from || 'Дом',
      to: to || 'Детская поликлиника',
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
        <h1 className="text-lg font-bold text-zinc-50">Заказ поездки</h1>
      </header>

      {/* Кто едет */}
      <section>
        <p className="mb-2 text-sm font-medium text-zinc-300">Кто едет</p>
        {children.length === 0 ? (
          <button
            onClick={onAddChild}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-card/50 px-4 py-3.5 text-sm text-zinc-400"
          >
            <Plus size={16} className="text-mint" />
            Сначала добавьте ребёнка
          </button>
        ) : (
          <div className="flex flex-wrap gap-2">
            {children.map((child) => {
              const active = selectedIds.includes(child.id);
              const result = childResult(child);
              return (
                <button
                  key={child.id}
                  onClick={() => toggleChild(child.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'border-mint bg-mint-dim text-mint'
                      : 'border-line bg-card text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {active && <Check size={14} />}
                  {child.name || 'Ребёнок'} · {ageLabel(child)}
                  <span className="text-xs opacity-70">
                    {result.group ? `гр. ${result.group}` : 'без кресла'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {selected.length > 0 && !requirementsActive && (
          <p className="mt-2 text-xs text-zinc-500">
            ✓ Кресло не требуется — доступны все машины
          </p>
        )}
      </section>

      {/* Маршрут (декоративный) */}
      <section className="flex flex-col gap-2.5 rounded-2xl border border-line bg-card p-4">
        <div className="flex items-center gap-2.5">
          <MapPin size={16} className="shrink-0 text-mint" />
          <input
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-600 outline-none"
            placeholder="Откуда: ул. Лесная, 12"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="ml-[7px] h-3 border-l border-dashed border-line" />
        <div className="flex items-center gap-2.5">
          <Navigation size={16} className="shrink-0 text-zinc-500" />
          <input
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-600 outline-none"
            placeholder="Куда: детская поликлиника №3"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </section>

      {/* Машины */}
      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-sm font-medium text-zinc-300">Доступные машины</p>
          {requirementsActive && (
            <p className="text-xs text-zinc-500">
              подходят {fittingCount} из {cars.length}
            </p>
          )}
        </div>

        {selected.length === 0 && children.length > 0 ? (
          <p className="rounded-xl bg-card px-4 py-3.5 text-sm text-zinc-500">
            Выберите, кто из детей поедет, — и мы отфильтруем машины по нужному
            креслу
          </p>
        ) : requirementsActive && fittingCount === 0 && !showAll ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-card px-4 py-8 text-center">
            <span className="text-3xl">🚗</span>
            <p className="text-sm font-medium text-zinc-200">
              Сейчас нет машин с нужным креслом
              {required.length > 0 && ` (${required.map(seatShortName).join(' + ')})`}
            </p>
            <p className="max-w-[280px] text-xs text-zinc-500">
              Обычно ожидание дольше — попробуйте позже
            </p>
            <button
              onClick={() => setShowAll(true)}
              className="mt-1 flex items-center gap-1.5 rounded-full bg-card-2 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-line"
            >
              <Eye size={14} /> Показать все машины
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visibleCars.map(({ car, fit }) => (
              <CarCard
                key={car.id}
                car={car}
                fit={fit}
                requirementsActive={requirementsActive}
                onPick={handlePick}
              />
            ))}
            {requirementsActive && !showAll && fittingCount < cars.length && (
              <button
                onClick={() => setShowAll(true)}
                className="py-1 text-center text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
              >
                Показать неподходящие машины ({cars.length - fittingCount})
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
