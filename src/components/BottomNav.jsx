import { Home, Users, CarFront } from 'lucide-react';

const TABS = [
  { id: 'home', label: 'Главная', icon: Home },
  { id: 'children', label: 'Дети', icon: Users },
  { id: 'ride', label: 'Поездка', icon: CarFront },
];

export default function BottomNav({ active, onNavigate }) {
  return (
    <nav className="sticky bottom-0 z-10 border-t border-line bg-night/95 backdrop-blur">
      <div className="flex justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-5 py-1.5 text-[11px] font-medium transition-colors ${
                isActive ? 'text-mint' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
