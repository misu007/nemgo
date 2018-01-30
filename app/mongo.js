var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, {useMongoClient: true});

// User Schema
var UserScheme = new Schema({
	_id : mongoose.Schema.Types.ObjectId,
	userName : String,
	facebookId : String,
	twitterId : String,
	photoUrl : String,
	address: String,
	fmtAddress : String,
	walletData : String,
	birthYear : String,
	gender : String,
	created : { 
        type : Date,
        default : Date.now
    }
});
var User = mongoose.model('User', UserScheme);

// Campaign Schema
var CampaignScheme = new Schema({
	_id : mongoose.Schema.Types.ObjectId,
	putBy : { 
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'User'
    },
	sumAmount : Number,
	count : Number,
	type : Number,
	locationId : String,
	locationName : String,
	locationLat : Number,
	locationLng : Number,
	message : String,
	address: String,
	fmtAddress : String,
	walletData : String,
    completed : Boolean,
	created : { 
        type : Date,
        default : Date.now
    }
});
var Campaign = mongoose.model('Campaign', CampaignScheme);

module.exports = {
	newUser : function(userName, facebookId, twitterId, photoUrl, wo, callback){		
		_insertUser(userName, facebookId, twitterId, photoUrl, _conv(wo.fmtAddress), wo.fmtAddress, wo.walletData, callback);		
	},
	updateUser : function(userId, setData, callback){
		User.findOneAndUpdate({_id: userId}, {$set:setData}, function(err, user){
			if (callback) callback(user);
		});
	},
	getCampaignsByAddressList : function(addressList, callback){
		Campaign.find({address : addressList}, {walletData: 0}).populate({path:'putBy', select: 'userName photoUrl birthYear gender'}).exec(function(err, campaigns){
			if (callback) callback(campaigns);
		});
	},
	getUsersByAddressList : function(addressList, callback){
		User.find({address : addressList}, {walletData: 0}, function(err, users){
			if (callback) callback(users);
		});
	},
	getUserByFacebookId : function(facebookId, callback){
		User.find({facebookId : facebookId}, function(err, users){
			if (callback) callback(users);
		});
	},
	getUserByTwitterId : function(twitterId, callback){
		User.find({twitterId : twitterId}, function(err, users){
			if (callback) callback(users);
		});
	},
	getUserById : function(userId, callback){
		User.findById(userId, function(err, user){
			if (callback) callback(user);
		});
	},
	getCampaignById : function(campaignId, callback){
		Campaign.findById(campaignId).populate({path:'putBy', select: 'userName photoUrl'}).exec(function(err, campaign){
			if (callback) callback(campaign);
		});
	},
	getAvailableCampaigns : function(user, callback){
		Campaign.find({completed: false}).populate({path:'putBy', select: 'userName photoUrl'}).exec(function(err, campaigns){
			if (callback) callback(campaigns);
		});
	},
	newCampaign : function(putBy, sumAmount, count, type, unit, locationName, locationLat, locationLng, message, wo, callback){
		_insertCampaign(putBy, sumAmount, count, type, locationName, locationLat, locationLng, message, _conv(wo.fmtAddress), wo.fmtAddress, wo.walletData, function(campaign){
			if (callback) callback(campaign);
		});
	},
	completeCampaign : function(campaign, callback){
		Campaign.findOneAndUpdate({_id: campaign._id}, {$set:{completed:true}},function(err, campaign){
			if (callback) callback(campaign);
		});
	}
};

function _insertUser(userName, facebookId, twitterId, photoUrl, address, fmtAddress, walletData, callback){
	var user = new User({
		_id : new mongoose.Types.ObjectId(),
		userName : userName,
		facebookId : facebookId,
		twitterId: twitterId,
		photoUrl : photoUrl,
		address : address,
		fmtAddress : fmtAddress,
		walletData : walletData
	});
	user.save(function(err){
		if (err) throw err;
		if (callback) callback(user);
	});
}

function _insertCampaign(putBy, sumAmount, count, type, locationName, locationLat, locationLng, message, address, fmtAddress, walletData, callback){
	var campaign = new Campaign({
		_id : new mongoose.Types.ObjectId(),
		putBy : putBy._id,
		sumAmount : sumAmount,
		count: count,
		type: type,
		locationName: locationName,
		locationLat: locationLat,
		locationLng: locationLng,
		message: message,
		completed: false,
		address : address,
		fmtAddress : fmtAddress,
		walletData : walletData
	});
	campaign.save(function(err){
		if (err) throw err;
		if (callback) callback(campaign);
	});
}

function _conv(fmtAddress){
	return fmtAddress.replace(/-/g, '');
}




