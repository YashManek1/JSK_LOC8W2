import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import Groq from 'groq-sdk';

@Injectable()
export class GroqSecondaryService {
  private readonly logger = new Logger(GroqSecondaryService.name);
  private groq: Groq;

  constructor() {
    // Critical: Using the Secondary API Key to isolate rate limits during massive codebase unpacking
    const apiKey = process.env.GROQ_API_KEY_SECONDARY;
    if (!apiKey) {
      this.logger.error(
        'CRITICAL: GROQ_API_KEY_SECONDARY is not set in environment variables!',
      );
      throw new BadRequestException(
        'Database analysis rate limits not configured (Missing secondary key).',
      );
    }

    this.groq = new Groq({ apiKey });
  }

  /**
   * Processes an entire repository's XML structure to detect which features were actually built
   * versus what the team claimed they built in their problem statement.
   *
   * @param repomixOutput The packed XML codebase representation
   * @param problemStatement The team's original pitch / problem statement
   */
  async evaluateCodebaseImplementations(
    repomixOutput: string,
    problemStatement: string,
    contributors: any[] = [],
  ) {
    this.logger.log(
      `Evaluating ${repomixOutput.length} characters of Codebase + Commits against Problem Statement...`,
    );

    const systemPrompt = `
You are a strict, senior technical lead evaluating a hackathon team's actual written code.
You will be given the team's "Pitched Problem Statement", the developers' commit history, and a massively concatenated XML string containing their entire codebase.

YOUR JOB IS TO DETERMINE WHAT THEY ACTUALLY BUILT AND WHO BUILT IT. 
Look for active controllers, real database models, actual integrated frontend components, and functioning logic.
Compare the literal code structures with the commit messages provided for each author. 

Generate a JSON response that STRICTLY follows this structure (do NOT deviate):
{
    "implementedFeatures": ["Array", "of", "strings", "describing", "actual working features"],
    "missingPitchedFeatures": ["Array", "of", "claims", "they made", "but never coded"],
    "relevanceScore": <Number between 1-100 indicating how much of their pitch actually exists in the code>,
    "developerMapping": [
        {
            "author": "<The exact GitHub username from the commits list>",
            "features": ["Specific feature string they built (e.g., 'JWT Authentication', 'UI Dashboard')"]
        }
    ]
}

- Every implemented feature MUST be mapped to the specific developer who built it based on their commit messages!
- If a developer has no substantive commits, give them an empty "features" array.
- You must return ONLY the raw JSON object. No markdown wrappers (\`\`\`json). No explanations.
`;

    // Strip everything but author and messages to save LLM context
    const strippedCommits = contributors.map((c) => ({
      author: c.author,
      commitCount: c.commits,
      commits: (c.commitMessages || []).slice(0, 50), // Only take latest 50 for cost/context
    }));

    const userPrompt = `
PITCHED PROBLEM STATEMENT:
${problemStatement}

=== DEVELOPER COMMIT HISTORIES ===
${JSON.stringify(strippedCommits, null, 2)}

=== ACTUAL PACKED CODEBASE ===
${repomixOutput}
`;

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        model: 'llama-3.3-70b-versatile', // using a heavy model for deep codebase analysis
        temperature: 0.1, // keep it strictly factual
        max_tokens: 2000,
      });

      const content = completion.choices[0]?.message?.content || '{}';

      // Clean Markdown wrapper if the LLM leaked them
      const cleanedContent = content
        .trim()
        .replace(/^```json/i, '')
        .replace(/```$/i, '');

      const parsed = JSON.parse(cleanedContent);
      return parsed;
    } catch (error: any) {
      this.logger.error(`Groq Secondary evaluation failed: ${error.message}`);
      throw new BadRequestException('Failed to analyze codebase via AI');
    }
  }
}
