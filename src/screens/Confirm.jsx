import { useState } from 'react';
import {
  ArrowLeft, Star, Clock, ShieldCheck, Check, MapPin, Navigation, PartyPopper,
} from 'lucide-react';
import { seatShortName } from '../components/SeatBadge.jsx';
import { ageLabel } from '../lib/format.js';

function SuccessScreen({ order, onDone }) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 pb-10 pt-20 text-center">
      <span className="rounded-full bg-mint-dim p-5 text-mint">
        <PartyPopper size={36} />
      </span>
      <h1 className="text-xl font-bold text-zinc-50">Поездка заказана!</h1>
      <p className="max-w-[280px] text-sm text-zinc-400">
        {order.car.driverName} приедет через {order.car.etaMin} мин на{' '}
        {order.car.carModel.split('·')[0].trim()}. Кресла уже установлены и
        проверены.
      </p>
      <button
        onClick={onDone}
        className="mt-4 w-full max-w-[280px] rounded-2xl bg-mint px-5 py-4 text-base font-semibold text-night transition-opacity hover:opacity-90"
      >
        На главную
      </button>
    </div>
  );
}

export default function Confirm({ order, onBack, onDone }) {
  const [confirmed, setConfirmed] = useState(false);
  if (confirmed) return <SuccessScreen order={order} onDone={onDone} />;

  const { car, children, from, to } = order;
  const withSeat = children.filter(({ result }) => result.group != null);
  const withoutSeat = children.filter(({ result }) => result.group == null);

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
        <h1 className="text-lg font-bold text-zinc-50">Подтверждение</h1>
      </header>

      {/* Карточка поездки */}
      <section className="rounded-2xl border border-line bg-card p-4">
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
              <Clock size={12} /> подача {car.etaMin} мин
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1.5 border-t border-line pt-3 text-sm">
          <p className="flex items-center gap-2 text-zinc-300">
            <MapPin size={14} className="text-mint" /> {from}
          </p>
          <p className="flex items-center gap-2 text-zinc-300">
            <Navigation size={14} className="text-zinc-500" /> {to}
          </p>
        </div>
      </section>

      {/* Блок безопасности */}
      <section className="rounded-2xl border border-mint-dim bg-card p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-mint">
          <ShieldCheck size={18} />
          Безопасность детей
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {withSeat.map(({ child, result }) => (
            <div key={child.id} className="flex items-start gap-2.5">
              <span className="mt-0.5 rounded-full bg-mint-dim p-1 text-mint">
                <Check size={12} strokeWidth={3} />
              </span>
              <div>
                <p className="text-sm text-zinc-200">
                  Установлено: {seatShortName(result.group).toLowerCase()}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Соответствует параметрам: {child.name || 'ребёнок'},{' '}
                  {ageLabel(child)}
                  {child.heightCm != null && `, ${child.heightCm} см`}
                </p>
              </div>
            </div>
          ))}
          {withoutSeat.map(({ child }) => (
            <div key={child.id} className="flex items-start gap-2.5">
              <span className="mt-0.5 rounded-full bg-card-2 p-1 text-zinc-400">
                <Check size={12} strokeWidth={3} />
              </span>
              <div>
                <p className="text-sm text-zinc-200">
                  {child.name || 'Ребёнок'} — кресло не требуется
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Штатный ремень безопасности
                </p>
              </div>
            </div>
          ))}
          {children.length === 0 && (
            <p className="text-sm text-zinc-400">Поездка без детей</p>
          )}
        </div>
      </section>

      <button
        onClick={() => setConfirmed(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-mint px-5 py-4 text-base font-semibold text-night transition-opacity hover:opacity-90"
      >
        <Check size={18} />
        Подтвердить заказ
      </button>
    </div>
  );
}
