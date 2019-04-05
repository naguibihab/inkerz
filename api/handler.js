// handler.js
const rp = require('request-promise');
const md5 = require('md5');

'use strict';

const publicKey = process.env.PUBLIC_KEY
const privateKey = process.env.PRIVATE_KEY

const keepCacheAliveFor = 300000 // 300000 = 5 minutes

const acceptedParams = [
  'limit',
  'offset',
  'titleStartsWith'
]

// Utilizing lambda's cold area to cache some data
var cache = [] // arr of
// {
//   cachedAt: 0,
//   data: {}
// }

module.exports.comics = async function(event, context, callback) {
    let startTime = Date.now();
    var comicsUrl = 'https://gateway.marvel.com:443/v1/public/comics'

    // Constructing url
    let ts = startTime
    comicsUrl += '?apikey='+publicKey;
    comicsUrl += '&ts='+ts
    comicsUrl += '&hash='+md5(ts+privateKey+publicKey)

    // Controling the params sent by client
    Object.entries(event.queryStringParameters).forEach((param) => {
      let key = param[0]
      let value = param[1]
      if(acceptedParams.indexOf(key) > -1){
        comicsUrl += '&'+key+'='+value
      }
    })

    console.log("Marvel url:", comicsUrl)

    var response = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      },
      body: ""
    };

    if(
      cache[comicsUrl] != null &&
      Date.now() - cache[url].cachedAt < keepCacheAliveFor
      ) {
      // Use cache
      console.log("Time elapsed",Date.now() - startTime);
      console.log("Cached",cache);
      response.body = constructResponseBody(cache[comicsUrl].data,startTime)
      callback(null, response);
    } else {
      // Call marvel
      await rp(comicsUrl)
      .then(function(resp){
        respjson = JSON.parse(resp)
        console.log("Time elapsed",Date.now() - startTime);

        if (respjson.code == 200) { // We're expecting 200, anything else is an error
          response.body = constructResponseBody(respjson,startTime)

          // Cache the response for later use
          // use the url as the key
          cache[comicsUrl] = {
            cachedAdt: Date.now(),
            data: respjson
          }
          console.log("Cached",cache);
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