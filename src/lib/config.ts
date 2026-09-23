import { siteConfig, type NavItem } from '../../site.config';
import type { Locale } from '../i18n/translations';

export function getSiteName(): string {
  return siteConfig.name;
}

export function getTagline(): string {
  return siteConfig.tagline;
}

export function getDomain(): string {
  return siteConfig.domain;
}

export function getDescription(lang: Locale = 'en'): string {
  return siteConfig.description[lang];
}

export function getContactEndpoint(): string {
  return siteConfig.contactEndpoint;
}

export function getAuthor() {
  return siteConfig.author;
}

export function getSocialLinks() {
  return siteConfig.social;
}

export function getNav(): NavItem[] {
  return siteConfig.nav;
}

export const config = siteConfig;
