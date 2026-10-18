// Satu entri history per "masuk level", supaya tombol back HP/browser balik ke menu, bukan keluar situs.
export interface BackStack {
  enter: () => void;
  leave: () => void;
}

export const createBackStack = (skin: string, onBack: () => void): BackStack => {
  let pushed = false;
  // history.back() async: popstate miliknya sendiri jangan dianggap back dari user.
  let leaving = false;
  window.addEventListener('popstate', () => {
    if (leaving) {
      leaving = false;
      // enter() dipanggil selagi back() tertunda: push ulang setelah back selesai.
      if (pushed) window.history.pushState({ skin }, '');
      return;
    }
    if (!pushed) return;
    pushed = false;
    if (document.documentElement.dataset['skin'] === skin) onBack();
  });
  return {
    enter: () => {
      if (pushed) return;
      pushed = true;
      if (!leaving) window.history.pushState({ skin }, '');
    },
    leave: () => {
      if (!pushed) return;
      pushed = false;
      if (leaving) return;
      leaving = true;
      window.history.back();
    },
  };
};
