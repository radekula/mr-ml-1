/* Polish initialisation for the jQuery UI date picker plugin. */
/* Written by Jacek Wysocki (jacek.wysocki@gmail.com). */
!function(e){"function"==typeof define&&define.amd?define(["../widgets/datepicker"],e):e(jQuery.datepicker)}(function(e){return e.regional.pl={closeText:"Zamknij",prevText:"&#x3C;Poprzedni",nextText:"Następny&#x3E;",currentText:"Dziś",monthNames:["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"],monthNamesShort:["Sty","Lu","Mar","Kw","Maj","Cze","Lip","Sie","Wrz","Pa","Lis","Gru"],dayNames:["Niedziela","Poniedziałek","Wtorek","Środa","Czwartek","Piątek","Sobota"],dayNamesShort:["Nie","Pn","Wt","Śr","Czw","Pt","So"],dayNamesMin:["N","Pn","Wt","Śr","Cz","Pt","So"],weekHeader:"Tydz",dateFormat:"dd.mm.yy",firstDay:1,isRTL:!1,showMonthAfterYear:!1,yearSuffix:""},e.setDefaults(e.regional.pl),e.regional.pl});
/* End written by Jacek Wysocki (jacek.wysocki@gmail.com). */

$(document).ready(function() {
    /* Add document */
    if ($('body').is('#add')) {

        var file = null;
        
        /* Send form */
        $('#form-add').on('click', '[type="submit"]', function(e) {
            e.preventDefault();

            var id = '1';
            var file = $('#file').val();
            var owners = $('#owner').val();
            owners = owners.split(';');
            var title = $('#title').val();
            var desc = $('#description').val();

            if (!file || !owners || !title) {
                alert('Proszę o poprawne wypełnienie formularza.');
            } else {
                var document = new FormData();

                document.append('id', id);
                document.append('title', title);
                document.append('file_name', file);

                var date = new Date();
                var dd = date.getDate();
                var mm = date.getMonth() + 1;
                var yyyy = date.getFullYear();

                if (dd < 10) {
                    dd = '0' + dd;
                }
                if (mm < 10) {
                    mm = '0' + mm;
                }

                document.append('create_date', dd + '/' + mm + '/' + yyyy);
                document.append('description', desc);

                var owner = [];
                owners.forEach(function(item) {
                    owner.push(item);
                });
                document.append('owner', owner);

                saveDocument(id, document);
            }
        });
        
        $('body').on('change', '#file', function(e) {
            file = e.target.files[0];
            var val = $(this).val();
            $('#upload').find('#file-name').remove();
            $('#upload').append('<p id="file-name" class="file-name">' + val + '</p>');
        });
        
        /* Save document */
        function saveDocument(id, document) {
            $.ajax({
                url: '/document/' + id,
                type: 'PUT',
                data: document,
                cache: false,
                dataType: 'json',
                processData: false,
                contentType: false,
                success: function(data) {
                    if (typeof data.error === 'undefined') {
                        /* success */
                        submitForm(event, data);
                    } else {
                        /* errors */
                        alert('Wystąpił błąd podczas próby przesłania pliku.');
                    }
                },
                error: function() {
                    // errors
                    alert('Wystąpił błąd podczas próby przesłania pliku.');
                }
            });
        }
    }
    
    
    /* List of documents */
    if ($("body").is("#documents")) {

        /* Init datepicker */
        $.datepicker.setDefaults($.datepicker.regional["pl"]);
        $(".datepicker").datepicker({
            dateFormat: "dd/mm/yy"
        });

        var data = [];
        var perPage = 5;
        var page = 1;

        /* Get Pagination */
        function getPagination(pageId) {
            var class_ = "";
            var dataCount = data.length;
            var ul = $("#pagination").find("ul").empty();
            var countPages = Math.ceil(dataCount / perPage);

            if (countPages > 0) {
                if (pageId > 3) {
                    ul.append("<li class='prev'><a class='loader' data-page='" + (pageId - 1) + "'>Poprzednia</a></li>");
                    var i = pageId - 2;
                    if (i >= 0) {
                        for (; i <= pageId; i++) {
                            class_ = i == pageId ? " class='current'" : "";
                            ul.append("<li" + class_ + "><a class='loader' data-page='" + i + "'>" + i + "</a></li>");
                        }
                        if (pageId < countPages) {
                            ul.append("<li class='next'><a class='loader' data-page='" + (pageId + 1) + "'>Nastepna</a>");
                        }
                    }
                } else {
                    if ((pageId - 1) > 0) {
                        ul.append("<li class='prev'><a class='loader' data-page='" + (pageId - 1) + "'>Poprzednia</a></li>");
                    }
                    var i = 0;
                    var condition = countPages < 3 ? countPages : 3;
                    for (; i < condition; i++) {
                        class_ = i == (pageId - 1) ? " class='current'" : "";
                        ul.append("<li" + class_ + "><a class='loader' data-page='" + (i + 1) + "'>" + (i + 1) + "</a></li>");
                    }
                    if ((pageId - 1) < countPages - 1) {
                        ul.append("<li class='next'><a class='loader' data-page='" + (pageId + 1) + "'>Nastepna</a>");
                    }
                }
            }
        }

        /* Generate a list of documents */
        function getDocuments() {
            $("#loader").remove();
            $("#form-table").find("[type='submit']").after("<img id='loader' src='/img/ajax-loader.svg' alt=''>");
            $.getJSON("/documents.json?ver=1.0", function(results) {
                if (Array.isArray(results)) {
                    data = []; // reset
                    page = 1; // reset
                    var i = 0;
                    var condition1 = results.length;

                    for (; i < condition1; i++) {
                        if (
                            filtration(
                                results[i].title,
                                results[i].create_date,
                                results[i].owner[0]
                            )
                        ) {
                            data.push(results[i]);
                        }
                    }

                    getPageDocuments(page);
                    getPagination(page);

                    setTimeout(
                        function() {
                            $("#loader").remove();
                        },
                        250
                    );
                }
            });
        }
        getDocuments();

        $("#form-table").on("click", "[type='submit']", function(e) {
            e.preventDefault();
            getDocuments();
        });

        /* Get page of records */
        $("#pagination").on("click", "a[data-page]", function(e) {
            $("#loader").remove();
            $("#form-table").find("[type='submit']").after("<img id='loader' src='/img/ajax-loader.svg' alt=''>");
            e.preventDefault();
            var pageId = $(this).data("page");
            getPageDocuments(pageId);
        });

        function getPageDocuments(pageId) {
            var i = (pageId - 1) * perPage;
            var dataCount = data.length;
            var condition = i + perPage;
            condition = dataCount < condition ? dataCount : condition;
            var actions_ = "";
            var status_ = "";
            var table = $("#table").find("tbody").empty();

            for (; i < condition; i++) {
                actions_ = "<nav class='actions'><ul><li><a href='/resources/" + data[i].id + "'><img src='/img/icon-action-download.png' alt='Pobierz'></a></li><li><a href='/document/" + data[i].id + "'><img src='/img/icon-action-document.png' alt='Dokument'></a></li><li><a class='delete' href='/document/" + data[i].id + "' data-id='" + data[i].id + "'><img src='/img/icon-action-delete.png' alt='Usuń'></a></li></ul></nav>";
                status_ = "<span class='status inactive'>Usunięty</span>";
                table.append("<tr><td>" + data[i].id + "</td><td class='name'>" + data[i].title + "</td><td class='date1'>" + data[i].create_date + "</td><td class='owner'>" + data[i].owner[0] + "</td><td>" + status_ + "</td><td>" + actions_ + "</td></tr>");
            }

            getPagination(pageId);

            if (table.html() == "") {
                table.append("<tr><td colspan='7'>Nie znaleziono dokumentów.</td></tr>");
            }

            setTimeout(
                function() {
                    $("#loader").remove();
                },
                150
            );
        }

        /* Remove record */
        function removeRecord() {
            $("#table").on("click", "a.delete", function(e) {
                e.preventDefault();

                if (confirm("Czy na pewno usunąć wskazany dokument?")) {
                    var id = $(this).data("id");

                    $.ajax({
                        url: "/document/" + id,
                        type: "DELETE",
                        success: function(result) {
                            $("#table").find("[data-id='" + id + "']").parents("tr").remove();
                            getDocuments();
                            alert("Dokument został usunięty.");
                        },
                        error: function(result) {
                            alert("Wystąpił błąd podczas próby usunięcia dokumentu.");
                        }
                    });
                }
            });
        }
        removeRecord();

        /* Filtration */
        function filtration(name, date, owner, statusVal = "inactive") {
            var currentDate_ = "";
            var phrase_ = $("#form-table").find("input[name='phrase']").val();

            var begin_ = ($("#form-table").find("input[name='date1']").val()).split("/");
            begin_ = new Date(begin_[0], begin_[1], begin_[2]);

            var end_ = ($("#form-table").find("input[name='date2']").val()).split("/");
            end_ = new Date(end_[0], end_[1], end_[2]);

            currentDate_ = date.split("/");
            currentDate_ = new Date(currentDate_[0], currentDate_[1], currentDate_[2]);

            var status_ = $("#form-table").find("select[name='status']").val();

            if (currentDate_.getTime() < begin_.getTime() ||
                currentDate_.getTime() > end_.getTime() ||
                (name.search(phrase_) === -1 && owner.search(phrase_) === -1) ||
                (status_ !== statusVal && status_ !== "")
            ) {
                return false;
            } else {
                return true;
            }
        }
    }

    /* Expand menu */
    $("#menu").css("width", function() {
        var width = $(this).width();
        return width;
    });

    /* Expand search of header */
    $("#form-search").find("input[name='search']").focusin(function() {
        var windowWidth = $(window).width();
        if (windowWidth > 1099) {
            $(this).addClass("input");
        }
        $(this).attr("placeholder", "Szukaj...");
    });

    $("#form-search").find("input[name='search']").focusout(function() {
        $(this).removeClass("input").removeAttr("placeholder");
    });

    /* Toggle menu */
    $("body").on("click", "#toggle", function() {
        $(this).toggleClass("active");
        var body = $("body").toggleClass("fold", "");

        $("#menu").css("width", function() {
            if (body.hasClass("fold")) {
                setCookie("toggle", "true", 36000);
                return "90px";
            } else {
                setCookie("toggle", "false", 36000);
                return "320px";
            }
        });
    });

    /* Cookies */
    function setCookie(name, value, days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }
});
