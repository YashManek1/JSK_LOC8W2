/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as JSZip from 'jszip';
import * as xml2js from 'xml2js';
import pdfParse from 'pdf-parse';

export interface SlideContent {
  text: string;
  images: string[];
  slideCount: number;
}

@Injectable()
export class ShortlistPptService {
  private readonly logger = new Logger(ShortlistPptService.name);

  /** Extract text, images, AND slide count — extends existing PptxService logic */
  async extractWithCount(filePath: string): Promise<SlideContent> {
    const ext = filePath.split('.').pop()?.toLowerCase();

    if (ext === 'pdf') {
      const buffer = await fs.readFile(filePath);
      const data = await pdfParse(buffer);
      return { text: data.text.trim(), images: [], slideCount: 0 };
    }

    const buffer = await fs.readFile(filePath);
    const zip = await JSZip.loadAsync(buffer);

    const slideRegex = /^ppt\/slides\/slide\d+\.xml$/i;
    const slideFiles = Object.keys(zip.files).filter((n) => slideRegex.test(n));

    slideFiles.sort((a, b) => {
      const na = parseInt((a.match(/slide(\d+)/i) || ['', '0'])[1], 10);
      const nb = parseInt((b.match(/slide(\d+)/i) || ['', '0'])[1], 10);
      return na - nb;
    });

    let allText = '';
    for (const slideName of slideFiles) {
      const slideFile = zip.file(slideName);
      if (!slideFile) continue;
      const xml = await slideFile.async('string');
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(xml);
      const num = (slideName.match(/slide(\d+)/i) || ['', '?'])[1];
      const texts: string[] = [];
      this.extractTexts(result, texts);
      if (texts.length > 0) {
        allText += `\n--- Slide ${num} ---\n` + texts.join('\n') + '\n';
      }
    }

        // Vision models are decommissioned by Groq. We no longer extract images
        // to save massive amounts of Node.js memory.
        const images: string[] = [];

        this.logger.log(`  📊 Slides: ${slideFiles.length}, Images: Skipped (Vision deprecated)`);

    return {
      text: allText.trim(),
      images,
      slideCount: slideFiles.length,
    };
  }

  private extractTexts(node: any, acc: string[]) {
    if (!node || typeof node !== 'object') return;
    if (node['a:t']) {
      const val = typeof node['a:t'] === 'string' ? node['a:t'] : node['a:t']._;
      if (val && val.trim()) acc.push(val.trim());
    }
    for (const key of Object.keys(node)) {
      const child = node[key];
      if (Array.isArray(child)) child.forEach((c) => this.extractTexts(c, acc));
      else if (typeof child === 'object') this.extractTexts(child, acc);
    }
  }
}
