export const toIsoString = (value: Date | string | number): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }
  return date.toISOString();
};

export const isFutureDate = (value: Date | string | number): boolean => {
  const date = value instanceof Date ? value : new Date(value);
  return date.getTime() > Date.now();
};
