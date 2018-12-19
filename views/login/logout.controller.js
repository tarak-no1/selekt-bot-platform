(function () {
    'use strict';

    angular
        .module('app')
        .controller('LogoutController', LogoutController);

    LogoutController.$inject = ['$location', 'AuthenticationService', 'FlashService', '$rootScope','$window'];

    function LogoutController($location, AuthenticationService, FlashService, $rootScope,$window) {
        $rootScope.client_data = {};
        (function initController() {
            // reset login status
            AuthenticationService.ClearCredentials();
            $rootScope.userLogged = false;
            $window.sessionStorage.clear();
            console.log("Logged out");
            $location.path('/');
        })();
    }
})();
