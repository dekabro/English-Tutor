import express from "express";
import { Telegraf } from "telegraf";
import axios from "axios";

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const AI_KEY = process.env.AI_KEY;

if (!BOT_TOKEN) console.error("❌ BOT_TOKEN Missing");
if (!AI_KEY) console.error("❌ AI_KEY Missing");

const bot = new Telegraf(BOT_TOKEN);

async function askAI(prompt) {
  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "mixtral-8x7b-32768",
        messages: [{ role: "user", content": prompt }]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${AI_KEY}`
        }
      }
    );
    return res.data.choices[0].message.content;
  } catch (err) {
    return "⚠️ AI Error! Please try again.";
  }
}

bot.start((ctx) =>
  ctx.reply("🔥 God-Level AI Bot Active! Just send any message.")
);

bot.command("help", (ctx) =>
  ctx.reply("Commands:\n/start\n/help\n/id\n/ai <your question>")
);

bot.command("id", (ctx) =>
  ctx.reply(`🆔 Your Telegram ID: ${ctx.from.id}`)
);

bot.command("ai", async (ctx) => {
  const q = ctx.message.text.replace("/ai", "").trim();
  if (!q) return ctx.reply("Usage: /ai <your question>");

  ctx.reply("⏳ Thinking...");
  const ans = await askAI(q);
  ctx.reply(ans);
});

bot.on("text", async (ctx) => {
  const userText = ctx.message.text;
  ctx.reply("🤖 Processing...");
  const ans = await askAI(userText);
  ctx.reply(ans);
});

const secret = "railway_webhook_secret";

app.post(`/${secret}`, (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

app.get("/", (req, res) =>
  res.send("🔥 God-Level Telegram Bot Running Successfully!")
);

bot.launch();
console.log("🚀 Bot launched");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on PORT ${PORT}`));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));