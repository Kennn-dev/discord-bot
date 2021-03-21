require("dotenv").config();
const { MongoClient } = require("mongodb");
const { Client, MessageEmbed } = require("discord.js");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const { createApi } = require("unsplash-js");
const nodeFetch = require("node-fetch");
const client = new Client();
const cheerio = require("cheerio");
const fetch = require("isomorphic-fetch");

///import functions genshin
const {
  fetchImage,
  fetchInfo,
  fetchBuild,
  fetchFarm,
} = require("./genshinImpact/functions");

const data = require("./genshinImpact/data");
const servers = [];
//if the server doesn't have a set prefix yet
// let defaultPrefix = '$kk';

const itemsPerPage = 20;

const commands = require("./commands");
const { search } = require("ffmpeg-static");

const unsplash = createApi({
  accessKey: process.env.ACCESS_KEY_UNSPLASH,
  fetch: nodeFetch,
});

const mongoClient = new MongoClient(process.env.MONGODB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  connectTimeoutMS: 30000,
  keepAlive: 1,
});

const messageWithImage = (url) => {
  const mess = new MessageEmbed();
  return mess
    .setImage(url)
    .setTitle("Material Farming Routes")
    .setFooter("Bot written by Ken 🔥");
};
const customMessageEmbed = (content, q) => {
  const mess = new MessageEmbed();
  return mess
    .setColor("#fa7de5")
    .setTitle("Cúng chùa tích đức 🕯🕯🕯")
    .setDescription(content)
    .setFooter(`Tổng số nhang : ${q}`);
};

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);

  //COMMANDS WITH DATABASE
  mongoClient.connect((err, db) => {
    if (err) console.log(err);
    console.log("✅ DB connected");
    //LISTTTTTTT
    commands(client, ["l", "list"], (msg) => {
      const mess = new MessageEmbed();
      // if (err) throw err;

      const dbo = db.db("discordDB");
      dbo
        .collection("playlist")
        .find({})
        .toArray(function (err, result) {
          try {
            if (err) throw err;
            const des = result
              .map((i, index) => `${index + 1} - **${i.name}** : ${i.url}`)
              .join("\n");
            // console.log(des);
            mess
              .setColor("#fa7de5")
              .setTitle("Your Playlists")
              .setDescription(des)
              .setFooter("Bot written by Ken 🔥");
            msg.channel.send(mess);

            // db.close();
          } catch (error) {
            msg.channel.send(error);
            // db.close();
          }
        });
    });

    //ADDDDDDDDDDDDDD
    commands(client, ["add", "a"], (msg) => {
      const name = msg.content.split(" ")[1];
      const url = msg.content.split(" ")[2];
      if (name && url) {
        const mess = new MessageEmbed();
        const dbo = db.db("discordDB");
        const newData = { name, url };
        dbo.collection("playlist").insertOne(newData, (error, res) => {
          if (error) {
            console.log(error);
            // db.close(true);
          }
          mess
            .setColor("#e594b5")
            .setTitle("Playlist added")
            .addFields([
              { name: "Name ", value: name, inline: true },
              { name: "Link ", value: url, inline: true },
            ])
            .setFooter("Bot written by Ken 🔥");
          msg.channel.send(mess);

          // db.close(true);
        });
      } else {
        const mess = new MessageEmbed();
        mess
          .setColor("#f5211d")
          .setTitle("Missing args 😠 ")
          .setDescription("`!kadd <playlist name> <url>`")
          .setFooter("Bot written by Ken 🔥");

        msg.channel.send(mess);
      }
    });

    //PRAY
    commands(client, ["pray", "cung", "thapnhang"], (message) => {
      const idUser = message.author.id;
      // console.log(id)
      const dbo = db.db("discordDB");
      try {
        dbo
          .collection("prayers")
          .findOneAndUpdate(
            { idUser },
            { $inc: { prayTime: 1 } },
            { upsert: true }
          )
          .then((result) => {
            if (!result) console.log("Fail");
            console.log(result);
            message.channel.send(
              customMessageEmbed(
                `Bạn đã thắp 1 nén nhang cho Sư thầy <@401724978199920640>`,
                result.value.prayTime ? result.value.prayTime + 1 : 1
              )
            );
          });
      } catch (error) {
        if (error) console.log("something wrong in Pray !! check that");
      }
    });
  });

  //IMAGE RANDOM SEARCH
  commands(client, ["img", "image"], (message) => {
    const { content } = message;
    // console.log(content);
    const keyword = content.substr(content.indexOf(" ")).trim();
    console.log(keyword);
    if (!keyword) {
      const mess = new MessageEmbed();
      mess
        .setColor("#f5211d")
        .setTitle("Missing args 😠 ")
        .setDescription("`!kimg <keyword>`")
        .setFooter("Bot written by Ken 🔥");

      msg.channel.send(mess);
    }
    // 1 -> itemsPerPage
    const randomNum = Math.floor(Math.random() * itemsPerPage) + 1;
    console.log(randomNum);
    unsplash.search
      .getPhotos({
        query: keyword,
        page: itemsPerPage % 2,
        perPage: itemsPerPage,
        contentFilter: "high",
        lang: "vi",
      })
      .then((result) => {
        if (result.errors) {
          // handle error here
          console.log("error occurred: ", result.errors[0]);
          message.channel.send(result.errors[0]);
        } else {
          const feed = result.response;

          // extract total and results array from response
          const { total, results, total_pages } = feed;
          console.log({ total, total_pages });
          // const attachment = new MessageAttachment()
          // handle success here
          const embed = new MessageEmbed();
          try {
            if (!results[randomNum]) {
              message.channel.send("Sumthing wrong ? 😥");
            }
            embed
              .setImage(results[randomNum].urls.regular)
              .setFooter(
                `by ${results[randomNum].user.name}`,
                results[randomNum].user.profile_image.small
              );
            message.channel.send(embed);
          } catch (error) {
            console.log(error);
          }
        }
      });
  });

  //PLAYYYY
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
  });
  //LEAVE
  commands(client, ["leave"], (msg) => {
    const { voice } = msg.member;
    voice.channel.leave();
  });

  //GENSHIN INFO CHAR
  commands(client, ["genshin"], async (msg) => {
    const { content } = msg;
    let charObj = null;
    // console.log(content);
    const keyword = content.substr(content.indexOf(" ")).trim();

    for (let i in data) {
      if (i === keyword) {
        charObj = { name: i, id: data[i] };
      }
    }

    if (charObj != null) {
      // msg.channel.send(`Name : ${charObj.name} ID : ${charObj.id}`);
      try {
        const urlImg = await fetchImage(charObj.id);
        const getInfo = await fetchInfo(charObj.id);
        const getBuild = await fetchBuild(charObj.id);
        const mess = new MessageEmbed();
        mess
          .setColor("#fbaccc")
          .setTitle(`Genshin impact`)
          .setThumbnail(getInfo.iconElement)
          .setImage(urlImg)
          .setAuthor(`${charObj.name.toUpperCase()}`, getInfo.rating)
          .setDescription(getInfo.info)
          .addFields([
            { name: getBuild.name.title, value: getBuild.name.des },
            {
              name: "Weapon 🔪",
              value: getBuild.weapon,
              inline: true,
            },
            {
              name: "Artifacts ✨",
              value: getBuild.artifact,
              inline: true,
            },
            {
              name: "Main Stat 💥",
              value: `⌛ : ${getBuild.mainStat[0].trim()} \n 🍸 : ${getBuild.mainStat[1].trim()} \n 👑 : ${getBuild.mainStat[2].trim()}`,
              inline: false,
            },
            {
              name: "Sub Stat 💦",
              value: getBuild.subStat,
              inline: true,
            },
          ])
          .setFooter(`Bot written by Ken 🔥`, getInfo.iconWeapon)
          .setTimestamp(new Date());

        msg.channel.send(mess);
      } catch (error) {
        const messErr = new MessageEmbed();
        messErr
          .setColor("#ff0000")
          .setTitle(`Got new Error ⚠`)
          .setDescription(error)
          .setTimestamp(new Date());
      }
    } else {
      msg.channel.send(`Character's name doesn't exist 🤦‍♂️`);
    }
  });

  //REACTIONS
  commands(client, ["genshinfarm", "gsf"], async (msg) => {
    const arrImages = await fetchFarm();

    let count = 0;

    const imageMess = messageWithImage(arrImages[0]);

    msg.channel.send(imageMess).then((message) => {
      //msg.author.id === user.id
      message.react("◀").then((r) => {
        message.react("▶");
        //filter
        const backFilter = (reaction, user) =>
          reaction.emoji.name === "◀" && user.id === msg.author.id;
        const nextFilter = (reaction, user) =>
          reaction.emoji.name === "▶" && user.id === msg.author.id;
        const back = message.createReactionCollector(backFilter, {
          timer: 999999,
        });
        const next = message.createReactionCollector(nextFilter, {
          timer: 999999,
        });

        back.on("collect", (rs) => {
          if (count === 0) return;
          count -= 1;
          const editMess = messageWithImage(arrImages[count]);
          editMess.setFooter(`${count + 1}/${arrImages.length}`);
          message.edit(editMess);
          // rs.remove(r.users.filter((u) => u === msg.author).first());
        });

        next.on("collect", (rs) => {
          if (count + 1 === arrImages.length) return;
          count += 1;
          const editMess = messageWithImage(arrImages[count]);
          editMess.setFooter(`${count + 1}/${arrImages.length}`);
          message.edit(editMess);
          // rs.remove(r.users.filter((u) => u === msg.author).first());
        });
      });
    });
  });
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

///
client.login(process.env.DISCORD_BOT_TOKEN);

///Bennett Mona Lisa Diona venti razor jean amber
