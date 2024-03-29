require("dotenv").config();
const { MongoClient } = require("mongodb");
const { Client, MessageEmbed } = require("discord.js");
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
const {
  play: playFeature,
  clear: clearFeature,
  queue: queueFeature,
  skip: skipFeature,
} = require("./music/play");
const { tts, changeVoice } = require("./tts/index");
const servers = [];

//if the server doesn't have a set prefix yet
// let defaultPrefix = '$kk';

const itemsPerPage = 20;

const commands = require("./commands");

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
    .setTitle("Cúng chùa tích đức 🕯")
    .setDescription(content)
    .setFooter(`Tổng số nhang : ${q}`);
};

client.on("ready", () => {
  client.setMaxListeners(0);
  console.log(`Logged in as ${client.user.tag}!`);
  // PING
  commands(client, ["ping"], (msg) => {
    msg.channel.send("Và ping là ...").then((m) => {
      m.edit(
        `🤖 \nPong! Ping lên đến tận : **${
          Date.now() - msg.createdTimestamp
        }ms** \nĐộ trễ tận :  **${Math.round(client.ws.ping)}ms**`
      );
    });
  });

  //COMMANDS WITH DATABASE
  mongoClient.connect((err, db) => {
    if (err) console.log(err);
    console.log("✅ DB connected");
    // PLAY
    commands(client, ["p"], (msg) => {
      serverQ = playFeature(msg);
    });
    // QUEUE
    commands(client, ["q"], (msg) => {
      queueFeature(msg);
    });
    // CLEAR
    commands(client, ["clear"], (msg) => {
      clearFeature(msg);
    });
    // SKIP
    commands(client, ["skip"], (msg) => {
      skipFeature(msg);
    });
    // Help
    commands(client, ["help"], (msg) => {
      const mess = new MessageEmbed();
      mess
        .setColor("#fa7de5")
        .setTitle(`Lít commands`)
        .setDescription(
          `
        * Play : !kp
        * Skip : !kskip
        * Leave : !kleave
        * Say : !ks
        * Clear : !kclear
        * Watch Quêu : !kq 
        * Change voice : !kvoice [1 - 4]
        `
        )
        .setFooter(`Bot written by Ken 🔥"`);
      msg.channel.send(mess);
    });
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
    const getCount = (prayTime) => {
      if (prayTime.value === null) {
        // console.log("Value null");
        return 1;
      } else {
        // console.log("Not null");
        return prayTime.value.prayTime + 1;
      }
    };
    commands(client, ["pray", "cung", "thapnhang"], (message) => {
      const idUser = message.author.id;
      console.log(idUser);
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
            if (!result) console.log("Cannot find & create");
            // console.log(result);
            if (idUser === 401724978199920640) {
              message.channel.send(
                customMessageEmbed(
                  `Sư thầy cũng cần thắp nhang cầu may à ? 😏`,
                  getCount(result)
                )
              );
            } else {
              message.channel.send(
                customMessageEmbed(
                  `Bạn đã thắp 1 nén nhang cho Sư thầy <@401724978199920640>`,
                  getCount(result)
                )
              );
            }
          });
      } catch (error) {
        console.log("something wrong in Pray !! check that");
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
        if (error) {
          const messErr = new MessageEmbed();
          messErr
            .setColor("#ff0000")
            .setTitle(`Got new Error ⚠`)
            .setDescription(error.message)
            .setTimestamp(new Date());
        }
      }
    } else {
      msg.channel.send(`Character's name doesn't exist 🤦‍♂️`);
    }
  });

  //TEXT TO SPEAK

  commands(client, ["s"], async (msg) => {
    tts(msg);
  });
  /// VOICE CHANGE
  commands(client, ["voice"], async (msg) => {
    changeVoice(msg);
  });
});

const authors = [];
client.on("message", (msg) => {
  if (msg.author.bot) return;
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

  if (
    msg.author.id != msg.author.bot &&
    msg.channel.id == "819638171184005140"
  ) {
    authors.push({
      content: msg.content,
      author: msg.author.id,
    });

    let count = 0;
    for (let i = 0; i < authors.length; i++) {
      if (
        authors[i].content == msg.content &&
        authors[i].author == msg.author.id
      ) {
        count++;
      } else {
        count = 0;
      }
    }

    if (count >= 3) {
      msg.channel.send(`<@${msg.author.id}>, Spam con đỉ mẹ mày hay gì ? `);
      msg.channel
        .fetch({ limit: 3 })
        .then((msgs) =>
          msgs.messages.cache.map((i) => i.delete({ reason: "Spaming" }))
        )
        .catch((err) => console.log(err));
    }
  }

  if (msg.content === "hello") {
    msg.reply("Lô con cặc !!!");
  }
});

///
client.login(process.env.DISCORD_BOT_TOKEN);
