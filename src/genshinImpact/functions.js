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
  // let arr = [];
  let result = {
    statPriory: "",
    subStats: "",
  };
  let artifactHtml = $(
    "body > div.l-content > div.l-3col > div.l-3colMain > div.l-3colMain__center.l-3colMain__center--shadow > div.archive-style-wrapper"
  )
    .find("h4")
    .filter(function (i, el) {
      return $(el).text() === "Recommended Artifact Substats";
    })
    .next();
  // .html();

  const test1 = $(artifactHtml)
    .find("tbody > tr:nth-child(1) > td > .align")
    .map(function (i, el) {
      return $(el).text();
    })
    .get()
    .slice(0, 3)
    .join("");

  const test2 = $(artifactHtml)
    .find("tbody > tr:nth-child(2) > td")
    .map(function (i, el) {
      return $(el).text();
    })
    .get()
    .slice(0, 1)
    .join("");
  // let result = $(artifactSubTitle).html();
  // console.log(artifactHtml);
  return {
    name,
    weapon: weapon === "" ? "error" : weapon,
    artifact: artifact === "" ? "error" : artifact,
    mainStat: test1 === "" ? "error" : test1,
    subStat: test2 === "" ? "error" : test2,
  };
};

module.exports.fetchFarm = async function fetchFarm() {
  const response = await fetch(
    `https://fragstrat.com/genshin-impact/artifacts-and-material-farming`
  );
  const url = await response.text();
  const $ = cheerio.load(url);
  const arr = [];
  const getContent = $(
    "body > div.boxed-wrap.clearfix > div.boxed-content-wrapper.clearfix > div:nth-child(4) > div.main_container > div.main-col > div.base-box.blog-post.p-single.bp-horizontal-share.post-11828.post.type-post.status-publish.format-standard.category-genshin-impact.category-maps.tag-genshin-impact-farming > div.entry-content"
  )
    .find(".alignnone")
    .map(function (i, el) {
      arr.push($(el).attr("src"));
    });
  return arr;
  // console.log(getContent);
};
