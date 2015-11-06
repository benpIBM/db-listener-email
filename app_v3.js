/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

var http = require('http');

var to_email_address = "perlmutt@us.ibm.com";
var to_name = "Benji";
var email_subject = "App testing email";
var email_text = 'Welcome to the Matrix';
var from_email_address = 'benperlmutter@gmail.com';

var url_host = 'api.sendgrid.com'
var url_path = '/api/mail.send.json?'
				+'api_user=perlmutt@us.ibm.com'
				+'&api_key=demoPass12345'
				+'&to[]='+to_email_address
				+'&toname[]='+to_name
				+'&subject='+email_subject
				+'&text='+email_text
				+'&from='+from_email_address

var options = {
  host: url_host,
  path: url_path
};


// Load the Cloudant library.
var Cloudant = require('cloudant');

var me = 'bsp'; // Set this to your own account
var password = 'demoPass';

// Initialize the library with my account.
var cloudant = Cloudant({account:me, password:password});

follow_db = null;

follow_db = cloudant.db.use('books');

//console.log(follow_db);

var follow = require('follow');

follow({db:'https://bsp:demoPass@bsp.cloudant.com/books', include_docs:true}, function(error, change) {
  if(!error) {
    //console.log("Got change number " + change.seq + ": " + change.id);
    console.log(change);
    if(change.doc) {
    	console.log(change.doc._id);
    	if(change.doc.to_email_address) {
    		to_email_address = change.doc.to_email_address;
    		email_text = change.doc.email_text;
    		console.log(options);
    		http.request(options).end();
    	}
    }
  }
})

// callback = function(response) {
// 	//another chunk of data has been recieved, so append it to `str`
//   response.on('data', function (chunk) {
//     console.log(chunk);
//   });

// 	}


// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

console.log("hellow world");

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
