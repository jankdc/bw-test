const express = require('express');
const router = express.Router();
const debug = require('debug')('brandwatch-test:api');
const path = require('path');
const fs = require('fs');

/* GET topics listing. */
router.get('/topics', function(req, res, next) {
  const filePath = path.join(__dirname, '..', 'resources', 'topics.json');

  fs.readFile(filePath, (err, result) => {
    if (err) {
      debug('Error: topics.js is missing.');
      res.status(500).send('Sorry! Something has gone wrong on our side.');
      return;
    }

    try {
      const data = JSON.parse(result);
      const fill = (n) => {
        return n === undefined ? 0 : n;
      };

      let topics = {};
      data.topics.forEach((t) => {
        // Combine the metrics up if two topics have the same label.
        // Otherwise, create a new unique one.
        if (t.label in topics) {
          topics[t.label].sentimentScore += t.sentimentScore;
          topics[t.label].negative += t.sentiment.negative;
          topics[t.label].positive += t.sentiment.positive;
          topics[t.label].neutral += t.sentiment.neutral;
        } else {
          topics[t.label] = {
            score: t.sentimentScore,
            positive: fill(t.sentiment.positive),
            negative: fill(t.sentiment.negative),
            neutral: fill(t.sentiment.neutral)
          };
        }
      });

      res.json(topics);
    } catch (err) {
      debug('Error: topics.js has corrupt JSON content. See below.');
      debug(err);
      res.status(500).send('Sorry! Something has gone wrong on our side.');
    }
  });
});

module.exports = router;
