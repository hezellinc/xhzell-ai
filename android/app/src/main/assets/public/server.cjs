var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  app: () => app,
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var import_openai = __toESM(require("openai"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var pollinations = new import_openai.default({
  apiKey: "dummy-key",
  baseURL: "https://text.pollinations.ai/openai"
});
var app = (0, import_express.default)();
app.use(import_express.default.json({ limit: "50mb" }));
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
      const config = {};
      if (!selectedModel.includes("image")) {
        config.systemInstruction = systemPrompt;
      }
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config
      });
      let responseText = "";
      let responseImages = [];
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            responseImages.push(`data:${part.inlineData.mimeType || "image/jpeg"};base64,${part.inlineData.data}`);
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
            const content = Array.isArray(msg.parts) ? msg.parts.map((p) => p.text).join("\n") : msg.parts?.text || String(msg);
            messages.push({ role, content });
          }
        }
      }
      const response = await pollinations.chat.completions.create({
        model: selectedModel,
        messages,
        temperature: 0.7
      });
      res.json({ text: response.choices[0].message.content });
    } else {
      res.status(400).json({ error: "Invalid provider selected" });
    }
  } catch (error) {
    console.error(`[API Error - ${selectedProvider} - ${selectedModel}]:`, error.response?.data || error.message || error);
    res.status(500).json({ error: "Server sedang sibuk. Silakan coba beberapa saat lagi." });
  }
});
async function startServer() {
  const PORT = Number(process.env.PORT) || 3e3;
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
if (process.env.VERCEL !== "1") {
  startServer();
}
var server_default = app;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
//# sourceMappingURL=server.cjs.map
