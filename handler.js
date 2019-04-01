// handler.js
const rp = require('request-promise');
const md5 = require('md5');

'use strict';

const publicKey = process.env.PUBLIC_KEY
const privateKey = process.env.PRIVATE_KEY

const keepCacheAliveFor = 300000 // 300000 = 5 minutes

// Utilizing lambda's cold area to cache some data
var coldCache = {
  cachedAt: 0,
  data: {}
}

module.exports.comics = async function(event, context, callback) {
    let startTime = Date.now();
    var comics = 'https://gateway.marvel.com:443/v1/public/comics'

    // Constructing url
    let ts = startTime
    comics += '?apikey='+publicKey;
    comics += '&ts='+ts
    comics += '&hash='+md5(ts+privateKey+publicKey)

    console.log("Marvel url:", comics)

    var response = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: ""
    };

    if(Date.now() - coldCache.cachedAt < keepCacheAliveFor) {
      // Use cache
      console.log("Time elapsed",Date.now() - startTime);
      response.body = constructResponseBody(coldCache.data,startTime)
      callback(null, response);
    } else {
      // Call marvel
      await rp(comics)
      .then(function(resp){
        respjson = JSON.parse(resp)
        console.log("Time elapsed",Date.now() - startTime);
        if (respjson.code == 200) { // We're expecting 200, anything else is an error
          response.body = constructResponseBody(respjson,startTime)
          // Cache the response for later use
          coldCache.cachedAt = Date.now();
          coldCache.data = respjson;
        } else {
          console.log("Received a non-200: ",respjson.code)
          response.statusCode = 500;
          response.body = "Something went wrong on Marvel's side"
        }
        
        callback(null, response);
      })
      .catch(function(err){
        console.log("Error",err);
        response.statusCode = 500;
        response.body = "Something went wrong on the server side"
        callback(null, response);
      })
    }
};

function constructResponseBody(resp,startTime) {
  return JSON.stringify({
    resp: resp,
    meta: {
      timeElapsed: Date.now() - startTime
    }
  });
}