import { Inter } from 'next/font/google'
import './admin.css'
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import Script from "next/script";

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const metadata = {
  title: 'Admin Dashboard - MVPX',
  description: 'Quản trị hệ thống Máy Văn Phòng Xanh',
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={inter.className} suppressHydrationWarning>
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            try {
              // Admin dùng key 'admin-theme' riêng, không ảnh hưởng trang Public
              var adminTheme = localStorage.getItem('admin-theme');
              if (adminTheme === 'dark') {
                document.documentElement.classList.add('dark')
              } else {
                document.documentElement.classList.remove('dark')
              }
            } catch (_) {}
          `}
        </Script>
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          {children}
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
