const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";

export async function generateContent(prompt: string, systemContext?: string): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_ENDPOINT}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: `${systemContext ? `System Rules: ${systemContext}\n\n` : ""}${prompt}`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("AI Generation error:", error);
    // Provide a fallback response if Ollama isn't running
    return "Error: Could not connect to the local AI model. Please ensure Ollama is running and the model is pulled.";
  }
}
