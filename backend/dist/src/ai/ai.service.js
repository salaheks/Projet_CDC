"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
let AiService = AiService_1 = class AiService {
    logger = new common_1.Logger(AiService_1.name);
    genAI = null;
    model = null;
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            this.logger.log('Gemini AI Service initialized successfully.');
        }
        else {
            this.logger.warn('GEMINI_API_KEY not found. AI features will be disabled.');
        }
    }
    async auditArchitecture(graph) {
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
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(text);
        }
        catch (error) {
            this.logger.error('Failed to audit architecture with Gemini', error);
            throw new Error('AI Audit failed');
        }
    }
    async suggestNextComponents(graph) {
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
        }
        catch (error) {
            this.logger.error('Failed to generate suggestions with Gemini', error);
            return { suggestions: [] };
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AiService);
//# sourceMappingURL=ai.service.js.map