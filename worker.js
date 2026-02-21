export default {
  async fetch(request) {
    if (request.method !== "POST") return new Response("Dynotic Bot");

    const update = await request.json();
    const message = update.message || update.callback_query;
    if (!message) return new Response("ok");

    const chatId = message.chat?.id || message.from?.id;
    const TOKEN = "7530674768:AAESh0ejg8lkOPdsjVPVAnojWmMlLkabZMU";

    // Fungsi sendMessage dengan parse_mode HTML
    async function sendMessage(id, text, keyboard = null) {
      const body = { chat_id: id, text, parse_mode: "HTML" };
      if (keyboard) body.reply_markup = keyboard;
      await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    // Inline keyboards
    const mainMenu = {
      inline_keyboard: [
        [{ text: "Send a track", callback_data: "send_track" }],
        [{ text: "Business Request", callback_data: "business_request" }]
      ]
    };

    const backButton = {
      inline_keyboard: [[{ text: "↩ Back", callback_data: "main_menu" }]]
    };

    // Handle /start
    if (message.text === "/start") {
      await sendMessage(chatId,
        "≔ <b>Menu</b>:\n➀ <b>Send a track</b> — get your personal manager's contact for further collaboration with the label.\n➁ <b>Business Request</b> — discuss partnerships and other business matters.",
        mainMenu
      );
      return new Response("ok");
    }

    // Handle button clicks
    if (message.data) {
      switch (message.data) {
        case "main_menu":
          await sendMessage(chatId,
            "≔ <b>Menu</b>:\n➀ <b>Send a track</b> — get your personal manager's contact for further collaboration with the label.\n➁ <b>Business Request</b> — discuss partnerships and other business matters.",
            mainMenu
          );
          break;

        case "send_track":
          await sendMessage(chatId,
            "Your manager: <b>@hydarryl</b>\nSend him the demo",
            backButton
          );
          break;

        case "business_request":
          await sendMessage(chatId,
            "<b>Coming soon</b>",
            backButton
          );
          break;
      }
      return new Response("ok");
    }

    return new Response("ok");
  },
};
