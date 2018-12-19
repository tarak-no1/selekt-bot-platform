(function () {
    'use strict';

    angular
        .module('app')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['UserService', '$rootScope', '$scope', '$interval', '$timeout', '$location', '$window'];

    function HomeController(UserService, $rootScope, $scope, $interval, $timeout, $location, $window) {
//    redirecting to dashboard if user already logged in
        $rootScope.url = "https://www.selekt.in/";
        if ($rootScope.globals.clientData)
            $location.path('/dashboard');
        $scope.chat_1 = 1;
        $scope.chat_2 = 1;
        $scope.chat_3 = 1;
        $rootScope.toogle = false;

//        show and hide the example chat flow with timiing interval
        $interval(function () {
            $scope.chat_1 = $scope.chat_2 = $scope.chat_3 = 0
            $timeout(function () {
                $scope.chat_1 = 1
                $timeout(function () {
                    $scope.chat_2 = 1
                    $timeout(function () {
                        $scope.chat_3 = 1
                    }, 700)
                }, 700)

            }, 700)

        }, 5000)

    }

})();