/**
 * A demo portfolio page (/portfolio/<slug>/), as opposed to the gallery at
 * /portfolio/. These pages hide the site chrome so they read as the standalone
 * personal site a client actually receives.
 */
export const isPortfolioDemo = (pathname: string | null) =>
  /^\/portfolio\/[^/]+\/?$/.test(pathname ?? '');
