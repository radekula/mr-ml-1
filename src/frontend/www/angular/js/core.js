var app = angular.module("ngDMS", ["ngRoute", "ngCookies"]);

/*
 ** Routing
 */
app.config(function($routeProvider, $locationProvider) {
    $routeProvider.when("/", {
		title: "Pulpit",
		templateUrl: "/www/angular/desktop.html"
    });
    $routeProvider.when("/add", {
        title: "Dodaj dokument",
        templateUrl: "/www/angular/add.html",
    });
    $routeProvider.when("/documents", {
        title: "Lista dokumentów",
        templateUrl: "/www/angular/documents.html",
        controller: "DocumentsController"
    });
    $routeProvider.when("/documents/:page", {
        title: "Lista dokumentów",
        templateUrl: "/www/angular/documents.html",
        controller: "DocumentsController"
    });
    $routeProvider.when("/documents/:phrase/:date", {
        title: "Lista dokumentów",
        templateUrl: "/www/angular/documents.html",
        controller: "DocumentsController"
    });
    $routeProvider.when("/documents/:phrase/:date/:page", {
        title: "Lista dokumentów",
        templateUrl: "/www/angular/documents.html",
        controller: "DocumentsController"
    });
    $routeProvider.when("/document/:page", {
        title: "Dokument",
        templateUrl: "/www/angular/document.html",
        controller: "DocumentController"
    });
    $routeProvider.when("/user", {
        title: "Profil użytkownika",
        templateUrl: "/www/angular/user.html",
        controller: "UserController"
    });
    $routeProvider.when("/groups", {
        title: "Grupy użytkowników",
        templateUrl: "/www/angular/groups.html",
        controller: "GroupsController"
    });
    $routeProvider.when("/groups/:search", {
        title: "Grupy użytkowników",
        templateUrl: "/www/angular/groups.html",
        controller: "GroupsController"
    });
    $routeProvider.when("/members/:group", {
        title: "Grupa użytkowników",
        templateUrl: "/www/angular/members.html",
        controller: "MembersController"
    });
    $routeProvider.otherwise({
        title: "Podana strona nie istnieje",
        templateUrl: "/www/angular/404.html",
    });
});

/*
 ** Set title of document
 */
app.controller("ngDMSHead", ["$scope", "$location", function($scope, $location) {
    $scope.$on("$routeChangeSuccess", function(event, data) {
        $scope.pageTitle = data.title;
    });
}]);

/*
 ** Set current path
 */
app.controller("menu", function($scope, $location) {
    $scope.path = $location.path();
});

/*
 ** Init of app
 */
app.controller("ngDMSBody", ["$scope", "$cookies", "$location", function($scope, $cookies, $location) {
    // Toggle of menu
    $scope.toggle = $cookies.get("menu-toggle") ? true : false;
    $scope.menuToggle = function() {
        if ($cookies.get("menu-toggle")) {
            $cookies.remove("menu-toggle");
            $scope.toggle = false;
        } else {
            expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 60 * 60 * 24 * 365);
            $cookies.put("menu-toggle", "true", {
                expires: expireDate,
                path: '/'
            });
            $scope.toggle = true;
        }
    }

    // Set classess of css
    $scope.$on("$routeChangeSuccess", function(event, data) {
        switch ($location.path()) {
            case "/":
                $scope.body = "page page-desktop";
                break;
            case "/add":
                $scope.body = "page page-add";
                break;
            case "/user":
                $scope.body = "page page-user";
                break;
            default:
                $scope.body = "page-404";
                break;
        }

        if ($location.path().search("/documents") != -1) {
            $scope.body = "page page-documents";
        } else if ($location.path().search("/document") != -1) {
            $scope.body = "page page-document";
        } else if ($location.path().search("/groups") != -1) {
            $scope.body = "page page-groups";
        } else if ($location.path().search("/members") != -1) {
            $scope.body = "page page-members";
        }
    });
}]);

/*
 ** Search engine in header
 */
app.controller("SearchController", function($scope, $http, $location) {
    $scope.search = function($event) {
        $event.preventDefault();
		
		if( $scope.search_phrase && $scope.search_phrase !== "" ) {
			$location.path("/documents/" + encodeURI($scope.search_phrase) + "/1");
		} else {
			$location.path("/documents");
		}
    }
});

/*
 ** Datepicker - jQuery UI
 */
app.directive("datepicker", function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, elem, attrs, ngModelCtrl) {
            var updateModel = function(dateText) {
                scope.$apply(function() {
                    ngModelCtrl.$setViewValue(dateText);
                });
            }
            var options = {
                dateFormat: "yy-mm-dd",
                onSelect: function(dateText) {
                    updateModel(dateText);
                }
            }
            elem.datepicker(options);
        }
    }
});

/*
 ** Actions Controller
 */
app.controller("ActionsController", function($scope, $http, $location, $route) {
    $scope.documentOver = function($event) {
        $scope.loadPage = true;
        var documentId = $event.currentTarget.getAttribute("data-id");
        var thumbnail = document.getElementById("thumbnail_" + documentId);

        if (thumbnail.src != '') {
            $scope.loadPage = false;
            thumbnail.className = "thumbnail-show";
        } else {
            $http.get( // Get document
                "/service/documents/document/" + documentId
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        if (response.data.thumbnail != '') {
                            thumbnail.src = response.data.thumbnail;
                            thumbnail.className = "thumbnail-show";
                        }
                    }

                    $scope.loadPage = false;
                }
            );
        }
    }

    $scope.documentLeave = function($event) {
        thumbnailCurrent = document.getElementsByClassName("thumbnail-show");
        thumbnailCurrentLength = thumbnailCurrent.length;
        if (thumbnailCurrentLength > 0) {
            for (i = 0; i < thumbnailCurrentLength; i++) {
                document.getElementsByClassName("thumbnail-show")[i].className = "thumbnail";
            }
        }
    }

    // Download the document
    $scope.downloadDocument = function($event) {
        $event.preventDefault();

        if ($scope.file_name &&
            $scope.data
        ) {
            downloadLink = document.getElementById("js-download");
            downloadLink.setAttribute("download", $scope.file_name);
            downloadLink.setAttribute("href", $scope.data);
            downloadLink.click();
        } else {
            $scope.loadPage = true;
            documentId = $event.currentTarget.getAttribute("data-id");
            downloadLink = document.getElementById("js-download-" + documentId);

            if (!downloadLink.getAttribute("download") &&
                !downloadLink.getAttribute("href")
            ) {
                $http.get( // Get document
                    "/service/documents/document/" + documentId
                ).then(
                    function(response) { // Success
                        if (response.status == 200) {
                            if (response.data.file_name &&
                                response.data.data
                            ) {
                                downloadLink.setAttribute("download", response.data.file_name);
                                downloadLink.setAttribute("href", response.data.data);
                                downloadLink.click();
                            } else {
                                alert("Brak zasobu do pobrania.");
                            }
                        }

                        $scope.loadPage = false;
                    },
                    function(response) { // Error
                        if (response.status == 404) {
                            alert("Nie znaleziono dokumentu.");
                        } else if (response.status == 500) {
                            alert("Wewnętrzny błąd serwera.");
                        }

                        $scope.loadPage = false;
                    }
                );
            } else {
                downloadLink.click();
            }
        }
    }

    // Redirect to the document
    $scope.redirectToDocument = function($event) {
        $event.preventDefault();
        $scope.loadPage = true;
        documentId = $event.currentTarget.getAttribute("data-id");
        $location.path("/document/" + documentId);
    }

    // Delete the document
    $scope.deleteDocument = function($event) {
        $event.preventDefault();

        if (confirm("Czy na pewno usunąć wskazany zasób?")) {
            $scope.loadPage = true;
            documentId = $event.currentTarget.getAttribute("data-id");

            $http.delete(
                "/service/documents/document/" + documentId
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        $route.reload();
                        alert("Dokument został usunięty.");
                    }

                    $scope.loadPage = false;
                },
                function(response) { // Error
                    if (response.status == 404) {
                        alert("Nie znaleziono dokumentu.");
                    } else if (response.status == 500) {
                        alert("Wewnętrzny błąd serwera.");
                    }

                    $scope.loadPage = false;
                }
            );
        }
    }
});

/*
 ** Documents controller
 */
app.controller("DocumentsController", function($scope, $routeParams, $http, $timeout, $cookies, $location) {
    if (isNaN($routeParams.page) &&
        $routeParams.page != undefined
    ) {
        if ($routeParams.phrase ||
            $routeParams.date
        ) {
            if ($location.path() !== "/documents/" + $routeParams.phrase + "/" + $routeParams.date + "/") {
                $location.path("/documents/" + $routeParams.phrase + "/" + $routeParams.date + "/");
            }
        } else if ($location.path() !== "/documents") {
            $location.path("/documents");
        }
    } else {
		$scope.currentPage = !isNaN($routeParams.page) ? parseInt($routeParams.page) : 1;
		$scope.offset = 5 * ( $scope.currentPage - 1 );
		$scope.limit = 5;
		$scope.numberOfPages = 0;
		$scope.notice = [];
		$scope.documents = [];
		$scope.pages = [];
		$scope.loadPage = true;
        $scope.phrase = $routeParams.phrase && $routeParams.phrase != "null" ? decodeURI($routeParams.phrase) : "";
		
        if ( $scope.phrase !== "" ) {
			$scope.loc = "/#!documents/" + $routeParams.phrase + "/";
        } else {
			$scope.loc = "/#!documents/";
		}
		
		$scope.filter = function($event) {
			$event.preventDefault();
			phrase = document.getElementsByClassName( "documents-phrase" )[0].value;
			
			if( phrase !== "" ) {
				$location.path("/documents/" + phrase + "/1");
			} else {
				$location.path("/documents/");
			}
		}
		
        function getPagination() {
            $scope.pages = [];

            if ($scope.currentPage - 1 < $scope.numberOfPages) {
				i = $scope.currentPage;
                max = i + 3;
				diff = max - $scope.numberOfPages;
				
				if( diff > 0 ) {
					i = ( i - diff ) > 1 ? ( i - diff ) : 1;
				}
				
                for (i; i <= max; i++) {
                    if (i > $scope.numberOfPages) break;
                    $scope.pages.push(i);
                }
            }
        }
		
        $http.get(
            "/service/documents/documents?limit=" + $scope.limit + "&offset=" + $scope.offset + "&search=" + $scope.phrase
        ).then(
            function(response) { // Success
                if (response.status == 200) {
                    if( response.data.result !== null ) {
						$scope.documents = response.data.result;
						$scope.numberOfPages = Math.ceil( response.data.total / $scope.limit );
						getPagination();
					} else {
						$scope.notice.push( {
							"content": "Nie znaleziono dokumentów.",
							"class": "alert-danger"
						} );
					}
					
                    $scope.loadPage = false;
                }
            },
            function(response) { // Error
                if (response.status == 404) {
                    $scope.notice.push = {
                        "content": "Nie znaleziono dokumentów.",
                        "class": "alert-danger"
                    };
                } else if (response.status == 500) {
                    $scope.notice.push = {
                        "content": "Błąd wewnętrzny serwera.",
                        "class": "alert-danger"
                    };
                }

                $scope.loadPage = false;
            }
        );
    }
});

/*
 ** Document controller
 */
app.controller("DocumentController", function($scope, $routeParams, $http, $cookies, $location) {
    if ($routeParams.page) {
        documentId = $routeParams.page;

        $http.get( // Get document
            "/service/documents/document/" + documentId
        ).then(
            function(response) { // Success
                if (response.status == 200) {
                    $scope.id = response.data.id;
                    $scope.file_name = response.data.file_name;
                    $scope.title = response.data.title;
                    $scope.create_date = response.data.create_date;
                    $scope.owner = response.data.owner.join(";");
                    $scope.description = response.data.description;
                    $scope.thumbnail = response.data.thumbnail;
                    $scope.data = response.data.data;
                    document.getElementById("file-name").innerHTML = response.data.file_name;
                    document.getElementById("file_base64").value = response.data.data;
                    document.getElementById("file_name_base64").value = response.data.file_name;

                    thumbnail = response.data.thumbnail;
                    document.getElementById("thumbnail_base64").value = thumbnail;

                    if (thumbnail != '') {
                        document.getElementById("thumbnail_img").src = thumbnail;
                    } else {
                        thumbnail = document.getElementById("thumbnail_container");
                        thumbnail.parentElement.removeChild(thumbnail);
                    }
                }
            },
            function(response) { // Error
                if (response.status == 404) {
					alert("Dokument nieznaleziony");
					// $location.path("/404");
                } else if (response.status == 500) {
                    alert("Wewnętrzny błąd serwera.");
                }
            }
        );
    } else {
        $location.path("/404");
    }
});

/*
 ** Upload Controller
 */
app.controller("UploadController", function($scope, $http, $cookies, $location, $interval) {
    $scope.token = $cookies.get("token");
    
    openFile = function(event) {
        var input = event.target;
        files = input.files;
        if (files.length > 0) {
            document.getElementById("file-name").innerHTML = files[0].name;
        }
    }

    // Save a document
    $scope.saveDocument = function($event) {
        $event.preventDefault();
        $scope.loadPage = true;
        $scope.notice = [];
        _document = {
            "id": "",
            "title": "",
            "file_name": "",
            "create_date": "",
            "description": "",
            "owner": [],
            "metadata": [],
            "thumbnail": "",
            "data": ""
        }
        file_done = 0;

        // Set file a document
        fileReader = new FileReader();
        files = document.getElementById("file").files;
        if (files.length > 0) {
            file = files[0];
            file_name = file.name;
            file_size = file.size;
            reg_name = new RegExp(".+\.pdf$");
            max_size = 50000000; // max 50MB

            if (reg_name.test(file_name) !== true) {
                $scope.uploadForm.$valid = false;
                $scope.notice.push({
                    "content": "Błędne rozszerzenie pliku " + file_name + ".",
                    "class": "alert-danger"
                });
                file_done++;
            } else if (file_size > max_size) {
                $scope.uploadForm.$valid = false;
                $scope.notice.push({
                    "content": "Wielkość pliku " + file_name + " przekracza " + (max_size / 1000000) + "MB.",
                    "class": "alert-danger"
                });
                file_done++;
            } else {
                fileReader.onloadend = function(fileLoadedEvent) {
                    file_base64 = fileLoadedEvent.target.result;
                    _document.file_name = file_name; // Set file_name of a document
                    _document.data = file_base64; // Set data of a document
                    file_done++;
                }

                fileReader.readAsDataURL(file);
            }
        } else {
            file_base64 = document.getElementById("file_base64");
            file_name_base64 = document.getElementById("file_name_base64");

            if (file_base64 &&
                file_name_base64
            ) {
                _document.file_name = file_name_base64.value;
                _document.data = file_base64.value;
            } else {
                $scope.uploadForm.$valid = false;
            }

            file_done++;
        }

        // Set thumbnail of a document
        fileReader2 = new FileReader();
        files = document.getElementById("thumbnail").files;
        if (files.length > 0) {
            file = files[0];
            file_name = file.name;
            file_size = file.size;
            reg_name = new RegExp(".+\.(jpg|JPG|jpeg|JPEG|png|PNG)$");
            max_size = 10000000; // max 10MB

            if (reg_name.test(file_name) !== true) {
                $scope.uploadForm.$valid = false;
                $scope.notice.push({
                    "content": "Błędne rozszerzenie pliku " + file_name + ".",
                    "class": "alert-danger"
                });
                file_done++;
            } else if (file_size > max_size) {
                $scope.uploadForm.$valid = false;
                $scope.notice.push({
                    "content": "Wielkość pliku " + file_name + " przekracza " + (max_size / 1000000) + "MB.",
                    "class": "alert-danger"
                });
                file_done++;
            } else {
                fileReader2.onloadend = function(fileLoadedEvent) {
                    file_base64 = fileLoadedEvent.target.result;
                    _document.thumbnail = file_base64; // Set thumbnail of a document
                    file_done++;
                }

                fileReader2.readAsDataURL(file);
            }
        } else {
            thumbnail_base64 = document.getElementById("thumbnail_base64");

            if (thumbnail_base64) {
                _document.thumbnail = thumbnail_base64.value;
            }

            file_done++;
        }

        interval = $interval(
            function() {
                if (file_done == 2) {
                    $interval.cancel(interval);

                    if ($scope.uploadForm.$valid) {
                        // Set title of a document
                        _document.title = $scope.title ? $scope.title : "";

                        // Set date of a document
                        nowDate = new Date();
                        day = nowDate.getDate();
                        day = day < 10 ? "0" + day : day;
                        month = nowDate.getMonth() + 1;
                        month = month < 10 ? "0" + month : month;
                        year = nowDate.getFullYear();
                        _document.create_date = year + "-" + month + "-" + day;

                        // Set description of a document
                        _document.description = $scope.description ? $scope.description : "";

                        // Set owners of a document
                        i = 0;
                        owners = $scope.owner ? $scope.owner.split(";") : [];
                        countOwners = owners.length;
                        for (i; i < countOwners; i++) {
                            owner = owners[i].trim();
                            if (owner != "") {
                                _document.owner.push(owner);
                            }
                        }

                        if ($location.path() === "/add") {
                           $http.post(
                                "/service/documents/document/generate",
                                JSON.stringify(_document)
                            ).then(
                                function(response) { // Success
                                    if (response.status == 200) {
                                        // Reset data
                                        document.getElementById("file-name").innerHTML = "Upuść plik tutaj <br>lub";
                                        document.getElementById("file").value = "";
                                        document.getElementById("thumbnail").value = "";
                                        $scope.owner = "";
                                        $scope.title = "";
                                        $scope.description = "";
                                        $scope.uploadForm.$setPristine();
                                        $scope.notice.push({
                                            "content": "Dokument został zapisany.",
                                            "class": "alert-success"
                                        });
                                    }

                                    $scope.loadPage = false;
                                },
                                function(response) { // Error
                                    if (response.status == 400) {
                                        $scope.notice.push({
                                            "content": "Błędne żądanie.",
                                            "class": "alert-danger"
                                        });
                                    } else if (response.status == 500) {
                                        $scope.notice.push({
                                            "content": "Wewnętrzny błąd serwera.",
                                            "class": "alert-danger"
                                        });
                                    }

                                    $scope.loadPage = false;
                                }
                            );
                        } else {
                            var documentId = $scope.id;
                            _document.id = documentId;

                            $http.put(
                                "/service/documents/document/" + documentId,
                                JSON.stringify(_document)
                            ).then(
                                function(response) { // Success
                                    if (response.status == 200) {
                                        $scope.file_name = _document.file_name;
                                        document.getElementById("file_name_base64").value = _document.file_name;
                                        document.getElementById("file_base64").value = _document.data;
                                        document.getElementById("document").setAttribute("data", _document.data);
                                        $scope.notice.push({
                                            "content": "Dokument został zaktualizowany.",
                                            "class": "alert-success"
                                        });
                                    }

                                    $scope.loadPage = false;
                                },
                                function(response) { // Error
                                    if (response.status == 400) {
                                        $scope.notice.push({
                                            "content": "Błędne żądanie.",
                                            "class": "alert-danger"
                                        });
                                    } else if (response.status == 404) {
                                        $scope.notice.push({
                                            "content": "Nie znaleziono dokumentu.",
                                            "class": "alert-danger"
                                        });
                                    } else if (response.status == 500) {
                                        $scope.notice.push({
                                            "content": "Wewnętrzny błąd serwera.",
                                            "class": "alert-danger"
                                        });
                                    }

                                    $scope.loadPage = false;
                                }
                            );
                        }
                    } else {
                        $scope.notice.push({
                            "content": "Nieprawidłowo wypełniony formularz.",
                            "class": "alert-danger"
                        });
                        $scope.loadPage = false;
                    }
                }
            }, 1
        );
    }
});

/*
 ** User controller
 */
app.controller("UserController", function($scope, $cookies, $http, $routeParams) {
    $scope.notice = [];
    $scope.groups = [];
    $scope.login = $cookies.get("login");
    $scope.token = $cookies.get("token");
    $scope.type = "";
    $scope.active = "";
    $scope.last_login = "";
    $scope.last_active = "";
    $scope.first_name = "";
    $scope.last_name = "";
    $scope.email = "";

    var login = $cookies.get("login");
    var token = $cookies.get("token");

    // Get information about of the user
    $http.get(
        "/service/users/user"
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                $scope.login = response.data.login;
                $scope.type = response.data.type;
                $scope.active = response.data.active ? "Aktywny" : "Nieaktywny";
                $scope.last_login = response.data.last_login;
                $scope.last_active = response.data.last_active;
                $scope.first_name = response.data.first_name;
                $scope.last_name = response.data.last_name;
                $scope.email = response.data.email;
            }
        },
        function(response) { // Error
            if (response.status == 403) {
                $scope.notice.push({
                    "content": "Twoje konto nie może uzyskać danych użytkownika lub Twój token stracił ważność.",
                    "class": "alert-danger"
                });
            } else if (response.status == 404) {
                $scope.notice.push({
                    "content": "Użytkownik nie znaleziony.",
                    "class": "alert-danger"
                });
            } else if (response.status == 500) {
                $scope.notice.push({
                    "content": "Błąd wewnętrzny serwera.",
                    "class": "alert-danger"
                });
            }
        }
    );

    // Get information about of the groups
    $http.get(
        "/service/documents/user/groups"
    ).then(
        function(response) { // Success
            // $scope.groups = response.data;
            $scope.groups = response.data.result;
        }
    );

    $scope.saveUser = function($event) {
        $event.preventDefault();
        $scope.notice = [];
        $scope.loadPage = true;
        _user = {
            "type": "normal",
            "active": true,
            "first_name": $scope.first_name,
            "last_name": $scope.last_name,
            "email": $scope.email
        }

        var login = $cookies.get("login");
        var token = $cookies.get("token");

        if ($scope.userForm.$valid) {
            // Update information about of the user
            $http.put(
                "/service/users/user",
                JSON.stringify(_user)
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        $scope.notice.push({
                            "content": "Zmiany zostały zapisane.",
                            "class": "alert-success"
                        });
                    }

                    $scope.loadPage = false;
                },
                function(response) { // Error
                    if (response.status == 400) {
                        $scope.notice.push({
                            "content": "Błędne żądanie.",
                            "class": "alert-danger"
                        });
                    } else if (response.status == 403) {
                        $scope.notice.push({
                            "content": "Nieprawidłowy lub wygasły token.",
                            "class": "alert-danger"
                        });
                    } else if (response.status == 404) {
                        $scope.notice.push({
                            "content": "Użytkownik nie znaleziony.",
                            "class": "alert-danger"
                        });
                    } else if (response.status == 500) {
                        $scope.notice.push({
                            "content": "Błąd wewnętrzny serwera.",
                            "class": "alert-danger"
                        });
                    }

                    $scope.loadPage = false;
                }
            );
        } else {
            $scope.notice.push({
                "content": "Błędnie wypełniony formularz.",
                "class": "alert-danger"
            });
            $scope.loadPage = false;
        }
    }
});

/*
 ** Groups Controller
 */
app.controller("GroupsController", function($route, $scope, $http, $routeParams, $cookies, $location) {
	$scope.groups = [];
	$scope.notice = [];
    $scope.login = $cookies.get("login");
    $scope.token = $cookies.get("token");
    $scope.loadPage = true;
	$scope.search = $routeParams.search && $routeParams.search != "null" ? decodeURI($routeParams.search) : "";
    var groupsName = null;
    var groupsDescription = null;

    // Set date
    nowDate = new Date();
    day = nowDate.getDate();
    day = day < 10 ? "0" + day : day;
    month = nowDate.getMonth() + 1;
    month = month < 10 ? "0" + month : month;
    year = nowDate.getFullYear();
    $scope.date = year + "-" + month + "-" + day;
	
	$scope.filter = function($event) {
		$event.preventDefault();
		search = document.getElementsByClassName( "documents-phrase" )[0].value;
		
		if( search !== "" ) {
			$location.path("/groups/" + search);
		} else {
			$location.path("/groups/");
		}
	}

    // Get all group
    $http.get(
        "/service/groups/groups?" + "search=" + $scope.search
    ).then(
        function(response) { // Success
            if (response.status == 200) {
				if( response.data.result === null ) {
					$scope.notice.push( {
						"content": "Brak zdefiniowanych grup.",
						"class": "alert-danger"
					} );
				} else {
					$scope.groups = response.data.result;
				}
            }

            $scope.loadPage = false;
        },
        function(response) { // Error
            if (response.status == 400) {
                alert("Błędne żądanie.");
            } else if (response.status == 403) {
                alert("Nieprawidłowy lub wygasły token.");
            } else if (response.status == 500) {
                alert("Błąd wewnętrzny serwera.");
            }

            $scope.loadPage = false;
        }
    );

    // Click edit group
    $scope.editGroup = function($event) {
        $event.preventDefault();
        $event.currentTarget.style.display = "none";

        dataID = $event.currentTarget.getAttribute("data-id");

        groupsName = document.getElementById("js-groups-name-" + dataID);
        groupsName.readOnly = false;

        groupsDescription = document.getElementById("js-groups-description-" + dataID);
        groupsDescription.readOnly = false;

        document.getElementsByClassName("js-groups-save-" + dataID)[0].style.display = "block";
    }

    // Update group
    $scope.saveGroup = function($event) {
        $event.preventDefault();
        $scope.loadPage = true;
        $event.currentTarget.style.display = "none";
		
        name = groupsName.value;
        description = groupsDescription.value;
        group_data = {
            "active": true,
            "create_date": $scope.date,
            "creator": $scope.login,
            "description": description ? description : ""
        }
		
        if (name != "") {
            $http.put(
                "/service/groups/group/" + name,
                JSON.stringify(group_data)
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        groupsName.readOnly = true;
                        groupsDescription.readOnly = true;
                        document.getElementsByClassName("js-groups-edit-" + dataID)[0].style.display = "block";
                        alert("Grupa została zaktualizowana.");
                    }

                    $scope.loadPage = false;
                },
                function(response) { // Error
                    if (response.status == 400) {
                        alert("Błędne żądanie.");
                    } else if (response.status == 403) {
                        alert("Nieprawidłowy lub wygasły token.");
                    } else if (response.status == 404) {
                        alert("Nie znaleziono grupy.");
                    } else if (response.status == 500) {
                        alert("Błąd wewnętrzny serwera.");
                    }

                    $scope.loadPage = false;
                }
            );
        }
    }

    // Delete group
    $scope.deleteGroup = function($event) {
        $event.preventDefault();
        $scope.loadPage = true;
        dataID = $event.currentTarget.getAttribute("data-id");
        groupsName = document.getElementById("js-groups-name-" + dataID).value;
		
        if (confirm("Czy na pewno usunąć wskazaną pozycję?")) {
            $http.delete(
                "/service/groups/group/" + groupsName
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        if (dataID - 1 == 0) {
                            left = [];
                            right = $scope.groups.splice(dataID, $scope.groups.length);
                        } else {
                            left = $scope.groups.splice(0, dataID - 1);
                            right = $scope.groups.splice(dataID - 1, $scope.groups.length);
                        }

                        $scope.groups = left.concat(right);
                        alert("Grupa została usunięta.");
						
						$route.reload();
                    }

                    $scope.loadPage = false;
                },
                function(response) { // Error
                    if (response.status == 403) {
                        alert("Nieprawidłowy lub wygasły token.");
                    } else if (response.status == 404) {
                        alert("Nie znaleziono grupy.");
                    } else if (response.status == 500) {
                        alert("Błąd wewnętrzny serwera.");
                    }

                    $scope.loadPage = false;
                }
            );
        }
    }

    // Create group
    $scope.addGroup = function($event) {
        $event.preventDefault();
        $scope.loadPage = true;
        name = document.getElementById("js-groups-name").value;
        description = document.getElementById("js-groups-description").value;
        group_data = {
            "active": true,
            "create_date": $scope.date,
            "creator": $scope.login,
            "description": description ? description : ""
        }
		
        if (name != "") {
            $http.post(
                "/service/groups/group/" + encodeURIComponent(name),
                JSON.stringify(group_data)
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        group_data.name = name;
                        $scope.groups.push(group_data);

                        document.getElementById("js-groups-name").value = "";
                        document.getElementById("js-groups-description").value = "";
                        alert("Grupa została dodana.");
						
						$route.reload();
                    }

                    $scope.loadPage = false;
                },
                function(response) { // Error
                    if (response.status == 400) {
                        alert("Błędne żądanie.");
                    } else if (response.status == 403) {
                        alert("Nieprawidłowy lub wygasły token.");
                    } else if (response.status == 409) {
                        alert("Istnieje grupa o podanej nazwie.");
                    } else if (response.status == 500) {
                        alert("Błąd wewnętrzny serwera.");
                    }

                    $scope.loadPage = false;
                }
            );
        } else {
            alert("Nieprawidłowa nazwa grupy.");
            $scope.loadPage = false;
        }
    }

    // Redirect to users list
    $scope.showGroup = function($event) {
        $event.preventDefault();
        name = $event.currentTarget.getAttribute("data-name");
        $location.path("/members/" + name);
    }
});

/*
 ** MembersController
 */
app.controller("MembersController", function($route, $scope, $http, $routeParams, $cookies, $location) {
    if (isNaN($routeParams.group) &&
        $routeParams.group != undefined
    ) {
        $scope.group = $routeParams.group;
    }

	$scope.notice = [];
    $scope.users = [];
	$scope.users_prompt = [];
    $scope.loadPage = true;
    $scope.token = $cookies.get("token");
	
    // Get all users
    $http.get(
        "/service/groups/members/get/" + $scope.group
    ).then(
        function(response) { // Success
            if (response.status == 200) {
				if( response.data === "null" ) {
					$scope.notice.push( {
						"content": "Brak użytkowników przypisanych do grupy.",
						"class": "alert-danger"
					} );
				} else {
					$scope.users = response.data;
				}
            }

            $scope.loadPage = false;
        },
        function(response) { // Error
            if (response.status == 403) {
                alert("Nieprawidłowy lub wygasły token.");
            }

            if (response.status == 404) {
                alert("Grupa nieznaleziona.");
            } else if (response.status == 500) {
                alert("Błąd wewnętrzny serwera.");
            }

            $scope.loadPage = false;
        }
    );
	
    // Add user to group
    $scope.addUser = function($event) {
        $event.preventDefault();
        $scope.loadPage = true;
        login = document.getElementById("js-members-login").value;
		users = [login];

        if (users[0] != "") {
            $http.post(
                "/service/groups/members/add/" + $scope.group,
                JSON.stringify(users)
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        count_users = users.length;

                        if (count_users > 1) {
                            alert("Użytkownicy zostali dodani do grupy.");
                        } else {
                            alert("Użytkownik został dodany do grupy.");
                        }

                        document.getElementById("js-members-login").value = "";
						
						$route.reload();
                    }

                    $scope.loadPage = false;
                },
                function(response) { // Error
                    if (response.status == 400) {
                        alert("Błędne żądanie.");
                    } else if (response.status == 403) {
                        alert("Nieprawidłowy lub wygasły token.");
                    } else if (response.status == 404) {
                        alert("Nie znaleziono grupy.");
                    } else if (response.status == 500) {
                        alert("Błąd wewnętrzny serwera.");
                    }

                    $scope.loadPage = false;
                }
            );
        } else {
            alert("Nieprawidłowa nazwa użytkownika.");
            $scope.loadPage = false;
        }
    }

    // Delete user to group
    $scope.deleteUser = function($event) {
        $event.preventDefault();
        $scope.loadPage = true;
        dataID = $event.currentTarget.getAttribute("data-id");
        dataLogin = $event.currentTarget.getAttribute("data-name");
        users = [dataLogin];

        if (confirm("Czy na pewno usunąć użytkownika z grupy?")) {
            $http.post(
                "/service/groups/members/remove/" + $scope.group,
                JSON.stringify(users)
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        if (dataID - 1 == 0) {
                            left = [];
                            right = $scope.users.splice(dataID, $scope.users.length);
                        } else {
                            left = $scope.users.splice(0, dataID - 1);
                            right = $scope.users.splice(dataID - 1, $scope.users.length);
                        }

                        $scope.users = left.concat(right);
                        alert("Użytkownik został usunięty z grupy.");
						
						$route.reload();
                    }

                    $scope.loadPage = false;
                },
                function(response) { // Error
                    if (response.status == 400) {
                        alert("Błędne żądanie.");
                    } else if (response.status == 403) {
                        alert("Nieprawidłowy lub wygasły token.");
                    } else if (response.status == 404) {
                        alert("Nie znaleziono grupy.");
                    } else if (response.status == 500) {
                        alert("Błąd wewnętrzny serwera.");
                    }

                    $scope.loadPage = false;
                }
            );
        }
    }
});

/*
 ** SearchUserController
 */
app.controller("SearchUserController", function($route, $scope, $http, $routeParams, $cookies, $location) {
	// Search of user
	$scope.searchUser = function($event) {
		$event.preventDefault();
		limit = 4;
		user = $event.currentTarget.value;
		
		if( user.length > 2 ) {
			$scope.loadPage = true;
			
            $http.get(
                "/service/users/users?limit=" + limit + "&search=" + user
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
						$scope.users_prompt = response.data.result;
						document.getElementById("js-users-prompt").style.display = "block";
                    }

                    $scope.loadPage = false;
                },
                function(response) { // Error
                    if (response.status == 400) {
                        alert("Błędne żądanie.");
                    } else if (response.status == 403) {
                        alert("Nieprawidłowy lub wygasły token.");
                    } else if (response.status == 500) {
                        alert("Błąd wewnętrzny serwera.");
                    }

                    $scope.loadPage = false;
                }
            );
		} else {
			$scope.users_prompt = [];
			document.getElementById("js-users-prompt").style.display = "none";
		}
	}
	
	// Select of user
	$scope.selectUser = function($event) {
		$event.preventDefault();
		user = $event.currentTarget.getAttribute("data-name");
		document.getElementsByClassName("js-get-login")[0].value = user;
		document.getElementById("js-users-prompt").style.display = "none";
	}
});
