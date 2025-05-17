export function formatPrice(amount: unknown): string {
  if (!isFormattableNumber(amount)) {
    return '';
  }
  return Intl.NumberFormat('de-CH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function isFormattableNumber(amount: unknown): amount is number {
  if (typeof amount === 'number') {
    return Number.isFinite(amount);
  } else {
    return Number.isFinite(Number(amount));
  }
}
