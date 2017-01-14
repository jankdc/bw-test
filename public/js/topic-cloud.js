/**
 * Represents the topic cloud.
 * @constructor
 * @param {HTMLCanvasElement} element - The canvas to draw on.
 * @param {Object} topics - The corpus of many topics data.
 */
function TopicCloud(element, topics) {
  'use strict';
  var self = this;

  if (!WordCloud.isSupported) {
    throw new Error('TopicCloud is not supported.');
  }

  if (element.constructor !== HTMLCanvasElement) {
    throw new Error('Invalid `element` argument.');
  }

  if (topics.constructor !== Object) {
    throw new Error('Invalid `topics` argument.');
  }

  var makeMsg = function(topic, name) {
    return topic + ' is missing a `'+name+'` of type Number';
  }

  for (var topic in topics) {
    if (topics[topic].positive.constructor !== Number) {
      throw new Error(makeMsg(topic, 'positive'));
    }

    if (topics[topic].negative.constructor !== Number) {
      throw new Error(makeMsg(topic, 'negative'));
    }

    if (topics[topic].neutral.constructor !== Number) {
      throw new Error(makeMsg(topic, 'neutral'));
    }

    if (topics[topic].score.constructor !== Number) {
      throw new Error(makeMsg(topic, 'score'));
    }
  }

  self._keys = Object.keys(topics);
  self._topics = topics;
  self._random = false;
  self._element = element;
  self._fontFamily = 'Comic Sans MS, sans-serif';
  self._weightFactor = 60;
  self._allowRotaton = false;
  self._onClickedTopic = null;
  self._drawOutOfBound = false;
  self._onFinishedDraw = null;
}

/**
 * Draws on the canvas with the topics corpus provided.
 * @method
 */
TopicCloud.prototype.generate = function() {
  'use strict';
  var self = this;

  /**
   * Check out {@link https://github.com/timdream/wordcloud2.js} for more API info.
   */
  WordCloud(self._element, {
    list: self._keys.map(function(label, index) {

      // Transform the topic data so it fits into the library.
      return [label, index]; 
      
    }),
    color: function (label) {

      // Calculate color based on the topic's sentiment score.
      return TopicCloud.sentimentColor(self._topics[label].score); 

    },
    click: function (array) {

      // Callback to tell that a topic has been clicked
      if (self._onClickedTopic) {
        self._onClickedTopic(Object.assign({ label: array[0] }, self._topics[array[0]]));
      }

    },
    weightFactor: function (index) {

      // Calculate the right text size (there's 6 of them) for each topic
      // based on the score and the highest mentioned topic.

      var props = self._topics[self._keys[index]];
      var score = props.positive + props.negative + props.neutral;

      // We need this to calculate how much we should increment the text size.
      var maxNum = self._maxNumMention();

      // We use this to categorise each text size to a certain text group.
      var divTop = Math.ceil(self._keys.length / 6);

      // This tells you which text group this topic belongs to.
      var textGroup = Math.ceil((self._keys.length - index) / divTop);

      // We use this as a multiplier for textGroup to get one of 6 different text sizes.
      var sizeGroup = maxNum / 6;

      // Calculate the final weight.
      return ((textGroup * sizeGroup) / maxNum) * self._weightFactor;
    },
    shuffle: self._random,
    fontFamily: self._fontFamily,
    rotateRatio: self._allowRotaton ? 0.5 : 0,
    drawOutOfBound: self._drawOutOfBound
  });

  /**
   * Listen for when the canvas finishes drawing, then we'll callback.
   */
  self._element.addEventListener('wordcloudstop', self._onFinishedDraw);
};


/**
 * Sets the callback function for listening to when the cloud finished drawing on the canvas
 * @method
 * @param {TopicCloud~onFinishedDrawCallback} callback - The callback that handles the event.
 */
TopicCloud.prototype.onFinishedDraw = function(callback) {
  'use strict';
  var self = this;

  // Stop listening to this event as this listener will be replaced.
  self._element.removeEventListener('wordcloudstop', self._onFinishedDraw);

  self._onFinishedDraw = callback;
};


/**
 * Sets the callback function for listening to clicked topic events.
 * @method
 * @param {TopicCloud~clickedTopicCallback} callback - The callback that handles the event.
 */
TopicCloud.prototype.onClickedTopic = function(callback) {
  'use strict';
  var self = this;

  self._onClickedTopic = callback;
};

/**
 * Gets the number of topics in the cloud.
 * @method
 * @returns {Number}
 */                  
TopicCloud.prototype.numberOfTopics = function() {
  'use strict';
  var self = this;

  return self._keys.length;
};

/**
 * Gets the topic with the highest total mention.
 * @access private
 * @method
 * @returns {Number}
 */
TopicCloud.prototype._maxNumMention = function() {
  'use strict';
  var self = this;

  var maxScore = 0;
  self._keys.map(function(label) { 
    var topic = self._topics[label];
    var score = topic.positive + topic.negative + topic.neutral;
    if (score > maxScore) {
      maxScore = score;
    }
  });
  
  return maxScore;
};

/**
 * Gets the topic's sentiment color based on sentiment score.
 * @function
 * @static
 * @param {Number} score - The sentiment score of a topic.
 * @returns {string}
 */
TopicCloud.sentimentColor = function(score) {
  'use strict';
  var self = this;

  return score > 60 ? 'green' : score < 40 ? 'red' : 'grey';
};

/**
 * Checks if this is supported by the caller (i.e. browser).
 * @function
 * @static
 * @returns {Boolean}
 */
TopicCloud.isSupported = function() {
  'use strict';
  return WordCloud.isSupported;
};

/**
 * This callback is called when a topic has been clicked.
 * @callback TopicCloud~clickedTopicCallback
 * @param {string} label - The name of the topic.
 * @param {Object} props - The properties of the topic.
 */

/**
 * This callback is called when the cloud finished drawing.
 * @callback TopicCloud~onFinishedDrawCallback
 */
