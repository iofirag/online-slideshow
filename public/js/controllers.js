var app = angular.module('slideshowApp.controllers', ['ngStorage'])

app.controller('searchCtrl', ['$scope', '$http','$rootScope','$state','$localStorage','myService',
	function($scope, $http, $rootScope, $state, $localStorage,myService) {
		
		$rootScope.vars = {
			database : myService.initFirebase(),
			searchString : '',
			//picturesRef : '',
			resultList : {}
		}
		

		//$scope.found = 'wait'
		$scope.runScript = (e)=>{
			//$scope.found = 'wait';
		    //$scope.notFoundSearchString = '';
		    if (e.keyCode == 13) {
		    	$scope.search()
		        return false;
		    }
		}
		$scope.search = ()=>{
			console.log('search='+ $rootScope.vars.searchString);
			var find = $rootScope.vars.searchString;
			if (!find) return;

			$rootScope.vars.resultList = {};
			
			// Autophoto
			// -by key
			try{
				if (find.indexOf('-')==0){
					var eventsRef_keyFind = $rootScope.vars.database.ref('events/'+find)
					eventsRef_keyFind.once('value', function(snapshot) {
						var albumList = snapshot.val();
						if (!albumList) {
							// not found
						} else {
							// add every object included at the result in the reslultList obj
							if (!$rootScope.vars.resultList.hasOwnProperty(snapshot.key)){
								console.log(snapshot.val())
								$rootScope.vars.resultList[ snapshot.key ] = snapshot.val()
								$localStorage.searchString = snapshot.key
							}
							$state.go('slideshow');
						} 
					})
				}
			}catch(ex){
				// id not valid
			}
			
			// -by value
			var eventsRef = $rootScope.vars.database.ref('events')
			// Search by Description
			var eventsRef_descFind = eventsRef.orderByChild('description').equalTo(find);
			eventsRef_descFind.once('value', function(snapshot) {
				var albumList = snapshot.val();
				if (!albumList) {
					// not found
				} else {
					var resKeys = Object.keys(albumList)
					for (var i in resKeys){
						// add every object included at the result in the reslultList obj
						if (!$rootScope.vars.resultList.hasOwnProperty(resKeys[i])){
							$rootScope.vars.resultList[ resKeys[i] ] = albumList[ resKeys[i] ];
						}
					}
				} 
			});
			// Search by Title
			var eventsRef_titleFind = eventsRef.orderByChild('title').equalTo(find);
			eventsRef_titleFind.once('value', function(snapshot) {
				var albumList = snapshot.val();
				if (!albumList) {
					// not found
				} else {
					var resKeys = Object.keys(snapshot.val())
					for (var i in resKeys){
						// add every object included at the result in the reslultList obj
						if (!$rootScope.vars.resultList.hasOwnProperty(resKeys[i])){
							$rootScope.vars.resultList[ resKeys[i] ] = albumList[ resKeys[i] ];
						}
					}
				} 
			});

		}
	}
])
app.controller('resultsCtrl', ['$scope','$http','$rootScope','$localStorage','myService',
	function($scope, $interval, $http, $rootScope, $localStorage,myService) {
}])
app.controller('slideshowCtrl', ['$scope','$interval','$http','$rootScope','$localStorage','myService','$state',
	function($scope, $interval, $http, $rootScope, $localStorage,myService, $state) {
		
		$scope.loading = true;
		$scope.currImg = {
			key : '',
			url : ''
		}
		// $scope.currImgIndex = 'not_init';
		//$scope.pictureKeysList = [];
		$scope.picturesMap = {};
		

		$scope.init = ()=>{
			
			
			if (!$localStorage.searchString){
				return $state.go('search');
			}
			console.log('$localStorage.searchString=',$localStorage.searchString)
			
			if (!$rootScope.vars){
				console.log('$rootScope.vars is empty. recover params from $localStorage')
				$rootScope.vars = {
					database : myService.initFirebase(),
					searchString : $localStorage.searchString
				}
			}
			console.log('$rootScope.vars=',$rootScope.vars)

			// $scope.loading = true;
			console.log('$rootScope.vars.searchString='+$rootScope.vars.searchString)
			var eventRef = $rootScope.vars.database.ref('events/'+$rootScope.vars.searchString);
			
			// Init all the pictures url and text.
			eventRef.once('value', function(snapshot) {
				if (!snapshot) return 'key "'+$rootScope.vars.searchString+'" not exist'

				var userEvent = snapshot.val();
				$scope.picturesMap = userEvent.pictures;
				//console.log('$scope.picturesMap=',$scope.picturesMap)
				if ( Object.keys($scope.picturesMap).length){
					$scope.startInterval();
					console.log('id valid')
				}
				console.log('$scope.loading='+$scope.loading)
			});


			eventRef.on('child_added', function(data) {
				if ( data.key.indexOf('-')!=0 ) return;

				// Add new picture data in map
				debugger
				$scope.picturesMap[data.key] = data.val();
				debugger;
				console.log('child has added='+data.key)
				// $scope.$apply()
			});
			eventRef.on('child_changed', function(data) {
				// Change this data in map by the exist key // maybe check for exist key for safe
				debugger;
				if (data.key=='pictures'){
					$scope.picturesMap = data.val();
				}
				// else{
				// 	$scope.picturesMap[data.key] = data.val();
				// }
				console.log('child_Changed', data.val() );
				debugger
				// $scope.$apply()
			});
			eventRef.on('child_removed', function(dataDel) {				
				if ( data.key.indexOf('-') != 0 ) return;

				//check if this is current image AND there is more picture
				// Detect if it's current show
				if ($scope.currImg.key == dataDel.key){
					// Change picture
					$scope.stopInterval();
					// $scope.intervalFunction();
					$scope.startInterval();
				}else{
					// delete another img
				}
				// Remove deleted pic key from map
				delete $scope.picturesMap[dataDel.key];
				// $scope.$apply()
			});
		}
		$scope.startInterval = ()=>{
			// Remove loading image
			$scope.loading = false
			// Start the interval to show
			if (Object.keys($scope.picturesMap).length >0){
				$scope.intervalFunction()
				$scope.interval = setInterval(()=>{
					$scope.intervalFunction();
				}, 10000);
			}
		}
		$scope.stopInterval = ()=>{
			$scope.interval = null;
			$scope.$apply()
		}
		$scope.intervalFunction = ()=>{
			$scope.getNextIndexToShow();
			var imgDataToShow = $scope.picturesMap[ $scope.currImg.key ];
			$scope.currImg.url = imgDataToShow.dataUrl;
			console.log('$scope.currImg.url='+$scope.currImg.url)
			$scope.$apply()
		}
		$scope.getNextIndexToShow = ()=>{
			var pictureKeysList = Object.keys($scope.picturesMap)
			var currIndex = Object.keys($scope.picturesMap).indexOf($scope.currImg.key)

			if(currIndex >= 0 && currIndex+1 < pictureKeysList.length){
				// Get next key
				$scope.currImg.key = Object.keys($scope.picturesMap)[currIndex+1];
			}else{
				// Start from the beginning
				$scope.currImg.key = Object.keys($scope.picturesMap)[0];
			}
			$scope.$apply()
		}


		// $scope.initArrayPrototype = ()=>{
		// 	Array.prototype.indexOf || (Array.prototype.indexOf = function(d, e) {
		// 	    var a;
		// 	    if (null == this) throw new TypeError('"this" is null or not defined');
		// 	    var c = Object(this),
		// 	        b = c.length >>> 0;
		// 	    if (0 === b) return -1;
		// 	    a = +e || 0;
		// 	    Infinity === Math.abs(a) && (a = 0);
		// 	    if (a >= b) return -1;
		// 	    for (a = Math.max(0 <= a ? a : b - Math.abs(a), 0); a < b;) {
		// 	        if (a in c && c[a] === d) return a;
		// 	        a++
		// 	    }
		// 	    return -1
		// 	});
		// }
}])