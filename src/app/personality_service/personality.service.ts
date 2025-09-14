import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
// personality/personality.service.ts
@Injectable()
export class PersonalityService {
  private prompts = new Map<string, string>();
  private path = '../prompts/';

  constructor() {
    this.loadPrompts();
  }

  private async loadPrompts() {
    const personalities = ['kai', 'rin'];
    const archetypes = [
      'core_personality',
      'cheerful_buddy',
      'wise_philosopher',
      'chaotic_trickster',
      'heartwright',
    ];

    for (const personality of personalities) {
      for (const archetype of archetypes) {
        const path = `${this.prompts}${personality}/${archetype}.txt`;
        const content = await fs.readFile(path, 'utf-8');
        this.prompts.set(`${personality}_${archetype}`, content);
      }
    }

    // Cargar bond levels
    for (let i = 1; i <= 10; i++) {
      const path = `${this.prompts}bond_levels/level_${i}.txt`;
      const content = await fs.readFile(path, 'utf-8');
      this.prompts.set(`bond_level_${i}`, content);
    }
  }

  getPersonalityPrompt(
    mvpType: string,
    archetype: string,
    bondLevel: number,
  ): string {
    const personalityPrompt =
      this.prompts.get(`${mvpType}_${archetype}`) ||
      this.prompts.get(`${mvpType}_core_personality`);
    const bondPrompt =
      this.prompts.get(`bond_level_${bondLevel}`) ||
      this.prompts.get('bond_level_1');

    return `${personalityPrompt}\n\n--- BOND LEVEL CONTEXT ---\n${bondPrompt}`;
  }
}
