const fetch = require("node-fetch");
const express = require("express");
const bodyParser = require("body-parser");

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const sendPoll = async () => {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPoll`;
  const pollData = {
    chat_id: CHAT_ID,
    question: "Your daily poll question?",
    options: JSON.stringify(["Option 1", "Option 2", "Option 3"]),
    is_anonymous: false,
    allows_multiple_answers: false,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pollData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    console.log("Poll sent successfully");
  } catch (error) {
    console.error("Failed to send poll", error);
  }
};

const app = express();
app.use(bodyParser.json());

app.get("/send-poll", async (req, res) => {
  await sendPoll();
  res.send("Poll sent");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
