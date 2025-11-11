# Vasel Admin - AI Content Generator

Administrative tool for generating immigration law content using OpenAI GPT-4o and publishing to Strapi CMS.

## Features

- 🤖 **AI-Powered Content Generation**: Uses GPT-4o to generate complete service and blog content
- 🌍 **Bilingual Support**: Automatically creates content in both Spanish and English
- 📋 **Service Generator**: Create detailed immigration service descriptions
- ✍️ **Blog Generator**: Generate SEO-optimized blog articles
- 🔒 **Secure**: API keys and tokens never exposed to the frontend
- 🚀 **Direct Publishing**: Publish content directly to Strapi CMS

## Prerequisites

- Node.js 18+ installed
- Strapi instance running (http://localhost:1337)
- OpenAI API key for GPT-4o
- Strapi Full Access token

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy the environment variables file:
```bash
cp .env.example .env
```

3. Edit `.env` and add your credentials:
```env
STRAPI_URL=http://localhost:1337
STRAPI_FULL_TOKEN=your_strapi_full_access_token
OPENAI_API_KEY=your_openai_api_key
ADMIN_PASSWORD=your_secure_password
```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

### Generate a Service

1. Navigate to "Generate Services"
2. Fill in the service details:
   - Service name (e.g., "Permiso de Residencia por Trabajo")
   - Keywords (e.g., "trabajo, residencia, ley 14")
   - Complexity level
   - Price range and duration
3. Click "Generate with AI"
4. Review the generated content
5. Click "Publish to Strapi" to create the service in both languages

### Generate a Blog

1. Navigate to "Generate Blogs"
2. Provide topic and keywords
3. Generate and publish

## Architecture

```
vasel-admin/
├── src/
│   ├── lib/
│   │   ├── ai.ts          # Claude AI integration
│   │   └── strapi.ts      # Strapi API client
│   ├── routes/
│   │   ├── +page.svelte   # Dashboard
│   │   ├── services/      # Service generator page
│   │   ├── blogs/         # Blog generator page
│   │   └── api/           # Server-side API routes
│   └── app.html           # HTML template
├── .env                   # Environment variables (gitignored)
└── svelte.config.js       # SvelteKit configuration
```

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env` file to version control
- This admin tool should NOT be deployed publicly
- Keep it as a local development tool or behind authentication
- The `STRAPI_FULL_TOKEN` has full access to your CMS

## API Endpoints

### POST /api/generate-service
Generate service content using AI.

**Request Body:**
```json
{
  "serviceName": "Service Name",
  "keywords": ["keyword1", "keyword2"],
  "complexity": "Intermedio",
  "priceRange": "€800 - €1,500",
  "duration": "4-8 months"
}
```

### POST /api/publish-service
Publish generated service to Strapi.

**Request Body:**
```json
{
  "es": { /* Spanish service data */ },
  "en": { /* English service data */ }
}
```

## Building for Production

```bash
npm run build
npm run preview
```

## License

Private - Vasel Legal & Migration

## Support

For issues or questions, contact the development team.
