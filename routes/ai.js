
const express = require("express");
const router = express.Router();
const OpenAI = require("openai").default;

router.post("/chat", async (req, res) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { message } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a travel assistant for Wanderlust." },
        { role: "user", content: message },
      ],
    });

    const reply =
      response.choices[0]?.message?.content || "AI did not respond";

    // ✅ clearInput flag added
    res.json({
      reply,
      clearInput: true,   // 👈 ISKA MATLAB: message hata do
    });

  } catch (err) {
    console.error("AI ERROR:", err.message);

    if (err.status === 429) {
      return res.json({
        // reply: "AI quota exhausted. Please try again later.",
        reply: "Our travel assistant is taking a short break. Please try again in a few minutes.",

    
        clearInput: true, // 👈 error ke baad bhi input clear
      });
    }

    res.status(500).json({
      reply: "AI failed",

      clearInput: false,
    });
  }
});

module.exports = router;
