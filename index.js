const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const RENDER_URL = process.env.RENDER_URL;

const app = express();
app.use(bodyParser.json());

// Slot machine symbols
const symbols = ["🍒", "🍋", "🍊", "🍉", "⭐", "7️⃣"];

// Function to generate a random slot machine result
const getSlotResult = () => {
  const result = [];
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * symbols.length);
    result.push(symbols[randomIndex]);
  }
  return result;
};

// Function to send the slot machine result
const sendSlotResult = async (chatId) => {
  const result = getSlotResult();
  const message = `🎰 [ ${result.join(" | ")} ] 🎰\n`;

  let outcomeMessage = "Better luck next time!";

  // Check if all three symbols match
  if (result[0] === result[1] && result[1] === result[2]) {
    outcomeMessage = "🎉 Jackpot! You win! 🎉";
  }

  const finalMessage = `${message}${outcomeMessage}`;

  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const messageData = {
    chat_id: chatId,
    text: finalMessage,
  };

  try {
    const response = await axios.post(url, messageData);
    if (response.data.ok) {
      console.log("Slot machine result sent successfully");
    } else {
      console.error("Failed to send slot machine result", response.data);
    }
  } catch (error) {
    console.error("Failed to send slot machine result", error);
  }
};

const sendPoll = async () => {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPoll`;
  const pollData = {
    chat_id: CHAT_ID,
    question: "Absensi",
    options: JSON.stringify(["WFO", "WFH", "Izin", "Sakit", "Cuti"]),
    is_anonymous: false,
    allows_multiple_answers: false,
  };

  try {
    const response = await axios.post(url, pollData);
    if (response.data.ok) {
      console.log("Poll sent successfully");
    } else {
      console.error("Failed to send poll", response.data);
    }
  } catch (error) {
    console.error("Failed to send poll", error);
  }
};

app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
  const message = req.body.message;
  if (message) {
    const chatId = message.chat.id;
    const text = message.text;

    console.log("Chat ID:", chatId);

    // Check if the message is the /slot command
    if (text && text.toLowerCase() === "/slot") {
      sendSlotResult(chatId);
    }

    res.send("Chat ID logged in console.");
  } else {
    res.send("No message received.");
  }
});

app.get("/send-poll", async (req, res) => {
  console.log("Poll endpoint triggered at", new Date().toISOString());
  await sendPoll();
  res.send("Poll sent");
});

app.get("/", async (req, res) => {
  console.log(
    "Untuk nyalain service free nya Render.com",
    new Date().toISOString()
  );
  res.send("UDAH NYALA NIH !!!");
});

const PORT = process.env.PORT || 9900;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const setWebhook = async () => {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${RENDER_URL}/bot${TELEGRAM_TOKEN}`;
  try {
    const response = await axios.get(url);
    console.log(response.data);
  } catch (error) {
    console.error("Error setting webhook:", error);
  }
};

// Uncomment the line below to set the webhook (only needed once)
// setWebhook();
