export function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function totalMonths(child) {
  return (child.ageYears ?? 0) * 12 + (child.ageMonths ?? 0);
}

export function ageLabel(child) {
  const months = totalMonths(child);
  if (months < 24) {
    if (months % 12 === 0 && months > 0) {
      const y = months / 12;
      return `${y} ${plural(y, 'год', 'года', 'лет')}`;
    }
    return `${months} мес`;
  }
  const years = Math.floor(months / 12);
  return `${years} ${plural(years, 'год', 'года', 'лет')}`;
}
