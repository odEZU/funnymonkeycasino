import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import BottomNav from './components/BottomNav.jsx';
import ChildCard from './components/ChildCard.jsx';
import Home from './screens/Home.jsx';
import ChildForm from './screens/ChildForm.jsx';
import Ride from './screens/Ride.jsx';
import Confirm from './screens/Confirm.jsx';

const STORAGE_KEY = 'kid-seat-match/children';

function loadChildren() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function ChildrenScreen({ children, onAdd, onEdit, onDelete }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-50">Мои дети</h1>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 rounded-full bg-card-2 px-3 py-1.5 text-xs font-medium text-mint transition-colors hover:bg-line"
        >
          <Plus size={14} /> Добавить
        </button>
      </div>
      {children.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-card/50 px-4 py-8 text-center text-sm text-zinc-500">
          Пока никого нет. Добавьте ребёнка — и мы определим нужную группу
          кресла автоматически.
        </p>
      ) : (
        children.map((child) => (
          <ChildCard
            key={child.id}
            child={child}
            onEdit={() => onEdit(child)}
            onDelete={() => onDelete(child.id)}
          />
        ))
      )}
    </div>
  );
}

export default function App() {
  const [children, setChildren] = useState(loadChildren);
  const [screen, setScreen] = useState({ name: 'home' });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(children));
    } catch {
      // приватный режим / нет доступа к хранилищу — работаем из памяти
    }
  }, [children]);

  function saveChild(child) {
    setChildren((prev) => {
      const exists = prev.some((c) => c.id === child.id);
      return exists ? prev.map((c) => (c.id === child.id ? child : c)) : [...prev, child];
    });
    setScreen({ name: screen.returnTo ?? 'home' });
  }

  function deleteChild(id) {
    setChildren((prev) => prev.filter((c) => c.id !== id));
  }

  const openForm = (child = null, returnTo = 'home') =>
    setScreen({ name: 'childForm', child, returnTo });

  const activeTab =
    screen.name === 'childForm'
      ? (screen.returnTo ?? 'home')
      : screen.name === 'confirm'
        ? 'ride'
        : screen.name;

  return (
    <div className="min-h-dvh bg-night font-sans text-zinc-100">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[420px] flex-col bg-night shadow-2xl">
        <main className="flex-1">
          {screen.name === 'home' && (
            <Home
              children={children}
              onAddChild={() => openForm(null, 'home')}
              onEditChild={(c) => openForm(c, 'home')}
              onDeleteChild={deleteChild}
              onOrderRide={() => setScreen({ name: 'ride' })}
            />
          )}
          {screen.name === 'children' && (
            <ChildrenScreen
              children={children}
              onAdd={() => openForm(null, 'children')}
              onEdit={(c) => openForm(c, 'children')}
              onDelete={deleteChild}
            />
          )}
          {screen.name === 'childForm' && (
            <ChildForm
              initial={screen.child}
              onSave={saveChild}
              onBack={() => setScreen({ name: screen.returnTo ?? 'home' })}
            />
          )}
          {screen.name === 'ride' && (
            <Ride
              children={children}
              onBack={() => setScreen({ name: 'home' })}
              onAddChild={() => openForm(null, 'ride')}
              onPickCar={(order) => setScreen({ name: 'confirm', order })}
            />
          )}
          {screen.name === 'confirm' && (
            <Confirm
              order={screen.order}
              onBack={() => setScreen({ name: 'ride' })}
              onDone={() => setScreen({ name: 'home' })}
            />
          )}
        </main>
        <BottomNav active={activeTab} onNavigate={(tab) => setScreen({ name: tab })} />
      </div>
    </div>
  );
}
