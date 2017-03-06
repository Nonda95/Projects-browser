/**
 * Created by osmalek on 21.10.2016.
 */
var app = angular.module("myApp", ["ngAnimate", "myFilter", "ngRoute", "ngFileUpload"]);
app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: 'main.html',
            controller: 'appCtrl'
        })
        .when('/add-project', {
            templateUrl: 'edit.html',
            controller: 'editCtrl'
        })
        .when('/edit/:id', {
            templateUrl: 'edit.html',
            controller: 'editCtrl'
        })
        .otherwise({
            redirectTo: '/home'
        });
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: true
    });
})
app.factory('projectsFactory', function ($http) {
    var obj = {};
    obj.refresh = function (callback) {
        $http.post('select.php').then(function (response) {
            obj.projects = response.data;
            if (callback)
                callback();
        });
    };
    return obj;
});
app.controller("editCtrl", ['$scope', '$rootScope', 'projectsFactory', '$routeParams', '$location', '$http', 'Upload', function ($scope, $rootScope, projectsFactory, $routeParams, $location, $http, Upload) {
    $scope.project = {};
    $scope.load = function () {
        if($routeParams.id) {
            $scope.project = projectsFactory.projects[$routeParams.id];
            $scope.project.tags = $scope.project.keywords.join(', ');
        }
    };
    if (!projectsFactory.projects)
        projectsFactory.refresh($scope.load);
    else
        $scope.load();
    $scope.doTheBack = function () {
        window.history.back();
    };
    $scope.uploadFiles = function ($files, shade) {
        if ($files && $files.length) {
            if(!$scope.project.imgs) {
                $scope.project.imgs = [];
            }
            shade.style.display = "block";
            setTimeout(function () {
                shade.style.opacity = 1;
                $scope.loading = true;
            }, 10);
            var uploadedCount = 0;
            angular.forEach($files, function (image) {
                Upload.upload({
                    url: 'upload_file.php',
                    data: {file: image}
                }).then(function (response) {
                    $scope.project.imgs.push('res/' + response.config.data.file.name);
                    uploadedCount++;
                    if (uploadedCount == $files.length) {
                        $scope.pushToDatabase();
                        setTimeout(function () {
                            shade.style.opacity = 0;
                            $scope.loading = false;
                        }, 10);
                        setTimeout(function () {
                            shade.style.display = "none";
                        }, 310);
                    }
                }, null, null);
            })
        }
    };
    $scope.submit = function () {
        var shade = document.getElementById("shade");
        if ($scope.files && $scope.files.length > 0) {
            $scope.uploadFiles($scope.files, shade);
        } else {
            $scope.pushToDatabase();
            setTimeout(function () {
                shade.style.opacity = 0;
            }, 10);
            setTimeout(function () {
                shade.style.display = "none";
            }, 310);
        }
    };

    $scope.pushToDatabase = function () {
        var target;
        var final = angular.copy($scope.project);
        if (final.tags && final.tags.length) {
            final.keywords = final.tags.split(/[\s,]+/);
        } else {
            final.keywords = [];
        }
        delete final.tags;
        if ($routeParams.id) {
            target = "update.php";
        } else {
            target = "insert.php";
        }
        $http.post(target, final).then(function () {
            projectsFactory.refresh(null);
            $location.path('home');
        }, function (data) {
            $scope.response = data;
        });
    };
    $scope.delete = function () {
        if (confirm("Czy na pewno chcesz usunąć projekt?")) {
            $http.post('delete.php', {"id": $scope.project.id}).then(function (data) {
                projectsFactory.refresh(null);
                $location.path('home');
            }, function (data) {

            });
        }
    };
    $scope.deleteImg = function (index) {
        $scope.project.imgs.splice(index, 1);
    };

    $scope.deleteFile = function (index) {
        $scope.files.splice(index, 1);
    };
}]);
app.controller("appCtrl", function ($scope, $http, projectsFactory) {
    $scope.projectsFactory = projectsFactory;
    if (!projectsFactory.projects)
        projectsFactory.refresh(null);
    $scope.initPos = {};
    $scope.galleryIndex = 0;
    $scope.gallery = [];
    $scope.expand = function (item, index) {
        $scope.selected = item;
        var element = document.getElementById(index);
        var shade = document.getElementById("shade");
        shade.style.display = "block";
        var clone = element.cloneNode(true);
        var offset = $scope.getElementSize(element);
        clone.style.position = 'fixed';
        clone.style.left = offset.left + 'px';
        clone.style.top = offset.top + 'px';
        clone.style.height = offset.height + 'px';
        clone.style.width = offset.width + 'px';
        $scope.gallery = Array.prototype.slice.call(clone.getElementsByTagName("img"));
        var nav = clone.getElementsByClassName("nav-item");
        if (nav.length == 2) {
            nav[0].addEventListener("click", $scope.prev);
            nav[1].addEventListener("click", $scope.next);
        }
        $scope.galleryIndex = 0;
        if (item.imgs && item.imgs.length > 0)
            $scope.showImg(0);
        var onClick = function () {
            $scope.selected = null;
            if (item.imgs && item.imgs.length > 0)
                $scope.showImg(0);
            var offset = $scope.getElementSize(element);
            clone.style.position = 'fixed';
            clone.style.left = offset.left + 'px';
            clone.style.top = offset.top + 'px';
            clone.style.height = offset.height + 'px';
            clone.style.width = offset.width + 'px';
            setTimeout(function () {
                clone.id = "collapsing";
                shade.style.opacity = 0;
            }, 10);
            setTimeout(function () {
                shade.style.display = "none";
                document.body.removeChild(clone);
            }, 310);
        };
        var closeBtn = clone.getElementsByClassName("closeBtn")[0];
        closeBtn.addEventListener("click", onClick);
        document.body.appendChild(clone);
        setTimeout(function () {
            clone.id = "expanded";

            shade.style.opacity = 1;
        }, 10);
    };
    $scope.next = function () {
        $scope.showImg((($scope.galleryIndex + 1) % $scope.gallery.length));
    };
    $scope.prev = function () {
        $scope.showImg((($scope.galleryIndex + $scope.gallery.length - 1) % $scope.gallery.length));
    };
    $scope.showImg = function (toShowIndex) {
        var act = $scope.gallery[$scope.galleryIndex];
        if (act != null)
            act.id = "";
        $scope.galleryIndex = toShowIndex;
        $scope.gallery[toShowIndex].id = "activeImg";
    };

    $scope.isExpanded = function (item) {
        return $scope.selected === item;
    };
    $scope.getElementSize = function (element) {
        var box = element.getBoundingClientRect();
        return {top: box.top, left: box.left, height: box.height, width: box.width};
    }
});