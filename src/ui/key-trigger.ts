export class KeyTrigger {
  public static delay = 1000;

  public static listenFor(trigger: string): Promise<void> {
    return new Promise((resolve) => {
      const charCodesLower = trigger
        .toLowerCase()
        .split('')
        .map((x) => x.charCodeAt(0));
      const charCodesUpper = trigger
        .toUpperCase()
        .split('')
        .map((x) => x.charCodeAt(0));

      let currentIndex = 0;
      let timer;

      let clearIndex = () => {
        currentIndex = 0;
      };

      document.addEventListener('keypress', (e) => {
        timer = setTimeout(clearIndex, this.delay);

        if (
          e.charCode === charCodesLower[currentIndex] ||
          e.charCode === charCodesUpper[currentIndex]
        ) {
          currentIndex++;

          clearTimeout(timer);
          timer = setTimeout(clearIndex, this.delay);

          if (currentIndex === charCodesLower.length) {
            resolve();
          }
        } else {
          currentIndex = 0;
        }
      });
    });
  }
}
