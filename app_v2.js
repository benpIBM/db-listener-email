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



// Load the Cloudant library.
var Cloudant = require('cloudant');

// Database
var ibmdb = null;

// Connect
Cloudant( {  
  account: 'bsp',
  password: 'demoPass'

}, function( error, cloudant ) {
  if( error ) {
    console.log( 'Could not connect to Cloudant.' );
    console.log( 'Message: ' + error.message );
  }    

  // Debug
  console.log( 'Connected to database.' );

  // Use database
  // Assumes the database exists
  console.log( 'Using database.' );
  ibmdb = cloudant.db.use( 'books' );

stream = ibmdb.follow( {  
  include_docs: true, 
  since: 'now'
} );

console.log(stream);

// Database change
stream.on( 'change', function( change ) {  
  console.log( 'Change: ' + change.doc );
} );

});


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
