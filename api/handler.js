// handler.js
const rp = require('request-promise');
const md5 = require('md5');
const uuidv1 = require('uuid/v1');

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

var cache = [] // arr of
// {
//   cachedAt: 0,
//   data: {}
// }

var liability = {}
// { 
//   name: string
//   value: number
// }

var asset = {}
// { 
//   name: string
//   value: number
// }

var application = {}
// {
  // applicant_first_name: string
  // applicant_last_name: string
  // loan_amount: number
  // lender_id: string (CMB, STG, NCP, NAB)
  // id: number
  // assets: []asset
  // liabilities: []liability 
// }

var data_asset1 = {
  name: "house",
  value: 1000000
}

var data_asset2 = {
  name: "car",
  value: 20000
}

var data_liability1 = {
  name: "lib1",
  value: 100
}

var data_liability2 = {
  name: "lib1",
  value: 100
}

var data_app1 = {
  id: 1,
  applicant_first_name: "John",
  applicant_last_name: "Doe",
  loan_amount: 1000,
  lender_id: "NAB",
  assets: new Array(
    data_asset1,
    data_asset2
  ),
  liabilities: new Array(
    data_liability1,
    data_liability2
  )
}

var data_app2 = {
  id: 2,
  applicant_first_name: "Jane",
  applicant_last_name: "Doe",
  loan_amount: 200,
  lender_id: "STG",
  assets: new Array(
    data_asset1,
    data_asset2
  ),
  liabilities: new Array(
    data_liability1,
    data_liability2
  )
}

var data_apps = {
  1: data_app1,
  2: data_app2
}

// Template response
var response = {
  statusCode: 200,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*"
  },
  body: ""
};


module.exports.getApps = async function(event, context, callback) {
  response.body = JSON.stringify(data_apps)

  callback(null, response);
};

module.exports.getAppById = async function(event, context, callback) {
    // Get the id from url
    const appId = event.pathParameters.id;

    const found = data_apps[appId];
    if(found){
      response.body =  JSON.stringify(found)
    } else {
      response.statusCode = 404
    }

    response.statusCode = 200 // OK
    callback(null, response);
};

module.exports.updateApp = async function(event, context, callback) {
    // Get the id from url
    const appId = event.pathParameters.id;
    const body = JSON.parse(event.body);

    if(!validateBody(body)) {
      response.statusCode = 400;
      callback(null, response);
    }

    const found = data_apps[appId];

    if(found){
      updatedApp = {
        applicant_first_name: body.first_name,
        applicant_last_name: body.last_name,
        loan_amount: body.loan_amount,
        lender_id: body.lender_id,
        assets: body.assets,
        liabilities: body.liabilities
      }

      data_apps[appId] = updatedApp
      console.log(data_apps);
    } else {
      response.statusCode = 404
    }

    response.statusCode = 200 // OK
    callback(null, response);
}

module.exports.createApp = async function(event, context, callback) {
  // Insert an application
  // Status = 201
  const body = JSON.parse(event.body);
  const newAppId = uuidv1();

  if(!validateBody(body)) {
    response.statusCode = 400;
    callback(null, response);
  }

  // validations
  if(body.first_name == null || body.first_name == '') {
    // todo
  }
  if(body.last_name == null || body.last_name == '') {
  }

  if(body.loan_amount < 1) {
    // todo
  }

  body.assets.forEach((asset) => {
    if(asset.name || asset.name == '') {
      // todo
    }
    if(asset.value < 1) {
      // todo
    }
  })

  var new_app = {
    applicant_first_name: body.first_name,
    applicant_last_name: body.last_name,
    loan_amount: body.loan_amount,
    lender_id: body.lender_id,
    assets: body.assets,
    liabilities: body.liabilities
  }
  data_apps[newAppId] = new_app

  response.body =  JSON.stringify({id: newAppId})
  response.statusCode = 201 // created

  callback(null, response);
}

module.exports.deleteApp = async function(event, context, callback) {
    // Get the id from url
    const appId = event.pathParameters.id;

    const found = data_apps[appId];
    if(found){
      data_apps[appId] = null
    } else {
      response.statusCode = 404
    }

    response.statusCode = 204 // No content
    callback(null, response);
}

// Helper function to validate the request
function validateBody(body) {
  // validations
  if(body.applicant_first_name == null || body.applicant_first_name == '') {
    console.log("Warning: Validation failed for firstname")
    return false;
  }
  if(body.applicant_last_name == null || body.applicant_last_name == '') {
    console.log("Warning: Validation failed for lastname")
    return false;
  }

  if(body.loan_amount < 1) {
    console.log("Warning: Validation failed for loanamount")
    return false;
  }

  return true;
}