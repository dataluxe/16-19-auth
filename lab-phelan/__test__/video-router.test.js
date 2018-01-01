'use strict';

require('./lib/setup');

const superagent = require('superagent');
const server = require('../lib/server');
const accountMockFactory = require('./lib/account-mock-factory');
const videoMockFactory = require('./lib/video-mock-factory');

const apiURL = `http://localhost:${process.env.PORT}`;

describe('/videos', () => {
  beforeAll(server.start);
  afterAll(server.stop);
  afterEach(videoMockFactory.remove);

  test('POST /videos should return a 200 status code and a video if there are no errors', () => {
    let tempAccountMock = null;
    return accountMockFactory.create()
      .then(accountMock => {
        tempAccountMock = accountMock;

        return superagent.post(`${apiURL}/videos`)
          .set('Authorization',`Bearer ${accountMock.token}`)
          .field('title','chimp-and-lion')
          .attach('video',`${__dirname}/asset/chimp-and-lion.mp4`)
          .then(response => {
            console.log(response.body);
            expect(response.status).toEqual(200);
            expect(response.body.title).toEqual('chimp-and-lion');
            expect(response.body._id).toBeTruthy();
            expect(response.body.url).toBeTruthy();
          })
          .catch(error => {
            console.log(error);
            expect(error).toBeFalsy();
          });
      });
  });
});