const prefix = "!k";
module.exports = (client, aliases, callback) => {
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
      }
    });
  });
};
