const cheerio = require("cheerio");

module.exports.fetchLyrics = async function fetchLyrics(query) {
  query += " lyrics";
  const queryFormat = query.trim().replace(/\s/g, "%20");
  console.log(queryFormat);
  const response = await fetch(
    `https://www.google.com/search?q=${queryFormat}`
  );
  const url = await response.text();
  const $ = cheerio.load(url);
  const songUrl = $("div.bbVIQb").text();

  console.log(songUrl);
  return songUrl;
};
