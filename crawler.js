const axios = require("axios");
const Word = require("./components/words/words");
const {random, sleep} = require('./utils')

(async () => {
  try {
    const dataRaw = {};
    const loop = 10;
    for(let i = 0; i < loop; i++) {
      await sleep(random(2000, 10000));
      const res = await axios.get("http://hanaslexis.com/cards/api/get20");
      res.data.forEach(word => dataRaw[word._id] = word)
    }

    const data = Object.values(dataRaw).map((word) => ({
      concept: word.concept,
      vie: word.vieKey,
      eng: word.engKey,
      examples: JSON.stringify(
        word.examples.map((ex) => ({ eng: ex.eng, vie: ex.vie }))
      ),
      image: word.image,
    }));
    await Word.bulkCreate(data);
  } catch (err) {
    console.error(err);
  }

})();

