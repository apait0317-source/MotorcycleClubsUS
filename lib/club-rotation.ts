/** Prefer unseen clubs so a rotation replaces the entire visible group. */
export function randomClubGroup(count: number, previous: number[], random = Math.random): number[] {
  const available = Array.from({ length: count }, (_, index) => index).filter(index => !previous.includes(index));
  const selected: number[] = [];
  while (selected.length < Math.min(3, count)) {
    if (!available.length) available.push(...previous.filter(index => index < count && !selected.includes(index)));
    const position = Math.floor(random() * available.length);
    selected.push(...available.splice(position, 1));
  }
  return selected;
}
