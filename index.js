const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const app = express();
app.use(bodyParser.json());

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
    console.log("Chat ID:", chatId);
    res.send("Chat ID logged in console.");
  } else {
    res.send("No message received.");
  }
});

app.get("/send-poll", async (req, res) => {
  await sendPoll();
  res.send("Poll sent");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const setWebhook = async () => {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=https://coba-absen.onrender.com/bot${TELEGRAM_TOKEN}`;
  try {
    const response = await axios.get(url);
    console.log(response.data);
  } catch (error) {
    console.error("Error setting webhook:", error);
  }
};

setWebhook();
