// src/ai/gemini.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
  constructor(private config: ConfigService) {}

  async getIcebreaker(): Promise<{ message: string }> {
    const apiKey = this.config.get('GEMINI_API_KEY');
    const model = 'gemini-2.0-flash';
    const prompt =
      'Give a fun coding-related icebreaker for devs. One line only';

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    try {
      const res = await axios.post(
        url,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
          },
        },
      );

      return {
        message:
          res.data.candidates?.[0]?.content?.parts?.[0]?.text ||
          '🤖 Icebreaker not found',
      };
    } catch (error) {
      console.error('[Gemini Error]', error.response?.data || error.message);
      return { message: '❌ Failed to fetch Gemini response' };
    }
  }
}
