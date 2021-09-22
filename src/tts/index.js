const FormData = require("form-data");
const axios = require("axios");

let speaker_id = 1;

const tts = async (msg) => {
  try {
    //join room
    if (!msg.member.voice.channel) {
      msg.channel.send("Vào phòng đi anh yêu");
      return;
    }
    const connection = await msg.member.voice.channel.join();
    const input = msg.content.split("!ks")[1];

    const data = new URLSearchParams();
    data.append("input", String(input));
    data.append("speaker_id", Number(speaker_id));
    data.append("speed", Number(0.8));
    const res = await fetch(process.env.ZALO_URL, {
      method: "POST",
      headers: {
        apikey: process.env.ZALO_KEY,
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: data,
    });
    const voice = await res.json();
    // console.log(voice.data.url, typeof voice.data.url);
    connection.play(voice.data.url);
  } catch (error) {
    console.log(error);
  }
};

const changeVoice = (msg) => {
  try {
    const voicesId = [1, 2, 3, 4];
    const input = msg.content.split("!kvoice")[1];
    if (input.indexOf(voicesId) === -1) {
      // console.log(speaker_id);
      speaker_id = input;
      let mess = new MessageEmbed();
      mess
        .setColor("#fa7de5")
        .setTitle("Success")
        .setDescription(`Đổi giọng thành công 👌 ${speaker_id}`);
      msg.channel.send(mess);
    } else {
      msg.channel.send("Voice id giá trị từ `1- 4` thui bạn ei 👉👈");
    }
  } catch (error) {
    console.log(error);
    msg.channel.send("Có gì đó sai rồi ! Check logs thử xem");
  }
};
module.exports = {
  tts,
  changeVoice,
};
