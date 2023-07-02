let cursor = document.querySelector('.cursor');
let cursoroutline = document.querySelector('.cursor-outline');
let links = document.querySelectorAll('a');

links.forEach(link => {
    link.addEventListener('mouseover', () => {
        cursor.classList.add('cursor-hover');
        cursoroutline.classList.add('cursor-outline-hover');
        console.log("hover!!!");
    });
    link.addEventListener('mouseleave', () => {
        console.log(cursor.classList);
        cursor.classList.remove('cursor-hover');
        cursoroutline.classList.remove('cursor-outline-hover');
        console.log("remove :c hover!!!");
    })
});

document.addEventListener('mousedown', function () {
    cursor.classList.add('cursor-click');
    cursoroutline.classList.add('outline-click');
});

document.addEventListener('mouseup', function () {
    cursor.classList.remove('cursor-click');
    cursoroutline.classList.remove('outline-click');
});