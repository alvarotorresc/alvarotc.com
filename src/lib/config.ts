import { siteConfig } from '../../site.config';

export function getSiteName(): string {
  return siteConfig.name;
}

export function getTagline(): string {
  return siteConfig.tagline;
}

export function getDomain(): string {
  return siteConfig.domain;
}

export function getDescription(): string {
  return siteConfig.description;
}

export function getAuthor() {
  return siteConfig.author;
}

export function getSocialLinks() {
  return siteConfig.social;
}

export function getNav() {
  return siteConfig.nav;
}

export const config = siteConfig;
