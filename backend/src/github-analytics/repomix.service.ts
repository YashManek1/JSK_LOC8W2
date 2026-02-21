import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

@Injectable()
export class RepomixService {
  private readonly logger = new Logger(RepomixService.name);

  constructor() {}

  /**
   * Clones a repository, runs repomix to pack it into a single XML-like text file,
   * reads the output, and cleans up the temporary directory.
   * @param githubUrl The full URL to the public GitHub repository
   * @returns string - The packed XML structure of the codebase.
   */
  async packRepository(githubUrl: string): Promise<string> {
    // Basic validation
    if (!githubUrl || !githubUrl.includes('github.com')) {
      throw new BadRequestException(
        'Invalid GitHub URL provided to repomix service.',
      );
    }

    const runId = uuidv4();
    const tmpDir = path.join(process.cwd(), 'tmp', `repo-${runId}`);
    const outputPath = path.join(tmpDir, 'repomix-output.xml');

    try {
      this.logger.log(`[${runId}] Creating temp directory: ${tmpDir}`);
      await fs.mkdir(tmpDir, { recursive: true });

      // 1. Clone the repository shallowly
      this.logger.log(`[${runId}] Cloning repository...`);
      const cloneCmd = `git clone --depth 1 ${githubUrl} .`;
      await execAsync(cloneCmd, { cwd: tmpDir });

      // 2. Run Repomix (Assuming 'npx repomix' is available globally or locally via package loader)
      // We ignore node_modules, Python venvs, build directories, and lock files to save tokens.
      this.logger.log(`[${runId}] Packing codebase with repomix...`);
      const repomixCmd = `npx repomix --style xml -o ${outputPath} --ignore "node_modules,dist,build,.next,venv,env,.venv,*.lock,package-lock.json,yarn.lock,pnpm-lock.yaml"`;
      await execAsync(repomixCmd, { cwd: tmpDir });

      // 3. Read the output file
      this.logger.log(`[${runId}] Reading repomix output...`);
      const packedContent = await fs.readFile(outputPath, 'utf-8');

      // Optional: Basic Plagiarism Signature Check (Look for boilerplate watermarks)
      this.detectPlagiarismSignatures(packedContent, githubUrl);

      return packedContent;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`[${runId}] Repomix packing failed: ${message}`);
      throw new BadRequestException(
        'Failed to pack codebase for analysis. Ensure the repository is public.',
      );
    } finally {
      // 4. Cleanup the temporary directory to avoid disk bloat
      try {
        this.logger.log(`[${runId}] Cleaning up temp directory...`);
        await fs.rm(tmpDir, { recursive: true, force: true });
      } catch {
        this.logger.error(
          `[${runId}] Failed to cleanup temp directory: ${tmpDir}`,
        );
      }
    }
  }

  /**
   * A utility function that scans the packed XML code for obvious boilerplate signatures
   * (e.g., "create-react-app default text", standard Next.js template footprints)
   * If found, logs a warning that admins could surface later.
   */
  private detectPlagiarismSignatures(packedCode: string, repoUrl: string) {
    const suspiciousSignatures = [
      'Edit <code>src/App.js</code> and save to reload.', // CRA
      'Get started by editing <code>pages/index.js</code>', // Next.js
      'This project was bootstrapped with Create React App', // Readme boilerplate
    ];

    let signatureFound = false;
    for (const sig of suspiciousSignatures) {
      if (packedCode.includes(sig)) {
        this.logger.warn(
          `🚩 PLAGIARISM FLAG: Boilerplate signature detected in repo ${repoUrl}. Pattern: "${sig}"`,
        );
        signatureFound = true;
        break;
      }
    }

    return signatureFound;
  }
}
