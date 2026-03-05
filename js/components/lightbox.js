const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('.lightbox__img');

lightbox.addEventListener('click', close);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') close();
});

function open(src) {
  lightboxImg.src = src;
  lightbox.classList.add('lightbox--visible');
  document.body.style.overflow = 'hidden';
}

function close() {
  lightbox.classList.remove('lightbox--visible');
  document.body.style.overflow = '';
}

export { open as openLightbox };
