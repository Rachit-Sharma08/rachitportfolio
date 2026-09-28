// Client-side route titles. Mirrors scripts/seo-config.mjs (the pre-renderer's
// per-route head); this one keeps <title> fresh across client-side navigation.
export const PAGE_TITLES: Record<string, string> = {
  '/': 'Rachit Sharma — Digital Marketer Building With AI',
  '/resume': 'Rachit Sharma — Resume',
  '*': 'Rachit Sharma — Page Not Found',
}

export function titleForPath(pathname: string): string {
  const key = pathname.replace(/\/+$/, '') || '/'
  return PAGE_TITLES[key] ?? PAGE_TITLES['*']
}