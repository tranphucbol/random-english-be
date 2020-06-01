const Word = require("../components/words/words");
const { random } = require(".");

const randomAnswerIndex = (words, answerIndexes) => {
  const min = 0;
  const max = words.length - 1;
  let index = -1;
  do {
    index = random(min, max);
  } while (index === -1 || answerIndexes.includes(index));
  return index;
};

const generateAnswers = (words, currentIndex) => {
  const answerIndexes = [currentIndex];
  while (answerIndexes.length < 4) {
    let index = randomAnswerIndex(words, answerIndexes);
    answerIndexes.push(index);
  }
  return answerIndexes.slice(1, 4).map(index => words[index].eng);
};

(async () => {
  const words = await Word.findAll();
  await Promise.all(words.map((word, index) => {
    const answers = generateAnswers(words, index);
    word.answers = JSON.stringify(answers);
    return word.save();
  }));
})();
