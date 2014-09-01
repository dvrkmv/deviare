var deviareApp = angular.module('deviareApp', []);

deviareApp.controller('mainController', [
	'$scope', 
	'$http', 
	'$timeout', 
	function($scope, $http, $timeout) {
		'use strict';
		
		$scope.redirectData = {};
		$scope.redirects = {};
		$scope.errorMsg = '';
		
		// Get redirects on page load
		$http.get('api/redirects')
			.success(function(data) {
				$scope.redirects = data;
				//console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});

		// submit redirect form data
		$scope.createRedirect = function() {
			$http.post('/api/redirect', $scope.formData)
				.success(function(data) {
					$scope.formData = {}; // clear the form so our user is ready to enter another
					console.log(data, data.err);
					if (data.err !== null && typeof data.err !== 'undefined') {
						$scope.errorMsg = data.err;
						$timeout(function() {
							$scope.errorMsg = '';
						}, 3000);
					} else {
						$scope.redirects = data;
					}
				})
				.error(function(data) {
					console.log('Error: ' + data);
				});
		};

		// delete a redirect after checking it
		$scope.deleteRedirect = function(id) {
			$http.delete('/api/redirect/' + id)
				.success(function(data) {
					if (data.err !== null && typeof data.err !== 'undefined') {
						$scope.errorMsg = data.err;
						$timeout(function() {
							$scope.errorMsg = '';
						}, 3000);
					} else {
						$scope.redirects = data;
					}
					console.log(data);
				})
				.error(function(data) {
					console.log('Error: ' + data);
				});
		};
	}
]);

deviareApp.controller('accountController', [
	'$scope',
	'$http', 
	function($scope, $http) {
		'use strict';

		// Make request for User information
		$http.get('/api/account')
			.success(function(data) {
				console.log(data);

				// set user information on scope
				$scope.user = data;
			})
			.error(function(data) {
				console.log(data);
			}
		);
	}
]);