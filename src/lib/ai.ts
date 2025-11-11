import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY
});

export interface ServicePrompt {
	serviceName: string;
	keywords: string[];
	complexity: 'Básico' | 'Intermedio' | 'Avanzado';
	priceRange?: string;
	duration?: string;
	comments?: string;
}

export interface BlogPrompt {
	topic: string;
	keywords: string[];
	targetAudience?: string;
	comments?: string;
}

export async function generateServiceContent(prompt: ServicePrompt) {
	const systemPrompt = `You are an expert immigration lawyer in Spain specializing in extranjería (immigration law).
You help create detailed, accurate, and comprehensive service descriptions for an immigration law firm.
You must respond ONLY with valid JSON, no markdown, no code blocks, just the raw JSON object.

IMPORTANT: Create EXTENSIVE and DETAILED content. Each section should be thorough and informative.`;

	const additionalContext = prompt.comments
		? `\n\nAdditional Context from User:\n${prompt.comments}\n\nUse this information to make the service description more accurate and tailored.`
		: '';

	const userPrompt = `Generate a complete and DETAILED immigration service for Spanish immigration law with the following details:

Service Name: ${prompt.serviceName}
Keywords: ${prompt.keywords.join(', ')}
Complexity: ${prompt.complexity}
Price Range: ${prompt.priceRange || '€800 - €1,500'}
Duration: ${prompt.duration || '4-8 months'}${additionalContext}

REQUIREMENTS:
- Create EXTENSIVE descriptions (at least 4-5 sentences for the main description)
- Generate AT LEAST 5-7 FAQ items with detailed answers (minimum 2-3 sentences per answer)
- Include AT LEAST 5-6 process steps with detailed descriptions
- Provide comprehensive benefits (at least 6-8 benefits)
- List detailed required documents (minimum 8-10 documents)
- Make content professional, accurate, and helpful

Create the service in BOTH Spanish and English. Return a JSON object with this exact structure:

{
  "es": {
    "name": "string",
    "slug": "string (lowercase, hyphenated)",
    "description": "string (2-3 sentences)",
    "tags": ["array", "of", "relevant", "tags"],
    "active": true,
    "price_range": "string",
    "duration": "string",
    "complexity": "Básico|Intermedio|Avanzado",
    "icon_name": "string (lucide icon name)",
    "target_audience": "string (who is this for)",
    "benefits": "string (multiline, each benefit on new line)",
    "process_steps": [
      {
        "step": 1,
        "title": "string",
        "description": "string",
        "estimated_time": "string"
      }
    ],
    "required_documents": {
      "required_documents": ["array", "of", "documents"]
    },
    "success_rate": "string (percentage)",
    "faq": [
      {
        "question": "string",
        "answer": "string"
      }
    ],
    "SEO": {
      "metaTitle": "string (MAX 60 characters)",
      "metaDescription": "string (MAX 160 characters)",
      "keywords": ["array"],
      "canonicalURL": "string",
      "metaRobots": "index, follow"
    }
  },
  "en": {
    // Same structure as Spanish, BUT:
    // IMPORTANT: "complexity" field MUST ALWAYS use Spanish values: "Básico", "Intermedio", or "Avanzado"
    // Even in the English version, use these exact Spanish values for complexity
  }
}

Make it professional, accurate, and helpful. Use real Spanish immigration law terminology.

CRITICAL FIELD REQUIREMENTS:
- "complexity" field MUST ALWAYS be one of: "Básico", "Intermedio", "Avanzado" (in Spanish, even for English version)
- DO NOT translate complexity to English (not "Basic", "Intermediate", "Advanced")

CRITICAL SEO REQUIREMENTS:
- metaTitle MUST be 60 characters or less (strict limit)
- metaDescription MUST be 160 characters or less (strict limit)
- These are hard limits enforced by the CMS - content will be rejected if exceeded`;

	try {
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o',
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt }
			],
			temperature: 0.7,
			max_tokens: 8000,
			response_format: { type: 'json_object' }
		});

		const content = completion.choices[0].message.content;
		if (!content) {
			throw new Error('No content received from OpenAI');
		}

		return JSON.parse(content);
	} catch (error: any) {
		console.error('OpenAI API Error:', error);
		throw new Error(`Failed to generate service: ${error.message}`);
	}
}

export async function generateBlogContent(prompt: BlogPrompt) {
	const systemPrompt = `You are an expert immigration lawyer in Spain writing comprehensive and educational blog content about Spanish immigration law.
You must respond ONLY with valid JSON, no markdown, no code blocks, just the raw JSON object.

IMPORTANT: Create IN-DEPTH and EXTENSIVE content. Articles should be comprehensive, well-structured, and highly informative.`;

	const additionalContext = prompt.comments
		? `\n\nAdditional Context from User:\n${prompt.comments}\n\nUse this information to make the blog content more accurate, relevant, and tailored to the specific needs.`
		: '';

	const userPrompt = `Generate a complete and COMPREHENSIVE blog article about Spanish immigration law with the following details:

Topic: ${prompt.topic}
Keywords: ${prompt.keywords.join(', ')}
Target Audience: ${prompt.targetAudience || 'Foreigners seeking to immigrate to Spain'}${additionalContext}

REQUIREMENTS:
- Create an EXTENSIVE article with at least 10-15 content blocks (mix of headings, paragraphs, and lists)
- Include detailed explanations (paragraphs should be 4-6 sentences minimum)
- Provide actionable advice and practical examples
- Include relevant legal references when appropriate
- Make content engaging, informative, and SEO-optimized
- Structure content with clear headings (h2, h3) for readability

Create the blog in BOTH Spanish and English. Return a JSON object with this exact structure:

{
  "es": {
    "title": "string (engaging title)",
    "slug": "string (lowercase, hyphenated)",
    "excerpt": "string (2-3 sentence summary)",
    "content": [
      {
        "type": "heading",
        "text": "string",
        "level": 2
      },
      {
        "type": "paragraph",
        "text": "string"
      },
      {
        "type": "list",
        "items": ["array", "of", "items"],
        "style": "ordered|unordered"
      }
    ],
    "tags": ["array", "of", "tags"],
    "SEO": {
      "metaTitle": "string (MAX 60 characters)",
      "metaDescription": "string (MAX 160 characters)",
      "keywords": ["array"],
      "canonicalURL": "string",
      "metaRobots": "index, follow"
    }
  },
  "en": {
    // Same structure as Spanish
  }
}

Make it informative, accurate, and SEO-optimized. Include practical advice and real examples.

CRITICAL SEO REQUIREMENTS:
- metaTitle MUST be 60 characters or less (strict limit)
- metaDescription MUST be 160 characters or less (strict limit)
- These are hard limits enforced by the CMS - content will be rejected if exceeded`;

	try {
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o',
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt }
			],
			temperature: 0.7,
			max_tokens: 8000,
			response_format: { type: 'json_object' }
		});

		const content = completion.choices[0].message.content;
		if (!content) {
			throw new Error('No content received from OpenAI');
		}

		return JSON.parse(content);
	} catch (error: any) {
		console.error('OpenAI API Error:', error);
		throw new Error(`Failed to generate blog: ${error.message}`);
	}
}
