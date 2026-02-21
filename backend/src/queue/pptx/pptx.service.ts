/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as JSZip from 'jszip';
import * as xml2js from 'xml2js';
import pdfParse from 'pdf-parse';

export interface PptxContent {
  text: string;
  images: string[];
}

@Injectable()
export class PptxService {
  /**
   * Extract text and images from a .pptx or .pdf file.
   *
   * @param filePath - Absolute path to the file
   */
  async extractPptx(filePath: string): Promise<PptxContent> {
    const ext = filePath.split('.').pop()?.toLowerCase();

    if (ext === 'pdf') {
      const buffer = await fs.readFile(filePath);
      const data = await pdfParse(buffer);
      return { text: data.text.trim(), images: [] };
    }

    const buffer = await fs.readFile(filePath);
    const zip = await JSZip.loadAsync(buffer);

    // 1. Extract text from slides
    const slideRegex = /^ppt\/slides\/slide\d+\.xml$/i;
    const slideFiles = Object.keys(zip.files).filter((name) =>
      slideRegex.test(name),
    );

    // Sort slides numerically
    slideFiles.sort((a, b) => {
      const matchA = a.match(/slide(\d+)/i);
      const matchB = b.match(/slide(\d+)/i);
      const numA = matchA ? parseInt(matchA[1], 10) : 0;
      const numB = matchB ? parseInt(matchB[1], 10) : 0;
      return numA - numB;
    });

    let allText = '';
    for (const slideName of slideFiles) {
      const slideFile = zip.file(slideName);
      if (!slideFile) continue;

      const xml = await slideFile.async('string');
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(xml);

      const slideMatch = slideName.match(/slide(\d+)/i);
      const slideNum = slideMatch ? slideMatch[1] : '?';

      const texts: string[] = [];
      this.extractTexts(result, texts);
      if (texts.length > 0) {
        allText += `\n--- Slide ${slideNum} ---\n` + texts.join('\n') + '\n';
      }
    }

    // 2. Extract images
    const imgRegex = /^ppt\/media\/image\d+\.(png|jpeg|jpg|gif)$/i;
    const imageFiles = Object.keys(zip.files).filter((name) =>
      imgRegex.test(name),
    );

    const images: string[] = [];
    for (const imgName of imageFiles) {
      const imgFile = zip.file(imgName);
      if (!imgFile) continue;

      const imgBuffer = await imgFile.async('nodebuffer');

      // Basic filter: ignore tiny images (likely icons/decorators)
      if (imgBuffer.length < 5000) continue;

      const parts = imgName.split('.');
      const ext = parts.length > 1 ? parts.pop()?.toLowerCase() : undefined;
      let mime = 'image/jpeg';
      if (ext === 'png') mime = 'image/png';
      else if (ext === 'jpeg' || ext === 'jpg') mime = 'image/jpeg';
      else if (ext === 'gif') mime = 'image/gif';

      const b64 = imgBuffer.toString('base64');
      images.push(`data:${mime};base64,${b64}`);
    }

    return { text: allText.trim(), images };
  }

  /**
   * Recursively pull text nodes out of a parsed-XML object.
   */
  private extractTexts(node: any, acc: string[]) {
    if (!node || typeof node !== 'object') return;

    // Direct text value
    if (node['a:t']) {
      const val = typeof node['a:t'] === 'string' ? node['a:t'] : node['a:t']._;
      if (val && val.trim()) acc.push(val.trim());
    }

    // Recurse arrays and objects
    for (const key of Object.keys(node)) {
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach((item) => this.extractTexts(item, acc));
      } else if (typeof child === 'object') {
        this.extractTexts(child, acc);
      }
    }
  }
}
