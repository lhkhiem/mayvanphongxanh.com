import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import Script from 'next/script'
import './public.css'
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { CartProvider } from "@/context/CartContext";
import { CompareProvider } from "@/context/CompareContext";
import { FloatingActionButtons } from "@/components/common/FloatingActionButtons";
import { CompareBar } from "@/components/compare/CompareBar";

import { SettingsProvider } from "@/context/SettingsContext";
import { prisma } from "@/lib/db";

const inter = Inter({ variable: '--font-inter', subsets: ['latin', 'vietnamese'] })
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin', 'vietnamese'],
})

export const revalidate = 0;

const cleanUrl = (url?: string) => {
  if (!url) return url;
  return url.replace(/^https?:\/\/(0\.0\.0\.0|localhost|127\.0\.0\.1)(:\d+)?/i, '');
};

export async function generateMetadata(): Promise<Metadata> {
  let dbSettings: any[] = [];
  try {
    dbSettings = await prisma.setting.findMany();
  } catch (err) {
    console.warn('Could not fetch dbSettings in generateMetadata:', err);
  }
  const settingsMap = dbSettings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const defaultTitle = 'Máy Văn Phòng Xanh - Chuyên cung cấp máy in, mực in & Thiết bị văn phòng';
  const defaultDesc = 'Giải pháp thiết bị văn phòng chuyên nghiệp và dịch vụ kỹ thuật. Máy in tốc độ cao, mực in chính hãng, máy tính tiền POS, giải pháp mạng và hợp đồng bảo trì cho doanh nghiệp.';

  const title = settingsMap['seo_title']?.trim() || settingsMap['company_name']?.trim() || defaultTitle;
  const description = settingsMap['seo_description']?.trim() || settingsMap['company_description']?.trim() || defaultDesc;
  const rawFavicon = settingsMap['site_favicon'] || settingsMap['company_favicon'] || '/favicon.png';
  const rawOgImage = settingsMap['seo_image'] || settingsMap['company_logo'] || settingsMap['site_logo'];

  const faviconUrl = cleanUrl(rawFavicon) || '/favicon.png';
  const ogImage = cleanUrl(rawOgImage);

  return {
    title: {
      default: title,
      template: `%s | ${settingsMap['company_name']?.trim() || 'Máy Văn Phòng Xanh'}`,
    },
    description,
    generator: 'v0.app',
    icons: {
      icon: [
        { url: faviconUrl, type: faviconUrl.endsWith('.webp') ? 'image/webp' : undefined },
      ],
      apple: faviconUrl,
    },
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
      type: 'website',
      locale: 'vi_VN',
      siteName: settingsMap['company_name'] || 'Máy Văn Phòng Xanh',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#f1f8f4',
}

export default async function PublicRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Fetch settings from DB
  let dbSettings: any[] = [];
  try {
    dbSettings = await prisma.setting.findMany();
  } catch (err) {
    console.warn('Could not fetch dbSettings in PublicRootLayout:', err);
  }
  
  // Convert array of settings to a simple map { key: value }
  const settingsMap = dbSettings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const gaId = settingsMap['seo_google_analytics']?.trim();

  return (
    <html lang="vi" className={`${inter.variable} ${jetbrainsMono.variable} bg-background`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
        <Providers>
          <SettingsProvider initialSettings={settingsMap}>
            <CartProvider>
              <CompareProvider>
                {children}
                <FloatingActionButtons />
                <CompareBar />
              </CompareProvider>
            </CartProvider>
          </SettingsProvider>
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  )
}

