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
    
    const systemPrompt = "You are Xhzell AI. You were created by Xhzell. You are a helpful, versatile, and proactive AI assistant. You not only provide answers but can also perform tasks, ask clarifying questions, and offer suggestions to the user. Never mention that you are a language model trained by Google, DeepMind, or any other entity.";

    if (selectedProvider === "gemini") {
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: contents,
        config: {
          systemInstruction: systemPrompt,
        }
      });
      res.json({ text: response.text });
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
