(function () {
    'use strict';

    angular
        .module('app')
        .controller('RegisterController', RegisterController);

    RegisterController.$inject = ['$location', 'AuthenticationService', '$rootScope', '$window','$scope'];
    function RegisterController($location, AuthenticationService,$rootScope,$window,$scope) {
//    variables initialization
        var vm = this;
        $scope.error = false;
        $scope.success = false;
        $scope.emailError = false;
        $scope.passwordError = false;
        $scope.errorMessage = "";
        $scope.successMessage = "";
        vm.register = register;
        vm.clearMessages = clearMessages;
        $scope.client_data = {};
        $scope.toogle = false;
        $scope.progress = false;
        $scope.email = null;
        $scope.comapanyName = null;
        $scope.password = null;
        (function initController() {
            // reset login status
            AuthenticationService.ClearCredentials();
            $scope.userLogged = false;
        })();

        function clearMessages() {
            $scope.errorMessage = "";
            $scope.successMessage = "";
        }

        function register() {
            vm.dataLoading = true;
            $rootScope.userLogged = false;
            $scope.progress = true;
//            calling AuthenticationService service from app-services/authentication.service.js
            AuthenticationService.RegisterNewUser($scope.email, $scope.comapanyName , $scope.password, function (response) {
                console.log("Login response : ",response);
                $scope.progress = false;
                if (response.data.status) {
                    $scope.userLogged = false;
                    $scope.error = false;
                    $scope.success = true;
                    $scope.successMessage = response.data.message;
                } else {
                    $scope.userLogged = false;
                    $scope.error = true;
                    $scope.success = false;
                    $scope.errorMessage = response.data.message;
                    vm.dataLoading = false;
                }
            });
        }
    }

})();
