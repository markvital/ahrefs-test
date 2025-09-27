const compactNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const formatMonthlySearchVolume = (value: number): string =>
  compactNumberFormatter.format(value);
