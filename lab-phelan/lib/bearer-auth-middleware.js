'use strict';

const jsonWebToken = require('jsonwebtoken');
const httpErrors = require('http-errors');

const Account = require('../model/account');


const promisify = (fn) => (...args) => {
  return new Promise((resolve,reject) => {
    fn(...args,(error,data) => {
      if(error)
        return reject(error);
      return resolve(data);
    });
  });
};

module.exports = (request,response,next) => {
  console.log('Hit bearerAuthMiddleware');
  if(!request.headers.authorization)
    return next(new httpErrors(400,`_ERROR__ 'Authorization' header required.`));

  const token = request.headers.authorization.split('Bearer ')[1];
  console.log(`BearerAuth: token: ${token}`);

  if(!token)
    return next(new httpErrors(400,'__ERROR__ token required'));


  return promisify(jsonWebToken.verify)(token,process.env.SECRET)
    .catch(error => Promise.reject(new httpErrors(401,error)))
    .then(decryptedData => {
      console.log(`BAM - Data Decrypted: ${JSON.stringify(decryptedData)}`);

      return Account.findOne({tokenSeed : decryptedData.tokenSeed});
    })
    .then(account => {
      if(!account)
        throw new httpErrors(404,'__ERROR__ not found');

      request.account = account;
      return next();
    })
    .catch(next);
};
