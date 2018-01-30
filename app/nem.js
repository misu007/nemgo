var nem = require('nem-sdk').default;
var async = require('async');
var crypto = require('crypto');
var CRYPT_ALGORITHM = process.env.CRYPT_ALGORITHM;
var CRYPT_PASSPHRASE = process.env.CRYPT_PASSPHRASE;
var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultTestnet, nem.model.nodes.defaultPort);

module.exports = {
	generateWallet : function(){
		var walletName = 'NEMGO-' + crypto.randomBytes(8).toString('hex');
		var password = crypto.randomBytes(12).toString('hex');
		var wallet = _generateWallet(walletName, password);
		var thisWallet = {
			fmtAddress : _getFmtAddress(wallet),
			walletData : _encryptWallet(wallet, password)
		};
		return thisWallet;
	},
	getAccount : function(fmtAddress, callback){
		var address = _conv(fmtAddress);
		nem.com.requests.account.data(endpoint, address).then(function(data){
			callback(data);
		});
	},
	getAllTransactionsByAddress : function(fmtAddress, callback){
		var address = _conv(fmtAddress);
		nem.com.requests.account.transactions.all(endpoint, address).then(function(data){
			callback(_addSender(data));
		});

	},
	getIncomingTransactionsByAddress : function(fmtAddress, callback){
		var address = _conv(fmtAddress);
		nem.com.requests.account.transactions.incoming(endpoint, address).then(function(data){
			callback(_addSender(data));
		});

	},
	getOutgoingTransactionsByAddress : function(fmtAddress, callback){
		var address = _conv(fmtAddress);
		nem.com.requests.account.transactions.outgoing(endpoint, address).then(function(data){
			callback(_addSender(data));
		});

	},	
	getUnconfirmedTransactionsByAddress : function(fmtAddress, callback){
		var address = _conv(fmtAddress);
		nem.com.requests.account.transactions.unconfirmed(endpoint, address).then(function(data){
			callback(_addSender(data));
		});

	},
	transferByUser : function (user, recipient, amount, message, callback){
		var decrypted = _decryptWallet(user.walletData);
		var wlt = decrypted.wlt;
		var password = decrypted.password;
		var wallet = _retrieveFromWlt(wlt);
		_transfer(wallet, password, recipient.replace(/-/g, ''), amount, message, callback);	
	}
};

function _addSender(transactions){
	for(var i=0; i<transactions.data.length; i++){
		var tran = transactions.data[i];
		var signer = tran.transaction.signer;
		transactions.data[i].transaction.sender = _getAddressFromKey(signer);
	}
	return transactions;
}	
function _getAddressFromKey(publicKey){
	var address = nem.model.address.toAddress(publicKey, nem.model.network.data.testnet.id);
	return address;
}

function _getFmtAddress(wallet){
	var walletAccount = wallet.accounts[0];
	var fmtAddress = nem.utils.format.address(walletAccount.address);
	return fmtAddress;
}

function _generateWallet(walletName, password){
	var wallet = nem.model.wallet.createPRNG(walletName, password, nem.model.network.data.testnet.id);
	return wallet;
}

function _transfer(wallet, password, recipient, amount, message, callback){
	var common = _getCommon(wallet, password);
	var transferTransaction = nem.model.objects.create('transferTransaction')(recipient, amount, message);
	var transactionEntity = nem.model.transactions.prepare("transferTransaction")(common, transferTransaction, nem.model.network.data.testnet.id);
	var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultTestnet, nem.model.nodes.defaultPort);	
	nem.model.transactions.send(common, transactionEntity, endpoint).then(function(res){
		if (callback) callback(res);
	});
}

function _getCommon(wallet, password){
	var common = nem.model.objects.create('common')(password, ''); 
	var walletAccount = wallet.accounts[0];
	nem.crypto.helpers.passwordToPrivatekey(common, walletAccount, walletAccount.algo);
	return common;
}

function _convertToWlt(wallet){
	var wordArray = nem.crypto.js.enc.Utf8.parse(JSON.stringify(wallet));
	var wlt = nem.crypto.js.enc.Base64.stringify(wordArray);
	return wlt;
}
function _retrieveFromWlt(wlt){
	var wallet = JSON.parse(new Buffer(wlt, 'base64').toString());
	return wallet;
}

function _encryptWallet(wallet, password){
	var text = JSON.stringify({
		wlt: _convertToWlt(wallet),
		password: password
	});
	var cipher = crypto.createCipher(CRYPT_ALGORITHM, CRYPT_PASSPHRASE);
	var crypted = cipher.update(text,'utf8','base64');
	crypted += cipher.final('base64');
	return crypted;
}
function _decryptWallet(text){
	var decipher = crypto.createDecipher(CRYPT_ALGORITHM, CRYPT_PASSPHRASE);
	var dec = decipher.update(text,'base64','utf8');
	dec += decipher.final('utf8');
	return JSON.parse(dec);
}

function _conv(fmtAddress){
	return fmtAddress.replace(/-/g, '');
}

