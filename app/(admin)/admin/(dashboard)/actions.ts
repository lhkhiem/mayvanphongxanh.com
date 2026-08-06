"use server";

import { prisma } from "@/lib/db";

export type SalesDashboardData = {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  revenueChartData: Array<{ name: string; revenue: number; orders: number }>;
  topProducts: Array<{ id: string | number; name: string; sku: string; quantity: number; revenue: number }>;
  lowStockVariants: Array<{ id: string; name: string; sku: string; stock: number; threshold: number; productName: string }>;
  rentalSummary: {
    totalActive: number;
    totalReturned: number;
    totalMaintenance: number;
    totalOverdue: number;
  };
};

export type ContentDashboardData = {
  totalPosts: number;
  activePosts: number;
  totalCategories: number;
  totalServices: number;
  totalProjects: number;
  totalPages: number;
  totalMediaAssets: number;
  mediaSizeBytes: number;
  pendingContactRequests: number;
  recentPosts: Array<{ id: string; title: string; slug: string; categoryName: string; createdAt: Date; isActive: boolean }>;
  recentContacts: Array<{ id: string; name: string; phone: string; service: string; status: string; createdAt: Date }>;
};

export type SeoIssueItem = {
  id: string | number;
  title: string;
  type: "Product" | "Post" | "Category" | "Page" | "Service";
  url: string;
  missingTitle: boolean;
  missingDescription: boolean;
  titleLength: number;
};

export type SeoDashboardData = {
  seoHealthScore: number;
  totalTrackedItems: number;
  optimizedItems: number;
  missingSeoCount: number;
  issuesList: SeoIssueItem[];
  breakdown: {
    products: { total: number; optimized: number };
    posts: { total: number; optimized: number };
    categories: { total: number; optimized: number };
    pages: { total: number; optimized: number };
    services: { total: number; optimized: number };
  };
};

export async function getSalesDashboardData(): Promise<SalesDashboardData> {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });

    let totalRevenue = 0;
    let pendingOrders = 0;
    let processingOrders = 0;
    let deliveredOrders = 0;
    let cancelledOrders = 0;

    const monthlyRevenueMap: Record<string, { revenue: number; orders: number }> = {};

    // Get month names for last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `T${d.getMonth() + 1}/${d.getFullYear()}`;
      monthlyRevenueMap[label] = { revenue: 0, orders: 0 };
    }

    orders.forEach((order) => {
      if (order.status === "DELIVERED") {
        totalRevenue += order.totalAmount;
      }
      if (order.status === "PENDING") pendingOrders++;
      if (order.status === "PROCESSING") processingOrders++;
      if (order.status === "DELIVERED") deliveredOrders++;
      if (order.status === "CANCELLED") cancelledOrders++;

      const date = new Date(order.createdAt);
      const label = `T${date.getMonth() + 1}/${date.getFullYear()}`;
      if (monthlyRevenueMap[label]) {
        if (order.status !== "CANCELLED") {
          monthlyRevenueMap[label].revenue += order.totalAmount;
        }
        monthlyRevenueMap[label].orders += 1;
      }
    });

    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / (deliveredOrders || 1) : 0;

    const revenueChartData = Object.entries(monthlyRevenueMap).map(([name, val]) => ({
      name,
      revenue: val.revenue,
      orders: val.orders,
    }));

    // Top selling product variants
    const orderItems = await prisma.orderItem.findMany({
      take: 200,
    });

    const productSalesMap: Record<string, { name: string; sku: string; quantity: number; revenue: number }> = {};
    orderItems.forEach((item) => {
      const key = item.sku || item.productName;
      if (!productSalesMap[key]) {
        productSalesMap[key] = {
          name: item.productName + (item.variantName ? ` (${item.variantName})` : ""),
          sku: item.sku,
          quantity: 0,
          revenue: 0,
        };
      }
      productSalesMap[key].quantity += item.quantity;
      productSalesMap[key].revenue += item.price * item.quantity;
    });

    const topProducts = Object.entries(productSalesMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Low stock variants
    const variants = await prisma.productVariant.findMany({
      include: {
        product: { select: { name: true } },
      },
      orderBy: { stockQuantity: "asc" },
      take: 20,
    });

    const lowStockVariants = variants
      .filter((v) => v.stockQuantity <= (v.lowStockThreshold || 5))
      .map((v) => ({
        id: v.id,
        name: v.name || v.sku,
        sku: v.sku,
        stock: v.stockQuantity,
        threshold: v.lowStockThreshold || 5,
        productName: v.product.name,
      }));

    // Rental Machines
    const rentalMachines = await prisma.rentalMachine.findMany();
    const rentalSummary = {
      totalActive: rentalMachines.filter((r) => r.status === "ACTIVE").length,
      totalReturned: rentalMachines.filter((r) => r.status === "RETURNED").length,
      totalMaintenance: rentalMachines.filter((r) => r.status === "MAINTENANCE").length,
      totalOverdue: rentalMachines.filter((r) => r.status === "OVERDUE").length,
    };

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      averageOrderValue,
      revenueChartData,
      topProducts,
      lowStockVariants,
      rentalSummary,
    };
  } catch (error) {
    console.error("Error fetching sales dashboard data:", error);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      averageOrderValue: 0,
      revenueChartData: [],
      topProducts: [],
      lowStockVariants: [],
      rentalSummary: { totalActive: 0, totalReturned: 0, totalMaintenance: 0, totalOverdue: 0 },
    };
  }
}

export async function getContentDashboardData(): Promise<ContentDashboardData> {
  try {
    const [
      posts,
      categories,
      services,
      projects,
      pages,
      mediaAssets,
      pendingContacts,
      recentPosts,
      recentContacts,
    ] = await Promise.all([
      prisma.post.findMany({ select: { id: true, isActive: true } }),
      prisma.category.count(),
      prisma.service.count(),
      prisma.project.count(),
      prisma.page.count(),
      prisma.asset.findMany({ select: { sizeBytes: true } }),
      prisma.contactRequest.count({ where: { status: "PENDING" } }),
      prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { category: { select: { name: true } } },
      }),
      prisma.contactRequest.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalPosts = posts.length;
    const activePosts = posts.filter((p) => p.isActive).length;
    const totalMediaAssets = mediaAssets.length;
    const mediaSizeBytes = mediaAssets.reduce((sum, a) => sum + (a.sizeBytes || 0), 0);

    return {
      totalPosts,
      activePosts,
      totalCategories: categories,
      totalServices: services,
      totalProjects: projects,
      totalPages: pages,
      totalMediaAssets,
      mediaSizeBytes,
      pendingContactRequests: pendingContacts,
      recentPosts: recentPosts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        categoryName: p.category?.name || "Chưa phân loại",
        createdAt: p.createdAt,
        isActive: p.isActive,
      })),
      recentContacts: recentContacts.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        service: c.service,
        status: c.status,
        createdAt: c.createdAt,
      })),
    };
  } catch (error) {
    console.error("Error fetching content dashboard data:", error);
    return {
      totalPosts: 0,
      activePosts: 0,
      totalCategories: 0,
      totalServices: 0,
      totalProjects: 0,
      totalPages: 0,
      totalMediaAssets: 0,
      mediaSizeBytes: 0,
      pendingContactRequests: 0,
      recentPosts: [],
      recentContacts: [],
    };
  }
}

export async function getSeoDashboardData(): Promise<SeoDashboardData> {
  try {
    const [products, posts, categories, pages, services] = await Promise.all([
      prisma.product.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, slug: true, metaTitle: true, metaDescription: true },
      }),
      prisma.post.findMany({
        select: { id: true, title: true, slug: true, metaTitle: true, metaDescription: true },
      }),
      prisma.category.findMany({
        select: { id: true, name: true, slug: true, metaTitle: true, metaDescription: true },
      }),
      prisma.page.findMany({
        select: { id: true, title: true, slug: true, metaTitle: true, metaDescription: true },
      }),
      prisma.service.findMany({
        select: { id: true, title: true, slug: true, metaTitle: true, metaDescription: true },
      }),
    ]);

    const issuesList: SeoIssueItem[] = [];

    const checkEntity = (
      items: Array<{ id: string | number; name?: string; title?: string; slug: string; metaTitle: string | null; metaDescription: string | null }>,
      type: "Product" | "Post" | "Category" | "Page" | "Service",
      urlPrefix: string
    ) => {
      let optimized = 0;
      items.forEach((item) => {
        const titleText = item.name || item.title || "";
        const mTitle = item.metaTitle?.trim();
        const mDesc = item.metaDescription?.trim();

        const missingTitle = !mTitle;
        const missingDescription = !mDesc;
        const titleLength = mTitle ? mTitle.length : titleText.length;

        if (missingTitle || missingDescription || titleLength < 25) {
          issuesList.push({
            id: item.id,
            title: titleText,
            type,
            url: `${urlPrefix}/${item.slug}`,
            missingTitle,
            missingDescription,
            titleLength,
          });
        } else {
          optimized++;
        }
      });
      return { total: items.length, optimized };
    };

    const prodStats = checkEntity(products, "Product", "/san-pham");
    const postStats = checkEntity(posts, "Post", "/tin-tuc");
    const catStats = checkEntity(categories, "Category", "/danh-muc");
    const pageStats = checkEntity(pages, "Page", "");
    const servStats = checkEntity(services, "Service", "/dich-vu");

    const totalTrackedItems =
      prodStats.total + postStats.total + catStats.total + pageStats.total + servStats.total;
    const optimizedItems =
      prodStats.optimized +
      postStats.optimized +
      catStats.optimized +
      pageStats.optimized +
      servStats.optimized;

    const seoHealthScore =
      totalTrackedItems > 0 ? Math.round((optimizedItems / totalTrackedItems) * 100) : 100;

    return {
      seoHealthScore,
      totalTrackedItems,
      optimizedItems,
      missingSeoCount: issuesList.length,
      issuesList: issuesList.slice(0, 15),
      breakdown: {
        products: prodStats,
        posts: postStats,
        categories: catStats,
        pages: pageStats,
        services: servStats,
      },
    };
  } catch (error) {
    console.error("Error fetching SEO dashboard data:", error);
    return {
      seoHealthScore: 100,
      totalTrackedItems: 0,
      optimizedItems: 0,
      missingSeoCount: 0,
      issuesList: [],
      breakdown: {
        products: { total: 0, optimized: 0 },
        posts: { total: 0, optimized: 0 },
        categories: { total: 0, optimized: 0 },
        pages: { total: 0, optimized: 0 },
        services: { total: 0, optimized: 0 },
      },
    };
  }
}
