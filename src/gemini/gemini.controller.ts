// src/ai/ai.controller.ts
import { Controller, Get } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('ai')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Get('icebreaker')
  async getIcebreaker(): Promise<string> {
    return this.geminiService.getIcebreaker();
  }
}
