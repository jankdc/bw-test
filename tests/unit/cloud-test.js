/*
 * Unit tests for public/js/topic-cloud.js
 */
describe('TopicCloud', function () {

  beforeEach(function () {
    fixture.setBase('tests/unit');
    fixture.load('cloud.html', 'cloud-small.json');
  });

  afterEach(function () {
    fixture.cleanup();
  });

  it('should be supported.', function () {
    TopicCloud.isSupported().should.equal(true);
  });

  it('should throw an error when passed a non-canvas element', function() {
    var wrongElem = document.body;
    var topicsData = fixture.json[0];

    // Wrong element
    (function () { new TopicCloud(wrongElem, topicsData); }).should.throw();

    // Empty canvas
    (function () { new TopicCloud(null, topicsData); }).should.throw();
  });

  it('should throw an error when passed an invalid topics corpus', function() {
    var canvasElem = fixture.el.querySelector('#cloud-canvas');
    var topicsData = fixture.json[0];

    topicsData['Berlin'].positive = null;

    (function () { new TopicCloud(canvasElem, topicsData); }).should.throw();
  });

  it('should give the same amount of topics passed in', function() {
    var topicsData = fixture.json[0];
    var canvasElem = fixture.el.querySelector('#cloud-canvas');
    var topicCloud = new TopicCloud(canvasElem, topicsData);

    topicCloud.numberOfTopics().should.equal(Object.keys(topicsData).length);
  });

  it('should draw with the same canvas instructions across all browsers.', function (done) {
    // Known md5 hash of the instruction stack for the file 'cloud-small.json'
    // when displayed to the canvas.
    var cloudSmallHash = '04f751a5c1eee94dc0adc5fec6e45b37';
    var topicsData = fixture.json[0];
    var canvasElem = fixture.el.querySelector('#cloud-canvas');
    var topicCloud = new TopicCloud(canvasElem, topicsData);

    topicCloud.onFinishedDraw(function () {
      var context = canvasElem.getContext('2d');
      context.hash({ loose: true }).should.equal(cloudSmallHash);
      done();
    });

    topicCloud.generate();
  });

  it('should draw the same amount of words passed in.', function (done) {
    var topicsData = fixture.json[0];
    var canvasElem = fixture.el.querySelector('#cloud-canvas');
    var topicCloud = new TopicCloud(canvasElem, topicsData);

    topicCloud.onFinishedDraw(function () {
      var calls = JSON.parse(canvasElem.getContext('2d').json({loose: true}));
      var count = calls
        .filter(function(c) { return c === 'fillText' })
        .map(function() { return 1; })
        .reduce(function(a,b) { return a + b });

      count.should.equal(Object.keys(topicsData).length);
      done();
    });

    topicCloud.generate();
  });

  it('should have painted the topics with the right sentiment colors.', function (done) {
    var topicsData = fixture.json[0];
    var canvasElem = fixture.el.querySelector('#cloud-canvas');
    var topicCloud = new TopicCloud(canvasElem, topicsData);

    topicCloud.onFinishedDraw(function () {
      var calls = JSON.parse(canvasElem.getContext('2d').json());

      /**
       *
       * Parses out each topic label, along with it's associated color.
       *
       * It then checks if the topic's score associated with that label
       * matches the right color that's been drawn on the canvas.
       *
       */
      for (var i = 0; i < calls.length; i++) {
        if (calls[i].method === 'fillText') {
          should.exist(calls[i - 3].attr);

          // e.g. {"method":"fillText","arguments":["TopicText",-82.09,6]}
          var label = calls[i].arguments[0];

          // e.g. {"attr":"fillStyle","val":"red"}
          var color = calls[i - 3].val;

          color.should.be.oneOf(['red', 'green', 'grey']);

          if (color === 'grey') {
            topicsData[label].score.should.be.within(40, 60);
          } else if (color === 'red') {
            topicsData[label].score.should.be.below(40);
          } else if (color === 'green') {
            topicsData[label].score.should.be.above(60);
          }
        }
      }

      done();
    });

    topicCloud.generate();
  });

  it('should have 6 unique font sizes in canvas.', function (done) {
    var topicsData = fixture.json[0];
    var canvasElem = fixture.el.querySelector('#cloud-canvas');
    var topicCloud = new TopicCloud(canvasElem, topicsData);

    topicCloud.onFinishedDraw(function () {
      var calls = JSON.parse(canvasElem.getContext('2d').json());

      /**
       * Parses out each font sizes (e.g. "Normal 50px Comic Sans")
       *                                           ^
       * It then reduces them down to a list of unique sizes.
       *
       */
      var fontSizes = calls
        .filter(function(c) { 
          return c.attr === 'font';
        })
        .map(function(a) {
          return a.val.split(' ')[1];
        }) 
        .reduce(function(list, size) {
          if (!(list.indexOf(size) !== -1)) {
            list.push(size);
          }
          return list;
        }, []);

      fontSizes.length.should.equal(6);
      done();
    });

    topicCloud.generate();
  });
});