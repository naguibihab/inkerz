// handler.js
const rp = require('request-promise');
const md5 = require('md5');

'use strict';

const publicKey = process.env.PUBLIC_KEY
const privateKey = process.env.PRIVATE_KEY

module.exports.comics = async function(event, context, callback) {
    var comics = 'https://gateway.marvel.com:443/v1/public/comics'

    // console.log(event); // Contains incoming request data (e.g., query params, headers and more)

    // Constructing url
    let ts = Date.now()
    comics += '?apikey='+publicKey;
    comics += '&ts='+ts
    comics += '&hash='+md5(ts+privateKey+publicKey)

    console.log("url", comics)

    var response = {
      statusCode: 200,
      headers: {
        "x-custom-header" : "My Header Value"
      },
      body: JSON.stringify({ "message": "Hello World!" })
    };

    await rp(comics)
    .then(function(resp){
      console.log("Response from marvel",resp)
      response.body = resp
      callback(null, response);
    })
    .catch(function(err){
      console.log("Error",err);
      response.statusCode = 500;
      response.body = "Something went wrong on the server side"
      callback(null, response);
    })
};
