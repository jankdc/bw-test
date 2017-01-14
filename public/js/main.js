(function () {
  'use strict';

  /**
   * Fetches topics corpus and binds the TopicCloud object with the DOM UI.
   */
  function showTopicCloud() {
    try {
      $.getJSON('/api/topics', function(topics) {
        var cloud = new TopicCloud(document.getElementById('cloud-canvas'), topics);

        cloud.onClickedTopic(function(topic) {
          document.getElementById('topic').textContent = '"' + topic.label + '"';
          document.getElementById('total-mentions').textContent = topic.positive + topic.negative + topic.neutral;
          document.getElementById('neutral-mentions').textContent = topic.neutral;
          document.getElementById('positive-mentions').textContent = topic.positive;
          document.getElementById('negative-mentions').textContent = topic.negative;
        });

        cloud.generate();
      });
    } catch (err) {
      console.error(err);
    }
  }

  document.addEventListener('DOMContentLoaded', showTopicCloud);
})();
