import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://desa-connect.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/*?*'
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/images/', '/icons/'],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
} 