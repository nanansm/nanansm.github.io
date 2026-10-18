// Skin yang tidak aktif dibuat inert supaya keluar dari tab order & pohon a11y.
const syncInert = (): void => {
  const active = document.documentElement.dataset.skin ?? 'manual';
  document.querySelectorAll<HTMLElement>('[data-skin-root]').forEach((root) => {
    root.inert = root.dataset.skinRoot !== active;
  });
};

syncInert();
window.addEventListener('skinchange', syncInert);
