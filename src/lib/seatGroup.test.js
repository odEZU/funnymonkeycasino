import { describe, it, expect } from 'vitest';
import { getSeatGroup, carFitsChildren } from './seatGroup.js';

describe('getSeatGroup — строки таблицы (по росту)', () => {
  it('70 см → автолюлька 0+', () => {
    const r = getSeatGroup({ heightCm: 70 });
    expect(r.group).toBe('0+');
    expect(r.installation).toBe('Спиной вперёд');
  });

  it('95 см → группа 1', () => {
    const r = getSeatGroup({ heightCm: 95 });
    expect(r.group).toBe('1');
    expect(r.installation).toBe('Лицом вперёд');
  });

  it('110 см → группа 2', () => {
    expect(getSeatGroup({ heightCm: 110 }).group).toBe('2');
  });

  it('135 см → бустер (группа 3)', () => {
    expect(getSeatGroup({ heightCm: 135 }).group).toBe('3');
  });

  it('155 см → кресло не требуется', () => {
    const r = getSeatGroup({ heightCm: 155 });
    expect(r.group).toBeNull();
    expect(r.installation).toBe('Штатный ремень');
  });
});

describe('getSeatGroup — граничные значения роста', () => {
  it('87 см → ещё 0+ (граница «до 87 см»)', () => {
    expect(getSeatGroup({ heightCm: 87 }).group).toBe('0+');
  });

  it('88 см → группа 1', () => {
    expect(getSeatGroup({ heightCm: 88 }).group).toBe('1');
  });

  it('105 см → ещё группа 1 (зона пересечения с группой 2)', () => {
    const r = getSeatGroup({ heightCm: 105 });
    expect(r.group).toBe('1');
    expect(r.alsoFits).toBe('2');
  });

  it('106 см → группа 2', () => {
    expect(getSeatGroup({ heightCm: 106 }).group).toBe('2');
  });

  it('125 см → группа 2 (младшая в пересечении), также подойдёт 3', () => {
    const r = getSeatGroup({ heightCm: 125 });
    expect(r.group).toBe('2');
    expect(r.alsoFits).toBe('3');
  });

  it('126 см → бустер', () => {
    expect(getSeatGroup({ heightCm: 126 }).group).toBe('3');
  });

  it('149 см → ещё бустер, 150 см → не требуется', () => {
    expect(getSeatGroup({ heightCm: 149 }).group).toBe('3');
    expect(getSeatGroup({ heightCm: 150 }).group).toBeNull();
  });
});

describe('getSeatGroup — зоны пересечения → младшая группа + alsoFits', () => {
  it('80 см (пересечение 0+/1) → 0+, также подойдёт 1', () => {
    const r = getSeatGroup({ heightCm: 80 });
    expect(r.group).toBe('0+');
    expect(r.alsoFits).toBe('1');
  });

  it('75 см → 0+ без alsoFits (ниже диапазона группы 1)', () => {
    const r = getSeatGroup({ heightCm: 75 });
    expect(r.group).toBe('0+');
    expect(r.alsoFits).toBeNull();
  });

  it('102 см (пересечение 1/2) → 1, также подойдёт 2', () => {
    const r = getSeatGroup({ heightCm: 102 });
    expect(r.group).toBe('1');
    expect(r.alsoFits).toBe('2');
  });
});

describe('getSeatGroup — только возраст (fallback)', () => {
  it('8 месяцев → 0+ и подсказка указать рост', () => {
    const r = getSeatGroup({ ageMonths: 8 });
    expect(r.group).toBe('0+');
    expect(r.hint).toMatch(/рост/i);
  });

  it('14 мес → 0+, 15 мес → группа 1 (граница)', () => {
    expect(getSeatGroup({ ageMonths: 14 }).group).toBe('0+');
    expect(getSeatGroup({ ageMonths: 15 }).group).toBe('1');
  });

  it('3 года → группа 1, 5 лет → группа 2, 9 лет → бустер', () => {
    expect(getSeatGroup({ ageMonths: 36 }).group).toBe('1');
    expect(getSeatGroup({ ageMonths: 60 }).group).toBe('2');
    expect(getSeatGroup({ ageMonths: 108 }).group).toBe('3');
  });

  it('12 лет → кресло не требуется', () => {
    expect(getSeatGroup({ ageMonths: 144 }).group).toBeNull();
  });
});

describe('getSeatGroup — правило «12+ ИЛИ 150+»', () => {
  it('13 лет и 158 см → не требуется', () => {
    const r = getSeatGroup({ ageMonths: 156, heightCm: 158 });
    expect(r.group).toBeNull();
    expect(r.warning).toBeNull();
  });

  it('12 лет, но рост 140 см → всё равно не требуется (возраст 12+)', () => {
    expect(getSeatGroup({ ageMonths: 144, heightCm: 140 }).group).toBeNull();
  });

  it('10 лет, но рост 152 см → не требуется (рост 150+)', () => {
    expect(getSeatGroup({ ageMonths: 120, heightCm: 152 }).group).toBeNull();
  });
});

describe('getSeatGroup — конфликт рост/возраст', () => {
  it('2 года и 110 см → приоритет роста (группа 2) + предупреждение', () => {
    const r = getSeatGroup({ ageMonths: 24, heightCm: 110 });
    expect(r.group).toBe('2');
    expect(r.warning).toMatch(/нетипичен/i);
  });

  it('согласованные данные (3 года, 98 см) → без предупреждения', () => {
    const r = getSeatGroup({ ageMonths: 36, heightCm: 98 });
    expect(r.group).toBe('1');
    expect(r.warning).toBeNull();
  });

  it('возрастная группа совпадает с alsoFits → без ложного предупреждения', () => {
    // 16 мес, 80 см: по росту 0+ (alsoFits 1), по возрасту 1 — не конфликт.
    const r = getSeatGroup({ ageMonths: 16, heightCm: 80 });
    expect(r.group).toBe('0+');
    expect(r.warning).toBeNull();
  });
});

describe('getSeatGroup — вес как уточняющий фильтр', () => {
  it('вес в диапазоне группы → ничего не меняет', () => {
    const r = getSeatGroup({ heightCm: 98, weightKg: 15 });
    expect(r.group).toBe('1');
    expect(r.warning).toBeNull();
  });

  it('рост 85 см, но вес 15 кг → сдвиг с 0+ на группу 1 + предупреждение', () => {
    const r = getSeatGroup({ heightCm: 85, weightKg: 15 });
    expect(r.group).toBe('1');
    expect(r.warning).toMatch(/вес/i);
  });

  it('вес 36+ кг → кресло не требуется', () => {
    expect(getSeatGroup({ heightCm: 148, weightKg: 38 }).group).toBeNull();
  });
});

describe('getSeatGroup — нет данных', () => {
  it('пустой ввод → просьба указать данные', () => {
    const r = getSeatGroup({});
    expect(r.group).toBeNull();
    expect(r.hint).toMatch(/рост или возраст/i);
  });
});

describe('carFitsChildren — подбор машины', () => {
  const infant = getSeatGroup({ ageMonths: 8, heightCm: 70 }); // 0+
  const schoolkid = getSeatGroup({ ageMonths: 96, heightCm: 130 }); // 3
  const teen = getSeatGroup({ ageMonths: 156, heightCm: 158 }); // null

  it('ребёнок 8 мес, 70 см → подходит только машина с 0+', () => {
    expect(carFitsChildren(['0+'], [infant]).ok).toBe(true);
    expect(carFitsChildren(['1', '3'], [infant]).ok).toBe(false);
    expect(carFitsChildren([], [infant]).missing).toEqual(['0+']);
  });

  it('двое (8 мес + 8 лет) → нужна машина и с люлькой, и с бустером', () => {
    expect(carFitsChildren(['0+', '3'], [infant, schoolkid]).ok).toBe(true);
    expect(carFitsChildren(['0+'], [infant, schoolkid]).ok).toBe(false);
    expect(carFitsChildren(['3'], [infant, schoolkid]).ok).toBe(false);
  });

  it('одно кресло не закрывает двух детей одной группы', () => {
    expect(carFitsChildren(['0+'], [infant, infant]).ok).toBe(false);
    expect(carFitsChildren(['0+', '0+'], [infant, infant]).ok).toBe(true);
  });

  it('13 лет → требований нет, подходит любая машина', () => {
    expect(carFitsChildren([], [teen]).ok).toBe(true);
  });

  it('alsoFits учитывается: 105 см подходит и кресло группы 2', () => {
    const overlap = getSeatGroup({ heightCm: 105 }); // группа 1, alsoFits 2
    expect(carFitsChildren(['2'], [overlap]).ok).toBe(true);
  });

  it('ребёнок с альтернативой не отбирает кресло у ребёнка без неё', () => {
    // Первому нужна строго группа 2, второй (105 см) может в 1 или 2.
    const strict = getSeatGroup({ heightCm: 115 }); // только 2
    const flexible = getSeatGroup({ heightCm: 105 }); // 1 или 2
    expect(carFitsChildren(['2', '1'], [flexible, strict]).ok).toBe(true);
  });
});
