let fs = require('fs');
let text = fs.readFileSync("./text.txt").toLocaleString()
let stoplist = fs.readFileSync("./stoplist.txt").toLocaleString()
                 .split('\n').filter(s => s !== '')

let sentence_pattern = new RegExp('[.!?,;:\t\\\\"\\(\\)\\\'\u2019\u2013]|\\s\\-\\s');
let word_pattern = new RegExp('[^a-zA-Z0-9_\\+\\-/]')
let stop_word_pattern = new RegExp(`\\b(?:${stoplist.join('|')})\\b`, 'ig');

let sentences = text.split(sentence_pattern);
let phrase_list = [].concat(
  ...sentences.map(s => s.split(stop_word_pattern)
                         .map(w => w.trim().toLowerCase())
                         .filter(w => w !== '')));

let get_words = (text) => text.split(word_pattern).filter(isNaN);

let phrase_words = phrase_list.reduce((words, p) => (
  words[p] = get_words(p), words)
, {});

let word_counts = phrase_list.reduce((counts, p) => {
  let words = get_words(p);
  words.forEach(w => {
    counts[w] = counts[w] || {deg: 0, freq: 0};
    counts[w].deg += words.length;  // Degree = number of words that appear with this word
    counts[w].freq += 1;            // Freq = How often word appears ever
  });
  return counts;
}, {});

let word_scores = Object.entries(word_counts).reduce(
  (scores, [k, {deg, freq}]) => (scores[k] = deg / freq, scores)
, {});

let phrase_scores = phrase_list.map(p => [p, get_words(p).reduce((s, w) => s + word_scores[w], 0)])

let keywords = phrase_scores
  .sort(([w1, s1], [w2, s2]) => s1 > s2).reverse()
  .map(([w, s]) => w);

console.log(keywords.slice(0, 5))
