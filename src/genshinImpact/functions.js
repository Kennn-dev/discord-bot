const fetch = require("isomorphic-fetch");
const cheerio = require("cheerio");

module.exports.fetchImage = async function fetchImage(id) {
  const response = await fetch(
    `https://game8.co/games/Genshin-Impact/archives/${id}`
  );
  const imageUrl = await response.text();
  const $ = cheerio.load(imageUrl);

  //   console.log($);
  return $("#hl_1").next().find(".center > img").attr("src");
};

module.exports.fetchInfo = async function fetchInfo(id) {
  const response = await fetch(
    `https://game8.co/games/Genshin-Impact/archives/${id}`
  );
  const url = await response.text();
  const $ = cheerio.load(url);

  const rating = $("#hl_1")
    .next()
    .find(
      "table > tbody > tr:nth-child(2) > td:nth-child(2) > div:nth-child(1) > img"
    )
    .attr("src");
  const iconElement = $("#hl_1")
    .next()
    .find(
      "table > tbody > tr:nth-child(2) > td:nth-child(2) > div:nth-child(3) > div:nth-child(2) > a > img"
    )
    .attr("src");
  const iconWeapon = $("#hl_1")
    .next()
    .find(
      "table > tbody > tr:nth-child(2) > td:nth-child(2) > div:nth-child(3) > div:nth-child(4) > a > img"
    )
    .attr("src");

  const info = $("#hl_1")
    .next()
    .find(
      "table > tbody > tr:nth-child(2) > td:nth-child(2) > div:nth-child(3)"
    )
    .text()
    .replace(/(\n\n\n|\r)/gm, "\n")
    .replace(/(\r\n|\n\n|\n\n\n|\r)/gm, "\n");
  //   console.log(iconWeapon);
  return { rating, info, iconElement, iconWeapon };
};

module.exports.fetchBuild = async function fetchBuild(id) {
  const response = await fetch(
    `https://game8.co/games/Genshin-Impact/archives/${id}`
  );
  const url = await response.text();
  const $ = cheerio.load(url);

  //   const info = $("#hl_1")
  //     .next()
  //     .find(
  //       "table > tbody > tr:nth-child(2) > td:nth-child(2) > div:nth-child(3)"
  //     )
  //     .text()
  //     .replace(/(\n\n\n|\r)/gm, "\n")
  //     .replace(/(\r\n|\n\n|\n\n\n|\r)/gm, "\n");
  //   console.log(iconWeapon);
  const name = {
    title: $("#hs_1").prev().text().toUpperCase(),
    des: $("#hs_1").text(),
  };

  const weapon = $("#hs_1")
    .next()
    .find("table > tbody > tr:nth-child(2) > td.center > a")
    .text();

  let artifact = $("#hs_1")
    .next()
    .find("table > tbody > tr:nth-child(2) > td:nth-child(2) > div")
    .map(function (i, el) {
      return $(this).text();
    })
    .get()
    .join("---");
  //   console.log({ weapon, artifact });

  //   console.log(name);
  return { name, weapon, artifact };
};
