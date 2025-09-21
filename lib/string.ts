export function formatTaxonomyId(value: string): string {
  const cleaned = value.replace(/^[a-z]{2,3}:/i, '');
  return cleaned
    .split(/[-_]/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export function compact<T>(values: (T | undefined | null | false)[]): T[] {
  return values.filter(Boolean) as T[];
}
