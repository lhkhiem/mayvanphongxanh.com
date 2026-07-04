import { CartProvider } from "@/context/CartContext";
import { CompareProvider } from "@/context/CompareContext";
import { FloatingActionButtons } from "@/components/common/FloatingActionButtons";
import { CompareBar } from "@/components/compare/CompareBar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <CartProvider>
      <CompareProvider>
        {children}
        <FloatingActionButtons />
        <CompareBar />
      </CompareProvider>
    </CartProvider>
  )
}
