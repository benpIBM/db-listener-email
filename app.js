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

var sendgrid  = require('sendgrid')('perlmutt@us.ibm.com', 'demoPass12345');

// Load the Cloudant library.
var Cloudant = require('cloudant');

var follow = require('follow');

var distance = require('google-distance-matrix');

var follow_db_name = 'dbo_email_notification_data_table_small';

var me = 'bsp'; // Set this to your own account
var password = 'demoPass';

// Initialize the library with my account.
var cloudant = Cloudant({account:me, password:password});

follow_db = null;

follow_db = cloudant.db.use(follow_db_name);

follow({db:'https://bsp:demoPass@bsp.cloudant.com/'+follow_db_name, include_docs:true}, function(error, change) {
	if (error) {
        console.log(error);
    }
    if (!error) {
		if(change.doc.email_address) {
    		// if(change.doc.from_email_address){
    		// 	var from_email_address = change.doc.from_email_address;
    		// }
    		// if(change.doc.email_subject) {
    		// 	var email_subject = change.doc._id + ' ' + change.doc.email_subject;
    		// }
    		// var to_email_address = change.doc.to_email_address;
    		// var email_text = change.doc.email_text;
    		// if(change.doc.geometry) {
    		// 	lon = change.doc.geometry.coordinates[0];
    		// 	lat = change.doc.geometry.coordinates[1];
    		// }
    		// email_text = email_text + ' lat: ' + lat + ', long: ' + lon;
    		// email_text = (email_text.split(" ")).join("%20");
    		// email_subject = (email_subject.split(" ")).join("%20");
            var origins = [''+change.doc.current_latseconds+',-'+change.doc.current_longseconds];
            var destinations = [''+change.doc.dest_city_lat+',-'+change.doc.dest_city_long];
            distance.key('AIzaSyBs439IekWvWvLFui-bxVCwCJGRY69YnRM');
            distance.mode('driving');
            distance.units('imperial');
            distance.matrix(origins, destinations, function (err, distances) {
                if (!err) {
                    var google_eta = distances.rows[0].elements[0].duration.value;
                    var doc_eta = change.doc.sec_eta;
                    if ((google_eta - doc_eta) > 10800) {
                        var to_email_address = change.doc.email_address;
                        var from_email_address = 'perlmutt@us.ibm.com';
                        var email_subject = 'The Shipment on tractor # '+change.doc.lgh_tractor+' will be later than Expected!';
                        var email_text = 'Tractor #'+change.doc.lgh_tractor+' is scheduled to arrive in '+(doc_eta/3600).toFixed(2)+' hours ('+doc_eta+' seconds) but cannot physically arrive before '+(google_eta/3600).toFixed(2)+' hours ('+google_eta+' seconds). \n\nIt is currently in '+change.doc.current_city_name+' with coordinates of '+origins+' and has a destination of '+change.doc.dest_city_name+' with coordinates of '+destinations+'.\n\n';
                        if (change.doc.stops_lgh != change.doc.ckc_lgh){
                            email_text = email_text+'This may be due in part to the fact that the Stops_ETA Leg Header Number does not equal the Checkall Leg Header Number. \n\n'+change.doc.stops_lgh+' DNE '+change.doc.ckc_lgh;
                        }
                        var sendGridEmail   = new sendgrid.Email({
                            to: to_email_address,
                            from: from_email_address,
                            subject: email_subject,
                            text: email_text
                        });
                        // sendgrid.send(sendGridEmail, function(err, json) {
                        //     if (err) { 
                        //         console.error(err); 
                        //     }
                        //     console.log(change.doc._id);
                        //     console.log(json);
                        // });
                    }
                }
            });
    		
    	}
    }
});

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
