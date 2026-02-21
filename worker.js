export default {
  async fetch(request) {
    if (request.method !== "POST") return new Response("Dynotic Bot Running 🚀");

    const update = await request.json();
    const message = update.message || update.callback_query;
    if (!message) return new Response("ok");

    const chatId = message.chat?.id || message.from?.id;
    const isCallback = !!message.data;

    const TOKEN = "7530674768:AAESh0ejg8lkOPdsjVPVAnojWmMlLkabZMU";
    const ADMIN_ID = "8285810924";

    // Simple in-memory store (per session user)
    // NOTE: Reset on worker restart, for production gunakan DB
    globalThis.sessions = globalThis.sessions || {};
    const sessions = globalThis.sessions;

    async function sendMessage(id, msg, keyboard = null) {
      const body = { chat_id: id, text: msg };
      if (keyboard) body.reply_markup = keyboard;
      await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    const genres = ["Lo-fi", "Phonk", "Electronic", "Jersey Club", "Chill", "Other"];

    // Start session
    if (!sessions[chatId]) sessions[chatId] = { step: null, data: {} };

    const session = sessions[chatId];

    // Handle /start
    if (message.text === "/start") {
      session.step = null;
      session.data = {};
      await sendMessage(chatId, "Welcome to Dynotic Distribution 🎶\nType /submit to release your music.");
      return new Response("ok");
    }

    // Handle /submit
    if (message.text === "/submit") {
      session.step = "genre";
      const keyboard = { inline_keyboard: genres.map(g => [{ text: g, callback_data: g }]) };
      await sendMessage(chatId, "Select Genre:", keyboard);
      return new Response("ok");
    }

    // Handle genre selection (callback_query)
    if (isCallback && session.step === "genre") {
      const genre = message.data;
      session.data.genre = genre;
      session.step = "artist";
      await sendMessage(chatId, `✅ Genre selected: ${genre}\nNow, send Artist name:`);
      return new Response("ok");
    }

    // Handle multi-step text input
    if (!isCallback) {
      if (session.step === "artist") {
        session.data.artist = message.text.trim();
        session.step = "title";
        await sendMessage(chatId, "Send Title of the track:");
        return new Response("ok");
      }

      if (session.step === "title") {
        session.data.title = message.text.trim();
        session.step = "cover";
        await sendMessage(chatId, "Send Cover URL (image):");
        return new Response("ok");
      }

      if (session.step === "cover") {
        session.data.cover = message.text.trim();
        session.step = "audio";
        await sendMessage(chatId, "Send Audio WAV URL:");
        return new Response("ok");
      }

      if (session.step === "audio") {
        session.data.audio = message.text.trim();

        // Send to admin
        const submissionText = 
`🚀 NEW RELEASE SUBMISSION
Artist: ${session.data.artist}
Title: ${session.data.title}
Genre: ${session.data.genre}
Cover URL: ${session.data.cover}
Audio URL: ${session.data.audio}

Submitted via @dynoticbot`;

        await sendMessage(ADMIN_ID, submissionText);
        await sendMessage(chatId, "✅ Submission sent to admin. Please wait for review.");

        // Reset session
        session.step = null;
        session.data = {};
        return new Response("ok");
      }
    }

    return new Response("ok");
  },
};
