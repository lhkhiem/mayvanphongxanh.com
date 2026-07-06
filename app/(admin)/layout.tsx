import { Inter } from 'next/font/google'
import './admin.css'
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

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
