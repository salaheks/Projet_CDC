import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { InfraGraphDTO } from '../common/types/infra-ir.types';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // We use gemini-1.5-flash for fast reasoning on JSON structures
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      this.logger.log('Gemini AI Service initialized successfully.');
    } else {
      this.logger.warn('GEMINI_API_KEY not found. AI features will be disabled.');
    }
  }

  /**
   * Perform an AI-driven security and best-practices audit on the infrastructure graph.
   */
  async auditArchitecture(graph: InfraGraphDTO): Promise<any> {
    if (!this.model) {
      return {
        status: 'DISABLED',
        message: 'AI Service is not configured (missing GEMINI_API_KEY).',
        recommendations: [],
      };
    }

    const prompt = `
Tu es un architecte Cloud et expert en sécurité (AWS, GCP, Azure). 
Analyse l'architecture suivante (fournie au format JSON) et identifie les failles de sécurité, 
les goulots d'étranglement de performance, et les problèmes de haute disponibilité (SPOF).

Fournis ta réponse UNIQUEMENT sous forme de JSON valide avec la structure suivante :
{
  "score": 85, // Score de 0 à 100
  "summary": "Résumé de l'analyse en une ou deux phrases",
  "recommendations": [
    {
      "severity": "HIGH|MEDIUM|LOW",
      "category": "SECURITY|PERFORMANCE|RELIABILITY|COST",
      "title": "Titre court du problème",
      "description": "Explication détaillée",
      "affectedNodeIds": ["id1", "id2"] // IDs des nœuds concernés
    }
  ]
}

Voici l'architecture :
${JSON.stringify(graph, null, 2)}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean up markdown code blocks if present
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(text);
    } catch (error) {
      this.logger.error('Failed to audit architecture with Gemini', error);
      throw new Error('AI Audit failed');
    }
  }

  /**
   * Autocomplete/Suggest the next components for the architecture.
   */
  async suggestNextComponents(graph: InfraGraphDTO): Promise<any> {
    if (!this.model) {
      return { suggestions: [] };
    }

    const prompt = `
Tu es un assistant à la conception d'infrastructure Cloud. 
Basé sur l'architecture partielle suivante (en JSON), suggère 1 à 3 composants logiques à ajouter 
pour compléter l'architecture de manière standard (ex: si tu vois des subnets publics sans NAT, suggère un NAT Gateway. 
Si tu vois un Load Balancer sans cible, suggère un Auto Scaling Group ou des VMs).

Réponds UNIQUEMENT en JSON valide avec la structure :
{
  "suggestions": [
    {
      "type": "nom-du-type-de-ressource",
      "provider": "aws|gcp|azure",
      "reason": "Pourquoi ce composant est recommandé"
    }
  ]
}

Architecture actuelle :
${JSON.stringify(graph, null, 2)}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(text);
    } catch (error) {
      this.logger.error('Failed to generate suggestions with Gemini', error);
      return { suggestions: [] };
    }
  }
}
