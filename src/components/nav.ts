import { type Locale, site } from '../config/site';
import { type Key, localizePath, useT } from '../i18n';

export interface NavLink {
  href: string;
  label: string;
  external?: boolean;
}

type Item = { key: Key; path: string; feature?: keyof typeof site.features };

const sections: Item[] = [
  { key: 'nav.services', path: '/#servicios' },
  { key: 'nav.action', path: '/#en-accion' },
  { key: 'nav.kit', path: '/#equipo' },
  { key: 'nav.tour', path: '/gira', feature: 'tour' },
  { key: 'nav.music', path: '/musica', feature: 'music' },
  { key: 'nav.sets', path: '/sesiones', feature: 'sets' },
  { key: 'nav.bio', path: '/bio' },
];

/** Shared by Header, MobileMenu and Footer. Disabled features are left out entirely, never rendered hidden. */
export function navLinks(locale: Locale, variant: 'header' | 'mobile' | 'footer'): NavLink[] {
  const t = useT(locale);
  const items = [
    ...(variant === 'mobile' ? [{ key: 'nav.home', path: '/' } as Item] : []),
    ...sections,
    ...(variant === 'footer' ? [{ key: 'cta.book', path: '/contratacion' } as Item] : []),
  ];
  const links: NavLink[] = items
    .filter((i) => !i.feature || site.features[i.feature])
    .map((i) => ({ href: localizePath(i.path, locale), label: t(i.key) }));
  if (variant !== 'footer' && site.features.shop)
    links.push({ href: site.shopUrl, label: t('nav.shop'), external: true });
  return links;
}
