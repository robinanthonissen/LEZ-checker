var geocoder;
var map;
var openData_url = "http://datasets.antwerpen.be/v4/gis/lezafbakening.json";
var database_url = 'https://lez-checker.firebaseio.com/users.json';
var databasePost_url = 'https://lez-checker.firebaseio.com/users/';
var parsed;
var mapZones = [];
var jsonObj;
var inZone = false;
var coordinates = [];
var address = "";
var checked = false;
var zone = "zone.png";
var nozone = "nozone.png";
var userId;
var name;
var email = "test@test.be";
var straat;
var gemeente;
var locations = [];
var users;
var userExists = true;
var currentUser;
var su;
var stripeAuth = "Bearer sk_test_GWZ2AQy2WENzOpgU97ir0fBE";
//var stripeAuth = "sk_test_GWZ2AQy2WENzOpgU97ir0fBE"

window.initMap = function () {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lng: 4.4035802,
			lat: 51.222504
		},
		zoom: 13,
	});
	geocoder = new google.maps.Geocoder();
}

// Get the modal
var modal = document.getElementById('myModal');
// Get the button that opens the modal
var btn = document.getElementById("donateBtn");
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
// When the user clicks the button, open the modal 
var donateBtn = function () {
	modal.style.display = "block";
}
// When the user clicks on <span> (x), close the modal
var spanClick = function () {
	modal.style.display = "none";
}
// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
}

/*var config = {
	apiKey: "AIzaSyDwMelp1i3d6LbUNw6qBLUTjyLXqARzABg",
	authDomain: "lez-checker.firebaseapp.com",
	databaseURL: "https://lez-checker.firebaseio.com",
	projectId: "lez-checker",
	storageBucket: "lez-checker.appspot.com",
	messagingSenderId: "461492775973"
};
firebase.initializeApp(config);
var database = firebase.database();*/

var webApp = angular.module('webApp', ['ngRoute']).config(function ($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'main.html',
			controller: 'mainController'
		})
		.when('/myLocations', {
			templateUrl: 'myLocations.html',
			controller: 'databaseController'
		})
		.when('/donate', {
			templateUrl: 'donate.html',
			controller: 'donationController'
		})
		.when('/main', {
			templateUrl: 'main.html',
			controller: 'mainController'
		})
		.otherwise({
			redirectTo: '/'
		});
});;

webApp.service('dbService', ['$http', function ($http) {
	//var su = this.saveUser;
	this.getUser = function (userID) {
		//TODO: get user by facebook ID
		$http.get(databasePost_url + userID + ".json").then(function (res) {
			console.log(res.data);
			if (res.data == null) {
				console.log("niet in database");
				userExists = false;
				su(userId, name, email, locations);
			} else {
				userExists = true;
				currentUser = res.data;
				console.log(currentUser);
				locations = res.data.locations;
			}
		});
	}

	this.saveUser = function (userId, name, email, locations) {
		/*firebase.database().ref('users/' + userId).set({
			username: name,
			email: email //,
			//location : location
		});*/
		currentUser = {
			"username": name,
			"email": email,
			"locations": locations
		};

		$http.patch(databasePost_url + userId + "/.json", currentUser).success(function (res) {
			console.log("new user posted");
			console.log(currentUser);
		});
	}

	this.saveLocation = function (userId, straat, gemeente, inzone) {
		var newLocation = {
			"straat": straat,
			"gemeente": gemeente,
			"inZone": inzone
		};
		locations.push(newLocation);
		currentUser.locations = locations;

		$http.patch(databasePost_url + userId + "/.json", currentUser).success(function (res) {
			console.log(res);
			console.log(currentUser);
			console.log("new location posted");
		});
		/*firebase.database().ref('users/' + userId).push({
			straat: straat,
			gemeente: gemeente,
			inZone: inzone
		});*/
	}
}]);

webApp.controller('mainController', function ($scope, $http, dbService) {
	window.initMap = function () {
		map = new google.maps.Map(document.getElementById('map'), {
			center: {
				lng: 4.4035802,
				lat: 51.222504
			},
			zoom: 13,
		});
		geocoder = new google.maps.Geocoder();
	}

	$scope.result;
	$http({
		method: "GET",
		url: openData_url
	}).then(function mySucces(response) {
		jsonObj = response.data.data[0].geometry;
		parsed = JSON.parse(jsonObj);
		var arr = [];
		arr = Object.values(parsed);
		var zones = arr[1];
		for (j = 0; j < zones.length; j++) {
			var zone = zones[j];
			var coor = [];
			for (i = 0; i < zone.length; i++) {
				var set = zone[i];
				coor.push({
					lng: set [0],
					lat: set [1]
				});
			}
			coordinates.push(coor);
		}
		for (i = 0; i < coordinates.length; i++) {
			var bermudaTriangle = new google.maps.Polygon({
				//paths: triangleCoords,
				paths: coordinates[i],
				strokeColor: '#FF0000',
				strokeOpacity: 0.8,
				strokeWeight: 2,
				//fillColor: '#FF0000',
				//fillOpacity: 0.35
			});
			bermudaTriangle.setMap(map);
			mapZones.push(bermudaTriangle);
		}
	}, function myError(response) {
		$scope.myWelcome = response.statusText;
	});

	if (userId != null) {
		currentUser = dbService.getUser(userId);
		console.log("getUser uitgevoerd in mainController");
	}
	/*$http({
		method: "GET",
		url: database_url
	}).then(function mySucces(response) {
		users = response.data;
		console.log(users);
	})*/

	$scope.resultZone = "***";

	$scope.checkAdres = function () {
		inZone = false;
		$scope.adres = $scope.straatNr + " " + $scope.gemeente;
		address = $scope.adres;
		straat = $scope.straatNr;
		gemeente = $scope.gemeente;
		$scope.straatNr = "";
		$scope.gemeente = "";
		$scope.adres = "";
		geocodeAddress(geocoder, map);
		checked = true;
	}

	function geocodeAddress(geocoder, resultsMap) {
		geocoder.geocode({
			'address': address
		}, function (results, status) {
			if (status === 'OK') {
				resultsMap.setCenter(results[0].geometry.location);
				var marker = new google.maps.Marker({
					map: resultsMap,
					position: results[0].geometry.location
				});
				var resultCoor = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
				var marker = new google.maps.Marker({
					position: resultCoor,
					map: map,
					title: address
				});
				var i = 0;
				while (i < mapZones.length && inZone == false) {
					//for (i = 0; i < mapZones.length; i++) {
					inZone = google.maps.geometry.poly.containsLocation(marker.getPosition(), mapZones[i]) ?
						true :
						false;
					console.log("In zone: " + inZone);
					i++;
				}
				$scope.divHeight = $("#infoDiv").height();
				$scope.height = $scope.divHeight + 'px';
				if (inZone == true) {
					$scope.imgSrc = zone;
					$scope.resultZone = "Uw bestemming bevindt zich in de lage emissiezone.";
				} else {
					$scope.imgSrc = nozone;
					$scope.resultZone = "Uw bestemming bevindt zich niet in de lage emissiezone.";
				}
				$scope.checked = true;
				setTimeout(function () {
					$scope.$apply(function () {
						$scope.checked = true;
					});
				}, 100);
				if (userId != null) {
					//databaseService.saveLocation(userId, straat, gemeente, inZone);
					dbService.saveLocation(userId, straat, gemeente, inZone);
					console.log("saved location");
				}
			} else {
				alert('Geocode was not successful for the following reason: ' + status);
			}
		});
	}
});

webApp.controller('fbController', function ($scope, $http, dbService) {

	su = dbService.saveUser;

	parseParams = function () {
		var params = {},
			queryString = location.hash.substring(1),
			regex = /([^&=]+)=([^&]*)/g,
			m;
		while (m = regex.exec(queryString)) {
			params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
		}
		return params;
	};

	params = parseParams();

	$scope.name = "Please login";
	if (params.access_token) {
		$http({
			method: 'GET',
			url: 'https://graph.facebook.com/v2.5/me?fields=id,name&access_token=' + params.access_token
		}).success(function (response) {
			$scope.name = response.name;
			console.log(response);
			userId = response.id;
			if (userId != null) {
				dbService.getUser(userId);
				console.log(currentUser);
			}
			name = response.name;
			//TODO: check of user al in database zit
			//dbService.saveLocation(userId ,"Ellermanstraat", "Antwerpen", true);
			if (userExists == false) {
				dbService.saveUser(userId, name, email, locations);
			}
			/*			if (currentUser.username == ""){
							dbService.saveUser(userId, name, email, locations);
						}
						else{
							console.log(currentUser);
						}*/
		}, function (err) {
			console.log(err);
			$scope.name = "login failed";
		});
	}

	$scope.login = function () {
		window.location.href = "https://www.facebook.com/dialog/oauth?client_id=651160725054150&response_type=token&redirect_uri=http://localhost:5000/"
	};

});

webApp.controller('donationController', function ($scope, $http) {
	var getToken = function (successCb) {
		var request = {
			method: 'POST',
			url: 'https://api.stripe.com/v1/tokens',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': stripeAuth
			},
			data: 'card[number]=' + $scope.cardNumber + '&card[exp_month]=' + $scope.cardExpMonth + '&card[exp_year]=' + $scope.cardExpYear + '&card[cvc]=' + $scope.cardCvc
		};
		var errCb = function (err) {
			alert("Wrong " + JSON.stringify(err));
		};
		$http(request).then(function (data) {
			//debugger;
			successCb(data["data"]["id"]); // Of data.data.id, is hetzelfde
			console.log(data);
		}, errCb).catch(errCb);
	};

	var createCustomer = function (token, successCb) {
		var request = {
			method: 'POST',
			url: 'https://api.stripe.com/v1/customers',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': stripeAuth
			},
			data: 'source=' + token
		};
		var errCb = function (err) {
			alert("Wrong " + JSON.stringify(err));
		};
		$http(request).then(function (data) {
			successCb(data.data.id);
		}, errCb).catch(errCb);
	};

	var createSubscription = function (customer, plan, successCb) {
		var request = {
			method: 'POST',
			url: 'https://api.stripe.com/v1/subscriptions',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': stripeAuth
			},
			data: 'plan=' + plan + '&customer=' + customer
		};
		var errCb = function (err) {
			alert("Wrong " + JSON.stringify(err));
		};
		$http(request).then(function (data) {
			successCb()
		}, errCb).catch(errCb);
	};

	var subscribe = function (plan) {
		getToken(function (token) {
			createCustomer(token, function (customer) {
				createSubscription(customer, plan, function (status) {
					alert("Subscribed!");
				});
			});
		});
	};

	$scope.donate = function () {
		subscribe($scope.plan);
	};
});
