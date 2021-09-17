const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

const queue = new Map();
const finder = async (query) => {
  const search = await ytSearch(query);
  if (search.videos.length > 0) {
    return search.videos[0];
  } else {
    return null;
  }
};
const songSearch = async (input) => {
  console.log({ input });
  if (ytdl.validateURL(input)) {
    // url
    const song = await ytdl.getInfo(input);

    if (song) {
      return {
        title: song.videoDetails.title,
        url: song.videoDetails.video_url,
      };
    }
  } else {
    // search
    const search = await finder(input);
    if (!search) return null;
    return {
      title: search.title,
      url: search.url,
      image: search.thumbnail,
    };
  }
};
const videoPlayer = async (guild, song) => {
  try {
    const songQueue = queue.get(guild.id);
    if (!song) {
      songQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }
    const stream = ytdl(song.url, { filter: "audioonly" });
    songQueue.connection.play(stream).on("finish", () => {
      songQueue.songs.shift();
      videoPlayer(guild, songQueue.songs[0]);
    });
    await songQueue.textChannel.send(`🎼 Đang drop bài **${song.title}**`);
  } catch (error) {
    console.log(error);
  }
};
const play = async (msg, client) => {
  try {
    const voiceChannel = msg.member.voice.channel;
    const textChannel = msg.channel;
    if (!voiceChannel) {
      msg.channel.send("Vào room dùm cái !");
      return;
    }

    const connection = await msg.member.voice.channel.join();
    if (!connection) {
      msg.channel.send("Join room failed");
      return;
    }

    const serverQ = queue.get(msg.guild.id);
    const query = msg.content.split("!kp")[1].trim();
    if (!query) return mgs.channel.send("Search đàng hoàng đi !");
    const song = await songSearch(query);
    if (!song) {
      msg.channel.send("Tìm không ra luôn á 🙃");
    }

    if (!serverQ) {
      console.log("NO Queue");
      const queueValue = {
        voiceChannel,
        textChannel,
        connection,
        songs: [],
      };
      queue.set(msg.guild.id, queueValue);
      queueValue.songs.push(song);

      videoPlayer(msg.guild, queueValue.songs[0]);
    } else {
      if (!song) {
        msg.channel.send(`Lên nhạc đi chời , hết list rồi ! 🙈`);
      }
      queue.get(msg.guild.id).songs.push(song);
      msg.channel.send(`🎹 **${song.title}** đã thêm vào quêu`);
      return;
    }
  } catch (err) {
    console.log(err);
    queue.delete(msg.guild.id);
    msg.channel.send("Có gì đó sai sai rồi, check logs xem !");
  }
};

module.exports = {
  play,
};
