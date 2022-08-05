import { KeyTrigger } from './key-trigger';

export class EasterEggs {
  private headerClickCount = 0;
  private headerClickCounter: number;
  private introClickCount = 0;
  private introClickCounter: number;

  constructor() {
    KeyTrigger.delay = 5000;
    this.initialiseInceptionMode();
    this.initialisePartyMode();
  }

  private initialiseInceptionMode() {
    document
      .querySelector('header')
      ?.addEventListener('click', this.onHeaderClick, { passive: true });

    KeyTrigger.listenFor('528491').then(() => {
      document.body.classList.toggle('inception');
    });
  }

  private initialisePartyMode() {
    document
      .querySelector('#intro')
      ?.addEventListener('click', this.onIntroClick, { passive: true });

    KeyTrigger.listenFor('party').then(() => {
      document.body.classList.toggle('party');
    });
  }

  private onHeaderClick() {
    this.headerClickCount++;
    if (this.headerClickCounter !== undefined) {
      window.clearTimeout(this.headerClickCounter);
    }
    this.headerClickCounter = window.setTimeout(() => {
      this.headerClickCount = 0;
    }, 300);

    if (this.headerClickCount === 5) {
      document.body.classList.toggle('inception');
    }
  }

  private onIntroClick() {
    this.introClickCount++;
    if (this.introClickCounter !== undefined) {
      window.clearTimeout(this.introClickCounter);
    }
    this.introClickCounter = window.setTimeout(() => {
      this.introClickCount = 0;
    }, 300);

    if (this.introClickCount === 3) {
      document.body.classList.toggle('party');
    }
  }
}
