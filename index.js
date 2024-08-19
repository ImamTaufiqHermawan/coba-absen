const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const RENDER_URL = process.env.RENDER_URL;
const JSON_FILE_PATH = "/attendance_data.json"; // Adjust the path as necessary

const app = express();
app.use(bodyParser.json());

// Slot machine symbols
const symbols = ["🍒", "🍋", "🍊", "🍉", "⭐", "7️⃣"];

// Function to generate a random or forced winning slot machine result
const getSlotResult = (forceWin = false) => {
  if (forceWin) {
    const winningSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    return [winningSymbol, winningSymbol, winningSymbol];
  }

  const result = [];
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * symbols.length);
    result.push(symbols[randomIndex]);
  }
  return result;
};

// Function to send the slot machine result
const sendSlotResult = async (chatId, forceWin = false) => {
  const result = getSlotResult(forceWin);
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
    options: JSON.stringify([
      "WFO - GPU",
      "WFO - Kramat",
      "WFH",
      "Izin",
      "Sakit",
      "Cuti",
    ]),
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

    // Check if the message is the /slot or /slot-win-dong command
    if (text) {
      if (text.toLowerCase() === "/slot") {
        sendSlotResult(chatId);
      } else if (text.toLowerCase() === "/slot-win-dong") {
        sendSlotResult(chatId, true); // Force a win
      }
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

// Function to format the current date as 'YYYY-MM-DD'
const getFormattedDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Function to send attendance information for the current date to Telegram
const sendAttendanceInfoForDate = async (dateString) => {
  try {
    // Read the data from the JSON file
    const data = fs.readFileSync(JSON_FILE_PATH, "utf8");
    const attendanceData = JSON.parse(data);

    let WFO = [];
    let WFH = [];

    // Filter names based on their status for the specific date
    attendanceData.forEach((person) => {
      person.attendance.forEach((record) => {
        if (record.date === dateString) {
          if (record.status === "o" && !WFO.includes(person.name)) {
            WFO.push(person.name);
          }
          if (record.status === "h" && !WFH.includes(person.name)) {
            WFH.push(person.name);
          }
        }
      });
    });

    // Formatting the message
    let message = `Selamat Pagi Tim, sesuai data https://docs.google.com/spreadsheets/d/11CIi5G-TUE9UsLFq7q5UJimcJ1DzBHzo/edit?pli=1&gid=1662467265#gid=1662467265 \n untuk presensi pada tanggal ${dateString}:\n\nWFO:\n`;
    message += WFO.map((name) => `- ${name}`).join("\n") || "- Tidak ada";
    message += "\n\nWFH:\n";
    message += WFH.map((name) => `- ${name}`).join("\n") || "- Tidak ada";

    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const messageData = {
      chat_id: CHAT_ID,
      text: message,
    };

    const response = await axios.post(url, messageData);
    if (response.data.ok) {
      console.log("Attendance info sent successfully for date:", dateString);
    } else {
      console.error("Failed to send attendance info", response.data);
    }
  } catch (error) {
    console.error("Error reading or processing the JSON file:", error);
  }
};

app.get("/send-attendance", async (req, res) => {
  const dateString = getFormattedDate(); // Get today's date in 'YYYY-MM-DD' format
  await sendAttendanceInfoForDate(dateString);
  res.send(`Attendance info for ${dateString} sent to Telegram.`);
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
