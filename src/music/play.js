const { MessageEmbed, Util } = require("discord.js");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const Youtube = require("simple-youtube-api");
const youtube = new Youtube(process.env.YOUTUBE_API_KEY);

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
const videoPlayer = async (msg, song) => {
  try {
    const songQueue = queue.get(msg.guild.id);
    if (!song) {
      msg.channel.send("Hết nhạc rồi ! 🤐");
      songQueue.isPlaying = false;
      // songQueue.voiceChannel.leave();
      //   queue.delete(msg.guild.id);
      return;
    }
    songQueue.isPlaying = true;
    const stream = ytdl(song.url, { filter: "audioonly" });
    songQueue.connection.play(stream).on("finish", () => {
      songQueue.songs.shift();
      videoPlayer(msg, songQueue.songs[0]);
    });
    await songQueue.textChannel.send(`🎼 Đang drop bài **${song.title}**`);
  } catch (error) {
    queue.delete(msg.guild.id);

    console.log(error);
  }
};

const play = async (msg) => {
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

    // TODOS : Check playlist and push all to songs
    let song = null;
    let playlist = null;
    const isPlaylist = query.includes("youtube.com/playlist?");
    if (isPlaylist) {
      // Search and get an array of songs
      playlist = [];
      const youtubePlaylist = await youtube.getPlaylist(query);
      const videos = await youtubePlaylist.getVideos();
      msg.channel.send(`Đợi tí ... ⏲️`);
      for (const video of videos) {
        try {
          const videoRes = await youtube.getVideoByID(video.id);
          const videoFormat = {
            title: Util.escapeMarkdown(videoRes.title),
            url: `https://www.youtube.com/watch?v=${videoRes.id}`,
            image: videoRes.thumbnails.standard.url,
          };
          // console.log(videoFormat);
          playlist.push(videoFormat);
        } catch (error) {
          console.log(error);
          msg.channel.send(error.message);
          videos.shift();
        }
      }
    } else {
      song = await songSearch(query);
      if (!song) {
        msg.channel.send("Tìm không ra luôn á 🙃");
      }
    }

    if (!serverQ) {
      const queueValue = {
        voiceChannel,
        textChannel,
        connection,
        isPLaying: true,
        songs: [],
      };
      queue.set(msg.guild.id, queueValue);
      if (isPlaylist) {
        // Push arr songs
        // console.log(playlist);
        playlist.forEach((i) => {
          queueValue.songs.push(i);
        });
        msg.channel.send(`Vừa thêm ${queueValue.songs.length} vào quêu 🎶`);
      } else {
        // console.log(song);
        queueValue.songs.push(song);
      }

      videoPlayer(msg, queueValue.songs[0]);
    } else {
      // Has server queue
      //  push a new song
      queue.get(msg.guild.id).songs.push(song);
      msg.channel.send(`🎹 **${song.title}** đã thêm vào quêu`);
      if (!serverQ.isPlaying) {
        // if freezing , resume
        console.log("is playing", serverQ.isPlaying);
        // queue.get(msg.guild.id).songs.push(song);
        videoPlayer(msg, queue.get(msg.guild.id).songs[0]);
      }
    }
  } catch (err) {
    console.log(err);
    queue.delete(msg.guild.id);
    msg.channel.send("Có gì đó sai sai rồi !").then((m) => m.edit(err.message));
  }
};
const clear = (msg) => {
  const voiceChannel = msg.member.voice.channel;
  if (!voiceChannel) {
    msg.channel.send("Vào room dùm cái !");
    return;
  }
  queue.get(msg.guild.id).connection.dispatcher.end();
  queue.delete(msg.guild.id);
  // queue.get(msg.guild.id).songs = [];
  msg.channel.send(`Clear 🌈`);
};
const queueShow = (msg) => {
  try {
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel) {
      msg.channel.send("Vào room dùm cái !");
      return;
    }
    const serverQ = queue.get(msg.guild.id);
    if (!serverQ || !serverQ.songs) {
      msg.channel.send("Hết nhạc rồi 💩 !");
      return;
    }
    const { songs } = serverQ;
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

const skip = async (msg) => {
  const voiceChannel = msg.member.voice.channel;

  if (!voiceChannel) {
    msg.channel.send("Vào room dùm cái !");
    return;
  }

  const songs = queue.get(msg.guild.id).songs;
  if (songs.length == 0) {
    msg.channel.send("Hết nhạc rồi sao skip ? U la troi 😠");
  }

  const connection = queue.get(msg.guild.id).connection;

  // console.log(connection);
  connection.dispatcher.end();
  msg.channel.send("Skipped ⏯️");
};
module.exports = {
  play,
  clear,
  queue: queueShow,
  skip,
};
