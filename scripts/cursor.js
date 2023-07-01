let cursor = document.getElementById('cursor');
let innerCursor = document.getElementById('inner-cursor');

document.addEventListener('mousemove', function(event) {
    let x = event.clientX;
    let y = event.clientY;
    cursor.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`

    innerCursor.style.left = x + 'px';
    innerCursor.style.top = y + 'px';
});