import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export const MODEL = "gemini-2.5-flash";

export async function streamChat(
  messages: { role: "user" | "assistant"; content: string }[],
  systemPrompt: string
): Promise<ReadableStream> {
  const model = genAI.getGenerativeModel({ model: MODEL, systemInstruction: systemPrompt });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1].content;
  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(lastMessage);

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

export async function analyzeFinancials(data: object): Promise<string> {
  const model = genAI.getGenerativeModel({ model: MODEL });
  const result = await model.generateContent(`You are a professional financial analyst. Analyze the following financial data and provide:
1. Key ratio analysis (liquidity, profitability, solvency, efficiency)
2. Trend analysis and notable patterns
3. Strengths and areas of concern
4. Actionable recommendations
5. A health score out of 100

Financial Data:
${JSON.stringify(data, null, 2)}

Provide clear, educational explanations tailored for students. Format your response with clear sections using ## headers and bullet points.`);
  return result.response.text();
}

export async function getAdaptiveLearningInsight(userPerformance: object): Promise<string> {
  const model = genAI.getGenerativeModel({ model: MODEL });
  const result = await model.generateContent(
    `Based on this student's performance data, give a brief (2-3 sentences) personalized learning recommendation:\n${JSON.stringify(userPerformance, null, 2)}`
  );
  return result.response.text();
}
