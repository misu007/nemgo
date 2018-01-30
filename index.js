var sslRedirect = require('heroku-ssl-redirect');
var session = require('express-session');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var redis = require('redis');
var RedisStore = require('connect-redis')(session);
var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var nem = require('./app/nem.js');
var db = require('./app/mongo.js');
var app = express();
var portNum = (process.env.PORT || 5000);
var server = app.listen(portNum, function(){
    console.log("Node app is running : " + server.address().port);
});
var APP_NAME = process.env.APP_NAME;
var GOOGLE_MAP_API_KEY = process.env.GOOGLE_MAP_API_KEY;
var REDIS_URL = process.env.REDIS_URL;
var SESSION_SECRET = process.env.SESSION_SECRET;
var TWITTER_APP_ID = process.env.TWITTER_APP_ID;
var TWITTER_APP_SECRET = process.env.TWITTER_APP_SECRET;
var TWITTER_APP_CALLBACK_URI = process.env.TWITTER_APP_CALLBACK_URI;
var FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
var FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
var FACEBOOK_APP_CALLBACK_URI = process.env.FACEBOOK_APP_CALLBACK_URI;
var soption = {
	secret: SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {maxAge:  24 * 60 * 60 * 1000},
	store: new RedisStore({
		ttl: 24 * 60 * 60, 
		client: redis.createClient(REDIS_URL, {detect_buffers: true})
	})
};
var sess = session(soption);
var coin = {
	'4' : {
		unit: 0.1
	},
	'3' : {
		unit: 0.15
	},
	'2' : {
		unit: 0.2
	},
	'1' : {
		unit: 0.5
	}
};

var CAMPAIGN_STRICT_MODE = true;

app.use(sess);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: FACEBOOK_APP_CALLBACK_URI,
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, done) {
  	process.nextTick(function () {
    	var facebookId = profile.id;
    	var userName = profile.displayName;
    	var photoUrl = profile.photos[0].value;
    	db.getUserByFacebookId(facebookId, function(users){
    		if (users && users.length > 0){
	    		if (!(users[0].photoUrl && (users[0].photoUrl.length > 0))){
	    			db.updateUser(users[0]._id, {photoUrl: photoUrl}, null);
	    		}
    			return done(null, users[0]._id);
    		} else {
    			db.newUser(userName, facebookId, null, photoUrl, nem.generateWallet(), function(user){
		    		return done(null, user._id);
    			});
    		}
    	});
  	});
  }
));
passport.use(new TwitterStrategy({
    consumerKey: TWITTER_APP_ID,
    consumerSecret: TWITTER_APP_SECRET,
    callbackURL: TWITTER_APP_CALLBACK_URI
  },
  function(accessToken, refreshToken, profile, done) {
  	process.nextTick(function () {
    	var twitterId = profile.id;
    	var userName = profile.displayName;
    	var photoUrl = profile.photos[0].value;
    	db.getUserByTwitterId(twitterId, function(users){
    		if (users && users.length > 0){
	    		if (!(users[0].photoUrl && (users[0].photoUrl.length > 0))){
	    			db.updateUser(users[0]._id, {photoUrl: photoUrl}, null);
	    		}
    			return done(null, users[0]._id);
    		} else {
    			db.newUser(userName, null, twitterId, photoUrl, nem.generateWallet(), function(user){
		    		return done(null, user._id);
    			});
    		}
    	});
  	});
  }
));
passport.serializeUser(function(id, done) {
	done(null, id);
});
passport.deserializeUser(function(id, done) {
	done(null, id);
});

app.use(sslRedirect());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true, parameterLimit:50000}));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', {failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/'); 
});
app.get('/', isAuthenticated, function(req, res){
				res.setHeader('Content-Type', 'text/html');
				res.render('pages/index', {
					appName : APP_NAME,
					googleMapApiKey : GOOGLE_MAP_API_KEY
				});			
});
app.get('/login', function(req, res) {
	res.setHeader('Content-Type', 'text/html');
	res.render('pages/login', {
		appName : APP_NAME,
		googleMapApiKey : ''
	});  
});
app.get('/logout', function(req, res){
	req.logout();
	req.session.destroy();
	res.redirect("/login");   
});
app.post('/account', isAuthenticated, function(req, res){
	var userId = req.session.passport.user;
	db.getUserById(userId, function(user){
		nem.getAccount(user.fmtAddress, function(data){
			nem.getIncomingTransactionsByAddress(user.fmtAddress, function(incomings){
				nem.getOutgoingTransactionsByAddress(user.fmtAddress, function(outgoings){
					nem.getUnconfirmedTransactionsByAddress(user.fmtAddress, function(unconfirmeds){
						var campaignAddressList = getAddressList(incomings.data, 'sender').concat(getAddressList(outgoings.data, 'recipient'));
						db.getCampaignsByAddressList(campaignAddressList, function(campaigns){
							res.send({
								userName : user.userName,
								userPhotoUrl : user.photoUrl,
								fmtAddress : user.fmtAddress,
								address : user.address,
								birthYear : user.birthYear,
								gender : user.gender,
								balance : (data.account.balance / 1000000),
								transactions : {
									incoming: enrichTransaction(incomings.data, 'sender', campaigns),
									outgoing: enrichTransaction(outgoings.data, 'recipient', campaigns),
									unconfirmed: unconfirmeds.data
								}
							});			
						});			
					});
				});
			});
		});
	});
});
app.post('/profile/save', isAuthenticated, function(req, res){
	db.updateUser(req.session.passport.user, {
		userName : req.body.userName,
		birthYear : req.body.birthYear,
		gender : req.body.gender
		}, function(user){
	});
	res.send({});
});
app.post('/coin/put', isAuthenticated, function(req, res){
	var userId = req.session.passport.user;
	db.getUserById(userId, function(user){
		createCampaign(user, req.body, function(result){
			res.send({});
		});
	});
});
app.post('/coin/pick', isAuthenticated, function(req, res){
	var userId = req.session.passport.user;
	var putCoinId = req.body.putCoinId;
	db.getUserById(userId, function(user){
		db.getCampaignById(putCoinId, function(campaign){
			doPickCoin(campaign, user, function(result){
				res.send({});
			});	
		});
	});
});

app.post('/coin/available', isAuthenticated, function(req, res){
	var userId = req.session.passport.user;
	db.getUserById(userId, function(user){
		db.getAvailableCampaigns(user, function(campaigns){
			nem.getIncomingTransactionsByAddress(user.fmtAddress, function(incomings){
				var availables = getAvailableCampaigns(campaigns, incomings);
				res.send(availables);	
			});
		});
	});

});

app.post('/campaign/detail', isAuthenticated, function(req, res){
	db.getCampaignById(req.body.campaignId, function(campaign){
		nem.getAccount(campaign.fmtAddress, function(data){
			nem.getOutgoingTransactionsByAddress(campaign.fmtAddress, function(outgoings){
				var unit = coin[campaign.type].unit;
				res.send({
					leftover : (data.account.balance / 1000000) / unit,
					outgoing : outgoings.data,
					campaign : campaign
				});	
			});
		});
	});
});
app.post('/campaign/summary', isAuthenticated, function(req, res){
	db.getCampaignById(req.body.campaignId, function(campaign){
		nem.getOutgoingTransactionsByAddress(campaign.fmtAddress, function(outgoings){
			var userAddressList = getAddressList(outgoings.data, 'recipient');
			db.getUsersByAddressList(userAddressList, function(users){
				res.send({
					campaign : campaign,
					users : users
				});	
			});	
		});
	});
});
app.post('/transfer', isAuthenticated, function(req, res){
	var userId = req.session.passport.user;
	db.getUserById(userId, function(user){
		nem.transferByUser(user, req.body.address, req.body.amount, null, function(result){
			res.send({});
		});
	});
});
module.exports = app;

function enrichTransaction(trans, target, campaigns){
	var cp = {};
	for (var i = 0; i < campaigns.length; i ++){
		cp[campaigns[i].address] = campaigns[i];
	}
	for (var i = 0; i < trans.length; i ++){
		var tran = trans[i];
		trans[i].transaction.campaign = cp[tran.transaction[target]];
	}
	return trans;
}
function getAddressList(transactions, target){
	var ret = [];
	for (var i = 0; i < transactions.length; i++){
		var tran = transactions[i];
		ret.push(tran.transaction[target]);
	}
	return ret;
}

function getAvailableCampaigns(campaigns, incomings){
	availables = [];
	var givenByList = getGivenByList(incomings.data);
	for (var i=0; i<campaigns.length; i++){
		var campaign = campaigns[i];
		if ((!CAMPAIGN_STRICT_MODE) || givenByList.indexOf(campaign.address) == -1){
			availables.push(campaign);
		}
	}
	return availables;
}

function getGivenByList(incomings){
	var ids = [];
	for (var i=0; i<incomings.length; i++){
		ids.push(incomings[i].transaction.sender);
	}
	return ids;
}

function createCampaign(user, data, callback){
	var unit = coin[data.type].unit;
	var amount = unit * Number(data.count);
	data.unit = unit;
	data.amount = amount;
	var newWallet = nem.generateWallet();
	nem.transferByUser(user, newWallet.fmtAddress, amount, null, function(result){
		db.newCampaign(user, data.amount, data.count, data.type, data.unit, data.placeName, data.lat, data.lng, data.message, newWallet, function(){
			callback(result);
		});
	});
}

function doPickCoin(campaign, user, callback){
	nem.getAccount(campaign.fmtAddress, function(data){
		var balance = (data.account.balance / 1000000);
		var unit = coin[campaign.type].unit;
		var actualUnit =
			unit > 0 ? unit - 0.05:
			0;
		if (balance <= unit){
			db.completeCampaign(campaign);
		}
		nem.transferByUser(campaign, user.fmtAddress, actualUnit, null, callback);
	});
}

function isAuthenticated(req, res, next){
	//console.log(req.user);
	if(req.isAuthenticated()){
		return next();
	} else {
		res.redirect("/login");   
	}
}


