var mapStyles = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#aaaaaa"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.business",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dadada"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c9c9c9"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  }
];

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
var obj = {
	user: {
		userName: '',
		userPhotoUrl : '',
    birthYear : '',
    gender : '',
    balance: '---', 
    fmtAddress: 'xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxx',
    transactions : {
        incoming: [],
        outgoing: [],
        unconfirmed: []
    }
	},
  incomingCoins : {
    '1': 0, '2': 0, '3': 0, '4': 0
  },
	campaign: {
	},
	withdraw : {
		address : '',
		amount: 0
	},
  campaignDetail : {
    show: false
  },
	newCampaign : {
		placeName: '',
		placeId: '',
		message: '',
		lat: 35.68,
		lng: 139.76,
		type: '4',
		count: 1,
		fee: 0.05,
		total: 0
	},
  myCampaignDetail : {
    campaign : {},
    users : []
  },
  myCampaignDetailSummary : {
    generation : {
      detail : [0,0,0,0,0,0,0,0,0,0]
    },
    gender : {
      detail : [0,0]
    }
  },
	app : {
		loading: false,
    processing: false
	},
	textSearch : {
		word: '',
		list: [],
		active: false
	},
	location : {
		active: false,
		init: false,
		followMode: false,
    lat: null,
    lng: null
	},
  layer4show : '',
  registerStatus : false,
  birthYearOptions : [{text: '-- SELECT --', value: ''}]
};
for (var i = 1900; i < 2015; i++){
  obj.birthYearOptions.push({
    text: i, value: i
  })
}
var campaigns = {};
var papi;
var map;
var map0;
var marker;
var markers = [];
var marker0;
var circle0;
var methods = {
  openEditProfile : function(){
    this.layer4show = 'active';
  },
  closeEditProfile : function(){
    this.layer4show = '';

  },
	changeLocationFollow : function(){
		this.location.followMode = !this.location.followMode;
		if (this.location.followMode) getLocation();
	},
  saveProfile : function(){
    majax(this.user, 'profile/save', function(data){ 
      refresh();
    });
  },
	putCoin : function(){
    this.app.processing = true;
		majax(this.newCampaign, 'coin/put', function(data){
			refresh();
			doReturnToLayer2();
		});

	},
	pickCoin : function (){
    this.app.processing = true;
		majax({
			putCoinId: this.campaignDetail._id		
		}, 'coin/pick', function(data){
			closeCampaignDetail();
			refresh();
		});

	},
	openWallet : function(){
		$('.layer2').addClass('active');
		$('.layer1').addClass('disabled');
	},
	refreshAccount : function(){
		refresh();
	},
	closeWallet : function(){
		$('.layer2').removeClass('active');
		$('.layer1').removeClass('disabled');
	},
	openCreateCampaign : function(){
		$('.layer3').addClass('active');
	},
	closeCreateCampaign : function(){
		$('.layer3').removeClass('active');
	},
	openLayer3 : function(evt){
		var target = evt.currentTarget.getAttribute('data-target');
		$('.layer2').addClass('disabled');
		$('.layer3').each(function(){
			if ($(this).hasClass(target)){
				$(this).addClass('active');
			} else {
				$(this).removeClass('active');
			}
		});
	},
  openMyCampaignDetail : function(evt){
    resetMyCampaignDetailSummary();
    var target = evt.currentTarget.getAttribute('data-target');
    majax({campaignId: target}, 'campaign/summary', function(data){ 
        Vue.set(obj, 'myCampaignDetail', data);
        window,setTimeout(function(){
        summarizeGeneration(data.users);
        }, 50);
        window,setTimeout(function(){
        summarizeGender(data.users);
        }, 100);
    });

    $('.layer2').addClass('disabled');
    $('.layer3').each(function(){
      if ($(this).hasClass('my-campaign-detail')){
        $(this).addClass('active');
      } else {
        $(this).removeClass('active');
      }
    });
  },
	returnToLayer2 : function(){
		doReturnToLayer2();
	},
	clickedResultItem : function(evt){
		var target = evt.currentTarget.getAttribute('data-id');
		var name = evt.currentTarget.getAttribute('data-name');
		var lat = evt.currentTarget.getAttribute('data-lat');
		var lng = evt.currentTarget.getAttribute('data-lng');
		var latlng = new google.maps.LatLng(lat, lng);
		marker.setPosition(latlng);
		map.setCenter(latlng);
		obj.newCampaign.placeName = name;
		obj.newCampaign.placeId = target;
		obj.newCampaign.lat = lat;
		obj.newCampaign.lng = lng;
		obj.textSearch.active = false;
		refreshNewCampaignPlaceSearch(name);
	},
	activateTextSearch : function(){
		obj.textSearch.active = true;
	},
	calcTotalCost : function(){
		var type = this.newCampaign.type;
		var count = Number(this.newCampaign.count);
		var total = 0;
		this.newCampaign.total = Math.round(100 * (coin[type].unit * count + 0.05)) / 100;
	},
  withdrawNem : function(){
    if (this.withdraw.address.match(/^T/)){
      this.app.processing = true;
      majax(this.withdraw, 'transfer', function(data){
        refresh();
        doReturnToLayer2();
      });
    } else {
      alert('Invalid Address.');
    }
  }
};
var filters = {
  normalizeDate : function(val){
    if (!val) return '';
    var mo = moment(val);
    return mo.format('MMM Do  hh:mm');
  },
  normalizeDateOfNem : function(val){
    var ts = Number(moment([2015, 2, 29, 0, 6, 25, 0]).format('X')) + val;
    return moment.unix(ts).format('MMM Do  HH:mm');
  },
  fixAmount : function(val){
    return Math.round(val * 100) / 100;
  },
  fixAmountOfNem : function(val){
    return Math.round(val * 100 / 1000000) / 100;
  }
};

initVue();

$(function(){    
	initFastClick();
	startLocationDetecting();
  getWalletAccount();
});

function initPutCoinMap(lat, lng){
	var centerl = new google.maps.LatLng(lat, lng);
  	map = new google.maps.Map(document.getElementById('put-map'), {
      center: centerl,
      zoom: 16,
      disableDefaultUI: true,
      styles: mapStyles
    });
    map.addListener("click", function (arg) {
		refreshNewCampaignPlaceSearch();
	}) ;

	var myLatLng = {lat: lat, lng: lng};

	var img = {
		url: '/img/nem.png',
		size: new google.maps.Size(24, 24),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(12, 12),
		scaledSize: new google.maps.Size(24, 24)
	};	  	
  	marker = new google.maps.Marker({
	    position: myLatLng,
	    map: map,
	    icon: img
	});

	papi = new google.maps.places.PlacesService(map);
}
function initPickCoinMap(lat, lng){
	var pyrmont = new google.maps.LatLng(lat, lng);

  	map0 = new google.maps.Map(document.getElementById('pick-map'), {
      center: pyrmont,
      zoom: 16,
      disableDefaultUI: true,
      styles: mapStyles
    });
    map0.addListener('click', function(){
    	closeCampaignDetail();
    });
}

function startLocationDetecting(){
	window.setInterval(function(){
		getLocation();
	}, 5000);
}

function summarizeGeneration(userList){
  var detail = [0,0,0,0,0,0,0,0,0,0];
  var total = 0;
  for (var i=0; i<userList.length; i++){
    var birthYear = userList[i].birthYear;
    if (birthYear && birthYear.length > 3){
      var thisYear = moment().year();
      var age = thisYear - birthYear;
      var id = Math.floor(age / 10);
      detail[id] = detail[id] + 1;
      total += 1;
    }
  }
  obj.myCampaignDetailSummary.generation.detail = detail;
  obj.myCampaignDetailSummary.generation.total = total;
}

function summarizeGender(userList){
  var detail = [0,0];
  var total = 0;
  for (var i=0; i<userList.length; i++){
    var gender = userList[i].gender;
    if (gender && (gender == 'female' || gender == 'male')){
      var id = 
        gender == 'female' ? 0:
        gender == 'male' ? 1:
        '';
      detail[id] = detail[id] + 1;
      total += 1;
    }
  }
  obj.myCampaignDetailSummary.gender.detail = detail;
  obj.myCampaignDetailSummary.gender.total = total;
}

function resetMyCampaignDetailSummary(){
    obj.myCampaignDetailSummary.generation.detail = [0,0,0,0,0,0,0,0,0,0];
    obj.myCampaignDetailSummary.gender.detail = [0,0];
}

function getLocation(){
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
         lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      obj.location.lat = position.coords.latitude;
      obj.location.lng = position.coords.longitude;
      if (map0) {
        var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        if (!obj.location.init){
            map0.setCenter(pos);
           map0.setZoom(19);
           obj.location.init = true;
           var img = {
            url: '/img/location.png',
            size: new google.maps.Size(20, 20),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(10, 10),
            scaledSize: new google.maps.Size(20, 20)
          };
          marker0 = new google.maps.Marker({
            position: latlng,
            map: map0,
            icon: img
          });
          circle0 = new google.maps.Circle({
            center: latlng,
            fillColor: 'rgb(19,154,134)',
            fillOpacity: 0.1,
            map: map0,
            radius: 50,
            strokeColor: 'rgb(19,154,134)',
            strokeOpacity: 0.3,
            strokeWeight: 1
          });
        } else {	
            marker0.setPosition(latlng);
            circle0.setCenter(latlng);
            if (obj.location.followMode){
             map0.setCenter(pos);
           }
        }
     } else {
          initPutCoinMap(position.coords.latitude, position.coords.longitude);
          initPickCoinMap(position.coords.latitude, position.coords.longitude);
          getCoinAvailable();
     }
     obj.location.active = true;
  }, function(){});
 } else {
   obj.location.active = false;
 }

}

function initFastClick(){
	FastClick.attach(document.body); 
}

function doReturnToLayer2(){

	obj.newCampaign.placeName = '';
	obj.newCampaign.placeId = '';
	obj.newCampaign.message = '';
	obj.newCampaign.count = 1;
	obj.newCampaign.fee = 0.05;
	obj.newCampaign.total = 0.15;
	obj.textSearch.word = '';
	obj.textSearch.active = false;

	$('.layer3').each(function(){
		$(this).removeClass('active');
	});
	$('.layer2').removeClass('disabled');
}

function initVue(){
	var vm = new Vue({
		el: '#app',
		data: obj,
		methods : methods,
    filters : filters
	});
	vm.$watch('textSearch.word', function (newValue, oldValue){
		var word = newValue;
		if (word && word.length > 2){
			papi.textSearch({
				location: map.getCenter(),
				radius: '1000',
				query: word
			}, function(results, status){
				if (status == google.maps.places.PlacesServiceStatus.OK){
				    obj.textSearch.list = results;
				}
			});
		} else {
			obj.textSearch.list = [];
		}

	});

}
function refreshNewCampaignPlaceSearch(word){
	obj.textSearch.list = [];
	if (!(word && word.length>0)) word = '';
	obj.textSearch.word = word;
}

function refresh(){
	getWalletAccount();
	getCoinAvailable();
}

function onPickMarkerClick(id){
	closeCampaignDetail();
	obj.campaignDetail.show = false;
	openCampaignDetail();
	map0.setCenter(new google.maps.LatLng(campaigns[id].lat, campaigns[id].lng));
	getCampaignDetail(id);
}

function closeCampaignDetail(){
	$('.campaign-detail').removeClass('active');
}


function getWalletAccount(){
	majax({}, 'account', function(data){
    var registerFlag = false;
    if (!(data.gender && data.gender.length > 0)) {
      data.gender = '';
      registerFlag = true;
    }
    if (!(data.birthYear && data.birthYear.length > 0)) {
      data.birthYear = '1990';
      registerFlag = true;
    }
    if (registerFlag){
      Vue.set(obj, 'layer4show', 'active');
      Vue.set(obj, 'registerStatus', false);
    } else {
      Vue.set(obj, 'layer4show', '');
      Vue.set(obj, 'registerStatus', true);
    }
    Vue.set(obj, 'user', data);
		if (data.transactions.unconfirmed.length > 0){
      obj.app.processing = true;
			startLoading();
			setTimeout(function(){
				refresh();
			}, 5000);
		} else {
      obj.app.processing = false;
    }
    countIncomingCoins();
	});
}


function countIncomingCoins(){
  var coins = {'1' : 0, '2' : 0, '3' : 0, '4' : 0};
  var ic = obj.user.transactions.incoming;
  for (var i=0; i < ic.length; i++){
    if (ic[i].transaction.campaign){
      coins[ic[i].transaction.campaign.type] += 1;
    }
  }
  Vue.set(obj, 'incomingCoins', coins);
}

function getCoinAvailable(){

	for (var i=0; i<markers.length; i++){
		var marker = markers[i];
		marker.setMap(null);
	}
	markers = [];

	majax({}, 'coin/available', function(datas){	
		for(var i=0; i<datas.length; i++){
			var data = datas[i];
			campaigns[data._id] = {lat:data.locationLat, lng:data.locationLng};
    		var img = {
    			url: '/img/coin_' + data.type + '.png',
    			size: new google.maps.Size(24, 24),
    			origin: new google.maps.Point(0, 0),
    			anchor: new google.maps.Point(12, 12),
    			scaledSize: new google.maps.Size(24, 24)
    		};
		  	var marker = new google.maps.Marker({
			    position: new google.maps.LatLng(data.locationLat, data.locationLng),
			    map: map0,
			    icon: img
		  	});
			markers.push(marker);
      marker.addListener('click', (function(id) {
            return function() {
              onPickMarkerClick(id);
            }
          })(data._id));
			var obj = {
				marker : marker,
				locationName : data.locationName,
				message : data.message,
				id: data._id
			};
		}
	});
}

function getCampaignDetail(campaignId){
	majax({
		campaignId: campaignId		
	}, 'campaign/detail', function(data){
    data.campaign.distance = getDistance(data.campaign.locationLat, data.campaign.locationLng, obj.location.lat, obj.location.lng);
    data.campaign.amount = coin[data.campaign.type].unit;
    data.campaign.show = true;
    Vue.set(obj, 'campaignDetail', data.campaign);
	});
}

function openCampaignDetail(){
	$('.campaign-detail').addClass('active');
}

function majax(data0, target, callback){
	startLoading();
	$.ajax({
		async: true,
		type: 'POST',
		data: JSON.stringify(data0),
		contentType: 'application/json',
		url: window.location.origin + '/' + target,						
		success: function(data) {
			stopLoading();
			if (data.error && data.error.length > 1 || data.errorCode && data.errorCode.length > 1){
				window.setTimeout(function(){
					alert(data.error + ' : ' + data.error_description);
				}, 100);
			} else {
				callback(data);
			}
		},
		error: function(req, status, err){
			stopLoading();
      location.href = '/logout'; 
		}
	});	
}

function startLoading(){
	obj.app.loading = true;
}

function stopLoading(){
	obj.app.loading = false;
}

function getDistance(lat1, lng1, lat2, lng2) {
   var distance = 1000 * 6378.14 * Math.acos(Math.cos(radians(lat1))* 
    Math.cos(radians(lat2))*
    Math.cos(radians(lng2)-radians(lng1))+
    Math.sin(radians(lat1))*
    Math.sin(radians(lat2)));
   return Math.round(distance);
}

function radians(deg){
  return deg * Math.PI / 180;
}

