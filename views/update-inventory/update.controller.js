(function () {
    'use strict';

    angular
        .module('app')
        .directive('fileModel', ['$parse', function ($parse) {
//        directive for file upload
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var model = $parse(attrs.fileModel);
                    var modelSetter = model.assign;
                    element.bind('change', function () {
                        scope.$apply(function () {
                            modelSetter(scope, element[0].files[0]);
                        });
                    });
                }
            };
        }])
        .controller('UpdateInventory', UpdateInventory);

    UpdateInventory.$inject = ['$rootScope', '$location', '$scope', "fileUpload"];

    function UpdateInventory($rootScope, $location, $scope, fileUpload) {
        $scope.bot_name_selected = '';
        $rootScope.setup_page = 1;
        $scope.country_selected = '';
        $scope.connectedPages = [];
        $scope.newBotCreated = false;
        $scope.fb_pages = [];
        $scope.company_name = $rootScope.globals.clientData.company_name;

        $scope.uploadFile = function () {
//            upload inventory file along with other data
            var data = {
                client_id: $rootScope.globals.clientData.client_id,
                myFile: $scope.myFile,
                bot_type: 'fashion',
                filename: $scope.myFile.name,
                deals_status: $scope.deals_status,
                contact_number: $scope.contact_number
            };
            console.log('file is ', data);
            console.dir($scope.myFile);
            var uploadUrl = "https://www.selekt.in/chatbot-solution/update-inventory";
            fileUpload.uploadFileToUrl(data, uploadUrl, function (response) {
                if (response.data.error_code === false) {
                    console.log(response.data);
                    var x = document.getElementById("snackbar");
                    x.className = "show";
                    $timeout(function() {
                        $location.path("/dashboard")
                    }, 1000);
                    
                } else {
                    console.log(response);
                }
            }, function (progress) {
                $scope.currentProgress = Math.min(progress, 100) / 100 * 300;
            });


        };
    }

})();