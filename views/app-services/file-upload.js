(function () {
    'use strict';

    angular
        .module('app')
        .service('fileUpload', fileUpload);

    fileUpload.$inject = ['$http', '$q', '$location'];

    function fileUpload($http, $q, $location) {
        this.uploadFileToUrl = function (data, uploadUrl, response, progress) {
            var defer = $q.defer();
//        var fd = new FormData();
//        fd.append('file', data.inventory_file);
//        data.inventory_file = fd;
//        console.log('data sent :', data)
//          $http.post(uploadUrl, data).then(function(response) {
//               console.log('res:', response)
//            });
            $http({
                method: 'POST',
                url: uploadUrl,
                headers: {
                    'Content-Type': undefined
                },
                data: data,
                transformRequest: function (data, headersGetter) {
                    var formData = new FormData();
                    angular.forEach(data, function (value, key) {
                        formData.append(key, value);
                    });

                    var headers = headersGetter();
                    delete headers['Content-Type'];
                    return formData;
                },
                uploadEventHandlers: {
                    progress: function (e) {
                        progress(e.loaded * 100 / e.total);
                    }
                }
            }).then(function (res) {
                    response(res);
                });
        }
    }
})();