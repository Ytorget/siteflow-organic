import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// Note: In a real production build, ensure process.env.GEMINI_API_KEY is set.
// For this demo, we assume the environment is correctly configured.
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

export const assessSystemNeeds = async (userProblem: string): Promise<{ analysis: string; fitScore: number }> => {
  try {
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

    // CLEANUP: Sometimes the model returns markdown code blocks (```json ... ```). 
    // We must strip them to parse valid JSON.
    text = text.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```$/, "");

    const data = JSON.parse(text);
    return {
        analysis: data.analysis || "Vi behöver mer information för att förstå dina behov.",
        fitScore: data.fitScore || 50
    };

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
        analysis: "Vi kunde inte analysera detta just nu, men det låter som något vi borde diskutera personligen.",
        fitScore: 0
    };
  }
};