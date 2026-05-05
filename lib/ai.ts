const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || "";
const MINIMAX_MODEL = process.env.MINIMAX_MODEL || "MiniMax-M2.7";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function callMiniMax(
  messages: Message[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<string> {
  if (!MINIMAX_API_KEY) {
    throw new Error("MiniMax API key not configured");
  }

  const response = await fetch("https://api.minimax.io/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MINIMAX_MODEL,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 4096,
    }),
  });

  if (!response.ok) {
    throw new Error(`MiniMax error ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
