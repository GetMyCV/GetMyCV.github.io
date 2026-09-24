/**
 * A sample page — a demo portfolio (/portfolio/<slug>/) or a sample CV
 * (/cv/<slug>/) — as opposed to the gallery at /portfolio/. These pages hide
 * the site chrome so they read as the thing a client actually receives.
 */
export const isSampleDemo = (pathname: string | null) =>
  /^\/(portfolio|cv)\/[^/]+\/?$/.test(pathname ?? '');
