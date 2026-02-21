export default {
  async fetch(request) {
    if (request.method !== "POST") return new Response("Dynotic Bot Running 🚀");

    const update = await request.json();
    const message = update.message || update.callback_query;
    if (!message) return new Response("ok");

    const chatId = message.chat?.id || message.from?.id;
    const TOKEN = "7530674768:AAESh0ejg8lkOPdsjVPVAnojWmMlLkabZMU";

    async function sendMessage(id, text, keyboard = null) {
      const body = { chat_id: id, text };
      if (keyboard) body.reply_markup = keyboard;
      await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    // Main menu keyboard
    const mainMenu = {
      inline_keyboard: [
        [{ text: "Send a track", callback_data: "send_track" }],
        [{ text: "Business Request", callback_data: "business_request" }]
      ]
    };

    // Back keyboard
    const backButton = {
      inline_keyboard: [[{ text: "⬅️ Back", callback_data: "main_menu" }]]
    };

    // Handle /start
    if (message.text === "/start") {
      await sendMessage(chatId,
        "📋 Menu:\n1️⃣ Send a track — get your personal manager's contact for further collaboration with the label.\n2️⃣ Business request — discuss partnerships and other business matters.",
        mainMenu
      );
      return new Response("ok");
    }

    // Handle button clicks
    if (message.data) {
      switch (message.data) {
        case "main_menu":
          await sendMessage(chatId,
            "📋 Menu:\n1️⃣ Send a track — get your personal manager's contact for further collaboration with the label.\n2️⃣ Business request — discuss partnerships and other business matters.",
            mainMenu
          );
          break;
        case "send_track":
          await sendMessage(chatId,
            "Your manager: @hydarryl\nSend him the demo",
            backButton
          );
          break;
        case "business_request":
          await sendMessage(chatId,
            "Coming soon",
            backButton
          );
          break;
      }
      return new Response("ok");
    }

    return new Response("ok");
  },
};
