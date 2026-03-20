import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import * as path from 'path';

const FALLBACK = "I'm having trouble responding right now. Please try again or reach out via email.";

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class ChatService {
  private readonly DATA_DIR = path.join(__dirname, '..', 'data');

  constructor(private readonly httpService: HttpService) {}

  private loadAllMarkdown(): string {
    const sections = ['bio', 'experience', 'stack', 'ambitions'];
    let content = '';

    for (const section of sections) {
      const filePath = path.join(this.DATA_DIR, `${section}.md`);
      if (fs.existsSync(filePath)) {
        content += `\n\n## ${section.toUpperCase()}\n\n${fs.readFileSync(filePath, 'utf-8')}`;
      }
    }

    const projectsDir = path.join(this.DATA_DIR, 'projects');
    if (fs.existsSync(projectsDir)) {
      const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        content += `\n\n## PROJECT: ${file}\n\n${fs.readFileSync(path.join(projectsDir, file), 'utf-8')}`;
      }
    }

    return content;
  }

  private buildSystemPrompt(context: string): string {
    return `You are a helpful AI assistant answering questions about the portfolio owner. 
Use the following context to answer questions accurately. Only answer questions about the owner's experience, skills, projects, or availability. For unrelated questions, politely redirect.

CONTEXT:
${context}

Be concise, helpful, and friendly. If you don't have specific information, say so honestly.`;
  }

  async ask(message: string, history: Array<{ role: string; content: string }>): Promise<{ answer: string; sources: string[] }> {
    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) {
      throw new HttpException('AI service not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }

    const context = this.loadAllMarkdown();
    const systemPrompt = this.buildSystemPrompt(context);

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user', content: message },
    ];

    try {
      const response = await this.httpService.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.1-8b-instant',
          messages,
          temperature: 0.7,
          max_tokens: 1024,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      ).toPromise();

      return {
        answer: response?.data?.choices?.[0]?.message?.content || FALLBACK,
        sources: ['bio', 'experience', 'stack', 'ambitions'],
      };
    } catch (error) {
      console.error('Groq API error:', error?.message);
      return { answer: FALLBACK, sources: [] };
    }
  }
}
