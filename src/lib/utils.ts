import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { CODE_STORAGE_KEY, LANGUAGE_STORAGE_KEY } from './constants';

export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const punctuate = (s: string): string =>
  s.charAt(s.length - 1) === '.' ? s : s + '.';

export const storeCode = (
  problemId: string,
  language: string,
  code: string
): void => {
  const storedData = localStorage.getItem(CODE_STORAGE_KEY);

  let codeMap = storedData ? JSON.parse(storedData) : {};

  codeMap[`${problemId}-${language}`] = code;

  localStorage.setItem(CODE_STORAGE_KEY, JSON.stringify(codeMap));
};

export const getStoredCode = (
  problemId: string,
  language: string
): string | null => {
  const storedData = localStorage.getItem(CODE_STORAGE_KEY);

  if (storedData) {
    const codeMap = JSON.parse(storedData);
    return codeMap[`${problemId}-${language}`] || null;
  }

  return null;
};

export const storeLanguage = (problemId: string, language: string): void => {
  const storedData = localStorage.getItem(LANGUAGE_STORAGE_KEY);

  let languageMap = storedData ? JSON.parse(storedData) : {};

  languageMap[problemId] = language;

  localStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(languageMap));
};

export const getStoredLanguage = (problemId: string): string | null => {
  const storedData = localStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (storedData) {
    const languageMap = JSON.parse(storedData);
    return languageMap[problemId] || null;
  }

  return null;
};
