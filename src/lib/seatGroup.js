/**
 * Подбор группы детского автокресла по ECE R129 (i-Size) / ECE R44.
 *
 * Приоритет критериев: рост → вес → возраст.
 * Рост — главный критерий (стандарт R129), возраст — fallback при
 * отсутствии роста, вес — уточняющий фильтр.
 *
 * Группы:
 *  '0+'  автолюлька          до 87 см   | до 13 кг  | 0–15 мес
 *  '1'   кресло с ремнями    76–105 см  | 9–18 кг   | 15 мес – 4 года
 *  '2'   кресло со спинкой   100–125 см | 15–25 кг  | 3.5–7 лет
 *  '3'   бустер              125–150 см | 22–36 кг  | 7–12 лет
 *  null  не требуется        от 150 см  | от 36 кг  | 12+ лет
 */

export const SEAT_GROUPS = {
  '0+': {
    group: '0+',
    name: 'Автолюлька',
    label: 'Автолюлька, группа 0+ (до 13 кг, спиной вперёд)',
    installation: 'Спиной вперёд',
    heightMax: 87,
    weightMax: 13,
  },
  1: {
    group: '1',
    name: 'Кресло группы 1',
    label: 'Кресло группы 1 (9–18 кг, лицом вперёд)',
    installation: 'Лицом вперёд',
    heightMin: 76,
    heightMax: 105,
    weightMax: 18,
  },
  2: {
    group: '2',
    name: 'Кресло группы 2',
    label: 'Кресло группы 2 со спинкой (15–25 кг, штатный ремень)',
    installation: 'Лицом вперёд',
    heightMin: 100,
    heightMax: 125,
    weightMax: 25,
  },
  3: {
    group: '3',
    name: 'Бустер',
    label: 'Бустер, группа 3 (22–36 кг, лицом вперёд)',
    installation: 'Лицом вперёд',
    heightMin: 125,
    heightMax: 150,
    weightMax: 36,
  },
};

const NO_SEAT = {
  group: null,
  name: 'Кресло не требуется',
  label: 'Кресло не требуется — штатный ремень безопасности',
  installation: 'Штатный ремень',
};

const GROUP_ORDER = ['0+', '1', '2', '3'];

function groupByHeight(heightCm) {
  // В зонах пересечения выбираем более безопасную (младшую) группу,
  // соседнюю старшую возвращаем как alsoFits.
  if (heightCm >= 150) return { group: null, alsoFits: null };
  if (heightCm <= 87) return { group: '0+', alsoFits: heightCm >= 76 ? '1' : null };
  if (heightCm <= 105) return { group: '1', alsoFits: heightCm >= 100 ? '2' : null };
  if (heightCm <= 125) return { group: '2', alsoFits: heightCm >= 125 ? '3' : null };
  return { group: '3', alsoFits: null };
}

function groupByAge(ageMonths) {
  if (ageMonths >= 144) return null;
  if (ageMonths < 15) return '0+';
  if (ageMonths < 48) return '1';
  if (ageMonths < 84) return '2';
  return '3';
}

function nextGroup(group) {
  const i = GROUP_ORDER.indexOf(group);
  return i >= 0 && i < GROUP_ORDER.length - 1 ? GROUP_ORDER[i + 1] : null;
}

/**
 * @param {{ heightCm?: number|null, weightKg?: number|null, ageMonths?: number|null }} params
 * @returns {{ group: string|null, name: string, label: string, installation: string,
 *            alsoFits: string|null, warning: string|null, hint: string|null }}
 */
export function getSeatGroup({ heightCm = null, weightKg = null, ageMonths = null } = {}) {
  const warnings = [];
  let hint = null;

  // Возраст 12+ ИЛИ рост 150+ ИЛИ вес 36+ → кресло не нужно.
  if (
    (ageMonths != null && ageMonths >= 144) ||
    (heightCm != null && heightCm >= 150) ||
    (weightKg != null && weightKg >= 36)
  ) {
    return { ...NO_SEAT, alsoFits: null, warning: null, hint: null };
  }

  let group = null;
  let alsoFits = null;

  if (heightCm != null) {
    ({ group, alsoFits } = groupByHeight(heightCm));

    // Конфликт рост/возраст: приоритет у роста + мягкое предупреждение.
    if (ageMonths != null) {
      const ageGroup = groupByAge(ageMonths);
      if (ageGroup !== group && ageGroup !== alsoFits) {
        warnings.push('Проверьте данные: рост нетипичен для указанного возраста');
      }
    }
  } else if (ageMonths != null) {
    group = groupByAge(ageMonths);
    hint = 'Укажите рост для более точного подбора';
  } else {
    return {
      ...NO_SEAT,
      group: null,
      name: 'Недостаточно данных',
      label: 'Укажите рост или возраст ребёнка',
      alsoFits: null,
      warning: null,
      hint: 'Укажите рост или возраст ребёнка',
    };
  }

  // Вес — уточняющий фильтр: если вес выше диапазона группы,
  // сдвигаемся к следующей группе.
  if (weightKg != null && group != null) {
    while (group != null && weightKg > SEAT_GROUPS[group].weightMax) {
      const next = nextGroup(group);
      warnings.push(
        `Вес ${weightKg} кг выше диапазона группы ${group} — подобрана следующая группа`
      );
      group = next;
      alsoFits = null;
    }
    if (group == null) {
      return { ...NO_SEAT, alsoFits: null, warning: warnings[0] ?? null, hint };
    }
  }

  const base = SEAT_GROUPS[group];
  return {
    group: base.group,
    name: base.name,
    label: base.label,
    installation: base.installation,
    alsoFits,
    warning: warnings.length ? warnings.join('. ') : null,
    hint,
  };
}

/** Группы кресел, которые подходят ребёнку (основная + допустимая старшая). */
export function acceptableGroups(result) {
  if (result.group == null) return [];
  return result.alsoFits ? [result.group, result.alsoFits] : [result.group];
}

/**
 * Проверка машины для набора детей: машина должна закрывать потребности
 * ВСЕХ детей одновременно (каждому ребёнку — своё кресло).
 *
 * @param {string[]} carSeats — установленные кресла, например ['1', '3']
 * @param {Array<ReturnType<typeof getSeatGroup>>} childResults
 * @returns {{ ok: boolean, missing: string[] }} missing — группы, которых не хватает
 */
export function carFitsChildren(carSeats, childResults) {
  const pool = [...carSeats];
  const missing = [];

  // Сначала дети с единственным вариантом, потом с альтернативами.
  const sorted = [...childResults]
    .filter((r) => r.group != null)
    .sort((a, b) => acceptableGroups(a).length - acceptableGroups(b).length);

  for (const result of sorted) {
    const options = acceptableGroups(result);
    const idx = pool.findIndex((seat) => options.includes(seat));
    if (idx >= 0) {
      pool.splice(idx, 1);
    } else {
      missing.push(result.group);
    }
  }
  return { ok: missing.length === 0, missing };
}
