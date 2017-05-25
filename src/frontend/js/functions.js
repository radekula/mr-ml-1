$(document).ready(function() {
    /* Init datepicker */
    $(".datepicker").datepicker();
    /* */

    /* Expand menu */
    $('#menu').css('width', function() {
        var width = $(this).width();
        return width;
    });

    $('body').addClass(function() {
        var valueCookie = getCookie('toggle');
        if (valueCookie === 1) {
            return 'fold';
        } else {
            return '';
        }
    });
    /* */

    /* Expand search of header */
    $('#form-search').find('input[name="search"]').focusin(function() {
        var windowWidth = $(window).width();
        if (windowWidth > 1099) {
            $(this).addClass('input');
        }
        $(this).attr('placeholder', 'Szukaj...');
    });

    $('#form-search').find('input[name="search"]').focusout(function() {
        $(this).removeClass('input').removeAttr('placeholder');
    });
    /* */

    /* Toggle menu */
    $('body').on('click', '#toggle', function() {
        $(this).toggleClass('active');
        var body = $('body').toggleClass('fold', '');
        if (!body.hasClass('fold')) {
            setCookie('toggle', '0');
        } else {
            setCookie('toggle', '1');
        }
    });
    /* */

    /* Cookies */
    function setCookie(name, value) {
        var date = new Date();
        date.setTime(date.getTime() + (36500 * 24 * 60 * 60 * 1000)); // 100 years
        var expires = date.toUTCString();
        document.cookie = name + '=' + value + '; expires=' + expires + '; path=/';
    }

    function getCookie(name) {
        var nameTmp = name + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(nameTmp) == 0) {
                return c.substring(nameTmp.length, c.length);
            }
        }
        return '';
    }
    /* */
});
