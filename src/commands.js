const { MessageEmbed } = require("discord.js");
const prefix = "!k";

module.exports = (client, aliases, callback) => {
  const errMess = new MessageEmbed();
  if (typeof aliases === "string") {
    aliases = [aliases];
  }
  client.on("message", (message) => {
    const { content } = message;

    aliases.forEach((i) => {
      const fullCmd = `${prefix}${i}`;

      if (content.startsWith(`${fullCmd} `) || content === fullCmd) {
        console.log(`Runnin command ${fullCmd}`);
        callback(message);
      } else {
        errMess
          .setColor("#e40017")
          .setTitle("Invalid commnand ⚠")
          .setDescription(
            "`Image : !kimage <keyword> \nGenshin : !kgenshin <character's name>`"
          )
          .setFooter("Powered by Ken");
      }
    });
  });
};
