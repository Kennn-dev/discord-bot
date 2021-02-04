require("dotenv").config();

const { Client, MessageEmbed } = require("discord.js");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const client = new Client();
const servers = [];
//if the server doesn't have a set prefix yet
// let defaultPrefix = '$kk';

const commands = require("./commands");
const listSongs = [];

function play(connection, message) {
  var server = servers[message.guild.id];

  server.dispatcher = connection.play(
    ytdl(server.queue[0], { filter: "audio" })
  );

  server.dispatcher.on("finish", function () {
    server.queue.shift();
    if (server.queue[0]) {
      play(connection, message);
    } else {
      connection.disconnect();
    }
  });
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);

  commands(client, ["pl", "playlist"], (msg) => {
    const mess = new MessageEmbed();
    mess
      .setColor("#e594b5")
      .setTitle("Playlist link ")
      .setDescription(
        "https://www.youtube.com/playlist?list=PLWGW_g1LMUQfTNInrMxtIPUWnKW4V0raT&fbclid=IwAR29VHg5Y159wRU45qRwgBHMk1hTht90AKfmzvzdOZ0trAt7KaWIA7pc-9I"
      )
      .setFooter("Bot written by Ken 🔥");

    msg.channel.send(mess);
  });

  commands(client, ["p", "play"], async (message) => {
    const url = message.content.split(" ")[1];
    function play(connection, message) {
      var server = servers[message.guild.id];
      server.dispatcher = connection.play(
        ytdl(server.queue[0], { filter: "audioonly" })
      );
      server.queue.shift();
      message.channel.send("\n Adding song to queue!");
      server.dispatcher.on("end", function () {
        if (server.queue[0]) {
          play(connection, message);
        } else {
          connection.disconnect();
        }
      });
    }

    if (!url) {
      message.channel.send("\n you need to provide a link!!");
      return;
    }

    if (!message.member.voice.channel) {
      message.channel.send(" \n You must be in a voice channel to play music!");
      return;
    }

    if (!servers[message.guild.id])
      servers[message.guild.id] = {
        queue: [],
      };

    var server = servers[message.guild.id];

    server.queue.push(url);

    if (!message.guild.voiceConnection)
      message.member.voice.channel.join().then(function (connection) {
        play(connection, message);
      });

    // usedCommandRecently4.add(message.author.id);
    // setTimeout(() => {
    //     usedCommandRecently4.delete(message.author.id)
    // }, 10000);
  });

  commands(client, ["leave"], (msg) => {
    const { voice } = msg.member;
    voice.channel.leave();
  });
});

client.on("guildMemberAdd", (member) => {
  const welcomeChannel = member.guild.channels.cache.get("806767655439695873");
  const welcomeMsg = `Chào mừng <@${member.id}> ! Bạn vừa phí thêm một phần lớn thời gian cuộc đời vào cái server này 🤦‍♂️`;

  welcomeChannel.send(welcomeMsg);
});

client.on("message", (msg) => {
  if (msg.content === "hello") {
    msg.reply("Lô con cặc !!!");
  }

  if (msg.channel.id === "561798348747833349") {
    //chat channel
    // Deal with command
    if (msg.content.startsWith("-p" || "-play" || "!p" || "!play")) {
      const navChannel = msg.guild.channels.cache
        .get("562357669063557282")
        .toString();
      msg.channel.send(`Cút lên ${navChannel} mà gọi nhạc 😡`);
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
