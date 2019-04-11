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
  'titleStartsWith',
  'orderBy'
]

// Utilizing lambda's cold area to cache some data
var cache = [] // arr of
// {
//   cachedAt: 0,
//   data: {}
// }

// getComics calls Marvel API to fetch some comics & stores them in a cache
// that lasts based on keepCacheAliveFor
module.exports.getComics = async function(event, context, callback) {
    let startTime = Date.now();
    var comicsUrl = 'https://gateway.marvel.com:443/v1/public/comics'

    // Constructing url
    let ts = startTime
    comicsUrl += '?apikey='+publicKey;
    comicsUrl += '&ts='+ts
    comicsUrl += '&hash='+md5(ts+privateKey+publicKey)

    cacheKey = ''

    // Controling the params sent by client
    Object.entries(event.queryStringParameters).forEach((param) => {
      let key = param[0]
      let value = param[1]
      if(acceptedParams.indexOf(key) > -1){
        comicsUrl += '&'+key+'='+value
        cacheKey += '&'+key+'='+value
      }
    })

    console.log("Calling marvel url to fetch data:", comicsUrl)

    var response = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      },
      body: ""
    };

    if(
      cache[cacheKey] != null &&
      Date.now() - cache[cacheKey].cachedAt < keepCacheAliveFor
      ) {
      // Use cache
      console.log("Using cache")
      console.log("Time elapsed",Date.now() - startTime);
      console.log("Cached",cache);
      response.body = constructResponseBody(cache[cacheKey].data,startTime,cacheKey)
      callback(null, response);
    } else {
      // Call marvel
      console.log("Calling API")
      await rp(comicsUrl)
      .then(function(resp){
        respjson = JSON.parse(resp)
        console.log("Time elapsed",Date.now() - startTime);

        if (respjson.code == 200) { // We're expecting 200, anything else is an error
          
          // Cache the response for later use
          // use the url as the key
          cache[cacheKey] = {
            cachedAt: Date.now(),
            data: respjson
          }
          response.body = constructResponseBody(respjson,startTime,cacheKey)
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

// Updates a comic in the cache by the comic id
module.exports.updateComic = async function(event, context, callback) {
  let startTime = Date.now();
  let id = event.pathParameters.id;

  cacheKey = ''

  // Controling the params sent by client
  Object.entries(event.queryStringParameters).forEach((param) => {
    let key = param[0]
    let value = param[1]
    if(acceptedParams.indexOf(key) > -1){
      cacheKey += '&'+key+'='+value
    }
  })

  // Fetching the comic from the cached data
  
};

function constructResponseBody(resp,startTime,cacheKey) {
  return JSON.stringify({
    resp: resp,
    meta: {
      timeElapsed: Date.now() - startTime,
      cacheKey: cacheKey
    }
  });
}