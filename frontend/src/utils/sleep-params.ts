/**
 * Sleep parameter utilities
 * Shared utilities for formatting and color coding sleep parameters
 */

export type ColorCode = 'red' | 'yellow' | 'green';

export const parseTimeToMinutes = (timeString: string): number => {
  if (!timeString || !timeString.includes(':')) {
    return 0;
  }
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

export const formatMinutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

export const getTIBColor = (tibMinutes: number): ColorCode => {
  const tibHours = tibMinutes / 60;
  return tibHours <= 6 ? 'red' : 'green';
};

export const getSOLColor = (solMinutes: number): ColorCode => {
  return solMinutes >= 30 ? 'red' : 'green';
};

export const getAwakeningsColor = (awakenings: number): ColorCode => {
  if (awakenings >= 0 && awakenings <= 2) return 'green';
  if (awakenings >= 3 && awakenings <= 4) return 'yellow';
  return 'red';
};

export const getWASOColor = (wasoMinutes: number): ColorCode => {
  if (wasoMinutes >= 0 && wasoMinutes <= 29) return 'green';
  if (wasoMinutes >= 30 && wasoMinutes <= 59) return 'yellow';
  return 'red';
};

export const getTSTColor = (tstMinutes: number, tibMinutes: number): ColorCode => {
  if (tibMinutes === 0) return 'red';
  const tstPercentage = (tstMinutes / tibMinutes) * 100;
  if (tstPercentage >= 0 && tstPercentage <= 74) return 'red';
  if (tstPercentage >= 75 && tstPercentage <= 84) return 'yellow';
  return 'green';
};

export const getActivityColor = (activity: number): ColorCode => {
  return activity >= 0 && activity <= 29 ? 'red' : 'green';
};

export const getAlcoholColor = (alcohol: number): ColorCode => {
  return alcohol === 0 ? 'green' : 'yellow';
};

export const getDaylightColor = (daylight: number): ColorCode => {
  if (daylight >= 0 && daylight <= 9) return 'red';
  if (daylight >= 10 && daylight <= 29) return 'yellow';
  return 'green';
};

export const getColorClass = (color: ColorCode): string => {
  switch (color) {
    case 'red':
      return 'color-red';
    case 'yellow':
      return 'color-yellow';
    case 'green':
      return 'color-green';
    default:
      return '';
  }
};

