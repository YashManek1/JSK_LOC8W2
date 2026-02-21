import { Injectable } from '@nestjs/common';

export interface AtsResult {
  matchedKws: string[];
  missedKws: string[];
  matchPct: number; // 0–100
}

@Injectable()
export class AtsService {
  /**
   * Deterministic keyword & domain match against extracted resume text.
   * Case-insensitive, whole-word-ish match (checks if text contains the keyword).
   */
  matchKeywords(
    resumeText: string,
    keywords: string[],
    domains: string[],
  ): AtsResult {
    const allTerms = [...new Set([...keywords, ...domains])].filter(Boolean);
    if (allTerms.length === 0) {
      return { matchedKws: [], missedKws: [], matchPct: 0 };
    }

    const lowerText = resumeText.toLowerCase();
    const matchedKws: string[] = [];
    const missedKws: string[] = [];

    for (const term of allTerms) {
      const lowerTerm = term.toLowerCase().trim();
      if (lowerTerm && lowerText.includes(lowerTerm)) {
        matchedKws.push(term);
      } else {
        missedKws.push(term);
      }
    }

    const matchPct = Math.round((matchedKws.length / allTerms.length) * 100);
    return { matchedKws, missedKws, matchPct };
  }
}
