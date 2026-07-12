import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
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

export async function generateMetadata(): Promise<Metadata> {
  const dbSettings = await prisma.setting.findMany();
  const settingsMap = dbSettings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const faviconUrl = settingsMap['site_favicon'] || '/favicon.png';

  return {
    title: 'Máy Văn Phòng Xanh - Chuyên cung cấp máy in, mực in & Thiết bị văn phòng',
    description: 'Giải pháp thiết bị văn phòng chuyên nghiệp và dịch vụ kỹ thuật. Máy in tốc độ cao, mực in chính hãng, máy tính tiền POS, giải pháp mạng và hợp đồng bảo trì cho doanh nghiệp.',
    generator: 'v0.app',
    icons: {
      icon: [
        { url: faviconUrl, type: faviconUrl.endsWith('.webp') ? 'image/webp' : undefined },
      ],
      apple: faviconUrl,
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
  const dbSettings = await prisma.setting.findMany();
  
  // Convert array of settings to a simple map { key: value }
  const settingsMap = dbSettings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <html lang="vi" className={`${inter.variable} ${jetbrainsMono.variable} bg-background`} suppressHydrationWarning>
      <head>
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
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
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </Providers>
      </body>
    </html>
  )
}
