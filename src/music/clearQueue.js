const clear = async (msg) => {
  const voiceChannel = msg.member.voice.channel;
  if (!voiceChannel) {
    msg.channel.send("Vào room dùm cái !");
    return;
  }
  msg.channel.send("Quêu đã dọn xong 😎");
  return null;
};

module.exports = { clear };
