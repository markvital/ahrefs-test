const formatter = new Intl.NumberFormat('en-US');

export function numberWithSeparators(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return formatter.format(value);
}
