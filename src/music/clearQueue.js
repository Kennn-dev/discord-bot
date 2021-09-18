const clear = async (msg, serverQ) => {
  try {
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel) {
      msg.channel.send("Vào room dùm cái !");
      return;
    }
    if (!serverQ) {
      message.channel.send("Hết nhạc rồi sao skip ? U la troi 😠");
    }
    serverQ = null;
    msg.channel.send("Clear 🌈");
  } catch (error) {
    console.log(error);
    msg.channel.send("Có gì sai sai rồi , check logs xem sao !");
  }
};

module.exports = { clear };
