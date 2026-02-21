import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import pdfParse from 'pdf-parse';
import { GeminiService } from '../queue/gemini/gemini.service';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private geminiService: GeminiService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.participant.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        college: true,
        role: true,
        githubUrl: true,
        linkedinUrl: true,
        primarySkillset: true,
        education: true,
        projects: true,
        workExperience: true,
        positionOfResponsibility: true,
        achievements: true,
        certifications: true,
        socialLinks: true,
        hackathonPreferences: true,
        tagline: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: any) {
    const user = await this.prisma.participant.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.participant.update({
      where: { id: userId },
      data: {
        ...data,
      },
    });

    return updatedUser;
  }

  async extractResumeData(userId: string, resumeFile: Express.Multer.File) {
    let text = '';
    try {
      const pdfData = await pdfParse(resumeFile.buffer);
      text = pdfData.text;
    } catch (e) {
      throw new Error('Failed to parse PDF resume');
    }

    // Use Gemini to extract structured data
    const prompt = `
      Extract the following information from the resume text and return it as a JSON object:
      - education: Array of objects with { institution, degree, year }
      - skills: Array of strings
      - projects: Array of objects with { title, description }
      - workExperience: Array of objects with { company, role, duration, description }
      - achievements: Array of strings
      - certifications: Array of strings

      Resume Text:
      ${text}
    `;

    const aiResponse = await this.geminiService.generateText(prompt);

    let extractedData: any = {};
    try {
      // Clean up markdown formatting if present
      const jsonStr = aiResponse
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      extractedData = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse Gemini response:', aiResponse);
      throw new Error('Failed to extract data from resume');
    }

    // Update the user's profile with the extracted data
    await this.prisma.participant.update({
      where: { id: userId },
      data: {
        education: extractedData.education || [],
        primarySkillset: extractedData.skills || [],
        projects: extractedData.projects || [],
        workExperience: extractedData.workExperience || [],
        achievements: extractedData.achievements || [],
        certifications: extractedData.certifications || [],
      },
    });

    return { message: 'Resume processed successfully', extractedData };
  }
}
