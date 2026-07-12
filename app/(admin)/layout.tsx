import { Inter } from 'next/font/google'
import './admin.css'
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ['latin', 'vietnamese'] })
import { prisma } from "@/lib/db";
import type { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const dbSettings = await prisma.setting.findMany();
  const settingsMap = dbSettings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const faviconUrl = settingsMap['site_favicon'] || '/favicon.png';

  return {
    title: 'Admin Dashboard - MVPX',
    description: 'Quản trị hệ thống Máy Văn Phòng Xanh',
    icons: {
      icon: [
        { url: faviconUrl, type: faviconUrl.endsWith('.webp') ? 'image/webp' : undefined },
      ],
      apple: faviconUrl,
    },
  };
}

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const dbSettings = await prisma.setting.findMany();
  const settingsMap = dbSettings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <html lang="vi" className={inter.className} suppressHydrationWarning>
      <head />
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          {children}
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
