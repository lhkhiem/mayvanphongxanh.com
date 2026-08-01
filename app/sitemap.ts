import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export const revalidate = 3600; // Tự động làm mới sitemap mỗi 1 giờ (3600 giây)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mayvanphongxanh.com').replace(/\/$/, '');

  // 1. Các trang tĩnh cố định
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/san-pham`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/gioi-thieu`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cho-thue-may`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/du-an`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/doi-tac`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/lien-he`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ho-tro`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/hoi-dap`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/chinh-sach-bao-mat`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/dieu-khoan-su-dung`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/chinh-sach-cookie`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/tin-tuc`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  try {
    // 2. Danh mục sản phẩm (Category)
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true },
    });

    const categoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${baseUrl}/danh-muc/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    }));

    // 3. Sản phẩm (Product)
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const productUrls: MetadataRoute.Sitemap = products.map((prod) => ({
      url: `${baseUrl}/san-pham/${prod.slug}`,
      lastModified: prod.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    }));

    // 4. Bài viết / Tin tức (Post)
    const posts = await prisma.post.findMany({
      where: {
        isActive: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/tin-tuc/${post.slug}`,
      lastModified: post.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticPages, ...categoryUrls, ...productUrls, ...postUrls];
  } catch (error) {
    console.error('Lỗi khi tạo sitemap:', error);
    return staticPages;
  }
}
