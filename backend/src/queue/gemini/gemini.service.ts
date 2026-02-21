/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

export interface ClaimCheckpoint {
  claim: string;
  verified: boolean;
  evidence: string;
}

export interface EvaluationResult {
  score: number;
  exaggerations: string[];
  claimsVerified: ClaimCheckpoint[];
  reality: string;
  prompt: string;
  rawResponse: string;
}

export interface EvaluateArgs {
  pptText?: string;
  pptImages?: string[];
  repoPackedContent: string;
  fileTree: string[];
  readme?: string;
}

// ─────────────────────────────────────────────────────────
//  SYSTEM PROMPT — STRICTLY SKEPTICAL
// ─────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an EXTREMELY STRICT and SKEPTICAL hackathon judge tasked with SCRUTINIZING team submissions. You will receive a team's PPT presentation and their COMPLETE source code. Your job is to ruthlessly verify every feature claim against the actual code.

## YOUR MINDSET
- You are a senior engineer who has seen hundreds of hackathon pitches
- Assume NOTHING works until you find concrete code proof
- Having a file named after a feature does NOT mean the feature is implemented
- Importing a library does NOT mean it's actually used
- A function that EXISTS but has placeholder/TODO content counts as NOT verified
- Config files, SQL schemas, and type definitions alone do NOT prove functionality

## HOW TO VERIFY EACH CLAIM
For EACH feature mentioned in the PPT:
1. Search for the ACTUAL implementation code (not just imports or config)
2. Check if the function/route has REAL business logic (not just return statements, console.logs, or TODOs)
3. Verify the feature is CONNECTED to the rest of the app (imported and called somewhere)
4. Check if endpoints have proper error handling and validation
5. Look for hardcoded/mocked data pretending to be real functionality

## RED FLAGS (deduct points heavily)
- Functions that just return mock/hardcoded data
- Routes that exist but have empty or trivial handlers
- Features mentioned in README but not in any source file
- "AI-powered" claims with no actual AI/ML API calls or model usage
- "Real-time" claims without WebSocket/SSE implementation
- Database schemas that exist but no queries actually use them
- Frontend pages that exist but aren't connected to real endpoints
- Copy-pasted boilerplate from templates (e.g., create-react-app defaults)
- TODO/FIXME/HACK comments in critical feature code

## STRICT SCORING GUIDE
- 85-100: EXCEPTIONAL — Every single claim has working, tested, production-quality code with real business logic. Almost never given.
- 70-84: GOOD — Most claims are genuinely implemented with real logic, only minor features missing.
- 50-69: AVERAGE — Core features exist but several claimed features are incomplete, stubbed, or not connected.
- 30-49: BELOW AVERAGE — Many claims unsupported. Lots of boilerplate/scaffolding passed off as features.
- 15-29: POOR — Mostly empty scaffolding, templates, and exaggerated claims. Very little real code.
- 0-14: FABRICATED — The PPT describes a product that essentially doesn't exist in the code.

## IMPORTANT: Be generous with evidence but STRICT with scoring.
- When marking verified=true: the code must have REAL working logic, not just exist
- When marking verified=false: explain specifically what's missing
- List EVERY exaggeration even if minor

You MUST respond with ONLY valid JSON:
{"score": <0-100>, "claimsVerified": [{"claim": "<specific feature from PPT>", "verified": <true/false>, "evidence": "<exact file:function or explanation of what's missing>"}], "exaggerations": ["<verbatim PPT claim> — <what the code actually shows or doesn't show>"], "reality": "<5-6 sentence brutally honest summary of what this codebase ACTUALLY does, mentioning specific files, functions, and what works vs what doesn't>"}`;

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genai: any = null;

  private getClient(): any {
    if (!this.genai) {
      this.genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return this.genai;
  }

  // ─────────────────────────────────────────────────────────
  //  ROBUST JSON EXTRACTION (handles truncated Gemini output)
  // ─────────────────────────────────────────────────────────
  private extractJSON(raw: string): any {
    if (!raw) return null;
    const text = raw.trim();

    // Strategy 1: Direct parse
    try {
      return JSON.parse(text);
    } catch {
      /* */
    }

    // Strategy 2: Markdown fence
    const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/i);
    if (fenceMatch) {
      try {
        return JSON.parse(fenceMatch[1].trim());
      } catch {
        /* */
      }
    }

    // Strategy 3: Find balanced { ... }
    let depth = 0,
      start = -1;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') {
        if (depth === 0) start = i;
        depth++;
      }
      if (text[i] === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          try {
            return JSON.parse(text.slice(start, i + 1));
          } catch {
            start = -1;
          }
        }
      }
    }

    // Strategy 4: Aggressive truncation repair
    const braceStart = text.indexOf('{');
    if (braceStart !== -1) {
      let candidate = text.slice(braceStart);

      // Close unclosed string
      const quoteCount = (candidate.match(/(?<!\\)"/g) || []).length;
      if (quoteCount % 2 !== 0) {
        const lastQuoteIdx = candidate.lastIndexOf('"');
        const beforeLastQuote = candidate.slice(0, lastQuoteIdx);
        const valueStartIdx = beforeLastQuote.lastIndexOf('"');
        if (valueStartIdx >= 0) {
          candidate = candidate.slice(0, valueStartIdx);
          candidate = candidate.replace(/,\s*$/, '');
        }
      }

      candidate = candidate.replace(/,\s*"[^"]*"\s*:\s*"?[^"{}[\]]*$/, '');
      candidate = candidate.replace(/,\s*"[^"]*"\s*:\s*$/, '');
      candidate = candidate.replace(/,\s*"[^"]*$/, '');
      candidate = candidate.replace(/,\s*$/, '');

      const openBrackets =
        (candidate.match(/\[/g) || []).length -
        (candidate.match(/\]/g) || []).length;
      const openBraces =
        (candidate.match(/\{/g) || []).length -
        (candidate.match(/\}/g) || []).length;
      candidate += ']'.repeat(Math.max(0, openBrackets));
      candidate += '}'.repeat(Math.max(0, openBraces));

      try {
        return JSON.parse(candidate);
      } catch {
        /* */
      }
    }

    // Strategy 5: Regex field extraction (last resort)
    const scoreMatch = text.match(/"score"\s*:\s*(\d+)/);
    if (scoreMatch) {
      const score = parseInt(scoreMatch[1], 10);

      const claimsVerified: ClaimCheckpoint[] = [];
      const claimRegex =
        /\{\s*"claim"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"verified"\s*:\s*(true|false)\s*,\s*"evidence"\s*:\s*"((?:[^"\\]|\\.)*)"\s*\}/g;
      let match: RegExpExecArray | null;
      while ((match = claimRegex.exec(text)) !== null) {
        claimsVerified.push({
          claim: match[1].replace(/\\"/g, '"'),
          verified: match[2] === 'true',
          evidence: match[3].replace(/\\"/g, '"'),
        });
      }

      const exaggerations: string[] = [];
      const exMatch = text.match(/"exaggerations"\s*:\s*\[([\s\S]*?)(?:\]|$)/);
      if (exMatch) {
        const items = exMatch[1].match(/"((?:[^"\\]|\\.)*)"/g);
        if (items)
          items.forEach((s) =>
            exaggerations.push(s.replace(/^"|"$/g, '').replace(/\\"/g, '"')),
          );
      }

      const realityMatch = text.match(/"reality"\s*:\s*"((?:[^"\\]|\\.)*)"$/ms);
      const reality = realityMatch
        ? realityMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n')
        : '';

      this.logger.log(
        `    🔧 Regex extraction: score=${score}, claims=${claimsVerified.length}`,
      );
      return { score, claimsVerified, exaggerations, reality };
    }

    return null;
  }

  // ─────────────────────────────────────────────────────────
  //  PROMPT BUILDER (capped at ~150K chars to leave room)
  // ─────────────────────────────────────────────────────────
  private buildPromptText({
    pptText,
    repoPackedContent,
    fileTree,
    readme,
  }: {
    pptText?: string;
    repoPackedContent: string;
    fileTree: string[];
    readme?: string;
  }): string {
    const MAX_CODE_SIZE = 150_000;

    let code = repoPackedContent || '';
    if (code.length > MAX_CODE_SIZE) {
      code =
        code.slice(0, MAX_CODE_SIZE) +
        '\n\n[... codebase truncated to fit context window ...]';
      this.logger.log(
        `    ✂️  Codebase trimmed from ${repoPackedContent.length} → ${MAX_CODE_SIZE} chars`,
      );
    }

    let prompt = `## PPT CLAIMS\n${pptText || '(no text)'}\n\n## SOURCE FILES (${fileTree.length} files)\n${fileTree.join('\n')}\n\n## SOURCE CODE\n${code}`;

    if (readme && readme !== '(README not found)') {
      prompt += `\n\n## README\n${readme.slice(0, 10000)}`;
    }

    return prompt;
  }

  // ─────────────────────────────────────────────────────────
  //  MAIN EVALUATION FUNCTION
  // ─────────────────────────────────────────────────────────
  async evaluateWithGemini({
    pptText,
    pptImages,
    repoPackedContent,
    fileTree,
    readme,
  }: EvaluateArgs): Promise<EvaluationResult> {
    const client = this.getClient();

    const promptText = this.buildPromptText({
      pptText,
      repoPackedContent,
      fileTree,
      readme,
    });

    const parts: any[] = [{ text: promptText }];

    // Add up to 5 images
    const limitedImages = (pptImages || []).slice(0, 5);
    for (const dataUri of limitedImages) {
      const [meta, data] = dataUri.split(',');
      const mimeMatch = meta.match(/data:(.+);base64/);
      if (mimeMatch && data) {
        parts.push({ inlineData: { mimeType: mimeMatch[1], data } });
      }
    }

    this.logger.log(`    📝 Prompt length: ${promptText.length} chars`);
    this.logger.log(
      `    📁 Codebase in prompt: ${Math.min(repoPackedContent?.length || 0, 150000)} chars`,
    );
    this.logger.log(`    🖼️  Images sent: ${limitedImages.length}`);

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.2,
        maxOutputTokens: 16384,
        responseMimeType: 'application/json',
      },
    });

    const raw: string = response.text || '';
    this.logger.log(`    📨 Response length: ${raw.length} chars`);
    this.logger.log(`    📨 Preview: ${raw.substring(0, 400)}`);

    const parsed = this.extractJSON(raw);

    if (parsed && typeof parsed.score === 'number') {
      const claims: ClaimCheckpoint[] = Array.isArray(parsed.claimsVerified)
        ? parsed.claimsVerified
        : [];
      const exags: string[] = Array.isArray(parsed.exaggerations)
        ? parsed.exaggerations
        : [];

      this.logger.log(
        `    ✅ Parsed — score: ${parsed.score}, claims: ${claims.length}, exaggerations: ${exags.length}`,
      );

      return {
        score: Math.max(0, Math.min(100, Math.round(parsed.score))),
        exaggerations: exags,
        claimsVerified: claims,
        reality: String(parsed.reality || ''),
        prompt: promptText,
        rawResponse: raw,
      };
    }

    this.logger.error('    ⚠️  All extraction strategies failed.');
    this.logger.error(`    📨 Full response: ${raw}`);

    return {
      score: 0,
      exaggerations: ['AI response could not be parsed — see raw response'],
      claimsVerified: [],
      reality: raw.slice(0, 2000),
      prompt: promptText,
      rawResponse: raw,
    };
  }

  // ─────────────────────────────────────────────────────────
  //  SIMPLE TEXT GENERATION (used by ProfileService etc.)
  // ─────────────────────────────────────────────────────────
  async generateText(prompt: string): Promise<string> {
    const client = this.getClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.3, maxOutputTokens: 8192 },
    });
    return response.text || '';
  }
}
