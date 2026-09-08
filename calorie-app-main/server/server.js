import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "data");
const entriesFile = path.join(dataDir, "entries.json");

app.use(cors());
app.use(express.json());

async function ensureJsonFile(filePath) {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, "[]", "utf-8");
  }
}

async function readJsonFile(filePath) {
  await ensureJsonFile(filePath);
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}

async function writeJsonFile(filePath, data) {
  await ensureJsonFile(filePath);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

async function readEntries() {
  return readJsonFile(entriesFile);
}

async function writeEntries(entries) {
  await writeJsonFile(entriesFile, entries);
}

app.post("/analyze", async (req, res) => {
  const { meal } = req.body;

  if (!meal || !meal.trim()) {
    return res.status(400).json({ error: "Le champ meal est obligatoire." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res
      .status(500)
      .json({ error: "La variable OPENAI_API_KEY est manquante." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Tu es un assistant nutrition en France.
Estime les calories de ce repas en tenant compte du vocabulaire alimentaire francais.

Regles importantes:
- Si le repas contient "tacos", interprete-le par defaut comme un tacos francais de fast-food, pas comme un taco mexicain, sauf si le texte precise clairement le contraire.
- Si un terme est ambigu, choisis l'interpretation la plus probable dans un contexte francais du quotidien.
- Donne une estimation raisonnable, pas une precision scientifique.
- Explique tres brievement l'hypothese choisie.

Repas: ${meal}

Return valid JSON only with this format:
{"calories": 123, "reasoning": "courte explication en francais"}`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data.error?.message || "Erreur OpenAI.";
      return res.status(500).json({ error: message });
    }

    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return res.status(500).json({ error: "Reponse OpenAI vide." });
    }

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch {
      return res.status(500).json({
        error: "La reponse OpenAI n'est pas au bon format.",
        aiResponse: content,
      });
    }

    const calories = Number.parseInt(parsed.calories, 10);
    const reasoning = typeof parsed.reasoning === "string" ? parsed.reasoning : "";

    if (Number.isNaN(calories)) {
      return res.status(500).json({
        error: "La reponse OpenAI ne contient pas un nombre valide.",
        aiResponse: content,
      });
    }

    return res.json({
      calories,
      aiResponse: content,
      reasoning,
    });
  } catch {
    return res
      .status(500)
      .json({ error: "Erreur serveur lors de l'analyse." });
  }
});

app.get("/entries", async (_req, res) => {
  try {
    const entries = await readEntries();
    return res.json(entries);
  } catch {
    return res.status(500).json({ error: "Impossible de lire l'historique." });
  }
});

app.post("/entries", async (req, res) => {
  const { meal, calories, reasoning, aiResponse } = req.body;

  if (!meal || !meal.trim()) {
    return res.status(400).json({ error: "Le repas est obligatoire." });
  }

  if (!Number.isFinite(calories)) {
    return res.status(400).json({ error: "Les calories sont invalides." });
  }

  try {
    const entries = await readEntries();
    const now = new Date();
    const entry = {
      id: Date.now(),
      meal: meal.trim(),
      calories,
      reasoning: reasoning || "",
      aiResponse: aiResponse || "",
      createdAt: now.toISOString(),
      day: now.toISOString().slice(0, 10),
    };

    entries.unshift(entry);
    await writeEntries(entries);

    return res.status(201).json(entry);
  } catch {
    return res
      .status(500)
      .json({ error: "Impossible d'enregistrer ce repas." });
  }
});

app.listen(PORT, async () => {
  await ensureJsonFile(entriesFile);
  console.log(`Server running on port ${PORT}`);
});
