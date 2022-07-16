import { KeyTrigger } from './key-trigger';

let headerClickCount = 0;
let headerClickCounter;

function onHeaderClick() {
  headerClickCount++;
  if (headerClickCounter !== undefined) {
    window.clearTimeout(headerClickCounter);
  }
  headerClickCounter = window.setTimeout(() => {
    headerClickCount = 0;
  }, 300);

  if (headerClickCount === 5) {
    document.body.classList.toggle('inception');
  }
}

document
  .querySelector('header')
  ?.addEventListener('click', onHeaderClick, { passive: true });

let introClickCount = 0;
let introClickCounter;

function onIntroClick() {
  introClickCount++;
  if (introClickCounter !== undefined) {
    window.clearTimeout(introClickCounter);
  }
  introClickCounter = window.setTimeout(() => {
    introClickCount = 0;
  }, 300);

  if (introClickCount === 3) {
    document.body.classList.toggle('party');
  }
}

document
  .querySelector('.intro')
  ?.addEventListener('click', onIntroClick, { passive: true });

(async () => {
  KeyTrigger.delay = 5000;
  KeyTrigger.listenFor('528491').then(() => {
    document.body.classList.toggle('inception');
  });
  KeyTrigger.listenFor('party').then(() => {
    document.body.classList.toggle('party');
  });
})();
