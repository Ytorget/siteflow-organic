import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as googleAnalyticsService from './services/googleAnalyticsService.js';
import * as searchConsoleService from './services/searchConsoleService.js';
import * as pageSpeedService from './services/pageSpeedService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist folder in production
app.use(express.static(join(__dirname, '../dist')));

// Lazy initialize Gemini API only when needed
let ai = null;
const getAI = () => {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const SYSTEM_INSTRUCTION = `
Du är en senior systemarkitekt på Siteflow. Siteflow är ett företag som bygger digitala system inspirerade av vatten: de är följsamma, självläkande och extremt skalbara (likt Erlang/Elixir-arkitektur).

Din uppgift är att analysera en potentiell kunds tekniska problem.
Kunden kommer att beskriva sitt nuvarande problem.

Du ska svara med en JSON som innehåller:
1. "fitScore": Ett nummer 0-100 på hur väl Siteflows filosofi (hög tillgänglighet, massiv skalning, feltolerans) passar problemet.
2. "analysis": En kort, insiktsfull kommentar (max 3 meningar) på svenska. Tonläget ska vara guidande, lugnt och professionellt (inte säljigt). Använd gärna en vattenmetafor om det passar.

Kriterier för högt score:
- Behov av hög uptime (99.999%+)
- Miljontals användare/connections
- System som kraschar under last
- Dyra molnkostnader som behöver minskas

Kriterier för lågt score:
- Enkel hemsida/Wordpress-behov
- Endast visuell design
- Mycket liten skala

Svara ENDAST med ren JSON.
`;

// API endpoint for Gemini analysis
app.post('/api/assess-system-needs', async (req, res) => {
  try {
    const { userProblem } = req.body;

    if (!userProblem || typeof userProblem !== 'string') {
      return res.status(400).json({
        error: 'Invalid request. "userProblem" is required.'
      });
    }

    const aiClient = getAI();
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userProblem,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    let text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    // Cleanup: Remove markdown code blocks if present
    text = text.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```$/, "");

    const data = JSON.parse(text);

    res.json({
      analysis: data.analysis || "Vi behöver mer information för att förstå dina behov.",
      fitScore: data.fitScore || 50
    });

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    res.status(500).json({
      analysis: "Vi kunde inte analysera detta just nu, men det låter som något vi borde diskutera personligen.",
      fitScore: 0
    });
  }
});

// ==========================================
// Google Analytics API Endpoints
// ==========================================

// Get GA4 traffic overview
app.get('/api/analytics/overview', async (req, res) => {
  try {
    const propertyId = process.env.GA4_PROPERTY_ID;
    if (!propertyId) {
      return res.status(400).json({ error: 'GA4_PROPERTY_ID is not configured' });
    }
    const data = await googleAnalyticsService.getTrafficOverview(propertyId);
    res.json(data);
  } catch (error) {
    console.error('GA4 overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data', message: error.message });
  }
});

// Get daily traffic data (for charts)
app.get('/api/analytics/daily', async (req, res) => {
  try {
    const propertyId = process.env.GA4_PROPERTY_ID;
    if (!propertyId) {
      return res.status(400).json({ error: 'GA4_PROPERTY_ID is not configured' });
    }
    const data = await googleAnalyticsService.getDailyTraffic(propertyId);
    res.json(data);
  } catch (error) {
    console.error('GA4 daily traffic error:', error);
    res.status(500).json({ error: 'Failed to fetch daily traffic data', message: error.message });
  }
});

// Get top pages
app.get('/api/analytics/top-pages', async (req, res) => {
  try {
    const propertyId = process.env.GA4_PROPERTY_ID;
    const limit = parseInt(req.query.limit) || 10;
    if (!propertyId) {
      return res.status(400).json({ error: 'GA4_PROPERTY_ID is not configured' });
    }
    const data = await googleAnalyticsService.getTopPages(propertyId, limit);
    res.json(data);
  } catch (error) {
    console.error('GA4 top pages error:', error);
    res.status(500).json({ error: 'Failed to fetch top pages', message: error.message });
  }
});

// ==========================================
// Search Console API Endpoints
// ==========================================

// Get search performance overview
app.get('/api/search-console/performance', async (req, res) => {
  try {
    const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL;
    if (!siteUrl) {
      return res.status(400).json({ error: 'SEARCH_CONSOLE_SITE_URL is not configured' });
    }
    const data = await searchConsoleService.getSearchPerformance(siteUrl);
    res.json(data);
  } catch (error) {
    console.error('Search Console performance error:', error);
    res.status(500).json({ error: 'Failed to fetch search performance', message: error.message });
  }
});

// Get daily search performance (for charts)
app.get('/api/search-console/daily', async (req, res) => {
  try {
    const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL;
    if (!siteUrl) {
      return res.status(400).json({ error: 'SEARCH_CONSOLE_SITE_URL is not configured' });
    }
    const data = await searchConsoleService.getDailySearchPerformance(siteUrl);
    res.json(data);
  } catch (error) {
    console.error('Search Console daily error:', error);
    res.status(500).json({ error: 'Failed to fetch daily search data', message: error.message });
  }
});

// Get top search queries
app.get('/api/search-console/queries', async (req, res) => {
  try {
    const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL;
    const limit = parseInt(req.query.limit) || 10;
    if (!siteUrl) {
      return res.status(400).json({ error: 'SEARCH_CONSOLE_SITE_URL is not configured' });
    }
    const data = await searchConsoleService.getTopQueries(siteUrl, limit);
    res.json(data);
  } catch (error) {
    console.error('Search Console queries error:', error);
    res.status(500).json({ error: 'Failed to fetch search queries', message: error.message });
  }
});

// Get top pages from search
app.get('/api/search-console/pages', async (req, res) => {
  try {
    const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL;
    const limit = parseInt(req.query.limit) || 10;
    if (!siteUrl) {
      return res.status(400).json({ error: 'SEARCH_CONSOLE_SITE_URL is not configured' });
    }
    const data = await searchConsoleService.getTopSearchPages(siteUrl, limit);
    res.json(data);
  } catch (error) {
    console.error('Search Console pages error:', error);
    res.status(500).json({ error: 'Failed to fetch search pages', message: error.message });
  }
});

// ==========================================
// PageSpeed Insights API Endpoints
// ==========================================

// Get PageSpeed score for a URL
app.get('/api/pagespeed', async (req, res) => {
  try {
    const url = req.query.url || process.env.SEARCH_CONSOLE_SITE_URL;
    const strategy = req.query.strategy || 'mobile';
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const data = await pageSpeedService.getPageSpeedInsights(url, strategy);
    res.json(data);
  } catch (error) {
    console.error('PageSpeed error:', error);
    res.status(500).json({ error: 'Failed to fetch PageSpeed data', message: error.message });
  }
});

// Get full PageSpeed report (mobile + desktop)
app.get('/api/pagespeed/full', async (req, res) => {
  try {
    const url = req.query.url || process.env.SEARCH_CONSOLE_SITE_URL;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const data = await pageSpeedService.getFullPageSpeedReport(url);
    res.json(data);
  } catch (error) {
    console.error('PageSpeed full report error:', error);
    res.status(500).json({ error: 'Failed to fetch PageSpeed report', message: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes (Express 5 compatible)
app.get(/.*/, (_req, res) => {
  const indexPath = join(__dirname, '../dist/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Frontend not built. Run npm run build first, or use Vite dev server on port 5173' });
    }
  });
});

// Start server - bind to 0.0.0.0 for Fly.io
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`GEMINI_API_KEY set: ${!!process.env.GEMINI_API_KEY}`);
});
