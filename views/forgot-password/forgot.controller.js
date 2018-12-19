(function () {
    'use strict';

    angular
        .module('app')
        .controller('ForgotController', ForgotController);

    ForgotController.$inject = ['$location', 'AuthenticationService', '$scope'];

    function ForgotController($location, AuthenticationService, $scope) {
//    variables initialization
        var vm = this;

        vm.forgotPass = forgotPass;
        $scope.toogle = false;
        $scope.error = false;
        $scope.success = false;
        $scope.emailError = false;
        $scope.passwordError = false;
        $scope.errorMessage = "";
        $scope.successMessage = "";
        $scope.progress = false;
        (function initController() {
            // reset login status
            AuthenticationService.ClearCredentials();
            $scope.userLogged = false;
        })();


        function forgotPass() {
            vm.dataLoading = true;
            $scope.userLogged = false;
            if (!vm.email) {
                $scope.error = true;
                $scope.success = false;
                $scope.errorMessage = "All fields are mandatory";
            } else {
                $scope.progress = true;
//            calling Login service from app-services/authentication.service.js
                AuthenticationService.ForgotPassword(vm.email, function (response) {
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
    }
})();
