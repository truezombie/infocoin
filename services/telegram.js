export const postMessageToTelegram = async (message) => {
  const text = encodeURIComponent(message);

  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHAR_ID}&text=${text}`;

  const responseRaw = await fetch(url, { muteHttpExceptions: true });
  const response = await responseRaw.json();

  const { ok, description } = response;

  if (ok !== true) {
    console.log(`Error: ${description}`);
  }
};
