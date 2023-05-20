// const inset50 = {
//     top: 50
//     , bottom: 50
//     , left: 50
//     , right: 50
// };

const layoutOptions = {
    west__size: 400,
    center__childOptions: {
        inset: {
            top: 20,
            bottom: 20,
            left: 20,
            right: 20,
        },

        south__initClosed: true,
    },
};

let outerLayout;
let innerLayout;

$(document).ready(function () {
    outerLayout = $('body').layout(layoutOptions);
    innerLayout = $('.ui-layout-center').layout(layoutOptions);

    $('#wmrph_ok').click('click', function () {
        if (!innerLayout.state.south.isClosed) {
            myWmrphFrame.ok();
            innerLayout.close('south');
        }
    });

    $('#wmrph_add').click('click', function () {
        if (!innerLayout.state.south.isClosed) {
            myWmrphFrame.add();
        }
    });

    $('#wmrph_buttons').hide();
});
