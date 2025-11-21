import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist folder in production
app.use(express.static('dist'));

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

    const response = await ai.models.generateContent({
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile('dist/index.html', { root: '.' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
