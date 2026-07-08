export function normalizeTerritoryKey(value: string | undefined | null): string {
  if (!value) return ''
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function territoryKeysMatch(a: string | undefined | null, b: string | undefined | null): boolean {
  const left = normalizeTerritoryKey(a)
  const right = normalizeTerritoryKey(b)
  if (!left || !right) return false
  return left === right || left.includes(right) || right.includes(left)
}
