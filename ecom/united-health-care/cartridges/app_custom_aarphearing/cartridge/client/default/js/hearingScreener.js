
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches

const fieldsets = $('.screener-form-container fieldset');

$(".next").click(function () {
    if (animating) return false;
    animating = true;

    current_fs = $(this).parent();
    next_fs = $(this).parent().next();

    // Iterate through fieldsets
    fieldsets.each(function(index, fs) {
        // Update CSS on current fieldset
        if (fs == current_fs.get(0)){
            current_fs.hide();

            current_fs.animate({
                opacity: 0
            }, {
                step: function (now, mx) {
                    //as the opacity of current_fs reduces to 0 - stored in "now"
                    //1. scale current_fs down to 80%
                    scale = 1.2 - (1 - now) * 0.2;
                    //2. bring next_fs from the right(50%)
                    left = (now * 50) + "%";
                    //3. increase opacity of next_fs to 1 as it moves in
                    opacity = 1 - now;
                    current_fs.css({
                        'transform': 'scale(' + scale + ')',
                    });
                    next_fs.css({
                        'transform': 'scale(' + scale + ')',
                        'opacity': opacity
                    });
                    //show the next fieldset
                    next_fs.show();
                },
                duration: 800,
                complete: function () {
                    animating = false;
                },
            });
        }
    });


});

$(".previous").click(function () {
    if (animating) return false;
    animating = true;

    current_fs = $(this).parent();
    previous_fs = $(this).parent().prev();

    //TODO: Change current step on progressbar


    //show the previous fieldset
    previous_fs.show();
    //hide the current fieldset
    current_fs.animate({
        opacity: 0
    }, {
        step: function (now, mx) {
            //as the opacity of current_fs reduces to 0 - stored in "now"
            //1. scale previous_fs from 80% to 100%
            scale = 0.8 + (1 - now) * 0.2;
            //2. take current_fs to the right(50%) - from 0%
            left = ((1 - now) * 50) + "%";
            //3. increase opacity of previous_fs to 1 as it moves in
            opacity = 1 - now;
            current_fs.css({
                // 'left': left
            });
            previous_fs.css({
                'transform': 'scale(' + scale + ')',
                'position': 'relative',
                'opacity': opacity
            });
            current_fs.hide();
        },
        duration: 800,
        complete: function () {
            // current_fs.hide();
            animating = false;
        },
    });
});

$(".submit").click(function () {
    return false;
})