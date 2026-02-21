export default {
  async fetch(request) {
    if (request.method === "POST") {
      const update = await request.json();
      const message = update.message;

      if (!message) {
        return new Response("ok");
      }

      const chatId = message.chat.id;
      const text = message.text;

      const ADMIN_ID = "8285810924";
      const TOKEN = "7530674768:AAESh0ejg8lkOPdsjVPVAnojWmMlLkabZMU";

      async function sendMessage(id, msg) {
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: id,
            text: msg,
          }),
        });
      }

      if (text === "/start") {
        await sendMessage(chatId, "Welcome to Dynotic Distribution 🎶\nType /submit to release your music.");
      }

      if (text === "/submit") {
        await sendMessage(chatId, "Send your submission in this format:\n\nArtist:\nTitle:\nGenre:\nRelease Date:\nCover URL:\nAudio WAV URL:");
      }

      if (!text.startsWith("/")) {
        await sendMessage(ADMIN_ID,
          "🚀 NEW RELEASE SUBMISSION\n\n" + text + "\n\nSubmitted via @dynoticbot"
        );
        await sendMessage(chatId, "✅ Submission sent to admin. Please wait for review.");
      }

      return new Response("ok");
    }

    return new Response("Dynotic Bot Running 🚀");
  },
};
