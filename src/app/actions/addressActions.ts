'use server';

import { findBestMatch } from '@/lib/fuzzy-search';

export async function checkAddressTypo(input: string) {
  if (!input || input.length < 3) return null;

  // Simulate slight search delay
  // await new Promise(r => setTimeout(r, 100));

  const suggestion = findBestMatch(input);
  return suggestion;
}
