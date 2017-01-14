const app = require('../../app');
const request = require('supertest');

describe('Routing', () => {
  let server;

  beforeEach(() => {
    server = app.listen();
  });

  afterEach(() => {
    server.close();
  });

  describe('/', () => {
    it('should respond with a 200 on a GET', (done) => {
      request(server)
        .get('/')
        .expect(200, done);
    });
  });
  
  describe('/api/topics', () => {
    it('should respond with a 200 on a GET', (done) => {
      request(server)
        .get('/api/topics/')
        .expect(200, done);
    });

    it('should return a JSON response', (done) => {
      request(server)
        .get('/api/topics/')
        .expect('Content-Type', /json/, done);
    });
  });
});
