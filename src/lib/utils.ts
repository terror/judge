import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const punctuate = (s: string): string =>
  s.charAt(s.length - 1) === '.' ? s : s + '.';
