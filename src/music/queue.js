const { MessageEmbed } = require("discord.js");

const queue = async (msg, serverQ) => {
  // console.log(serverQ);
  try {
    const data = await serverQ;
    const songs = await data.songs;
    // console.log("songs", songs);
    if (!data && songs.length == 0) {
      msg.channel.send("Chưa có bài nào 😀");
    }
    const mess = new MessageEmbed();
    const des = songs
      .map((song, index) => {
        if (index == 0) {
          return `		👇
				${index + 1} - **${song.title}**
						👆
				`;
        }
        return `${index + 1} - **${song.title}**`;
      })
      .join("\n");
    mess
      .setColor("#fa7de5")
      .setThumbnail(songs[0].image)
      .setTitle("Quêu 🎹")
      .setDescription(des)
      .setFooter("Bot written by Ken 🔥");
    msg.channel.send(mess);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { queue };
