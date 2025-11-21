// Secure API service - calls backend instead of exposing API key in browser
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const assessSystemNeeds = async (userProblem: string): Promise<{ analysis: string; fitScore: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/assess-system-needs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userProblem }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      analysis: data.analysis || "Vi behöver mer information för att förstå dina behov.",
      fitScore: data.fitScore || 50
    };

  } catch (error) {
    console.error("API request failed:", error);
    return {
      analysis: "Vi kunde inte analysera detta just nu, men det låter som något vi borde diskutera personligen.",
      fitScore: 0
    };
  }
};