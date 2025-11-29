/**
 * Gemini embeddings
 */

import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import { getGeminiKey } from "./config.js";

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = getGeminiKey();
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable not set");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function getEmbedding(text: string): Promise<number[]> {
  const client = getGenAI();
  const model = client.getGenerativeModel({ model: "text-embedding-004" });

  const result = await model.embedContent({
    content: { parts: [{ text }], role: "user" },
    taskType: TaskType.RETRIEVAL_QUERY,
  });

  return result.embedding.values;
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const client = getGenAI();
  const model = client.getGenerativeModel({ model: "text-embedding-004" });

  const embeddings: number[][] = [];
  for (const text of texts) {
    const result = await model.embedContent({
      content: { parts: [{ text }], role: "user" },
      taskType: TaskType.RETRIEVAL_DOCUMENT,
    });
    embeddings.push(result.embedding.values);
  }

  return embeddings;
}
