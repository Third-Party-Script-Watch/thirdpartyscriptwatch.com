export enum PlausibleEvents {
  EASTER_EGG = 'Easter egg triggered',
  FILTER = 'Filter',
  PIN = 'Script pinned',
  DETAILS_EXPAND = 'Details expand',
  SHOW_DATA_URIS = 'Show data URIs',
}

export type PlausibleArgs = [PlausibleEvents, any] | [PlausibleEvents];

declare global {
  const plausible: {
    (...args: PlausibleArgs): void;
    q: PlausibleArgs[];
  };

  interface Window {
    plausible: typeof plausible;
  }
}
