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

var request = require('request');

var to_email_address = "benperlmutter@gmail.com";
var to_name = "Benji";
var email_subject = "App testing email";
var email_text = 'Welcome to the Matrix';
var from_email_address = 'perlmutt@us.ibm.com';

email_subject = (email_subject.split(" ")).join("%20");
email_text = (email_text.split(" ")).join("%20");

var url_host;
var url_path;


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
    var lon;
    var lat;
    if(change.doc) {
    	console.log(change.doc._id);
    	if(change.doc.to_email_address) {
    		if(change.doc.from_email_address){
    			from_email_address = change.doc.from_email_address;
    		}
    		if(change.doc.email_subject) {
    			email_subject = change.doc.email_subject;
    		}
    		to_email_address = change.doc.to_email_address;
    		email_text = change.doc.email_text;
    		if(change.doc.geometry) {
    			lon = change.doc.geometry.coordinates[0];
    			lat = change.doc.geometry.coordinates[1];
    		}
    		email_text = email_text + ' lat: ' + lat + ', long: ' + lon;
    		email_text = (email_text.split(" ")).join("%20");
    		email_subject = (email_subject.split(" ")).join("%20");
    		console.log(email_text);
    		var url_path = 'http://api.sendgrid.com/api/mail.send.json?'
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

    		request.get(url_path, function(err, res, body){
    			if(err){
    				console.log("An error happened: ", err);
    			}else{
    				console.log(body);
    			}
    		});

    	}
    }
}
});

callback = function(response) {
	//another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    console.log(chunk);
  });
  response.on('end')
  console.log(response);

	}


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
