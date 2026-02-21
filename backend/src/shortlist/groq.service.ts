/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';

export interface CriterionResult {
    score: number;      // 1–10 (strict — 8+ = exceptional only)
    reason: string;     // one sentence XAI
}

export interface PptEvalResult {
    scores: Record<string, CriterionResult>;
    finalScore: number;   // 0–100 weighted
    rawText: string;
}

const DEFAULT_WEIGHTS: Record<string, number> = {
    problemRelevance: 25,
    innovation: 25,
    technicalDepth: 20,
    marketImpact: 15,
    slideQuality: 15,
};

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private client: Groq;

  constructor() {
    this.client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

    /**
     * Evaluate a hackathon PPT with strict 5-factor scoring.
     * Weights come from admin config; fallback to DEFAULT_WEIGHTS.
     * Images (base64 slides) are passed to the vision model for layout scoring.
     */
    async evaluatePpt({
        pptText,
        images = [],
        problemStatement,
        scoringWeights,
        domains,
        teamName,
    }: {
        pptText: string;
        images?: string[];
        problemStatement: string;
        scoringWeights: Record<string, number>;
        domains: string[];
        teamName: string;
    }): Promise<PptEvalResult> {
        const weights = { ...DEFAULT_WEIGHTS, ...scoringWeights };
        const criteria = Object.keys(weights);
        const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0) || 100;

        const criteriaBlock = criteria
            .map(c => `  "${c}": { "score": <integer 1-10>, "reason": "<one strict sentence why>" }`)
            .join(',\n');

        const systemPrompt = `You are an elite hackathon judge for a highly competitive hackathon. Your job is to score teams STRICTLY and CRITICALLY.

SCORING PHILOSOPHY:
- Scores 1–4: Weak/incomplete/vague
- Score 5: Average — minimum viable idea with basic execution
- Scores 6–7: Good — shows genuine effort, some depth
- Scores 8–9: Excellent — clear differentiation, depth, real execution
- Score 10: Exceptional — reserved for truly outstanding work (rare)

CRITICAL RULES:
1. Penalize buzzword abuse (AI/ML/blockchain/Web3 without technical depth): subtract 2 from that criterion
2. Penalize vague problem statements ("we will help everyone do everything better"): score ≤ 4
3. Penalize slides with only text walls or no architecture diagram: slideQuality ≤ 5
4. If innovation is a clone of an existing product with no twist: innovation ≤ 4
5. If no market data/sizing/personas shown: marketImpact ≤ 5
6. ALWAYS respond with ONLY valid JSON — no markdown, no preamble.`;

        const userPrompt = `TEAM: ${teamName}

HACKATHON PROBLEM STATEMENT:
${problemStatement || 'Build an innovative solution to a real-world problem.'}

TARGET DOMAINS: ${domains.join(', ') || 'Open'}

SCORING CRITERIA & WEIGHTS (score each 1–10 independently):
${criteria.map(c => `  ${c}: ${weights[c]}% weight`).join('\n')}

PPT CONTENT (extracted text from all slides):
${pptText.slice(0, 10000)}

${images.length > 0 ? `SLIDE IMAGES: ${images.length} slide images provided — also judge visual quality, diagram clarity, and information density.` : ''}

Respond ONLY with this exact JSON (no markdown):
{
  "scores": {
${criteriaBlock}
  }
}`;

        try {
            // Vision models are currently decommissioned by Groq. Falling back to text-only evaluation.
            const messages: any[] = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ];

            const model = 'llama-3.3-70b-versatile';

            const response = await this.client.chat.completions.create({
                model,
                messages,
                temperature: 0.1,   // Very low temp for reproducible strict scoring
                max_tokens: 1200,
                response_format: { type: 'json_object' },
            });

            const raw = response.choices[0]?.message?.content || '{}';
            this.logger.log(`[Groq] ${teamName} raw: ${raw.substring(0, 300)}`);
            const parsed = JSON.parse(raw);
            const rawScores: Record<string, CriterionResult> = parsed.scores || {};

            // Normalise + clamp + compute weighted finalScore
            let weightedSum = 0;
            for (const [crit, w] of Object.entries(weights)) {
                const raw = rawScores[crit];
                const score = typeof raw === 'object' ? raw.score : (typeof raw === 'number' ? raw : 5);
                const clamped = Math.max(1, Math.min(10, Math.round(score)));
                rawScores[crit] = {
                    score: clamped,
                    reason: typeof raw === 'object' ? raw.reason : 'No reason provided.',
                };
                weightedSum += clamped * w;
            }
            const finalScore = Math.round((weightedSum / totalWeight / 10) * 100);

            return { scores: rawScores, finalScore, rawText: raw };
        } catch (err: any) {
            this.logger.error(`[Groq] ${teamName} FAILED: ${err.message}`);
            throw err;
        }
    }

    /**
     * Re-compute finalScore from already-stored raw criterion scores + new weights.
     * Used when admin changes scoring weights after evaluation.
     */
    recomputeFinalScore(
        rawScores: Record<string, CriterionResult>,
        weights: Record<string, number>,
    ): number {
        const w = { ...DEFAULT_WEIGHTS, ...weights };
        const totalWeight = Object.values(w).reduce((a, b) => a + b, 0) || 100;
        let weightedSum = 0;
        for (const [crit, weight] of Object.entries(w)) {
            const raw = rawScores[crit];
            const score = raw?.score ?? 5;
            weightedSum += score * weight;
        }
        return Math.round((weightedSum / totalWeight / 10) * 100);
    }
}
