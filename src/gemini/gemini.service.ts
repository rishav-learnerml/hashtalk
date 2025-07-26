// src/ai/gemini.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class GeminiService {
  private icebreakers: string[] = [
    "Why did the developer go broke? Because he used up all his cache! 💸",
    "I'm not lazy, I'm just in an infinite loop of procrastination 🔁",
    "Have you tried turning it off and on again? 🔧",
    "Why do Java developers wear glasses? Because they don't C#! 🤓",
    "My code works... I have no idea why. 🤷‍♂️",
    "404: Icebreaker not found 🧊",
    "To ‘git’ or not to ‘git’, that is the commit. 🧠",
    "Debugging is like being the detective in a crime movie where you're also the murderer 🔍",
    "npm install – because copy-paste is a skill 🧩",
    "Real devs count from 0, not 1 😎",
  ];

  async getIcebreaker(): Promise<{ message: string }> {
    const randomIndex = Math.floor(Math.random() * this.icebreakers.length);
    return { message: this.icebreakers[randomIndex] };
  }
}
