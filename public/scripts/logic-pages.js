$(document).ready(function(){
    var lastScrollTop = 0;
    $(window).scroll(function(event){
        var currentScrollTopPosition = $(this).scrollTop();
        if (currentScrollTopPosition > lastScrollTop){
            $('#header').removeClass('big-header-nav');
            $('#header').addClass('small-header-nav');
        } else {
            $('#header').removeClass('small-header-nav');
            $('#header').addClass('big-header-nav');
        }
        lastScrollTop = currentScrollTopPosition;
     });
    
});