(function () {
    'use strict';
    angular
        .module('app')
        .controller('ProductTaggingController', ProductTaggingController)
        .config(function ($httpProvider) {
            $httpProvider.defaults.headers.common = {};
            $httpProvider.defaults.headers.post = {};
            $httpProvider.defaults.headers.put = {};
            $httpProvider.defaults.headers.patch = {};
        });

    ProductTaggingController.$inject = ['$scope','$http','$location', 'AuthenticationService', '$rootScope', '$window'];
    function ProductTaggingController($scope, $http, $location, AuthenticationService,$rootScope,$window) {
        var vm = this;
        $scope.product_line = 'women tops';
        $scope.image_info = {};
        $scope.image_url = '';
        $scope.update_response = {};
        $scope.image_links = [
            "https://assets.myntassets.com/h_640,q_90,w_480/v1/assets/images/1329664/2016/4/28/11461839194506-Bhama-Couture-Women-Tops-2961461839193770-1.jpg",
            "https://assets.myntassets.com/h_640,q_90,w_480/v1/assets/images/2172006/2017/10/12/11507791895870-plusS-Women-Grey-Solid-Top-2251507791895611-1.jpg",
            "https://assets.myntassets.com/h_640,q_90,w_480/v1/assets/images/2214731/2017/11/21/11511251528882-ONLY-Women-Tops-1691511251528734-1.jpg",
            "https://assets.myntassets.com/h_640,q_90,w_480/v1/assets/images/2029796/2017/8/8/11502193376933-ESPRIT-Women-Tops-2041502193376733-1.jpg",
            "https://assets.myntassets.com/h_640,q_90,w_480/v1/assets/images/2186127/2018/1/12/11515741300978-DressBerry-Women-Navy-Blue-Self-Design-Top-9251515741300831-1.jpg"
        ];

        $scope.product_lines = ["women tops", "women dresses", "women kurta", "women blazers"];
        $scope.submit = function (status) {
            console.log("Inside submit function");
            var image_url = $scope.image_url;
            var product_line = $scope.product_line.split(" ").join("_");
            if(image_url=='')
            {
                if(!status)
                {
                    $scope.update_response = {"status" :false, message:"Please enter image link"}
                    return;
                }
                else
                {
                    image_url = $scope.image_links[0];
                }
            }
            var baseUrl = "https://imagetag.in/image-tagging/get-attributes";

            var parameter = {product_line:product_line, image_links:[image_url]};
            var config={
                'content-type': 'application/json'
            };
            $http.post(baseUrl, parameter, config).then(function (response) {
                // This function handles success
                var response_data = response.data;
                console.log(response_data);
                $scope.image_info = response_data;
                
            }, function (response) {
                // this function handles error
                $scope.update_response = {"status":false, "message":"Error while getting response from server, try again"}
            });
        };
        $scope.submit(true);
        $scope.changeProductLine = function(pl)
        {
            $scope.product_line = pl;
        }
        $scope.getSelectedImage = function(img_url)
        {
            $scope.image_url = img_url;
            $scope.submit();
        }
        $scope.uploadFile = function(files) {
            console.log("Upload file");
            var fd = new FormData();
            //Take the first selected file
            fd.append("file", files[0]);
            var uploadUrl = "https://imagetag.in/image-tagging/upload-files";
            var config = {'content-type': undefined};
            $http.post(uploadUrl, fd, config).then(function (response) {
                // This function handles success
                var response_data = response.data;
                console.log(response_data);
                $scope.update_response  = response_data;
                if(response_data["type"]=="jpg")
                {
                    $scope.image_url = response_data["message"];
                    $scope.submit();
                }
            }, function (response) {
                // this function handles error
                console.log("Error")
                $scope.update_response = {status : false, message : "Error while uploading the file"};
            });
        }
        $scope.showAlert = function(message)
        {
            window.alert(message);
            $scope.update_response.status = true;
        }
	}
})();
