$(document).ready( async () => {
    const res = await $.get('/getTitles');

    $('.carousel-item.1').text(res.title1);
    $('.carousel-item.2').text(res.title2);
    $('.carousel-item.3').text(res.title3);
});


$(document).on('click', '#dropItButton', async () => {
    window.open("/login2");
})

$(document).on('click', '#getItButton', async () => {
    window.open("/login");
})
