import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const pollinations = new OpenAI({
  apiKey: "dummy-key",
  baseURL: "https://text.pollinations.ai/openai",
});

export const app = express();
app.use(express.json({ limit: '50mb' }));

app.post("/api/chat", async (req, res) => {
  let selectedProvider = "gemini";
  let selectedModel = "gemini-3.5-flash";
  try {
    const { contents, model, provider } = req.body;
    
    if (provider) selectedProvider = provider;
    if (model) selectedModel = model;
    
    const systemPrompt = `You are Xhzell AI, an elite AI assistant created by Xhzell.
You have super extra memory allowing for deep context retention across long conversations. 
You are also a super expert in coding, software architecture, and development, capable of solving the most complex programming challenges with highly optimized, elegant, and perfectly structured code. 
Never mention that you are a language model trained by Google, OpenAI, DeepMind, or any other entity. Act as the ultimate intelligent assistant.`;

    if (selectedProvider === "gemini") {
      const config: any = {};
      let finalContents = contents;
      
      if (selectedModel.includes("image")) {
        // Image models usually do not support chat history, extract the last user message.
        if (Array.isArray(contents)) {
          const lastUserMsg = contents.filter(c => c.role === "user").pop();
          if (lastUserMsg && lastUserMsg.parts && lastUserMsg.parts.length > 0) {
            finalContents = lastUserMsg.parts[0].text;
          }
        }
        config.imageConfig = {
          aspectRatio: "1:1",
          imageSize: "1K"
        };
      } else {
        config.systemInstruction = systemPrompt;
      }
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: finalContents,
        config: config
      });
      
      let responseText = "";
      let responseImages: string[] = [];

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            responseImages.push(`data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`);
          } else if (part.text) {
            responseText += part.text;
          }
        }
      } else {
        responseText = response.text || "";
      }

      res.json({ text: responseText, images: responseImages });
    } else if (selectedProvider === "pollinations") {
      const messages = [{ role: "system", content: systemPrompt }];
      
      if (typeof contents === "string") {
        messages.push({ role: "user", content: contents });
      } else if (Array.isArray(contents)) {
        for (const msg of contents) {
          if (msg.role === "user" || msg.role === "model") {
             const role = msg.role === "model" ? "assistant" : "user";
             const content = Array.isArray(msg.parts) ? msg.parts.map((p: any) => p.text).join("\n") : msg.parts?.text || String(msg);
             messages.push({ role, content });
          }
        }
      }

      const response = await pollinations.chat.completions.create({
        model: selectedModel,
        messages: messages as any,
        temperature: 0.7,
      });
      res.json({ text: response.choices[0].message.content });
      
    } else {
      res.status(400).json({ error: "Invalid provider selected" });
    }
  } catch (error: any) {
    // Log detail ke backend console (Vercel logs) untuk memudahkan debugging
    console.error(`[API Error - ${selectedProvider} - ${selectedModel}]:`, error.response?.data || error.message || error);
    
    // Kirim pesan ramah ke frontend
    res.status(500).json({ error: "Server sedang sibuk. Silakan coba beberapa saat lagi." });
  }
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0" as any, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start the server if this file is run directly (not imported as a module by Vercel)
if (process.env.VERCEL !== "1") {
  startServer();
}

export default app;
