import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mayvanphongxanh.com').replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/tai-khoan/',
          '/gio-hang/',
          '/thanh-toan/',
          '/tim-kiem/',
          '/tra-cuu-don-hang',
          '/tra-cuu-bao-hanh',
          '/quen-mat-khau',
          '/dang-nhap',
          '/dang-ky',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
