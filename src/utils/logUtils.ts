export const asyncLog = async (message: string) => {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, LOGGING_ENABLED } = process.env;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const data = {
    chat_id: TELEGRAM_CHAT_ID, // The chat ID where the message will be sent
    text: message, // The message content
  };

  if (LOGGING_ENABLED === "true")
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error("Error sending message:", error);
      });
};
