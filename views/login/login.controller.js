(function () {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$location', 'AuthenticationService', '$rootScope', '$scope'];

    function LoginController($location, AuthenticationService, $rootScope, $scope) {
//    variables initialization
        var vm = this;

        vm.login = login;
        $scope.toogle = false;
        $scope.error = false;
        $scope.success = false;
        $rootScope.emailError = false;
        $scope.passwordError = false;
        $scope.errorMessage = "";
        $scope.successMessage = "";
        $scope.progress = false;
        $scope.email = null;
        $scope.password = null;
        (function initController() {
            // reset login status
            AuthenticationService.ClearCredentials();
            $scope.userLogged = false;
        })();


        function login() {
            vm.dataLoading = true;
            $scope.userLogged = false;
            if (!$scope.email && !$scope.password) {
                $scope.error = true;
                $scope.success = false;
                $scope.errorMessage = "All fields are mandatory";
            } else {
                $scope.progress = true;
//            calling Login service from app-services/authentication.service.js
                AuthenticationService.Login($scope.email, $scope.password, function (response) {
                    $scope.progress = false;
                    if (response.data.status) {
                        console.log("Login response : ", response);
                        AuthenticationService.SetCredentials($scope.email, $scope.password,response.data.client_data);
//
                        $scope.userLogged = true;
                        $scope.error = false;
                        $scope.success = true;
                        $scope.successMessage = response.data.message;
                        $location.path('/dashboard');
                    } else {
                        $scope.error = true;
                        $scope.success = false;
                        $scope.errorMessage = response.data.message;
                    }
                });
            }
        }
    }
})();
