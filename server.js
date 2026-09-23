const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10kb" }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Har conversation ki memory alag
const conversations = {};

app.get("/", (req, res) => {
  res.send("AI Chatbot Backend is running!");
});

// New Chat
app.post("/new-chat", (req, res) => {
  const conversationId = req.body.conversationId;

  if (
    typeof conversationId === "string" &&
    conversationId.length <= 100
  ) {
    delete conversations[conversationId];
  }

  res.json({ success: true });
});

// AI Chat
app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;
    const conversationId = req.body.conversationId;

    // Message check
    if (
      typeof message !== "string" ||
      message.trim() === ""
    ) {
      return res.status(400).json({
        reply: "Message is required.",
      });
    }

    // Message length limit
    if (message.length > 4000) {
      return res.status(400).json({
        reply: "Message is too long. Please keep it under 4000 characters.",
      });
    }

    // Conversation ID check
    if (
      typeof conversationId !== "string" ||
      conversationId.length < 10 ||
      conversationId.length > 100
    ) {
      return res.status(400).json({
        reply: "Invalid conversation ID.",
      });
    }

    const previousResponseId =
      conversations[conversationId] || null;

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",

      input:
        "Reply in the same language as the user's message. " +
        "If the user writes in English, answer in English. " +
        "If the user writes in Hindi, answer in Hindi. " +
        "If the user writes in Hinglish, answer in Hinglish." +
        "\n\nUser message: " +
        message.trim(),

      previous_response_id:
        previousResponseId || undefined,
    });

    // Is conversation ki latest memory save
    conversations[conversationId] = response.id;

    res.json({
      reply:
        response.output_text ||
        "No answer received.",
    });

  } catch (error) {
    console.error("AI Error:", error);

    res.status(500).json({
      reply: "Sorry, AI service mein problem aa gayi.",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    "Server running on port " + PORT
  );
});
