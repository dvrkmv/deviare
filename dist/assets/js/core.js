var deviareApp = angular.module('deviareApp', []);

deviareApp.controller('mainController', ['$scope', '$http', function($scope, $http) {
	"use strict";
	
	$scope.redirectData = {};
	$scope.redirects = {};
	
	// Get redirects on page load
	$http.get('api/redirects')
		.success(function(data) {
			$scope.redirects = data;
			console.log(data);
		})
		.error(function(data){
			console.log('Error: ' + data);
		});

	// submit redirect form data
	$scope.createRedirect = function() {
		$http.post('/api/redirects', $scope.formData)
			.success(function(data) {
				$scope.formData = {}; // clear the form so our user is ready to enter another
				$scope.redirects = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// delete a redirect after checking it
	$scope.deleteRedirect = function(id) {
		$http.delete('/api/redirects/' + id)
			.success(function(data) {
				$scope.redirects = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};


}]);