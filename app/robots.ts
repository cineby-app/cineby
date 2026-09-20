import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/tmdb/',],
    },
    sitemap: 'https://cineby.vip/sitemap.xml',
  };
}
