import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import Groq from "groq-sdk";

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

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy-key" });

export async function POST(req: Request) {
  let selectedProvider = "gemini";
  let selectedModel = "gemini-3.5-flash";
  
  try {
    const { contents, model, provider } = await req.json();
    
    if (provider) selectedProvider = provider;
    if (model) selectedModel = model;
    
    let systemPrompt = `You are Xhzell AI, an elite AI assistant created by M Fariz Alfauzi (also known as Xhzell).\nYou have super extra memory allowing for deep context retention across long conversations. You are also a super expert in coding, software architecture, and development, capable of solving the most complex programming challenges with highly optimized, elegant, and perfectly structured code. Never mention that you are a language model trained by Google, OpenAI, DeepMind, or any other entity. Act as the ultimate intelligent assistant.\nWhen asked about your creator, clearly state that you were created by M Fariz Alfauzi.\nIf you use web search to find information, always include the source links in a friendly and conversational manner.`;

    let loopWarning = "";
    if (Array.isArray(contents)) {
      const modelMessages = contents.filter((m: any) => m.role === "model");
      if (modelMessages.length >= 2) {
        const lastMsg = modelMessages[modelMessages.length - 1];
        const prevMsg = modelMessages[modelMessages.length - 2];
        
        const lastText = Array.isArray(lastMsg.parts) ? lastMsg.parts.map((p: any) => p.text).join("") : lastMsg.parts?.text || String(lastMsg);
        const prevText = Array.isArray(prevMsg.parts) ? prevMsg.parts.map((p: any) => p.text).join("") : prevMsg.parts?.text || String(prevMsg);
        
        if (lastText && prevText && lastText.trim() === prevText.trim()) {
          loopWarning = "\n\n[SISTEM PERINGATAN: Anda baru saja memberikan respons yang sama persis beberapa kali. Ini adalah deteksi loop otomatis. Tolong berikan respons yang BERBEDA dan membantu untuk memutus loop ini. Jangan ulangi jawaban Anda sebelumnya.]";
        }
      }
    }
    
    const finalSystemPrompt = systemPrompt + loopWarning;

    if (selectedProvider === "gemini") {
      const config: any = {};
      let finalContents = contents;
      
      config.systemInstruction = finalSystemPrompt;
      config.tools = [{ googleSearch: {} }];

      let responseText = "";
      let responseImages: string[] = [];

      try {
        const response = await ai.models.generateContent({
          model: selectedModel,
          contents: finalContents,
          config: config
        });
        
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
      } catch (geminiError: any) {
        throw geminiError;
      }

      return NextResponse.json({ text: responseText, images: responseImages });
      
    } else if (selectedProvider === "cloudflare") {
      let promptStr = "";
      if (typeof contents === "string") {
        promptStr = contents;
      } else if (Array.isArray(contents)) {
        const lastUserMsg = contents.filter(c => c.role === "user").pop();
        if (lastUserMsg && lastUserMsg.parts && lastUserMsg.parts.length > 0) {
          promptStr = Array.isArray(lastUserMsg.parts) ? lastUserMsg.parts.map((p: any) => p.text).join(" ") : lastUserMsg.parts.text || String(lastUserMsg);
        } else {
          promptStr = contents.map((c: any) => typeof c === 'string' ? c : (c.text || JSON.stringify(c))).join(" ");
        }
      } else if (contents && (contents as any).text) {
         promptStr = (contents as any).text;
      } else {
         promptStr = JSON.stringify(contents);
      }
      
      if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
         throw new Error("Kredensial Cloudflare (CLOUDFLARE_ACCOUNT_ID dan CLOUDFLARE_API_TOKEN) belum diatur.");
      }

      const cfResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prompt: promptStr })
        }
      );

      if (!cfResponse.ok) {
        throw new Error(`Cloudflare AI API Error: ${cfResponse.statusText}`);
      }

      const contentType = cfResponse.headers.get("content-type") || "";
      let fallbackImageUrl = "";

      if (contentType.includes("application/json")) {
        const data = await cfResponse.json();
        if (data.result && data.result.image) {
          fallbackImageUrl = `data:image/jpeg;base64,${data.result.image}`;
        } else {
          throw new Error("Invalid JSON response from Cloudflare AI");
        }
      } else {
        const arrayBuffer = await cfResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fallbackImageUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`;
      }
      
      return NextResponse.json({ text: "Berikut gambar yang Anda minta:", images: [fallbackImageUrl] });
      
    } else if (selectedProvider === "pollinations") {
      const messages = [{ role: "system", content: finalSystemPrompt }];
      
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

      return NextResponse.json({ text: response.choices[0].message.content });
      
    } else if (selectedProvider === "groq") {
      const messages = [{ role: "system", content: finalSystemPrompt }];
      
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

      const chatCompletion = await groq.chat.completions.create({
        messages: messages as any,
        model: selectedModel,
      });

      return NextResponse.json({ text: chatCompletion.choices[0].message.content });
      
    } else {
      return NextResponse.json({ error: "Invalid provider selected" }, { status: 400 });
    }

  } catch (error: any) {
    console.error(`[API Error - ${selectedProvider} - ${selectedModel}]:`, error.response?.data || error.message || error);
    return NextResponse.json({ error: "Server sedang sibuk. Silakan coba beberapa saat lagi." }, { status: 500 });
  }
}