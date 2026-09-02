const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("AI Chatbot Backend is running!");
});

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      input: message,
    });

    res.json({
      reply: response.output_text,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      reply: "Error: " + error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
