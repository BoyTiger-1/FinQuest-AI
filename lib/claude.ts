import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODEL = "claude-sonnet-4-6";

export async function streamChat(
  messages: { role: "user" | "assistant"; content: string }[],
  systemPrompt: string
): Promise<ReadableStream> {
  const stream = await anthropic.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

export async function analyzeFinancials(data: object): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are a professional financial analyst. Analyze the following financial data and provide:
1. Key ratio analysis (liquidity, profitability, solvency, efficiency)
2. Trend analysis and notable patterns
3. Strengths and areas of concern
4. Actionable recommendations
5. A health score out of 100

Financial Data:
${JSON.stringify(data, null, 2)}

Provide clear, educational explanations tailored for students. Format your response with clear sections.`,
      },
    ],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function getAdaptiveLearningInsight(
  userPerformance: object
): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Based on this student's performance data, give a brief (2-3 sentences) personalized learning recommendation:
${JSON.stringify(userPerformance, null, 2)}`,
      },
    ],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}
