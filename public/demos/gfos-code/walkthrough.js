const dialog = document.querySelector('dialog');
const image = document.querySelector('#full-image');
const title = document.querySelector('#image-title');
let opener;
for (const button of document.querySelectorAll('[data-expand]')) {
  button.addEventListener('click', () => {
    const figure = button.closest('figure');
    const screen = figure.querySelector('img');
    opener = button;
    image.src = screen.src;
    image.alt = screen.alt;
    title.textContent = figure.querySelector('figcaption > span').textContent;
    dialog.showModal();
    document.querySelector('.image-scroll').scrollTo(0, 0);
  });
}
document.querySelector('[data-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
