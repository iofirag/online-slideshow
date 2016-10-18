var app = angular.module('slideshowApp.services', [])

app.factory('myService', function() {
 //    var config = {
	// 	apiKey: "AIzaSyDmReWWFJ9a0xY4T-ofnVGXJ08H_i1Iz7k",
	// 	authDomain: "online-slideshow.firebaseapp.com",
	// 	databaseURL: "https://online-slideshow.firebaseio.com",
	// 	storageBucket: "online-slideshow.appspot.com",
	// 	messagingSenderId: "427849476383"
	// };
	// firebase.initializeApp(config);
	// $scope.database = firebase.database();
	
    return {
  //   	database : '',
		initFirebase : ()=>{
			return firebase.database()
		}
    };
});