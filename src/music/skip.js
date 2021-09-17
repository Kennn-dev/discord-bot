const skip = async (msg, serverQ) => {
  const voiceChannel = msg.member.voice.channel;

  if (!voiceChannel) {
    msg.channel.send("Vào room dùm cái !");
    return;
  }
  if (!serverQ) {
    message.channel.send("Hết nhạc rồi sao skip ? U la troi 😠");
  }
  const data = await serverQ;
  const connection = await data.connection;
  console.log(connection);
  connection.dispatcher.end();
  msg.channel.send("Skipped ⏯️");
};

module.exports = { skip };
