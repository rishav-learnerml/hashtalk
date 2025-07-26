// gemini.module.ts

import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { ConfigModule } from '@nestjs/config';
import { GeminiController } from './gemini.controller';

@Module({
  imports: [ConfigModule], // ✅ Fix: Import ConfigModule
  providers: [GeminiService],
  exports: [GeminiService],
  controllers: [GeminiController], // (Optional) export if used in other modules
})
export class GeminiModule {}
