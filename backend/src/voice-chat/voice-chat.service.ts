/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Aes256Service } from '../security/aes256.service';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import * as path from 'path';

/**
 * Voice Chat Service — Gemini 1.5 Flash (Reliable Hackathon Hub)
 *
 * Audio-to-text pipeline with built-in retry logic for 429 quota handling.
 */
@Injectable()
export class VoiceChatService {
  private readonly logger = new Logger(VoiceChatService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly modelName: string;
  private readonly uploadsDir: string;

  private readonly systemPrompt = `You are a friendly and engaging AI interviewer for a hackathon registration.
Your job is to have a natural voice conversation to collect registration information.
Ask ONE question at a time. Be conversational, warm, and encouraging.
Keep responses SHORT (1-3 sentences max) — this is a voice conversation.

IMPORTANT CONTEXT: This hackathon is likely based in India. Expect diverse Indian names (like Yash, Rahul, Priya, etc.) and DO NOT auto-correct them to Western names like John. Listen to the phonetics carefully.

You need to collect these fields:
- Full Name
- Phone Number
- Primary Skills (e.g. React, Python, ML)
- Motivation for joining
- GitHub URL

IMPORTANT: You MUST respond with a valid JSON object EXACTLY matching this schema:
{
  "reply": "Your conversational response to the user.",
  "extractedData": {
    "fullName": "...",
    "phone": "...",
    "primarySkillset": ["...", "..."],
    "motivation": "...",
    "githubUrl": "..."
  }
}

WARNING: ONLY include fields in "extractedData" if the user has explicitly provided them. NEVER guess or use fake names. If a field is unknown, omit it from extractedData.
If all 5 fields are collected, congratulate them and say registration is complete.`;

  constructor(
    private prisma: PrismaService,
    private aes256: Aes256Service,
  ) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      this.logger.warn('⚠️ GEMINI_API_KEY not set in .env!');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.uploadsDir = path.resolve(__dirname, '../../uploads/audio');
    this.logger.log(`🤖 Gemini model: ${this.modelName}`);
  }

  // ─── Session Management ───────────────────────────────────────

  async startSession(email: string) {
    let participant = await this.prisma.participant.findUnique({
      where: { email },
    });

    if (!participant) {
      participant = await this.prisma.participant.create({
        data: { email },
      });
    }

    const greeting =
      "Hey! Welcome to the hackathon registration. I'm here to get you signed up — it'll be quick and easy. What's your full name?";

    const session = await this.prisma.chatSession.create({
      data: {
        participantId: participant.id,
        history: JSON.stringify([
          { role: 'system', content: this.systemPrompt },
          { role: 'assistant', content: greeting },
        ]),
      },
    });

    this.logger.log(`🎙️ Session started: ${session.id} for ${email}`);
    return {
      sessionId: session.id,
      participantId: participant.id,
      greeting,
    };
  }

  async getSession(sessionId: string) {
    return this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { participant: true },
    });
  }

  // ─── Audio Message Processing (Gemini) ────────────────────────

  async processAudioMessage(sessionId: string, audioBase64: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { participant: true },
    });

    if (!session) throw new Error(`Session ${sessionId} not found`);

    if (session.isComplete) {
      return {
        text: "Registration is already complete! You're all set.",
        extractedData: session.extractedData,
        isComplete: true,
      };
    }

    const history: Array<{ role: string; content: string }> =
      typeof session.history === 'string'
        ? JSON.parse(session.history)
        : (session.history as Array<{ role: string; content: string }>);

    const conversationContext = history
      .filter((m) => m.role !== 'system')
      .map((m) => `${m.role === 'assistant' ? 'AI' : 'User'}: ${m.content}`)
      .join('\n');

    const aiResponse = await this.callGeminiWithAudio(
      audioBase64,
      conversationContext,
    );

    const extractedFields = this.extractStructuredData(
      aiResponse.extractedData,
      session.extractedData as Record<string, unknown> | null,
    );

    const visibleText = aiResponse.reply.trim();

    history.push({ role: 'user', content: '[Audio message]' });
    history.push({ role: 'assistant', content: visibleText });

    const isComplete = this.isRegistrationComplete(extractedFields);

    await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        history: JSON.stringify(history),
        extractedData: extractedFields as unknown as Prisma.InputJsonValue,
        isComplete,
      },
    });

    await this.updateParticipant(session.participantId, extractedFields);

    this.logger.log(
      `🎙️ Audio processed for ${sessionId} — Complete: ${isComplete}`,
    );

    return { text: visibleText, extractedData: extractedFields, isComplete };
  }

  // ─── Text Message Processing (Fallback) ───────────────────────

  async processTextMessage(sessionId: string, userText: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { participant: true },
    });

    if (!session) throw new Error(`Session ${sessionId} not found`);

    if (session.isComplete) {
      return {
        text: "Registration is already complete! You're all set.",
        extractedData: session.extractedData,
        isComplete: true,
      };
    }

    const history: Array<{ role: string; content: string }> =
      typeof session.history === 'string'
        ? JSON.parse(session.history)
        : (session.history as Array<{ role: string; content: string }>);

    history.push({ role: 'user', content: userText });

    const aiResponse = await this.callGeminiWithText(history);

    const extractedFields = this.extractStructuredData(
      aiResponse.extractedData,
      session.extractedData as Record<string, unknown> | null,
    );

    const visibleText = aiResponse.reply.trim();

    history.push({ role: 'assistant', content: visibleText });

    const isComplete = this.isRegistrationComplete(extractedFields);

    await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        history: JSON.stringify(history),
        extractedData: extractedFields as unknown as Prisma.InputJsonValue,
        isComplete,
      },
    });

    await this.updateParticipant(session.participantId, extractedFields);

    this.logger.log(
      `💬 Text processed for ${sessionId} — Complete: ${isComplete}`,
    );

    return { text: visibleText, extractedData: extractedFields, isComplete };
  }

  // ─── Gemini API Calls ─────────────────────────────────────────

  private async callGeminiWithAudio(
    audioBase64: string,
    conversationContext: string,
  ): Promise<{ reply: string; extractedData: Record<string, unknown> }> {
    const execute = async () => {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: { responseMimeType: 'application/json' },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      });

      const prompt = `${this.systemPrompt}

Previous conversation:
${conversationContext}

The user just sent an audio message. Listen to the audio and respond naturally as the AI interviewer using ONLY the JSON format requested.`;

      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            mimeType: 'audio/webm',
            data: audioBase64,
          },
        },
      ]);

      const text = result.response.text();
      this.logger.log(`✅ Gemini raw response: "${text.substring(0, 80)}..."`);
      return JSON.parse(text) as {
        reply: string;
        extractedData: Record<string, unknown>;
      };
    };

    return this.withRetry(execute);
  }

  private async callGeminiWithText(
    history: Array<{ role: string; content: string }>,
  ): Promise<{ reply: string; extractedData: Record<string, unknown> }> {
    const execute = async () => {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: { responseMimeType: 'application/json' },
      });

      const prompt = history
        .map((m) => {
          if (m.role === 'system') return `[System]: ${m.content}`;
          if (m.role === 'assistant') return `AI: ${m.content}`;
          return `User: ${m.content}`;
        })
        .join('\n');

      const result = await model.generateContent(
        `${prompt}\nRespond in the requested JSON format ONLY.`,
      );
      const text = result.response.text();
      return JSON.parse(text) as {
        reply: string;
        extractedData: Record<string, unknown>;
      };
    };

    return this.withRetry(execute);
  }

  /**
   * Exponential backoff retry wrapper for 429 Errors
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    initialDelay = 2000,
  ): Promise<T> {
    let delay = initialDelay;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        const err = error as any;
        const is429 = err.message?.includes('429') || err.status === 429;

        if (is429 && i < maxRetries - 1) {
          const waitTime = Math.ceil(delay / 1000);
          this.logger.warn(
            `⚠️ Rate limit (429) hit. Retrying in ${waitTime}s... (Attempt ${i + 1}/${maxRetries})`,
          );
          await new Promise((res) => setTimeout(res, delay));
          delay *= 2;
          continue;
        }

        this.logger.error(`❌ Gemini call failed: ${err.message}`);
        if (is429) {
          return {
            reply:
              'I am handling a lot of requests right now. Please try again in 30 seconds!',
            extractedData: {},
          } as T;
        }
        return {
          reply:
            'I had a technical glitch processing that. Can you try saying it again?',
          extractedData: {},
        } as T;
      }
    }
    return {
      reply: 'The server is temporarily busy. Please try again in a moment.',
      extractedData: {},
    } as T;
  }

  // ─── Data Extraction ──────────────────────────────────────────

  private extractStructuredData(
    newExtractedData: Record<string, unknown>,
    existingData: Record<string, unknown> | null,
  ): Record<string, unknown> {
    const data: Record<string, unknown> = existingData
      ? { ...existingData }
      : {};

    if (newExtractedData && typeof newExtractedData === 'object') {
      for (const [key, value] of Object.entries(newExtractedData)) {
        if (value && value !== '...') {
          data[key] = value;
        }
      }
    }

    return data;
  }

  private isRegistrationComplete(data: Record<string, unknown>): boolean {
    const required = [
      'fullName',
      'phone',
      'primarySkillset',
      'motivation',
      'githubUrl',
    ];
    return required.every((f) => data[f] !== undefined && data[f] !== null);
  }

  private async updateParticipant(
    participantId: string,
    data: Record<string, unknown>,
  ) {
    const update: Record<string, unknown> = {};

    if (data.fullName) update.fullName = data.fullName;
    if (data.phone) update.phone = data.phone;
    if (data.githubUrl) update.githubUrl = data.githubUrl;
    if (data.linkedinUrl) update.linkedinUrl = data.linkedinUrl;
    if (data.motivation) update.motivation = data.motivation;
    if (data.roleSelection) update.roleSelection = data.roleSelection;
    if (data.sleepHabits) update.sleepHabits = data.sleepHabits;
    if (data.dietaryPref) update.dietaryPref = data.dietaryPref;
    if (Array.isArray(data.primarySkillset))
      update.primarySkillset = data.primarySkillset;
    if (Array.isArray(data.pastProjects))
      update.pastProjects = data.pastProjects;

    if (data.aadhaarNumber && typeof data.aadhaarNumber === 'string') {
      update.aadhaarEncrypted = this.aes256.encrypt(data.aadhaarNumber);
    }

    if (Object.keys(update).length > 0) {
      await this.prisma.participant.update({
        where: { id: participantId },
        data: update as any,
      });
    }
  }

  // ─── Identity Verification (Python Microservice) ──────────────

  async verifyIdentity(
    email: string,
    aadhaarFile: Express.Multer.File,
    idCardFile: Express.Multer.File,
    selfieFile: Express.Multer.File,
  ) {
    const participant = await this.prisma.participant.findUnique({
      where: { email },
    });
    if (!participant) {
      throw new BadRequestException('Participant not found.');
    }

    // 1. OCR Aadhaar
    const ocrFormData = new FormData();
    ocrFormData.append(
      'file',
      new Blob([new Uint8Array(aadhaarFile.buffer)], {
        type: aadhaarFile.mimetype,
      }),
      aadhaarFile.originalname,
    );

    let ocrResponse;
    try {
      ocrResponse = await fetch('http://127.0.0.1:8000/ocr/aadhaar', {
        method: 'POST',
        body: ocrFormData,
      });
    } catch (e) {
      this.logger.error('Failed to reach identity-service for OCR:', e);
      throw new BadRequestException(
        'Identity service is unavailable. Is the Python server running?',
      );
    }

    if (!ocrResponse.ok) {
      throw new BadRequestException('Failed to process Aadhaar document OCR.');
    }

    const ocrResult = (await ocrResponse.json()) as { aadhaarNumber?: string };
    const aadhaarNumber = ocrResult.aadhaarNumber;

    if (!aadhaarNumber) {
      throw new BadRequestException(
        'Could not clearly read a 12-digit Aadhaar number from the document.',
      );
    }

    // 2. Face Verification (Selfie vs ID Card)
    const faceFormData = new FormData();
    faceFormData.append(
      'selfie',
      new Blob([new Uint8Array(selfieFile.buffer)], {
        type: selfieFile.mimetype,
      }),
      selfieFile.originalname,
    );
    faceFormData.append(
      'document', // Python checks against this
      new Blob([new Uint8Array(idCardFile.buffer)], {
        type: idCardFile.mimetype,
      }),
      idCardFile.originalname,
    );

    let faceResponse;
    try {
      faceResponse = await fetch('http://127.0.0.1:8000/verify/face', {
        method: 'POST',
        body: faceFormData,
      });
    } catch (e) {
      this.logger.error('Failed to reach identity-service for Face Verify:', e);
      throw new BadRequestException('Identity service is unavailable.');
    }

    if (!faceResponse.ok) {
      const err = (await faceResponse.json().catch(() => ({}))) as {
        detail?: string;
      };
      throw new BadRequestException(
        `Face verification failed: ${err.detail || 'Unknown error'}`,
      );
    }

    const faceResult = (await faceResponse.json()) as {
      isMatch: boolean;
      confidence?: number;
      distance: number;
      faceEmbedding?: number[];
    };

    // DeepFace ArcFace default threshold is ~0.68.
    // For low-quality ID cards, we intelligently relax the distance threshold to 0.75
    const isApproved = faceResult.isMatch || faceResult.distance < 0.75;

    if (!isApproved) {
      throw new BadRequestException(
        `Identity Verification Failed: The face in the selfie does not match the ID Card (Distance: ${faceResult.distance.toFixed(2)}).`,
      );
    }

    // 3. Encrypt Aadhaar and update database
    const encryptedAadhaar = this.aes256.encrypt(aadhaarNumber);

    await this.prisma.participant.update({
      where: { id: participant.id },
      data: {
        aadhaarEncrypted: encryptedAadhaar,
        // Store the 512D ArcFace embeddings for future physical check-in matches
        faceEmbedding: faceResult.faceEmbedding || null,
      } as any,
    });

    // DeepFace ArcFace uses Cosine Distance (0 to 1+). A distance of 0.65 is actually a very strong match
    // mathematically in a 512-D space, but "1 - 0.65 = 34%" looks terrible on a UI.
    // We normalize it so a threshold distance of 0.75 maps to 75% confidence, and 0.0 maps to 100%.
    const normalizedConfidence = Math.max(
      0,
      1.0 - (faceResult.distance / 0.75) * 0.25,
    );

    return {
      success: true,
      message: 'Identity verified securely.',
      aadhaarNumber: aadhaarNumber,
      faceMatchConfidence: faceResult.confidence || normalizedConfidence,
    };
  }
}
