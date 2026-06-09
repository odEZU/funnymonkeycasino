import { CarFront, Plus, ShieldCheck } from 'lucide-react';
import ChildCard from '../components/ChildCard.jsx';

export default function Home({ children, onAddChild, onEditChild, onDeleteChild, onOrderRide }) {
  return (
    <div className="flex flex-col gap-6 px-4 pb-6 pt-8">
      <header>
        <div className="flex items-center gap-2 text-mint">
          <ShieldCheck size={20} />
          <span className="text-xs font-semibold uppercase tracking-widest">
            Kid Seat Match
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-bold leading-snug text-zinc-50">
          Добрый день! 👋
          <br />
          Куда едем с детьми?
        </h1>
        <p className="mt-1.5 text-sm text-zinc-400">
          Подберём машину с креслом, которое действительно подходит вашему
          ребёнку — по росту, весу и возрасту.
        </p>
      </header>

      <button
        onClick={onOrderRide}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-mint px-5 py-4 text-base font-semibold text-night transition-opacity hover:opacity-90 active:opacity-80"
      >
        <CarFront size={20} />
        Заказать поездку
      </button>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-100">Мои дети</h2>
          <button
            onClick={onAddChild}
            className="flex items-center gap-1 rounded-full bg-card-2 px-3 py-1.5 text-xs font-medium text-mint transition-colors hover:bg-line"
          >
            <Plus size={14} /> Добавить ребёнка
          </button>
        </div>

        {children.length === 0 ? (
          <button
            onClick={onAddChild}
            className="flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-card/50 px-4 py-8 text-center"
          >
            <span className="rounded-full bg-card-2 p-3 text-mint">
              <Plus size={20} />
            </span>
            <span className="text-sm font-medium text-zinc-200">
              Добавьте первого ребёнка
            </span>
            <span className="max-w-[260px] text-xs text-zinc-500">
              Укажите возраст и рост один раз — мы сами определим нужную группу
              кресла для каждой поездки
            </span>
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            {children.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                onEdit={() => onEditChild(child)}
                onDelete={() => onDeleteChild(child.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
